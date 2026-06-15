import React, { useState, useMemo, useRef, useEffect } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import SectionHeader from '@/components/SectionHeader'
import { useAppStore } from '@/store/appStore'
import type { TraceRecord } from '@/types'
import styles from './index.module.scss'

const TYPE_FILTERS = ['全部', '创作', '收藏证书', '流转', '展销', '养壶']
const TYPE_ICONS: Record<string, string> = {
  '创作': '🎨',
  '收藏证书': '📜',
  '流转': '🔄',
  '展销': '🏛',
  '养壶': '🫖'
}
const TYPE_ORDER: Record<string, number> = {
  '创作': 1,
  '收藏证书': 2,
  '流转': 3,
  '展销': 4,
  '养壶': 5
}

const YANGHU_TIPS = [
  {
    title: '养壶三要素：净、勤、专',
    level: 'subtitle'
  } as const,
  {
    title: '一、净 —— 清洁为本',
    level: 'h3'
  } as const,
  {
    title: '每次使用后及时用开水冲洗壶身内外，勿留茶垢积滞。可用软毛刷轻刷壶壁，再用干净茶巾擦拭。切忌用洗洁精等化学清洁剂，以免破坏包浆与影响茶味。',
    level: 'p'
  } as const,
  {
    title: '二、勤 —— 常泡常养',
    level: 'h3'
  } as const,
  {
    title: '一壶不事二茶。选定一类茶（如乌龙、普洱、红茶等）后长期使用，茶汁自然浸润，日久形成温润包浆。泡养过程中，可将茶汤浇淋壶身，再以茶巾轻轻擦拭，有助养出均匀光泽。',
    level: 'p'
  } as const,
  {
    title: '三、专 —— 专壶专茶',
    level: 'h3'
  } as const,
  {
    title: '一壶专泡一类茶，避免茶味串扰。朱泥适合乌龙茶、铁观音；紫泥适合普洱、红茶；段泥适合绿茶、白茶。选对泥料，方能让茶香与壶性相得益彰。',
    level: 'p'
  } as const,
  {
    title: '养壶忌急功近利，需日积月累，方显温润包浆。',
    level: 'tip'
  } as const
]

interface WorkGroup {
  workId: string
  workName: string
  records: TraceRecord[]
  firstImage: string
  anchorId: string
}

const TracePage = () => {
  const traceListData = useAppStore(s => s.traceList)
  const [activeType, setActiveType] = useState('全部')
  const [searchKeyword, setSearchKeyword] = useState('')
  const [expandedWorks, setExpandedWorks] = useState<Set<string>>(new Set())
  const listRef = useRef<any>(null)

  const allTraces = traceListData

  const workGroups = useMemo<WorkGroup[]>(() => {
    const workMap = new Map<string, WorkGroup>()
    allTraces.forEach(record => {
      if (!workMap.has(record.workId)) {
        workMap.set(record.workId, {
          workId: record.workId,
          workName: record.workName,
          records: [],
          firstImage: record.image,
          anchorId: `anchor-${record.workId}`
        })
      }
      workMap.get(record.workId)!.records.push(record)
    })
    return Array.from(workMap.values()).map(group => ({
      ...group,
      records: [...group.records].sort((a, b) => {
        if (a.date !== b.date) return a.date < b.date ? -1 : 1
        return TYPE_ORDER[a.type] - TYPE_ORDER[b.type]
      })
    }))
  }, [allTraces])

  const certToWorkMap = useMemo(() => {
    const map = new Map<string, string>()
    allTraces.forEach(t => {
      if (t.certificateNo) {
        map.set(t.certificateNo.toUpperCase(), t.workId)
        map.set(t.certificateNo, t.workId)
      }
    })
    return map
  }, [allTraces])

  const filteredGroups = useMemo(() => {
    let groups = workGroups
    if (searchKeyword.trim()) {
      const kw = searchKeyword.trim()
      const workIdByCert = certToWorkMap.get(kw) || certToWorkMap.get(kw.toUpperCase())
      if (workIdByCert) {
        groups = workGroups.filter(g => g.workId === workIdByCert)
      } else {
        groups = workGroups.filter(g => {
          const matchWork = g.workName.includes(kw)
          const matchRecord = g.records.some(r =>
            r.ownerName.includes(kw) ||
            (r.certificateNo && r.certificateNo.includes(kw)) ||
            r.notes.includes(kw)
          )
          return matchWork || matchRecord
        })
      }
    }
    if (activeType !== '全部') {
      groups = groups.map(g => ({
        ...g,
        records: g.records.filter(r => r.type === activeType)
      })).filter(g => g.records.length > 0)
    }
    return groups
  }, [workGroups, searchKeyword, activeType, certToWorkMap])

  useEffect(() => {
    if (searchKeyword.trim() && filteredGroups.length > 0) {
      const timer = setTimeout(() => {
        setExpandedWorks(prev => {
          const next = new Set(prev)
          filteredGroups.forEach(g => next.add(g.workId))
          return next
        })
        Taro.showToast({ title: `定位到${filteredGroups[0].workName}`, icon: 'none', duration: 1500 })
      }, 200)
      return () => clearTimeout(timer)
    }
  }, [searchKeyword, filteredGroups])

  const toggleWork = (workId: string) => {
    setExpandedWorks(prev => {
      const next = new Set(prev)
      if (next.has(workId)) next.delete(workId)
      else next.add(workId)
      return next
    })
  }

  return (
    <ScrollView className={styles.tracePage} scrollY ref={listRef} scrollIntoView={searchKeyword && filteredGroups.length > 0 ? filteredGroups[0].anchorId : undefined}>
      <View className={styles.searchWrap}>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索作品、持有人或证书编号(如ZS-2026-0052)"
            placeholderClass={styles.searchPlaceholder}
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
            confirmType="search"
          />
          {searchKeyword && (
            <Text className={styles.clearBtn} onClick={() => setSearchKeyword('')}>✕</Text>
          )}
        </View>
      </View>

      <ScrollView className={styles.tabRow} scrollX>
        {TYPE_FILTERS.map(type => (
          <View
            key={type}
            className={classnames(styles.tabBtn, activeType === type && styles.tabBtnActive)}
            onClick={() => setActiveType(type)}
          >
            <Text>{type}</Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.content}>
        <SectionHeader title="作品溯源" subtitle={`共${filteredGroups.length}件作品`} />
        {filteredGroups.length === 0 && (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>📋</Text>
            <Text className={styles.emptyText}>暂无匹配的溯源记录</Text>
          </View>
        )}
        {filteredGroups.map(group => {
          const isExpanded = expandedWorks.has(group.workId)
          return (
            <View key={group.workId} id={group.anchorId} className={styles.workGroupCard}>
              <View
                className={styles.workGroupHeader}
                onClick={() => toggleWork(group.workId)}
              >
                <View className={styles.workGroupInfo}>
                  <Text className={styles.workGroupName}>🏺 {group.workName}</Text>
                  <Text className={styles.workGroupCount}>溯源 {group.records.length} 条</Text>
                </View>
                <Text className={classnames(styles.arrowIcon, isExpanded && styles.arrowIconExpanded)}>▼</Text>
              </View>

              {isExpanded && (
                <View className={styles.timelineContainer}>
                  {group.records.map((trace, idx) => {
                    const TYPE_STYLES_MAP: Record<string, string> = {
                      '创作': styles.typeCreate,
                      '收藏证书': styles.typeCertificate,
                      '流转': styles.typeTransfer,
                      '展销': styles.typeExhibit,
                      '养壶': styles.typeCare
                    }
                    const isLast = idx === group.records.length - 1
                    return (
                      <View key={trace.id} className={styles.timelineItem}>
                        <View className={styles.timelineLeft}>
                          <View className={styles.timelineDot} />
                          {!isLast && <View className={styles.timelineLine} />}
                        </View>
                        <View className={styles.timelineRight}>
                          <View className={styles.traceCardInner}>
                            <View className={styles.traceHeader}>
                              <Text className={styles.traceTypeIcon}>{TYPE_ICONS[trace.type]}</Text>
                              <Text className={classnames(styles.traceTypeTag, TYPE_STYLES_MAP[trace.type])}>{trace.type}</Text>
                              <Text className={styles.traceDate}>{trace.date}</Text>
                            </View>
                            <View className={styles.traceBody}>
                              <View className={styles.traceRow}>
                                <Text className={styles.traceLabel}>持有人</Text>
                                <Text className={styles.traceValue}>{trace.ownerName}</Text>
                              </View>
                              {trace.certificateNo && (
                                <View className={styles.traceRow}>
                                  <Text className={styles.traceLabel}>证书编号</Text>
                                  <Text className={styles.certificateNo} selectable>{trace.certificateNo}</Text>
                                </View>
                              )}
                            </View>
                            {trace.notes && <Text className={styles.traceNotes}>{trace.notes}</Text>}
                          </View>
                        </View>
                      </View>
                    )
                  })}
                </View>
              )}
            </View>
          )
        })}
      </View>

      <View className={styles.guideSection}>
        <View className={styles.content}>
          <SectionHeader title="养壶指导" />
          <View className={styles.guideCard}>
            <Text className={styles.guideTitle}>紫砂壶养护指南</Text>
            <View className={styles.guideBody}>
              {YANGHU_TIPS.map((item, i) => {
                if (item.level === 'subtitle') {
                  return <Text key={i} className={styles.guideSubtitle}>{item.title}</Text>
                }
                if (item.level === 'h3') {
                  return <Text key={i} className={styles.guideH3}>{item.title}</Text>
                }
                if (item.level === 'tip') {
                  return <Text key={i} className={styles.guideTip}>{item.title}</Text>
                }
                return <Text key={i} className={styles.guideP}>{item.title}</Text>
              })}
            </View>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default TracePage

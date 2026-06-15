import React, { useState, useMemo } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import SectionHeader from '@/components/SectionHeader'
import { traceList } from '@/data/trace'
import type { TraceRecord } from '@/types'
import styles from './index.module.scss'

const TYPE_FILTERS = ['全部', '创作', '收藏证书', '流转', '展销', '养壶']
const TYPE_ICONS: Record<string, string> = { '创作': '🎨', '收藏证书': '📜', '流转': '🔄', '展销': '🏛', '养壶': '🫖' }
const TYPE_STYLES: Record<string, string> = {
  '创作': styles.typeCreate,
  '收藏证书': styles.typeCertificate,
  '流转': styles.typeTransfer,
  '展销': styles.typeExhibit,
  '养壶': styles.typeCare
}

const YANGHU_TIPS = `养壶三要素：净、勤、专。{'\n'}{'\n'}1. 净：每次使用后及时清洗，勿留茶垢；{'\n'}2. 勤：常泡常养，一壶不事二茶；{'\n'}3. 专：一壶专泡一类茶，避免串味。{'\n'}{'\n'}养壶忌急功近利，需日积月累，方显温润包浆。`

const TracePage = () => {
  const [activeType, setActiveType] = useState('全部')
  const [searchKeyword, setSearchKeyword] = useState('')

  const filteredTraces = useMemo(() => {
    return traceList.filter((item: TraceRecord) => {
      const matchType = activeType === '全部' || item.type === activeType
      const matchSearch = !searchKeyword ||
        item.workName.includes(searchKeyword) ||
        item.ownerName.includes(searchKeyword) ||
        item.certificateNo.includes(searchKeyword)
      return matchType && matchSearch
    })
  }, [activeType, searchKeyword])

  return (
    <ScrollView className={styles.tracePage} scrollY>
      <View className={styles.searchWrap}>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索作品、作者或证书编号"
            placeholderClass={styles.searchPlaceholder}
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
          />
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
        <SectionHeader title="溯源记录" subtitle={`共${filteredTraces.length}条`} />
        {filteredTraces.map(trace => (
          <View key={trace.id} className={styles.traceCard}>
            <View className={styles.traceHeader}>
              <Text className={styles.traceTypeIcon}>{TYPE_ICONS[trace.type]}</Text>
              <Text className={classnames(styles.traceTypeTag, TYPE_STYLES[trace.type])}>{trace.type}</Text>
              <Text className={styles.traceWorkName}>{trace.workName}</Text>
            </View>
            <View className={styles.traceBody}>
              <View className={styles.traceRow}>
                <Text className={styles.traceLabel}>持有人</Text>
                <Text className={styles.traceValue}>{trace.ownerName}</Text>
              </View>
              {trace.certificateNo && (
                <View className={styles.traceRow}>
                  <Text className={styles.traceLabel}>证书编号</Text>
                  <Text className={styles.traceValue}>{trace.certificateNo}</Text>
                </View>
              )}
            </View>
            {trace.notes && <Text className={styles.traceNotes}>{trace.notes}</Text>}
            <Text className={styles.traceDate}>{trace.date}</Text>
          </View>
        ))}
      </View>

      <View className={styles.guideSection}>
        <View className={styles.content}>
          <SectionHeader title="养壶指导" />
          <View className={styles.guideCard}>
            <Text className={styles.guideTitle}>紫砂壶养护指南</Text>
            <Text className={styles.guideText}>{YANGHU_TIPS}</Text>
          </View>
        </View>
      </View>
    </ScrollView>
  )
}

export default TracePage

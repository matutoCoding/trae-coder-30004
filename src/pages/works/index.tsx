import React, { useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import SectionHeader from '@/components/SectionHeader'
import WorkCard from '@/components/WorkCard'
import { useAppStore } from '@/store/appStore'
import styles from './index.module.scss'

const STATUS_FILTERS = ['全部', '制作中', '制作完成', '待烧成', '已烧成', '已入档']

const WorksPage = () => {
  const works = useAppStore(s => s.workList)
  const activeStatus = useAppStore(s => s.worksFilterStatus)
  const activeAuthor = useAppStore(s => s.worksFilterAuthor)
  const activeClay = useAppStore(s => s.worksFilterClay)
  const setWorksFilterStatus = useAppStore(s => s.setWorksFilterStatus)
  const setWorksFilterAuthor = useAppStore(s => s.setWorksFilterAuthor)
  const setWorksFilterClay = useAppStore(s => s.setWorksFilterClay)

  const makingCount = works.filter(w => w.status === '制作中').length
  const completedCount = works.filter(w => w.status === '制作完成').length
  const pendingCount = works.filter(w => w.status === '待烧成').length
  const firedCount = works.filter(w => w.status === '已烧成').length
  const archivedCount = works.filter(w => w.status === '已入档').length

  const authorList = useMemo(() => {
    const set = new Set<string>()
    works.forEach(w => set.add(w.author))
    return ['全部', ...Array.from(set)]
  }, [works])

  const clayTypeList = useMemo(() => {
    const set = new Set<string>()
    works.forEach(w => set.add(w.clayType))
    return ['全部', ...Array.from(set)]
  }, [works])

  const filteredWorks = useMemo(() => {
    return works.filter(w => {
      const matchStatus = activeStatus === '全部' || w.status === activeStatus
      const matchAuthor = activeAuthor === '全部' || w.author === activeAuthor
      const matchClay = activeClay === '全部' || w.clayType === activeClay
      return matchStatus && matchAuthor && matchClay
    })
  }, [works, activeStatus, activeAuthor, activeClay])

  const resetAll = () => {
    setWorksFilterStatus('全部')
    setWorksFilterAuthor('全部')
    setWorksFilterClay('全部')
  }

  return (
    <ScrollView className={styles.worksPage} scrollY>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>作品档案</Text>
        <Text className={styles.headerSubtitle}>职称作者标记 · 作品成品管理</Text>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNumber, styles.making)}>{makingCount}</Text>
          <Text className={styles.statLabel}>制作中</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNumber, styles.completed)}>{completedCount}</Text>
          <Text className={styles.statLabel}>制完</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNumber, styles.pending)}>{pendingCount}</Text>
          <Text className={styles.statLabel}>待烧</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNumber, styles.fired)}>{firedCount}</Text>
          <Text className={styles.statLabel}>已烧成</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNumber, styles.archived)}>{archivedCount}</Text>
          <Text className={styles.statLabel}>已入档</Text>
        </View>
      </View>

      <View className={styles.filterSection}>
        <View className={styles.filterGroup}>
          <Text className={styles.filterGroupLabel}>作品状态</Text>
          <ScrollView scrollX className={styles.filterRow}>
            {STATUS_FILTERS.map(s => (
              <View
                key={s}
                className={classnames(styles.filterBtn, activeStatus === s && styles.filterBtnActive)}
                onClick={() => setWorksFilterStatus(s)}
              >
                <Text>{s}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className={styles.filterGroup}>
          <Text className={styles.filterGroupLabel}>作者筛选</Text>
          <ScrollView scrollX className={styles.filterRow}>
            {authorList.map(a => (
              <View
                key={a}
                className={classnames(styles.filterBtn, styles.filterBtnSub, activeAuthor === a && styles.filterBtnActive2)}
                onClick={() => setWorksFilterAuthor(a)}
              >
                <Text>{a}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className={styles.filterGroup}>
          <Text className={styles.filterGroupLabel}>泥料类型</Text>
          <ScrollView scrollX className={styles.filterRow}>
            {clayTypeList.map(c => (
              <View
                key={c}
                className={classnames(styles.filterBtn, styles.filterBtnSub, activeClay === c && styles.filterBtnActive3)}
                onClick={() => setWorksFilterClay(c)}
              >
                <Text>{c}</Text>
              </View>
            ))}
          </ScrollView>
        </View>

        <View className={styles.filterResult}>
          <Text className={styles.filterResultText}>
            筛选结果：共 {filteredWorks.length} 件作品
            {(activeStatus !== '全部' || activeAuthor !== '全部' || activeClay !== '全部') && (
              <Text className={styles.filterReset} onClick={resetAll}> · 重置筛选</Text>
            )}
          </Text>
        </View>
      </View>

      <View className={styles.content}>
        <SectionHeader title="艺人职称" subtitle={`${authorList.length - 1}位`} />
        <ScrollView scrollX className={styles.authorSection}>
          {authorList.filter(a => a !== '全部').map(author => {
            const firstWork = works.find(w => w.author === author)
            const count = works.filter(w => w.author === author).length
            return (
              <View
                key={author}
                className={classnames(styles.authorCard, activeAuthor === author && styles.authorCardActive)}
                onClick={() => setWorksFilterAuthor(author)}
              >
                <View>
                  <Text className={styles.authorName}>{author}</Text>
                  <Text className={styles.authorTitle}>{firstWork?.authorTitle || ''}</Text>
                </View>
                <Text className={styles.authorWorkCount}>作品 {count} 件</Text>
              </View>
            )
          })}
        </ScrollView>

        <SectionHeader title="作品列表" subtitle={`共${filteredWorks.length}件`} />
        {filteredWorks.length > 0 ? (
          filteredWorks.map(work => <WorkCard key={work.id} work={work} />)
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🏺</Text>
            <Text className={styles.emptyText}>暂无匹配作品</Text>
            <Text className={styles.emptyHint}>试试调整筛选条件</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default WorksPage

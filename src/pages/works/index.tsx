import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import SectionHeader from '@/components/SectionHeader'
import WorkCard from '@/components/WorkCard'
import { useAppStore } from '@/store/appStore'
import styles from './index.module.scss'

const STATUS_FILTERS = ['全部', '制作中', '已烧成', '已入档']

const WorksPage = () => {
  const [activeStatus, setActiveStatus] = useState('全部')
  const works = useAppStore(s => s.workList)

  const filteredWorks = useMemo(() => {
    if (activeStatus === '全部') return works
    return works.filter(w => w.status === activeStatus)
  }, [activeStatus, works])

  const makingCount = works.filter(w => w.status === '制作中').length
  const firedCount = works.filter(w => w.status === '已烧成').length
  const archivedCount = works.filter(w => w.status === '已入档').length

  const authorMap = useMemo(() => {
    const map = new Map<string, { name: string; title: string; count: number }>()
    works.forEach(w => {
      const existing = map.get(w.author)
      if (existing) {
        existing.count += 1
      } else {
        map.set(w.author, { name: w.author, title: w.authorTitle, count: 1 })
      }
    })
    return Array.from(map.values())
  }, [works])

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
          <Text className={classnames(styles.statNumber, styles.fired)}>{firedCount}</Text>
          <Text className={styles.statLabel}>已烧成</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNumber, styles.archived)}>{archivedCount}</Text>
          <Text className={styles.statLabel}>已入档</Text>
        </View>
      </View>

      <View className={styles.filterRow}>
        {STATUS_FILTERS.map(status => (
          <View
            key={status}
            className={classnames(styles.filterBtn, activeStatus === status && styles.filterBtnActive)}
            onClick={() => setActiveStatus(status)}
          >
            <Text>{status}</Text>
          </View>
        ))}
      </View>

      <View className={styles.content}>
        <SectionHeader title="艺人职称" subtitle={`${authorMap.length}位`} />
        <ScrollView scrollX className={styles.authorSection}>
          {authorMap.map(author => (
            <View key={author.name} className={styles.authorCard}>
              <View>
                <Text className={styles.authorName}>{author.name}</Text>
                <Text className={styles.authorTitle}>{author.title}</Text>
              </View>
              <Text className={styles.authorWorkCount}>作品 {author.count} 件</Text>
            </View>
          ))}
        </ScrollView>

        <SectionHeader title="作品列表" subtitle={`共${filteredWorks.length}件`} />
        {filteredWorks.length > 0 ? (
          filteredWorks.map(work => <WorkCard key={work.id} work={work} />)
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyText}>暂无匹配作品</Text>
          </View>
        )}
      </View>
    </ScrollView>
  )
}

export default WorksPage

import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import SectionHeader from '@/components/SectionHeader'
import StatusTag from '@/components/StatusTag'
import { firingList } from '@/data/firing'
import styles from './index.module.scss'

const RESULT_FILTERS = ['全部', '成功', '微裂', '过烧', '欠烧']
const KILN_ICONS: Record<string, string> = { '电窑': '⚡', '气窑': '🔥', '柴窑': '🪵' }

const FiringPage = () => {
  const [activeResult, setActiveResult] = useState('全部')

  const filteredFiring = useMemo(() => {
    if (activeResult === '全部') return firingList
    return firingList.filter(f => f.result === activeResult)
  }, [activeResult])

  const successCount = firingList.filter(f => f.result === '成功').length
  const failCount = firingList.filter(f => f.result !== '成功').length
  const successRate = firingList.length > 0 ? Math.round((successCount / firingList.length) * 100) : 0

  return (
    <ScrollView className={styles.firingPage} scrollY>
      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNumber, styles.statNumberSuccess)}>{successCount}</Text>
          <Text className={styles.statLabel}>烧成成功</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNumber, styles.statNumberFail)}>{failCount}</Text>
          <Text className={styles.statLabel}>异常次数</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNumber, styles.statNumberRate)}>{successRate}%</Text>
          <Text className={styles.statLabel}>成功率</Text>
        </View>
      </View>

      <ScrollView className={styles.filterRow} scrollX>
        {RESULT_FILTERS.map(filter => (
          <View
            key={filter}
            className={classnames(styles.filterBtn, activeResult === filter && styles.filterBtnActive)}
            onClick={() => setActiveResult(filter)}
          >
            <Text>{filter}</Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.content}>
        <SectionHeader title="烧成记录" subtitle={`共${filteredFiring.length}条`} />
        {filteredFiring.map(firing => (
          <View key={firing.id} className={styles.firingCard}>
            <View className={styles.firingHeader}>
              <Text className={styles.firingWorkName}>{firing.workName}</Text>
              <StatusTag status={firing.result} type="firing" />
            </View>
            <View className={styles.firingBody}>
              <View className={styles.infoTag}>
                <Text className={styles.infoTagLabel}>{KILN_ICONS[firing.kilnType]} 窑型</Text>
                <Text className={styles.infoTagValue}>{firing.kilnType}</Text>
              </View>
              <View className={styles.infoTag}>
                <Text className={styles.infoTagLabel}>温度</Text>
                <Text className={styles.infoTagValue}>{firing.temperature}°C</Text>
              </View>
              <View className={styles.infoTag}>
                <Text className={styles.infoTagLabel}>时长</Text>
                <Text className={styles.infoTagValue}>{firing.duration}h</Text>
              </View>
            </View>
            {firing.notes && <Text className={styles.firingNotes}>{firing.notes}</Text>}
            <Text className={styles.firingDate}>{firing.date}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

export default FiringPage

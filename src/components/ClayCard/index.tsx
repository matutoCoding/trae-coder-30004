import React from 'react'
import { View, Text } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import StatusTag from '@/components/StatusTag'
import type { Clay } from '@/types'
import styles from './index.module.scss'

interface ClayCardProps {
  clay: Clay
}

const ClayCard: React.FC<ClayCardProps> = ({ clay }) => {
  const handleTap = () => {
    Taro.navigateTo({ url: `/pages/clayDetail/index?id=${clay.id}` })
  }

  const progressPercent = Math.min(100, Math.round((clay.agingDays / 365) * 100))

  return (
    <View className={styles.clayCard} onClick={handleTap}>
      <View className={styles.cardHeader}>
        <View className={styles.colorDot} style={{ background: clay.color }} />
        <Text className={styles.clayName}>{clay.name}</Text>
        <StatusTag status={clay.status} type="clay" />
      </View>
      <View className={styles.cardBody}>
        <View className={styles.infoRow}>
          <Text className={styles.label}>泥料类别</Text>
          <Text className={styles.value}>{clay.type}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>产地</Text>
          <Text className={styles.value}>{clay.origin}</Text>
        </View>
        <View className={styles.infoRow}>
          <Text className={styles.label}>库存</Text>
          <Text className={styles.value}>{clay.weight}斤</Text>
        </View>
      </View>
      <View className={styles.agingProgress}>
        <View className={styles.progressHeader}>
          <Text className={classnames(styles.progressLabel, styles.label)}>陈腐进度</Text>
          <Text className={styles.progressValue}>{clay.agingDays}天</Text>
        </View>
        <View className={styles.progressBar}>
          <View
            className={classnames(styles.progressFill, clay.status === '已熟化' && styles.progressFull)}
            style={{ width: `${progressPercent}%` }}
          />
        </View>
      </View>
    </View>
  )
}

export default ClayCard

import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import styles from './index.module.scss'

interface StatusTagProps {
  status: string
  type?: 'clay' | 'work' | 'order' | 'firing' | 'process'
}

const statusColorMap: Record<string, string> = {
  '陈腐中': styles.clayAging,
  '已熟化': styles.clayReady,
  '已使用': styles.clayUsed,
  '制作中': styles.workMaking,
  '制作完成': styles.workCompleted,
  '待烧成': styles.workPendingFiring,
  '已烧成': styles.workFired,
  '已入档': styles.workArchived,
  '待确认': styles.orderPending,
  '已完成': styles.orderDone,
  '待开始': styles.processPending,
  '进行中': styles.processActive,
  '成功': styles.fireSuccess,
  '微裂': styles.fireMinor,
  '过烧': styles.fireOver,
  '欠烧': styles.fireUnder
}

const StatusTag: React.FC<StatusTagProps> = ({ status }) => {
  return (
    <View className={classnames(styles.statusTag, statusColorMap[status])}>
      <Text className={styles.statusText}>{status}</Text>
    </View>
  )
}

export default StatusTag

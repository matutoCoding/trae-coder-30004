import React from 'react'
import { View, Text } from '@tarojs/components'
import classnames from 'classnames'
import StatusTag from '@/components/StatusTag'
import type { ProcessStep } from '@/types'
import styles from './index.module.scss'

interface ProcessStepCardProps {
  step: ProcessStep
  isLast: boolean
}

const ProcessStepCard: React.FC<ProcessStepCardProps> = ({ step, isLast }) => {
  return (
    <View className={styles.stepCard}>
      <View className={styles.timeline}>
        <View className={classnames(
          styles.dot,
          step.status === '已完成' && styles.dotDone,
          step.status === '进行中' && styles.dotActive,
          step.status === '待开始' && styles.dotPending
        )} />
        {!isLast && <View className={styles.line} />}
      </View>
      <View className={styles.stepContent}>
        <View className={styles.stepHeader}>
          <Text className={styles.stepName}>{step.name}</Text>
          <StatusTag status={step.status} type="process" />
        </View>
        <Text className={styles.workName}>{step.workName}</Text>
        {step.startTime && (
          <Text className={styles.timeInfo}>{step.startTime}{step.endTime ? ` - ${step.endTime}` : ''}</Text>
        )}
        {step.notes && (
          <Text className={styles.stepNotes}>{step.notes}</Text>
        )}
      </View>
    </View>
  )
}

export default ProcessStepCard

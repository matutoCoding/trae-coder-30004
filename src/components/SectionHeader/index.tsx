import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  actionText?: string
  onAction?: () => void
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, actionText, onAction }) => {
  return (
    <View className={styles.sectionHeader}>
      <View className={styles.titleWrap}>
        <View className={styles.decorLine} />
        <Text className={styles.title}>{title}</Text>
        {subtitle && <Text className={styles.subtitle}>{subtitle}</Text>}
      </View>
      {actionText && (
        <View className={styles.action} onClick={onAction}>
          <Text className={styles.actionText}>{actionText}</Text>
        </View>
      )}
    </View>
  )
}

export default SectionHeader

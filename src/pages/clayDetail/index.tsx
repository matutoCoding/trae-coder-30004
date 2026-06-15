import React from 'react'
import { View, Text } from '@tarojs/components'
import styles from './index.module.scss'

const ClayDetailPage = () => {
  return (
    <View className={styles.clayDetailPage}>
      <Text className={styles.placeholderIcon}>🏺</Text>
      <Text className={styles.placeholderTitle}>泥料详情</Text>
      <Text className={styles.placeholderDesc}>功能正在开发中...</Text>
    </View>
  )
}

export default ClayDetailPage

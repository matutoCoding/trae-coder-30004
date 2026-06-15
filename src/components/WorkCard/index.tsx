import React from 'react'
import { View, Text, Image } from '@tarojs/components'
import Taro from '@tarojs/taro'
import StatusTag from '@/components/StatusTag'
import type { Work } from '@/types'
import styles from './index.module.scss'

interface WorkCardProps {
  work: Work
}

const WorkCard: React.FC<WorkCardProps> = ({ work }) => {
  const handleTap = () => {
    Taro.navigateTo({ url: `/pages/workDetail/index?id=${work.id}` })
  }

  return (
    <View className={styles.workCard} onClick={handleTap}>
      <Image
        className={styles.workImage}
        src={work.image}
        mode="aspectFill"
        onError={(e) => { console.error('[WorkCard] image load error', e) }}
      />
      <View className={styles.workInfo}>
        <View className={styles.infoTop}>
          <Text className={styles.workName}>{work.name}</Text>
          <StatusTag status={work.status} type="work" />
        </View>
        <Text className={styles.authorInfo}>{work.author} · {work.authorTitle}</Text>
        <View className={styles.infoBottom}>
          <Text className={styles.clayInfo}>{work.clayType}</Text>
          <Text className={styles.capacity}>{work.capacity}</Text>
        </View>
      </View>
    </View>
  )
}

export default WorkCard

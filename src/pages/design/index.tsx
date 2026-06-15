import React, { useState, useMemo } from 'react'
import { View, Text, Image, ScrollView } from '@tarojs/components'
import classnames from 'classnames'
import SectionHeader from '@/components/SectionHeader'
import { designList } from '@/data/design'
import styles from './index.module.scss'

const STYLE_FILTERS = ['全部', '光素器', '花器', '筋纹器']

const DesignPage = () => {
  const [activeStyle, setActiveStyle] = useState('全部')

  const filteredDesigns = useMemo(() => {
    if (activeStyle === '全部') return designList
    return designList.filter(d => d.style === activeStyle)
  }, [activeStyle])

  return (
    <ScrollView className={styles.designPage} scrollY>
      <ScrollView className={styles.filterRow} scrollX>
        {STYLE_FILTERS.map(style => (
          <View
            key={style}
            className={classnames(styles.filterBtn, activeStyle === style && styles.filterBtnActive)}
            onClick={() => setActiveStyle(style)}
          >
            <Text>{style}</Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.content}>
        <SectionHeader title="壶型款式" subtitle={`共${filteredDesigns.length}款`} />
        {filteredDesigns.map(design => (
          <View key={design.id} className={styles.designCard}>
            <Image
              className={styles.designImage}
              src={design.image}
              mode="aspectFill"
              onError={(e) => { console.error('[DesignPage] image error', e) }}
            />
            <View className={styles.designInfo}>
              <Text className={styles.designName}>{design.name}</Text>
              <View className={styles.designMeta}>
                <Text className={styles.styleTag}>{design.style}</Text>
                <Text className={styles.difficultyTag}>{design.difficulty}</Text>
              </View>
              <Text className={styles.designDesc}>{design.description}</Text>
              <View className={styles.designFooter}>
                <Text className={styles.designAuthor}>设计：{design.author}</Text>
                <Text className={styles.designTime}>{design.createTime}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  )
}

export default DesignPage

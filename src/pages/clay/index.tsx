import React, { useState, useMemo } from 'react'
import { View, Text, Input, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import SectionHeader from '@/components/SectionHeader'
import ClayCard from '@/components/ClayCard'
import { useAppStore } from '@/store/appStore'
import styles from './index.module.scss'

const CLAY_TYPES = ['全部', '紫泥', '朱泥', '段泥', '绿泥', '底槽清', '拼紫']

const ClayPage = () => {
  const [activeType, setActiveType] = useState('全部')
  const [searchKeyword, setSearchKeyword] = useState('')
  const clayStoreList = useAppStore(s => s.clayList)

  const filteredClayList = useMemo(() => {
    return clayStoreList.filter(item => {
      const matchType = activeType === '全部' || item.type === activeType
      const matchSearch = !searchKeyword || item.name.includes(searchKeyword) || item.origin.includes(searchKeyword)
      return matchType && matchSearch
    })
  }, [activeType, searchKeyword, clayStoreList])

  const agingCount = clayStoreList.filter(c => c.status === '陈腐中').length
  const readyCount = clayStoreList.filter(c => c.status === '已熟化').length
  const totalCount = clayStoreList.length

  const handleAdd = () => {
    Taro.navigateTo({ url: '/pages/clayDetail/index' })
  }

  return (
    <ScrollView className={styles.clayPage} scrollY>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>泥料库</Text>
        <Text className={styles.headerSubtitle}>紫砂泥料陈腐管理</Text>
      </View>

      <View className={styles.searchWrap}>
        <View className={styles.searchBar}>
          <Text className={styles.searchIcon}>🔍</Text>
          <Input
            className={styles.searchInput}
            placeholder="搜索泥料名称或产地"
            placeholderClass={styles.searchPlaceholder}
            value={searchKeyword}
            onInput={(e) => setSearchKeyword(e.detail.value)}
          />
        </View>
      </View>

      <ScrollView className={styles.filterTabs} scrollX>
        {CLAY_TYPES.map(type => (
          <View
            key={type}
            className={classnames(styles.filterTab, activeType === type && styles.filterTabActive)}
            onClick={() => setActiveType(type)}
          >
            <Text>{type}</Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={styles.statNumber}>{totalCount}</Text>
          <Text className={styles.statLabel}>泥料总数</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statNumber}>{agingCount}</Text>
          <Text className={styles.statLabel}>陈腐中</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={styles.statNumber}>{readyCount}</Text>
          <Text className={styles.statLabel}>已熟化</Text>
        </View>
      </View>

      <View className={styles.content}>
        <SectionHeader title="泥料列表" subtitle={`共${filteredClayList.length}种`} />
        {filteredClayList.length > 0 ? (
          filteredClayList.map(clay => <ClayCard key={clay.id} clay={clay} />)
        ) : (
          <View className={styles.emptyState}>
            <Text className={styles.emptyText}>暂无匹配的泥料，点击右下角+新增</Text>
          </View>
        )}
      </View>

      <View className={styles.addButton} onClick={handleAdd}>
        <Text className={styles.addButtonText}>+</Text>
      </View>
    </ScrollView>
  )
}

export default ClayPage

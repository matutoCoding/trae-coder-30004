import React from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import { workList } from '@/data/work'
import { orderList } from '@/data/order'
import { clayList } from '@/data/clay'
import styles from './index.module.scss'

const MENU_ITEMS = [
  { icon: '📦', title: '定制订单', desc: '刻绘定制管理', path: '/pages/order/index' },
  { icon: '🔥', title: '烧成记录', desc: '窑温烧成追踪', path: '/pages/firing/index' },
  { icon: '📜', title: '收藏溯源', desc: '证书与流转记录', path: '/pages/trace/index' },
  { icon: '📐', title: '壶型设计', desc: '款式设计方案', path: '/pages/design/index' },
  { icon: '🫖', title: '养壶指导', desc: '紫砂壶养护知识', path: '/pages/trace/index' },
  { icon: '📊', title: '数据统计', desc: '创作数据概览', path: '' }
]

const MinePage = () => {
  const totalWorks = workList.length
  const totalOrders = orderList.length
  const totalClay = clayList.length

  const handleMenuClick = (path: string) => {
    if (!path) return
    Taro.navigateTo({ url: path })
  }

  return (
    <ScrollView className={styles.minePage} scrollY>
      <View className={styles.profileCard}>
        <View className={styles.profileInfo}>
          <View className={styles.avatar}>周</View>
          <View className={styles.profileDetail}>
            <Text className={styles.profileName}>周建平</Text>
            <Text className={styles.profileTitle}>工艺美术师</Text>
          </View>
        </View>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statItem}>
          <Text className={styles.statNumber}>{totalWorks}</Text>
          <Text className={styles.statLabel}>作品数</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNumber}>{totalOrders}</Text>
          <Text className={styles.statLabel}>订单数</Text>
        </View>
        <View className={styles.statItem}>
          <Text className={styles.statNumber}>{totalClay}</Text>
          <Text className={styles.statLabel}>泥料种</Text>
        </View>
      </View>

      <View className={styles.menuSection}>
        <Text className={styles.sectionTitle}>功能管理</Text>
        <View className={styles.menuCard}>
          {MENU_ITEMS.map(item => (
            <View
              key={item.title}
              className={styles.menuItem}
              onClick={() => handleMenuClick(item.path)}
            >
              <Text className={styles.menuIcon}>{item.icon}</Text>
              <Text className={styles.menuText}>{item.title}</Text>
              <Text className={styles.menuDesc}>{item.desc}</Text>
              <Text className={styles.menuArrow}>›</Text>
            </View>
          ))}
        </View>
      </View>

      <View className={styles.aboutSection}>
        <View className={styles.aboutCard}>
          <Text className={styles.aboutTitle}>紫砂工坊</Text>
          <Text className={styles.aboutDesc}>
            传承千年紫砂技艺，以匠人之心制器。{'\n'}
            记录每一块泥料的陈腐，每一道工序的匠心，{'\n'}
            每一件作品的诞生与流转。
          </Text>
        </View>
      </View>
    </ScrollView>
  )
}

export default MinePage

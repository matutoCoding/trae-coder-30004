import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import SectionHeader from '@/components/SectionHeader'
import ProcessStepCard from '@/components/ProcessStepCard'
import { processStepList } from '@/data/process'
import styles from './index.module.scss'

const PROCESS_FILTERS = ['全部', '打泥片', '打身筒', '镶接', '明针修坯', '装嘴把', '精加工', '刻绘']

const PROCESS_ICONS: Record<string, string> = {
  '壶型设计': '📐',
  '烧成记录': '🔥',
  '养壶指导': '🫖'
}

const ProcessPage = () => {
  const [activeFilter, setActiveFilter] = useState('全部')

  const currentWorkSteps = useMemo(() => {
    const currentSteps = processStepList.filter(s => s.workId === 'work-001')
    const currentStep = currentSteps.find(s => s.status === '进行中')
    return { steps: currentSteps, currentStep }
  }, [])

  const filteredSteps = useMemo(() => {
    if (activeFilter === '全部') return processStepList
    return processStepList.filter(s => s.type === activeFilter)
  }, [activeFilter])

  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path })
  }

  return (
    <ScrollView className={styles.processPage} scrollY>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>制壶工序</Text>
        <Text className={styles.headerSubtitle}>打身筒 · 镶接 · 明针修坯</Text>
      </View>

      <View className={styles.currentWork}>
        <Text className={styles.currentWorkLabel}>当前制作中</Text>
        <Text className={styles.currentWorkName}>{currentWorkSteps.currentStep?.workName || '石瓢壶'}</Text>
        <Text className={styles.currentWorkInfo}>
          当前工序：{currentWorkSteps.currentStep?.name || '明针修坯'} · 第{currentWorkSteps.currentStep?.order || 4}步/共7步
        </Text>
      </View>

      <View className={styles.quickActions}>
        <View className={styles.actionBtn} onClick={() => handleNav('/pages/design/index')}>
          <Text className={styles.actionIcon}>{PROCESS_ICONS['壶型设计']}</Text>
          <Text className={styles.actionLabel}>壶型设计</Text>
        </View>
        <View className={styles.actionBtn} onClick={() => handleNav('/pages/firing/index')}>
          <Text className={styles.actionIcon}>{PROCESS_ICONS['烧成记录']}</Text>
          <Text className={styles.actionLabel}>烧成记录</Text>
        </View>
        <View className={styles.actionBtn} onClick={() => handleNav('/pages/trace/index')}>
          <Text className={styles.actionIcon}>{PROCESS_ICONS['养壶指导']}</Text>
          <Text className={styles.actionLabel}>养壶指导</Text>
        </View>
      </View>

      <ScrollView className={styles.filterRow} scrollX>
        {PROCESS_FILTERS.map(filter => (
          <View
            key={filter}
            className={classnames(styles.filterBtn, activeFilter === filter && styles.filterBtnActive)}
            onClick={() => setActiveFilter(filter)}
          >
            <Text>{filter}</Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.content}>
        <SectionHeader title="工序记录" subtitle={`共${filteredSteps.length}条`} />
        <View className={styles.timelineWrap}>
          {filteredSteps.length > 0 ? (
            filteredSteps.map((step, index) => (
              <ProcessStepCard
                key={step.id}
                step={step}
                isLast={index === filteredSteps.length - 1}
              />
            ))
          ) : (
            <View className={styles.emptyState}>
              <Text className={styles.emptyText}>暂无工序记录</Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  )
}

export default ProcessPage

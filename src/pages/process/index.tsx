import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView } from '@tarojs/components'
import Taro from '@tarojs/taro'
import classnames from 'classnames'
import SectionHeader from '@/components/SectionHeader'
import ProcessStepCard from '@/components/ProcessStepCard'
import { useAppStore } from '@/store/appStore'
import styles from './index.module.scss'

const PROCESS_FILTERS = ['全部', '打泥片', '打身筒', '镶接', '明针修坯', '装嘴把', '精加工', '刻绘']

const PROCESS_ICONS: Record<string, string> = {
  '壶型设计': '📐',
  '烧成记录': '🔥',
  '养壶指导': '🫖'
}

const ProcessPage = () => {
  const [activeFilter, setActiveFilter] = useState('全部')
  const processSteps = useAppStore(s => s.processStepList)
  const works = useAppStore(s => s.workList)

  const currentWorkSteps = useMemo(() => {
    const active = processSteps.find(s => s.status === '进行中')
    if (!active) return { steps: [] as typeof processSteps, currentStep: null as any }
    const currentSteps = processSteps.filter(s => s.workId === active.workId)
    return { steps: currentSteps, currentStep: active }
  }, [processSteps])

  const currentWork = useMemo(() => {
    if (!currentWorkSteps.currentStep) return null
    return works.find(w => w.id === currentWorkSteps.currentStep.workId) || null
  }, [works, currentWorkSteps.currentStep])

  const filteredSteps = useMemo(() => {
    if (activeFilter === '全部') return processSteps
    return processSteps.filter(s => s.type === activeFilter)
  }, [activeFilter, processSteps])

  const handleNav = (path: string) => {
    Taro.navigateTo({ url: path })
  }

  const handleEnterCurrentWork = () => {
    if (!currentWorkSteps.currentStep) return
    Taro.navigateTo({ url: `/pages/workDetail/index?id=${currentWorkSteps.currentStep.workId}` })
  }

  return (
    <ScrollView className={styles.processPage} scrollY>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>制壶工序</Text>
        <Text className={styles.headerSubtitle}>打身筒 · 镶接 · 明针修坯</Text>
      </View>

      <View className={styles.currentWork} onClick={handleEnterCurrentWork}>
        <Text className={styles.currentWorkLabel}>当前制作中 → 点击查看进度</Text>
        <Text className={styles.currentWorkName}>
          {currentWork?.name || currentWorkSteps.currentStep?.workName || '暂无进行中的作品'}
        </Text>
        <Text className={styles.currentWorkInfo}>
          当前工序：{currentWorkSteps.currentStep?.name || '—'}
          {' '}· 第{currentWorkSteps.currentStep?.order || 0}步/共{currentWorkSteps.steps.length || 0}步
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

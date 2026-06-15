import React, { useMemo } from 'react'
import { View, Text, Image, ScrollView, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import StatusTag from '@/components/StatusTag'
import { useAppStore } from '@/store/appStore'
import type { ProcessStep } from '@/types'
import styles from './index.module.scss'

const WorkDetailPage = () => {
  const router = useRouter()
  const { id } = router.params

  const works = useAppStore(s => s.workList)
  const allSteps = useAppStore(s => s.processStepList)
  const completeStep = useAppStore(s => s.completeStep)

  const work = useMemo(() => {
    if (!id) return null
    return works.find(w => w.id === id) || null
  }, [id, works])

  const workSteps = useMemo<ProcessStep[]>(() => {
    if (!id) return []
    return allSteps
      .filter(s => s.workId === id)
      .sort((a, b) => a.order - b.order)
  }, [id, allSteps])

  const progress = useMemo(() => {
    if (workSteps.length === 0) return { done: 0, total: 0, percent: 0 }
    const done = workSteps.filter(s => s.status === '已完成').length
    return {
      done,
      total: workSteps.length,
      percent: Math.round((done / workSteps.length) * 100)
    }
  }, [workSteps])

  const handleCompleteStep = (step: ProcessStep) => {
    Taro.showModal({
      title: `完成「${step.name}」工序`,
      content: `确定已完成 ${step.name} 步骤吗？\n确认后将自动流转到下一步骤。`,
      confirmText: '确认完成',
      cancelText: '再等等',
      confirmColor: '#C04851',
      success: (res) => {
        if (res.confirm) {
          completeStep(step.id)
          console.log('[WorkDetail] step completed:', step.name, 'workId:', step.workId)
          Taro.showToast({
            title: step.type === '刻绘' || step.type === '精加工' ? '全部工序完成🎉' : '工序完成',
            icon: 'success',
            duration: 1500
          })
        }
      }
    })
  }

  if (!work) {
    return (
      <View className={styles.workDetailPage}>
        <View className={styles.emptyWrap}>
          <Text className={styles.emptyIcon}>🏺</Text>
          <Text className={styles.emptyText}>未找到该作品</Text>
        </View>
      </View>
    )
  }

  return (
    <ScrollView className={styles.workDetailPage} scrollY>
      <Image
        className={styles.heroImage}
        src={work.image}
        mode="aspectFill"
        onError={(e) => console.error('[WorkDetail] hero image error:', e)}
      />

      <View className={styles.infoCard}>
        <View className={styles.workTitle}>
          <Text className={styles.workName}>{work.name}</Text>
          <StatusTag status={work.status} type="work" />
        </View>

        <View className={styles.workMeta}>
          <Text className={styles.metaTag}>🏺 {work.clayType}</Text>
          <Text className={styles.metaTag}>📐 {work.designName}</Text>
          <Text className={styles.metaTag}>📏 {work.capacity}</Text>
          <Text className={styles.metaTag}>📅 {work.createTime}</Text>
        </View>

        <View className={styles.authorSection}>
          <View className={styles.authorAvatar}>{work.author.slice(0, 1)}</View>
          <View className={styles.authorInfo}>
            <Text className={styles.authorName}>{work.author}</Text>
            <Text className={styles.authorTitle}>🎓 {work.authorTitle}</Text>
          </View>
        </View>

        <View className={styles.description}>
          <Text className={styles.descLabel}>作品描述</Text>
          <Text className={styles.descText}>{work.description}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <View className={styles.sectionTitle}>
          <Text className={styles.sectionTitleText}>制作工序进度</Text>
        </View>

        <View className={styles.progressCard}>
          <View className={styles.progressInfo}>
            <Text className={styles.progressText}>
              已完成 <Text style={{ fontWeight: 600, color: '#8B6F4E' }}>{progress.done}</Text> / {progress.total} 步
            </Text>
            <Text className={styles.progressPercent}>{progress.percent}%</Text>
          </View>
          <View className={styles.progressBar}>
            <View className={styles.progressFill} style={{ width: `${progress.percent}%` }} />
          </View>
        </View>

        <View className={styles.stepsWrap}>
          {workSteps.length === 0 && (
            <View className={styles.emptyWrap}>
              <Text className={styles.emptyIcon}>📝</Text>
              <Text className={styles.emptyText}>暂无工序记录</Text>
            </View>
          )}

          {workSteps.map((step, idx) => {
            const isLast = idx === workSteps.length - 1
            const isDone = step.status === '已完成'
            const isActive = step.status === '进行中'
            const nextStatus = isDone
              ? '已完成：打身筒→镶接工序自动流转'
              : isActive
                ? '进行中：明针修坯工序完成后自动更新作品状态'
                : '待开始'
            console.log('[debug] step rendering:', step.name, 'status:', step.status, nextStatus)

            return (
              <View key={step.id} className={styles.stepItem}>
                <View className={styles.stepLeft}>
                  <View
                    className={classnames(
                      styles.stepDot,
                      isDone && styles.stepDotDone,
                      isActive && styles.stepDotActive
                    )}
                  />
                  {!isLast && (
                    <View
                      className={classnames(
                        styles.stepLine,
                        isDone && styles.stepLineDone
                      )}
                    />
                  )}
                </View>

                <View className={styles.stepRight}>
                  <View
                    className={classnames(
                      styles.stepCard,
                      isActive && styles.stepCardActive,
                      isDone && styles.stepCardDone
                    )}
                  >
                    <View className={styles.stepHeader}>
                      <Text className={styles.stepName}>
                        {step.type === '打身筒' && '🫖 '}
                        {step.type === '镶接' && '🔗 '}
                        {step.type === '明针修坯' && '✨ '}
                        {step.type === '装嘴把' && '🎯 '}
                        {step.type === '刻绘' && '✒️ '}
                        {step.type === '精加工' && '🔍 '}
                        {step.type === '打泥片' && '🪨 '}
                        {step.name}
                      </Text>
                      <Text className={styles.stepOrder}>第 {step.order} 步</Text>
                    </View>

                    {(step.startTime || step.endTime) && (
                      <Text className={styles.stepTime}>
                        {step.startTime}
                        {step.endTime && ` → ${step.endTime.split(' ')[1] || step.endTime}`}
                      </Text>
                    )}

                    {step.notes && (
                      <Text className={styles.stepNotes}>{step.notes}</Text>
                    )}

                    {isDone && (
                      <View className={styles.stepActionWrap}>
                        <Text className={styles.stepDoneTag}>✓ 本步已完成</Text>
                      </View>
                    )}

                    {isActive && (
                      <View className={styles.stepActionWrap}>
                        <Button
                          className={styles.stepActionBtn}
                          onClick={() => handleCompleteStep(step)}
                        >
                          <Text className={styles.stepActionBtnText}>
                            完成「{step.name}」并进入下一步
                          </Text>
                        </Button>
                      </View>
                    )}

                    {step.status === '待开始' && (
                      <View className={styles.stepActionWrap}>
                        <Text style={{ fontSize: 22, color: '#9B8B7A' }}>· 待上一步完成后自动开始</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            )
          })}
        </View>
      </View>

      <View style={{ height: 80 }} />
    </ScrollView>
  )
}

export default WorkDetailPage

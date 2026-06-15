import React, { useMemo, useState } from 'react'
import { View, Text, Image, ScrollView, Button, Input } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import StatusTag from '@/components/StatusTag'
import { useAppStore } from '@/store/appStore'
import type { ProcessStep, TraceRecord } from '@/types'
import styles from './index.module.scss'

const KILN_ICONS: Record<string, string> = { '电窑': '⚡', '气窑': '🔥', '柴窑': '🪵' }
const TRACE_ICONS: Record<string, string> = { '创作': '🎨', '收藏证书': '🏆', '流转': '🤝', '展销': '🏷️', '养壶': '💧' }

const WorkDetailPage = () => {
  const router = useRouter()
  const { id } = router.params

  const works = useAppStore(s => s.workList)
  const allSteps = useAppStore(s => s.processStepList)
  const firingList = useAppStore(s => s.firingList)
  const clayList = useAppStore(s => s.clayList)
  const traceList = useAppStore(s => s.traceList)
  const completeStep = useAppStore(s => s.completeStep)
  const archiveWork = useAppStore(s => s.archiveWork)

  const [archiveModal, setArchiveModal] = useState(false)
  const [archiveNo, setArchiveNo] = useState('')
  const [capacityRecheck, setCapacityRecheck] = useState('')
  const [productImage, setProductImage] = useState('')
  const [certificateNo, setCertificateNo] = useState('')

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

  const workFiringList = useMemo(() => {
    if (!id) return []
    return firingList.filter(f => f.workId === id)
  }, [id, firingList])

  const workTraceList = useMemo<TraceRecord[]>(() => {
    if (!id) return []
    return traceList.filter(t => t.workId === id)
  }, [id, traceList])

  const clayInfo = useMemo(() => {
    if (!work) return null
    const clay = clayList.find(c => c.id === work.clayId)
    const used = workSteps.reduce((s, x) => s + (x.consumeWeight || 0), 0)
    return { clay, used }
  }, [work, clayList, workSteps])

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
    const lastStep = workSteps.length > 0 ? workSteps[workSteps.length - 1] : null
    const isLast = lastStep && step.id === lastStep.id
    const willConsume = step.consumeWeight && step.consumeWeight > 0

    const consumeTip = willConsume
      ? `\n本次消耗泥料 ${step.clayName} ${step.consumeWeight} 斤。`
      : ''

    Taro.showModal({
      title: `完成「${step.name}」工序`,
      content: (isLast
        ? `确定已完成 ${step.name} 吗？\n确认后全部工序完成，作品状态将改为「制作完成」。${consumeTip}`
        : `确定已完成 ${step.name} 步骤吗？\n确认后将自动流转到下一步骤。${consumeTip}`),
      confirmText: isLast ? '完成全部工序' : '确认完成',
      cancelText: '再等等',
      confirmColor: '#C04851',
      success: (res) => {
        if (res.confirm) {
          completeStep(step.id)
          Taro.showToast({
            title: isLast ? '全部工序完成🎉' : (willConsume ? `已完成，扣泥 ${step.consumeWeight}斤` : '工序完成'),
            icon: 'success',
            duration: 1800
          })
        }
      }
    })
  }

  const openFiringPage = () => {
    if (!id) return
    Taro.navigateTo({ url: `/pages/firing/index?workId=${id}` })
  }

  const openArchiveModal = () => {
    if (work?.status !== '已烧成') {
      Taro.showToast({ title: '需先烧成成功才能入档', icon: 'none' })
      return
    }
    if (work.archiveNo) {
      Taro.showToast({ title: '该作品已入档', icon: 'none' })
      return
    }
    setArchiveModal(true)
  }

  const handleArchive = () => {
    if (!id) return
    if (!archiveNo.trim()) {
      Taro.showToast({ title: '请填写成品编号', icon: 'none' })
      return
    }
    if (!certificateNo.trim()) {
      Taro.showToast({ title: '请填写收藏证书号', icon: 'none' })
      return
    }
    if (!capacityRecheck.trim()) {
      Taro.showToast({ title: '请填写容量复核', icon: 'none' })
      return
    }

    archiveWork(id, {
      archiveNo: archiveNo.trim(),
      capacityRecheck: capacityRecheck.trim(),
      productImage: productImage.trim() || work?.image,
      certificateNo: certificateNo.trim()
    })

    Taro.showToast({ title: '作品入档成功', icon: 'success' })
    setArchiveModal(false)
    setArchiveNo('')
    setCapacityRecheck('')
    setProductImage('')
    setCertificateNo('')
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
        src={work.productImage || work.image}
        mode="aspectFill"
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

        {work.archiveNo && (
          <View className={styles.archiveSection}>
            <Text className={styles.sectionTitle}>📦 作品入档信息</Text>
            <View className={styles.archiveCard}>
              <View className={styles.infoTag}>
                <Text className={styles.infoTagLabel}>成品编号</Text>
                <Text className={styles.infoTagValue}>{work.archiveNo}</Text>
              </View>
              <View className={styles.infoTag}>
                <Text className={styles.infoTagLabel}>容量复核</Text>
                <Text className={styles.infoTagValue}>{work.capacityRecheck}</Text>
              </View>
              <View className={styles.infoTag}>
                <Text className={styles.infoTagLabel}>收藏证书</Text>
                <Text className={styles.infoTagValue}>{work.certificateNo}</Text>
              </View>
              <View className={styles.infoTag}>
                <Text className={styles.infoTagLabel}>入档时间</Text>
                <Text className={styles.infoTagValue}>{work.archiveTime}</Text>
              </View>
            </View>
          </View>
        )}

        {clayInfo?.clay && (
          <View className={styles.claySection}>
            <Text className={styles.sectionTitle}>🪨 泥料批次</Text>
            <View className={styles.clayInfoCard}>
              <View>
                <Text className={styles.clayName}>{clayInfo.clay.name}</Text>
                <Text className={styles.clayMetaLine}>{clayInfo.clay.type} · {clayInfo.clay.origin}</Text>
              </View>
              <View className={styles.clayWeightRow}>
                <View className={styles.clayWeightItem}>
                  <Text className={styles.clayWeightLabel}>已用</Text>
                  <Text className={styles.clayWeightValue}>—{clayInfo.used.toFixed(1)}斤</Text>
                </View>
                <View className={styles.clayWeightItem}>
                  <Text className={styles.clayWeightLabel}>库存</Text>
                  <Text className={classnames(styles.clayWeightValue, clayInfo.clay.weight < 1 && styles.clayWeightLow)}>
                    {clayInfo.clay.weight.toFixed(1)}斤
                  </Text>
                </View>
              </View>
            </View>
          </View>
        )}

        <View className={styles.description}>
          <Text className={styles.descLabel}>作品描述</Text>
          <Text className={styles.descText}>{work.description}</Text>
        </View>
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitleText}>制作工序进度</Text>

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
          {workSteps.map((step, idx) => {
            const isLast = idx === workSteps.length - 1
            const isDone = step.status === '已完成'
            const isActive = step.status === '进行中'

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

                    {step.consumeWeight && step.consumeWeight > 0 && (
                      <Text className={styles.stepConsume}>
                        🔧 消耗 {step.clayName || '泥料'} {step.consumeWeight}斤
                      </Text>
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

      <View className={styles.section}>
        <View className={styles.sectionTitleRow}>
          <Text className={styles.sectionTitleText}>烧成记录</Text>
          <View className={styles.sectionActionBtn} onClick={openFiringPage}>
            <Text className={styles.sectionActionText}>录入入窑记录 +</Text>
          </View>
        </View>

        {workFiringList.length === 0 ? (
          <View className={styles.firingEmptyCard} onClick={openFiringPage}>
            <Text className={styles.firingEmptyIcon}>🔥</Text>
            <Text className={styles.firingEmptyTitle}>暂无入窑记录</Text>
            <Text className={styles.firingEmptyHint}>点击此处为「{work.name}」补一条烧成记录</Text>
          </View>
        ) : (
          workFiringList.map(firing => (
            <View key={firing.id} className={styles.firingCard}>
              <View className={styles.firingCardHeader}>
                <StatusTag status={firing.result} type="firing" />
                <Text className={styles.firingCardDate}>{firing.date}</Text>
              </View>
              <View className={styles.firingCardBody}>
                <View className={styles.infoTag}>
                  <Text className={styles.infoTagLabel}>{KILN_ICONS[firing.kilnType]} 窑型</Text>
                  <Text className={styles.infoTagValue}>{firing.kilnType}</Text>
                </View>
                <View className={styles.infoTag}>
                  <Text className={styles.infoTagLabel}>温度</Text>
                  <Text className={styles.infoTagValue}>{firing.temperature}°C</Text>
                </View>
                <View className={styles.infoTag}>
                  <Text className={styles.infoTagLabel}>时长</Text>
                  <Text className={styles.infoTagValue}>{firing.duration}h</Text>
                </View>
              </View>
              {firing.notes && <Text className={styles.firingCardNotes}>{firing.notes}</Text>}
            </View>
          ))
        )}

        {work.status === '已烧成' && !work.archiveNo && (
          <View className={styles.archiveCardCta} onClick={openArchiveModal}>
            <Text className={styles.archiveCtaTitle}>📦 填写成品信息并入档</Text>
            <Text className={styles.archiveCtaHint}>烧成成功可填写成品编号、容量复核、照片、证书号并入库</Text>
          </View>
        )}
      </View>

      <View className={styles.section}>
        <Text className={styles.sectionTitleText}>溯源与养壶时间轴</Text>

        {workTraceList.length === 0 ? (
          <View className={styles.firingEmptyCard}>
            <Text className={styles.firingEmptyIcon}>📜</Text>
            <Text className={styles.firingEmptyTitle}>暂无溯源记录</Text>
            <Text className={styles.firingEmptyHint}>创作、收藏、流转、展销、养壶记录将显示在这里</Text>
          </View>
        ) : (
          <View className={styles.traceTimeline}>
            {workTraceList.map((trace, idx) => {
              const isLast = idx === workTraceList.length - 1
              return (
                <View key={trace.id} className={styles.traceItem}>
                  <View className={styles.traceLeft}>
                    <View className={styles.traceDot}>
                      <Text className={styles.traceIcon}>{TRACE_ICONS[trace.type] || '📜'}</Text>
                    </View>
                    {!isLast && <View className={styles.traceLine} />}
                  </View>

                  <View className={styles.traceCard}>
                    <View className={styles.traceCardHeader}>
                      <Text className={styles.traceType}>{trace.type}</Text>
                      <Text className={styles.traceDate}>{trace.date}</Text>
                    </View>
                    <Text className={styles.traceOwner}>所有者：{trace.ownerName}</Text>
                    {trace.certificateNo && (
                      <Text className={styles.traceCert}>证书编号：{trace.certificateNo}</Text>
                    )}
                    {trace.notes && (
                      <Text className={styles.traceNotes}>{trace.notes}</Text>
                    )}
                    {trace.image && trace.type === '收藏证书' && (
                      <Image className={styles.traceImage} src={trace.image} mode="aspectFill" />
                    )}
                  </View>
                </View>
              )
            })}
          </View>
        )}
      </View>

      {archiveModal && (
        <View className={styles.modalMask}>
          <View className={styles.modalCard}>
            <Text className={styles.modalTitle}>📦 作品入档</Text>

            <View className={styles.formRow}>
              <Text className={styles.formLabel}>成品编号 *</Text>
              <Input
                className={styles.formInput}
                placeholder="例：CP-2026-001"
                value={archiveNo}
                onInput={(e) => setArchiveNo(e.detail.value)}
              />
            </View>

            <View className={styles.formRow}>
              <Text className={styles.formLabel}>容量复核 *</Text>
              <Input
                className={styles.formInput}
                placeholder="例：320cc"
                value={capacityRecheck}
                onInput={(e) => setCapacityRecheck(e.detail.value)}
              />
            </View>

            <View className={styles.formRow}>
              <Text className={styles.formLabel}>收藏证书号 *</Text>
              <Input
                className={styles.formInput}
                placeholder="例：ZS-2026-0051"
                value={certificateNo}
                onInput={(e) => setCertificateNo(e.detail.value)}
              />
            </View>

            <View className={styles.formRow}>
              <Text className={styles.formLabel}>成品照片 URL</Text>
              <Input
                className={styles.formInput}
                placeholder="选填，默认使用当前作品图"
                value={productImage}
                onInput={(e) => setProductImage(e.detail.value)}
              />
            </View>

            <View className={styles.modalActions}>
              <View className={styles.cancelBtn} onClick={() => setArchiveModal(false)}>
                <Text className={styles.cancelBtnText}>取消</Text>
              </View>
              <View className={styles.submitBtn} onClick={handleArchive}>
                <Text className={styles.submitBtnText}>确认入档</Text>
              </View>
            </View>
          </View>
        </View>
      )}

      <View style={{ height: 80 }} />
    </ScrollView>
  )
}

export default WorkDetailPage

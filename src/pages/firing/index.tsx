import React, { useState, useMemo } from 'react'
import { View, Text, ScrollView, Input } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import SectionHeader from '@/components/SectionHeader'
import StatusTag from '@/components/StatusTag'
import { useAppStore } from '@/store/appStore'
import type { Firing } from '@/types'
import styles from './index.module.scss'

const RESULT_FILTERS = ['全部', '成功', '微裂', '过烧', '欠烧']
const KILN_TYPES = ['电窑', '气窑', '柴窑'] as const
const RESULTS = ['成功', '微裂', '过烧', '欠烧'] as const
const KILN_ICONS: Record<string, string> = { '电窑': '⚡', '气窑': '🔥', '柴窑': '🪵' }

const pad = (n: number) => n.toString().padStart(2, '0')
const todayStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const FiringPage = () => {
  const router = useRouter()
  const presetWorkId = router.params.workId

  const firingList = useAppStore(s => s.firingList)
  const works = useAppStore(s => s.workList)
  const addFiring = useAppStore(s => s.addFiring)

  const [activeResult, setActiveResult] = useState('全部')
  const [showForm, setShowForm] = useState(false)
  const [formKilnType, setFormKilnType] = useState<string>('电窑')
  const [formTemperature, setFormTemperature] = useState<string>('1180')
  const [formDuration, setFormDuration] = useState<string>('8')
  const [formResult, setFormResult] = useState<string>('成功')
  const [formDate, setFormDate] = useState<string>(todayStr())
  const [formNotes, setFormNotes] = useState<string>('')
  const [formWorkId, setFormWorkId] = useState<string>(presetWorkId || '')

  const presetWork = useMemo(() => {
    if (!formWorkId) return null
    return works.find(w => w.id === formWorkId) || null
  }, [formWorkId, works])

  const filteredFiring = useMemo(() => {
    if (activeResult === '全部') return firingList
    return firingList.filter(f => f.result === activeResult)
  }, [activeResult, firingList])

  const successCount = firingList.filter(f => f.result === '成功').length
  const failCount = firingList.filter(f => f.result !== '成功').length
  const successRate = firingList.length > 0 ? Math.round((successCount / firingList.length) * 100) : 0

  const openForm = () => {
    if (!formWorkId && works.length > 0) {
      setFormWorkId(works[0].id)
    }
    setShowForm(true)
  }

  const closeForm = () => {
    setShowForm(false)
  }

  const validate = () => {
    const t = Number(formTemperature)
    const d = Number(formDuration)
    if (!formWorkId) {
      Taro.showToast({ title: '请选择作品', icon: 'none' })
      return false
    }
    if (!formKilnType) {
      Taro.showToast({ title: '请选择窑型', icon: 'none' })
      return false
    }
    if (isNaN(t) || t < 500 || t > 2000) {
      Taro.showToast({ title: '窑温需在 500-2000°C', icon: 'none' })
      return false
    }
    if (isNaN(d) || d < 1 || d > 100) {
      Taro.showToast({ title: '时长需在 1-100 小时', icon: 'none' })
      return false
    }
    if (!formDate) {
      Taro.showToast({ title: '请选择日期', icon: 'none' })
      return false
    }
    return true
  }

  const handleSubmit = () => {
    if (!validate()) return
    const target = works.find(w => w.id === formWorkId)
    const firing: Omit<Firing, 'id'> = {
      workId: formWorkId,
      workName: target?.name || '未知作品',
      kilnType: formKilnType as any,
      temperature: Number(formTemperature),
      duration: Number(formDuration),
      result: formResult as any,
      notes: formNotes,
      date: formDate
    }
    addFiring(firing)
    Taro.showToast({ title: '入窑记录已保存', icon: 'success' })
    console.log('[Firing] added:', firing)
    closeForm()
  }

  return (
    <ScrollView className={styles.firingPage} scrollY>
      <View className={styles.header}>
        <Text className={styles.headerTitle}>烧成记录</Text>
        <Text className={styles.headerSubtitle}>窑温烧成追踪</Text>
      </View>

      <View className={styles.statsRow}>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNumber, styles.statNumberSuccess)}>{successCount}</Text>
          <Text className={styles.statLabel}>烧成成功</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNumber, styles.statNumberFail)}>{failCount}</Text>
          <Text className={styles.statLabel}>异常次数</Text>
        </View>
        <View className={styles.statCard}>
          <Text className={classnames(styles.statNumber, styles.statNumberRate)}>{successRate}%</Text>
          <Text className={styles.statLabel}>成功率</Text>
        </View>
      </View>

      {presetWork && (
        <View className={styles.presetWorkCard}>
          <Text className={styles.presetWorkLabel}>为作品录入入窑记录</Text>
          <Text className={styles.presetWorkName}>{presetWork.name}</Text>
          <Text className={styles.presetWorkMeta}>{presetWork.author} · {presetWork.clayType}</Text>
        </View>
      )}

      <ScrollView className={styles.filterRow} scrollX>
        {RESULT_FILTERS.map(filter => (
          <View
            key={filter}
            className={classnames(styles.filterBtn, activeResult === filter && styles.filterBtnActive)}
            onClick={() => setActiveResult(filter)}
          >
            <Text>{filter}</Text>
          </View>
        ))}
      </ScrollView>

      <View className={styles.content}>
        <SectionHeader title="烧成记录" subtitle={`共${filteredFiring.length}条`} />
        {filteredFiring.map(firing => (
          <View key={firing.id} className={styles.firingCard}>
            <View className={styles.firingHeader}>
              <Text className={styles.firingWorkName}>{firing.workName}</Text>
              <StatusTag status={firing.result} type="firing" />
            </View>
            <View className={styles.firingBody}>
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
            {firing.notes && <Text className={styles.firingNotes}>{firing.notes}</Text>}
            <Text className={styles.firingDate}>{firing.date}</Text>
          </View>
        ))}
        {filteredFiring.length === 0 && (
          <View className={styles.emptyState}>
            <Text className={styles.emptyIcon}>🔥</Text>
            <Text className={styles.emptyText}>暂无烧成记录，点击右下角 + 新增</Text>
          </View>
        )}
      </View>

      <View className={styles.addButton} onClick={openForm}>
        <Text className={styles.addButtonText}>+</Text>
      </View>

      {showForm && (
        <View className={styles.modalMask} onClick={closeForm}>
          <View className={styles.modalCard} onClick={(e) => e.stopPropagation && (e as any).stopPropagation()}>
            <Text className={styles.modalTitle}>录入烧成记录</Text>

            <View className={styles.formRow}>
              <Text className={styles.formLabel}>关联作品</Text>
              <ScrollView scrollX className={styles.workPickerScroll}>
                {works.map(w => (
                  <View
                    key={w.id}
                    className={classnames(styles.workPickerItem, formWorkId === w.id && styles.workPickerItemActive)}
                    onClick={() => setFormWorkId(w.id)}
                  >
                    <Text className={styles.workPickerName}>{w.name}</Text>
                    <Text className={styles.workPickerMeta}>{w.author}</Text>
                  </View>
                ))}
              </ScrollView>
            </View>

            <View className={styles.formRow}>
              <Text className={styles.formLabel}>窑型</Text>
              <View className={styles.optionRow}>
                {KILN_TYPES.map(k => (
                  <View
                    key={k}
                    className={classnames(styles.optionItem, formKilnType === k && styles.optionItemActive)}
                    onClick={() => setFormKilnType(k)}
                  >
                    <Text>{KILN_ICONS[k]} {k}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.formRow}>
              <Text className={styles.formLabel}>烧成结果</Text>
              <View className={styles.optionRow}>
                {RESULTS.map(r => (
                  <View
                    key={r}
                    className={classnames(styles.optionItem, formResult === r && styles.optionItemActive)}
                    onClick={() => setFormResult(r)}
                  >
                    <Text>{r}</Text>
                  </View>
                ))}
              </View>
            </View>

            <View className={styles.formRow}>
              <View className={styles.formHalf}>
                <Text className={styles.formLabel}>窑温(°C)</Text>
                <Input
                  className={styles.formInput}
                  type="digit"
                  value={formTemperature}
                  onInput={(e) => setFormTemperature(e.detail.value)}
                />
              </View>
              <View className={styles.formHalf}>
                <Text className={styles.formLabel}>时长(小时)</Text>
                <Input
                  className={styles.formInput}
                  type="digit"
                  value={formDuration}
                  onInput={(e) => setFormDuration(e.detail.value)}
                />
              </View>
            </View>

            <View className={styles.formRow}>
              <Text className={styles.formLabel}>日期</Text>
              <Input
                className={styles.formInput}
                value={formDate}
                onInput={(e) => setFormDate(e.detail.value)}
                placeholder="例：2026-06-15"
              />
            </View>

            <View className={styles.formRow}>
              <Text className={styles.formLabel}>备注</Text>
              <Input
                className={styles.formInput}
                value={formNotes}
                onInput={(e) => setFormNotes(e.detail.value)}
                placeholder="记录结晶、色泽、窑变等"
              />
            </View>

            <View className={styles.modalActions}>
              <View className={styles.cancelBtn} onClick={closeForm}>
                <Text>取消</Text>
              </View>
              <View className={styles.submitBtn} onClick={handleSubmit}>
                <Text>确认入窑</Text>
              </View>
            </View>
          </View>
        </View>
      )}
    </ScrollView>
  )
}

export default FiringPage

import React, { useState, useMemo } from 'react'
import { View, Text, Input, Textarea, Picker, ScrollView, Button } from '@tarojs/components'
import Taro, { useRouter } from '@tarojs/taro'
import classnames from 'classnames'
import { useAppStore } from '@/store/appStore'
import type { Clay } from '@/types'
import styles from './index.module.scss'

const CLAY_TYPES = [
  { type: '紫泥', color: '#6B4A6B' },
  { type: '朱泥', color: '#C04851' },
  { type: '段泥', color: '#D4A545' },
  { type: '绿泥', color: '#6B8C5A' },
  { type: '拼紫', color: '#7B5B7B' },
  { type: '底槽清', color: '#5A3D5A' }
] as const

type ClayType = typeof CLAY_TYPES[number]['type']

const getToday = () => {
  const d = new Date()
  const pad = (n: number) => n.toString().padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

const calcAgingDays = (startDate: string) => {
  if (!startDate) return 0
  const start = new Date(startDate).getTime()
  const now = Date.now()
  return Math.max(0, Math.floor((now - start) / (24 * 60 * 60 * 1000)))
}

const ClayDetailPage = () => {
  const router = useRouter()
  const { id } = router.params
  const isAdd = !id
  const clayData = useAppStore(s => s.clayList)
  const addClay = useAppStore(s => s.addClay)

  const existingClay = useMemo(() => {
    if (isAdd) return null
    return clayData.find(c => c.id === id) || null
  }, [isAdd, id, clayData])

  const [name, setName] = useState(existingClay?.name || '')
  const [type, setType] = useState<ClayType>(existingClay?.type as ClayType || '紫泥')
  const [origin, setOrigin] = useState(existingClay?.origin || '黄龙山')
  const [weight, setWeight] = useState<string>(existingClay?.weight?.toString() || '')
  const [color, setColor] = useState(existingClay?.color || '#6B4A6B')
  const [agingStartDate, setAgingStartDate] = useState(existingClay?.agingStartDate || getToday())
  const [notes, setNotes] = useState(existingClay?.notes || '')

  const agingDays = useMemo(() => calcAgingDays(agingStartDate), [agingStartDate])

  const validate = () => {
    if (!name.trim()) {
      Taro.showToast({ title: '请输入泥料名称', icon: 'none' })
      return false
    }
    if (!weight || Number(weight) <= 0) {
      Taro.showToast({ title: '请输入正确的重量', icon: 'none' })
      return false
    }
    if (!agingStartDate) {
      Taro.showToast({ title: '请选择陈腐开始日期', icon: 'none' })
      return false
    }
    return true
  }

  const handleSubmit = () => {
    if (!validate()) return
    const status = agingDays >= 365 ? '已熟化' : '陈腐中'
    addClay({
      name: name.trim(),
      type: type as Clay['type'],
      origin: origin.trim() || '未知产地',
      weight: Number(weight),
      agingDays,
      agingStartDate,
      status,
      notes: notes.trim(),
      color
    })
    console.log('[ClayDetail] new clay added:', name, type, weight, '斤')
    Taro.showToast({ title: '登记成功', icon: 'success' })
    setTimeout(() => {
      Taro.navigateBack()
    }, 1000)
  }

  if (!isAdd && existingClay) {
    return (
      <ScrollView className={styles.clayDetailPage} scrollY>
        <View className={styles.detailWrap}>
          <View className={styles.detailCard}>
            <View style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 }}>
              <View style={{ width: 80, height: 80, borderRadius: '50%', background: existingClay.color }} />
              <View>
                <Text style={{ fontSize: 34, fontWeight: 600, color: '#2C1810', display: 'block' }}>{existingClay.name}</Text>
                <Text style={{ fontSize: 24, color: existingClay.status === '已熟化' ? '#5B8C5A' : existingClay.status === '陈腐中' ? '#6B8AAD' : '#9B8B7A' }}>
                  【{existingClay.status}】 陈腐 {existingClay.agingDays} 天
                </Text>
              </View>
            </View>
            <View style={{ padding: 16, background: '#F7F2ED', borderRadius: 12, marginBottom: 16 }}>
              {[
                ['泥料类别', existingClay.type],
                ['产地', existingClay.origin],
                ['库存重量', `${existingClay.weight} 斤`],
                ['陈腐开始', existingClay.agingStartDate],
              ].map(([k, v]) => (
                <View key={k} style={{ display: 'flex', padding: 8 }}>
                  <Text style={{ width: 120, color: '#9B8B7A', fontSize: 26 }}>{k}</Text>
                  <Text style={{ color: '#5C4A3A', fontSize: 26, fontWeight: 500 }}>{v}</Text>
                </View>
              ))}
            </View>
            {existingClay.notes && (
              <View>
                <Text style={{ fontSize: 26, color: '#5C4A3A', fontWeight: 600, marginBottom: 12, display: 'block' }}>备注</Text>
                <Text style={{ fontSize: 26, color: '#86909C', lineHeight: '1.8em' }}>{existingClay.notes}</Text>
              </View>
            )}
          </View>
        </View>
      </ScrollView>
    )
  }

  return (
    <View className={styles.clayDetailPage}>
      <ScrollView className={styles.formWrap} scrollY>
        <View className={styles.formCard}>
          <Text className={styles.formSectionTitle}>泥料陈腐登记</Text>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.formRequired}>*</Text>泥料名称
            </Text>
            <Input
              className={styles.formInput}
              placeholder="如：原矿紫泥、大红袍朱泥"
              placeholderClass={styles.formInputPlaceholder}
              value={name}
              onInput={(e) => setName(e.detail.value)}
              confirmType="next"
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.formRequired}>*</Text>泥料类别
            </Text>
            <View className={styles.typeGrid}>
              {CLAY_TYPES.map(item => (
                <View
                  key={item.type}
                  className={classnames(styles.typeOption, type === item.type && styles.typeOptionActive)}
                  onClick={() => { setType(item.type); setColor(item.color) }}
                >
                  <View className={styles.typeDot} style={{ background: item.color }} />
                  <Text className={styles.typeName}>{item.type}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.formRequired}>*</Text>自定义颜色标记
            </Text>
            <View className={styles.colorPicker}>
              {CLAY_TYPES.map(item => (
                <View
                  key={item.color}
                  className={classnames(styles.colorOption, color === item.color && styles.colorOptionActive)}
                  onClick={() => setColor(item.color)}
                >
                  <View className={styles.colorDot} style={{ background: item.color }} />
                  <Text className={styles.colorLabel}>{item.type}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>产地</Text>
            <Input
              className={styles.formInput}
              placeholder="如：黄龙山、赵庄山、团山"
              placeholderClass={styles.formInputPlaceholder}
              value={origin}
              onInput={(e) => setOrigin(e.detail.value)}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.formRequired}>*</Text>重量（斤）
            </Text>
            <Input
              className={styles.formInput}
              type="digit"
              placeholder="请输入泥料重量"
              placeholderClass={styles.formInputPlaceholder}
              value={weight}
              onInput={(e) => setWeight(e.detail.value.replace(/[^\d.]/g, ''))}
            />
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>
              <Text className={styles.formRequired}>*</Text>陈腐开始日期
            </Text>
            <View className={styles.dateRow}>
              <Picker
                mode="date"
                value={agingStartDate}
                start="2000-01-01"
                end={getToday()}
                onChange={(e) => setAgingStartDate(e.detail.value)}
              >
                <View className={styles.datePicker}>
                  {agingStartDate ? (
                    <Text className={styles.dateText}>{agingStartDate}</Text>
                  ) : (
                    <Text className={styles.dateEmpty}>请选择日期</Text>
                  )}
                </View>
              </Picker>
              {agingDays > 0 && (
                <Text style={{ fontSize: 24, color: agingDays >= 365 ? '#5B8C5A' : '#8B6F4E', fontWeight: 500, whiteSpace: 'nowrap' }}>
                  已陈腐 {agingDays} 天
                </Text>
              )}
            </View>
          </View>

          <View className={styles.formItem}>
            <Text className={styles.formLabel}>备注</Text>
            <Textarea
              className={styles.formTextarea}
              placeholder="泥料特性、使用建议、来源等信息"
              placeholderClass={styles.formInputPlaceholder}
              value={notes}
              onInput={(e) => setNotes(e.detail.value)}
              maxlength={300}
              autoHeight
            />
          </View>
        </View>
      </ScrollView>

      <View className={styles.footer}>
        <Button className={styles.submitBtn} onClick={handleSubmit}>
          <Text className={styles.submitBtnText}>提交登记</Text>
        </Button>
      </View>
    </View>
  )
}

export default ClayDetailPage

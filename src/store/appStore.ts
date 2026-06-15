import { create } from 'zustand'
import Taro from '@tarojs/taro'
import type { Clay, ProcessStep, Work, TraceRecord } from '@/types'
import { clayList as initClay } from '@/data/clay'
import { processStepList as initProcess } from '@/data/process'
import { workList as initWork } from '@/data/work'
import { traceList as initTrace } from '@/data/trace'

interface AppState {
  clayList: Clay[]
  processStepList: ProcessStep[]
  workList: Work[]
  traceList: TraceRecord[]
  addClay: (clay: Omit<Clay, 'id'>) => void
  completeStep: (stepId: string) => void
  updateWorkStatus: (workId: string, status: Work['status']) => void
  initFromStorage: () => void
}

const STORAGE_KEY = 'zisha_workshop_data_v1'

type StoredData = {
  clayList: Clay[]
  processStepList: ProcessStep[]
  workList: Work[]
  traceList: TraceRecord[]
}

const persist = (data: StoredData) => {
  try {
    Taro.setStorageSync(STORAGE_KEY, JSON.stringify(data))
    console.log('[Store] persist saved')
  } catch (e) {
    console.error('[Store] persist error:', e)
  }
}

const loadPersisted = (): StoredData | null => {
  try {
    const raw = Taro.getStorageSync(STORAGE_KEY)
    if (raw) {
      console.log('[Store] loaded from storage')
      return JSON.parse(raw)
    }
    return null
  } catch (e) {
    console.error('[Store] load error:', e)
    return null
  }
}

const pad = (n: number) => n.toString().padStart(2, '0')
const nowStr = () => {
  const d = new Date()
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export const useAppStore = create<AppState>((set, get) => ({
  clayList: initClay,
  processStepList: initProcess,
  workList: initWork,
  traceList: initTrace,

  initFromStorage: () => {
    const saved = loadPersisted()
    if (saved) {
      set({
        clayList: saved.clayList,
        processStepList: saved.processStepList,
        workList: saved.workList,
        traceList: saved.traceList
      })
    }
  },

  addClay: (clay) => {
    const newClay: Clay = { ...clay, id: `clay-${Date.now()}` }
    const newList = [newClay, ...get().clayList]
    set({ clayList: newList })
    persist({ ...get(), clayList: newList })
    console.log('[Store] clay added:', newClay.name, 'total:', newList.length)
  },

  completeStep: (stepId) => {
    const steps = [...get().processStepList]
    const step = steps.find(s => s.id === stepId)
    if (!step) return

    const endTime = nowStr()
    step.status = '已完成'
    step.endTime = endTime

    const workSteps = steps
      .filter(s => s.workId === step.workId)
      .sort((a, b) => a.order - b.order)

    const currentIdx = workSteps.findIndex(s => s.id === stepId)
    if (currentIdx >= 0 && currentIdx + 1 < workSteps.length) {
      const nextStep = steps.find(s => s.id === workSteps[currentIdx + 1].id)
      if (nextStep) {
        nextStep.status = '进行中'
        nextStep.startTime = nextStep.startTime || endTime
        console.log('[Store] auto advance to:', nextStep.name)
      }
    }

    let newWorks = get().workList
    const allDone = workSteps.every(s => s.status === '已完成')
    if (allDone) {
      newWorks = newWorks.map(w =>
        w.id === step.workId ? { ...w, status: '已烧成' as const } : w
      )
      console.log('[Store] all steps completed for workId:', step.workId, '→ 已烧成')
    }

    set({ processStepList: steps, workList: newWorks })
    persist({ ...get(), processStepList: steps, workList: newWorks })
  },

  updateWorkStatus: (workId, status) => {
    const newWorks = get().workList.map(w =>
      w.id === workId ? { ...w, status } : w
    )
    set({ workList: newWorks })
    persist({ ...get(), workList: newWorks })
  }
}))

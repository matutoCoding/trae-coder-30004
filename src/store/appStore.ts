import { create } from 'zustand'
import Taro from '@tarojs/taro'
import type { Clay, ProcessStep, Work, TraceRecord, Firing, ClayTransaction } from '@/types'
import { clayList as initClay } from '@/data/clay'
import { processStepList as initProcess } from '@/data/process'
import { workList as initWork } from '@/data/work'
import { traceList as initTrace } from '@/data/trace'
import { firingList as initFiring } from '@/data/firing'
import { clayTransactionList as initTrans } from '@/data/clayTransaction'

interface AppState {
  clayList: Clay[]
  processStepList: ProcessStep[]
  workList: Work[]
  traceList: TraceRecord[]
  firingList: Firing[]
  clayTransactionList: ClayTransaction[]

  worksFilterStatus: string
  worksFilterAuthor: string
  worksFilterClay: string

  addClay: (clay: Omit<Clay, 'id'>, source?: string) => void
  completeStep: (stepId: string) => void
  updateWorkStatus: (workId: string, status: Work['status']) => void
  addFiring: (firing: Omit<Firing, 'id'>) => void
  addClayTransaction: (trans: Omit<ClayTransaction, 'id'>) => void
  archiveWork: (workId: string, data: Partial<Work>) => void
  setWorksFilterStatus: (s: string) => void
  setWorksFilterAuthor: (s: string) => void
  setWorksFilterClay: (s: string) => void
  initFromStorage: () => void
}

const STORAGE_KEY = 'zisha_workshop_data_v1'

type StoredData = {
  clayList: Clay[]
  processStepList: ProcessStep[]
  workList: Work[]
  traceList: TraceRecord[]
  firingList: Firing[]
  clayTransactionList: ClayTransaction[]
  worksFilterStatus?: string
  worksFilterAuthor?: string
  worksFilterClay?: string
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
  firingList: initFiring,
  clayTransactionList: initTrans,

  worksFilterStatus: '全部',
  worksFilterAuthor: '全部',
  worksFilterClay: '全部',

  setWorksFilterStatus: (s) => {
    set({ worksFilterStatus: s })
    persist({ ...get(), worksFilterStatus: s })
  },
  setWorksFilterAuthor: (s) => {
    set({ worksFilterAuthor: s })
    persist({ ...get(), worksFilterAuthor: s })
  },
  setWorksFilterClay: (s) => {
    set({ worksFilterClay: s })
    persist({ ...get(), worksFilterClay: s })
  },

  initFromStorage: () => {
    const saved = loadPersisted()
    if (saved) {
      set({
        clayList: saved.clayList,
        processStepList: saved.processStepList,
        workList: saved.workList,
        traceList: saved.traceList,
        firingList: saved.firingList ?? initFiring,
        clayTransactionList: saved.clayTransactionList ?? initTrans,
        worksFilterStatus: saved.worksFilterStatus ?? '全部',
        worksFilterAuthor: saved.worksFilterAuthor ?? '全部',
        worksFilterClay: saved.worksFilterClay ?? '全部'
      })
    }
  },

  addClay: (clay, source = '手动登记入库') => {
    const newClay: Clay = { ...clay, id: `clay-${Date.now()}` }
    const newList = [newClay, ...get().clayList]

    const trans: Omit<ClayTransaction, 'id'> = {
      clayId: newClay.id,
      type: '入库',
      weight: newClay.weight,
      source,
      date: nowStr()
    }
    const newTransList = [{ ...trans, id: `trans-${Date.now()}` }, ...get().clayTransactionList]

    set({ clayList: newList, clayTransactionList: newTransList })
    persist({ ...get(), clayList: newList, clayTransactionList: newTransList })
    console.log('[Store] clay added:', newClay.name, 'total:', newList.length)
  },

  addClayTransaction: (trans) => {
    const newTrans = { ...trans, id: `trans-${Date.now()}` }
    const newList = [newTrans, ...get().clayTransactionList]
    set({ clayTransactionList: newList })
    persist({ ...get(), clayTransactionList: newList })
  },

  completeStep: (stepId) => {
    const steps = [...get().processStepList]
    const step = steps.find(s => s.id === stepId)
    if (!step) return

    const endTime = nowStr()
    step.status = '已完成'
    step.endTime = endTime

    let newClayList = get().clayList
    let newTransList = get().clayTransactionList
    if (step.clayId && step.consumeWeight && step.consumeWeight > 0) {
      const target = newClayList.find(c => c.id === step.clayId)
      if (target) {
        newClayList = newClayList.map(c => {
          if (c.id !== step.clayId) return c
          const newWeight = Math.max(0, Number((c.weight - (step.consumeWeight || 0)).toFixed(2)))
          console.log(`[Store] clay consume: ${c.name} ${c.weight} - ${step.consumeWeight} = ${newWeight}`)
          return { ...c, weight: newWeight }
        })

        const trans: ClayTransaction = {
          id: `trans-${Date.now()}`,
          clayId: step.clayId,
          type: '消耗',
          weight: step.consumeWeight,
          workId: step.workId,
          workName: step.workName,
          stepName: step.name,
          date: endTime
        }
        newTransList = [trans, ...newTransList]
        set({ clayList: newClayList, clayTransactionList: newTransList })
      }
    }

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
        w.id === step.workId ? { ...w, status: '制作完成' as const } : w
      )
      console.log('[Store] all steps completed for workId:', step.workId, '→ 制作完成（待入窑）')
    }

    set({ processStepList: steps, workList: newWorks, clayList: newClayList, clayTransactionList: newTransList })
    persist({ ...get(), processStepList: steps, workList: newWorks, clayList: newClayList, clayTransactionList: newTransList })
  },

  updateWorkStatus: (workId, status) => {
    const newWorks = get().workList.map(w =>
      w.id === workId ? { ...w, status } : w
    )
    set({ workList: newWorks })
    persist({ ...get(), workList: newWorks })
  },

  addFiring: (firing) => {
    const newFiring: Firing = { ...firing, id: `fire-${Date.now()}` }
    const newList = [newFiring, ...get().firingList]

    let newWorks = get().workList.map(w => {
      if (w.id !== firing.workId) return w
      const nextStatus: Work['status'] = firing.result === '成功' ? '已烧成' : (w.status === '制作完成' ? '待烧成' : w.status)
      console.log(`[Store] addFiring result=${firing.result} → work ${w.name} status=${nextStatus}`)
      return { ...w, firingId: newFiring.id, status: nextStatus }
    })

    set({ firingList: newList, workList: newWorks })
    persist({ ...get(), firingList: newList, workList: newWorks })
  },

  archiveWork: (workId, data) => {
    const newWorks = get().workList.map(w => {
      if (w.id !== workId) return w
      return {
        ...w,
        ...data,
        status: '已入档' as const,
        archiveTime: nowStr()
      }
    })
    set({ workList: newWorks })
    persist({ ...get(), workList: newWorks })
    console.log('[Store] work archived:', workId)
  }
}))

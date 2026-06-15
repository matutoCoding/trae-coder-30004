import type { ClayTransaction } from '@/types'

export const clayTransactionList: ClayTransaction[] = [
  {
    id: 'trans-001',
    clayId: 'clay-005',
    type: '入库',
    weight: 10.0,
    source: '黄龙山原矿购入',
    date: '2026-03-01 09:00'
  },
  {
    id: 'trans-002',
    clayId: 'clay-005',
    type: '消耗',
    weight: 0.8,
    workId: 'work-001',
    workName: '石瓢壶',
    stepName: '打泥片',
    date: '2026-05-01 10:30'
  },
  {
    id: 'trans-003',
    clayId: 'clay-004',
    type: '入库',
    weight: 8.0,
    source: '赵庄山购入',
    date: '2026-03-15 10:00'
  },
  {
    id: 'trans-004',
    clayId: 'clay-004',
    type: '消耗',
    weight: 1.0,
    workId: 'work-002',
    workName: '仿古壶',
    stepName: '打泥片',
    date: '2026-05-10 10:00'
  },
  {
    id: 'trans-005',
    clayId: 'clay-001',
    type: '入库',
    weight: 15.0,
    source: '宜兴丁蜀镇购入',
    date: '2026-02-20 08:30'
  },
  {
    id: 'trans-006',
    clayId: 'clay-001',
    type: '消耗',
    weight: 0.8,
    workId: 'work-003',
    workName: '西施壶',
    stepName: '打泥片',
    date: '2026-04-05 09:30'
  }
]

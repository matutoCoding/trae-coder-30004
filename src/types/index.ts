export interface Clay {
  id: string
  name: string
  type: '紫泥' | '朱泥' | '段泥' | '绿泥' | '拼紫' | '底槽清'
  origin: string
  weight: number
  agingDays: number
  agingStartDate: string
  status: '陈腐中' | '已熟化' | '已使用'
  notes: string
  color: string
}

export interface Design {
  id: string
  name: string
  style: '光素器' | '花器' | '筋纹器'
  description: string
  image: string
  author: string
  createTime: string
  difficulty: '入门' | '进阶' | '高阶'
}

export interface ProcessStep {
  id: string
  name: string
  type: '打泥片' | '打身筒' | '镶接' | '明针修坯' | '装嘴把' | '精加工' | '刻绘'
  workId: string
  workName: string
  status: '待开始' | '进行中' | '已完成'
  startTime: string
  endTime: string
  notes: string
  order: number
}

export interface Firing {
  id: string
  workId: string
  workName: string
  kilnType: '电窑' | '气窑' | '柴窑'
  temperature: number
  duration: number
  result: '成功' | '微裂' | '过烧' | '欠烧'
  notes: string
  date: string
}

export interface Work {
  id: string
  name: string
  clayType: string
  clayId: string
  designName: string
  designId: string
  author: string
  authorTitle: string
  firingId: string
  image: string
  status: '制作中' | '已烧成' | '已入档'
  createTime: string
  description: string
  capacity: string
}

export interface Order {
  id: string
  clientName: string
  phone: string
  workName: string
  engravingReq: string
  status: '待确认' | '制作中' | '已烧成' | '已完成'
  createTime: string
  deadline: string
  notes: string
  price: number
}

export interface TraceRecord {
  id: string
  workId: string
  workName: string
  type: '创作' | '收藏证书' | '流转' | '展销' | '养壶'
  ownerName: string
  certificateNo: string
  date: string
  notes: string
  image: string
}

export interface MenuItem {
  id: string
  title: string
  desc: string
  path: string
}

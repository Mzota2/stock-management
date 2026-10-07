export type MachineId = 'galdi' | 'nimco'

export interface Part {
  id: string
  item: string
  partNumber: string
  description: string
  descriptionAlt: string
  qty: string
}

export interface Section {
  id: string
  code: string
  title: string
  drawing: string
  parts: Part[]
}

export interface Machine {
  id: MachineId
  name: string
  model: string
  sections: Section[]
}

export interface MachineSummary {
  id: MachineId
  name: string
  model: string
  sectionCount: number
  partCount: number
}

export interface SectionSummary {
  id: string
  code: string
  title: string
  drawing: string
  partIds: string[]
}

export interface StockRecord {
  partId: string
  machine: MachineId
  partNumber: string
  stockCode: string
  location: string
  onHand: number | null
  updatedAt?: number
}

export type StockMap = Record<string, StockRecord>

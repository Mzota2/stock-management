import galdi from './data/galdi.json'
import nimco from './data/nimco.json'
import type { Machine, MachineId, MachineSummary } from './types'

const MACHINES: Record<MachineId, Machine> = {
  galdi: galdi as Machine,
  nimco: nimco as Machine,
}

export const MACHINE_IDS = Object.keys(MACHINES) as MachineId[]

export function isMachineId(id: string): id is MachineId {
  return id in MACHINES
}

export function getMachine(id: string): Machine | null {
  return isMachineId(id) ? MACHINES[id] : null
}

export function getMachineSummaries(): MachineSummary[] {
  return MACHINE_IDS.map((id) => {
    const m = MACHINES[id]
    return {
      id,
      name: m.name,
      model: m.model,
      sectionCount: m.sections.length,
      partCount: m.sections.reduce((n, s) => n + s.parts.length, 0),
    }
  })
}

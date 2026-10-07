import type { Part, StockRecord } from './types'

const compact = (s: string) => s.toLowerCase().replace(/[\s\-./_]/g, '')

export type StockFilter = 'all' | 'uncoded' | 'coded'

export interface SearchablePart {
  part: Part
  sectionId: string
  sectionLabel: string
}

export function matchesQuery(
  entry: SearchablePart,
  tokens: string[],
  record: StockRecord | undefined,
): boolean {
  if (tokens.length === 0) return true
  const { part } = entry
  const haystack = [
    part.partNumber,
    part.description,
    part.descriptionAlt,
    part.item,
    entry.sectionLabel,
    record?.stockCode ?? '',
    record?.location ?? '',
  ]
    .join(' ')
    .toLowerCase()
  const compactHay = compact(`${part.partNumber} ${record?.stockCode ?? ''}`)
  return tokens.every((t) => haystack.includes(t) || compactHay.includes(compact(t)))
}

export function matchesFilter(filter: StockFilter, record: StockRecord | undefined): boolean {
  if (filter === 'all') return true
  const coded = Boolean(record?.stockCode)
  return filter === 'coded' ? coded : !coded
}

export function tokenize(query: string): string[] {
  return query.toLowerCase().trim().split(/\s+/).filter(Boolean)
}

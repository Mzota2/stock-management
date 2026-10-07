'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { useStock } from '@/hooks/use-stock'
import { matchesFilter, matchesQuery, tokenize, type SearchablePart, type StockFilter } from '@/lib/search'
import type { MachineId, Section } from '@/lib/types'
import { PartsList } from './parts-list'
import { SearchControls } from './search-controls'
import { FirebaseNotice } from './firebase-notice'
import { ProgressBar } from './progress-bar'

export function SectionView({ machineId, section }: { machineId: MachineId; section: Section }) {
  const { stock } = useStock(machineId)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<StockFilter>('all')
  const deferredQuery = useDeferredValue(query)

  const label = [section.code, section.title].filter(Boolean).join(' · ')
  const all = useMemo<SearchablePart[]>(
    () => section.parts.map((part) => ({ part, sectionId: section.id, sectionLabel: label })),
    [section, label],
  )

  const tokens = tokenize(deferredQuery)
  const queryMatches = all.filter((e) => matchesQuery(e, tokens, stock[e.part.id]))
  const coded = queryMatches.filter((e) => stock[e.part.id]?.stockCode).length
  const counts = { all: queryMatches.length, coded, uncoded: queryMatches.length - coded }
  const results = queryMatches.filter((e) => matchesFilter(filter, stock[e.part.id]))
  const totalCoded = section.parts.filter((p) => stock[p.id]?.stockCode).length

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-2 pt-4">
        {section.drawing ? (
          <p className="font-mono text-xs text-muted-foreground">DWG {section.drawing}</p>
        ) : null}
        <div className="flex items-center gap-3">
          <ProgressBar value={totalCoded} max={section.parts.length} className="flex-1" />
          <span className="font-mono text-xs text-muted-foreground tabular-nums">
            {totalCoded}/{section.parts.length} coded
          </span>
        </div>
      </div>
      <SearchControls
        query={query}
        onQueryChange={setQuery}
        filter={filter}
        onFilterChange={setFilter}
        placeholder="Search this section"
        counts={counts}
      />
      <FirebaseNotice />
      <PartsList
        key={`${deferredQuery}|${filter}`}
        machine={machineId}
        entries={results}
        stock={stock}
        emptyMessage="No parts in this section match."
      />
    </div>
  )
}

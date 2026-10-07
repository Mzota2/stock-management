'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useStock } from '@/hooks/use-stock'
import { matchesFilter, matchesQuery, tokenize, type SearchablePart, type StockFilter } from '@/lib/search'
import type { Machine, Section } from '@/lib/types'
import { PartsList } from './parts-list'
import { SearchControls } from './search-controls'
import { FirebaseNotice } from './firebase-notice'
import { ProgressBar } from './progress-bar'

export const sectionLabel = (s: Pick<Section, 'code' | 'title'>) =>
  [s.code, s.title].filter(Boolean).join(' · ')

export function MachineView({ machine }: { machine: Machine }) {
  const { stock } = useStock(machine.id)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<StockFilter>('all')
  const deferredQuery = useDeferredValue(query)

  const all = useMemo<SearchablePart[]>(
    () =>
      machine.sections.flatMap((s) =>
        s.parts.map((part) => ({ part, sectionId: s.id, sectionLabel: sectionLabel(s) })),
      ),
    [machine],
  )

  const tokens = tokenize(deferredQuery)
  const queryMatches = all.filter((e) => matchesQuery(e, tokens, stock[e.part.id]))
  const coded = queryMatches.filter((e) => stock[e.part.id]?.stockCode).length
  const counts = { all: queryMatches.length, coded, uncoded: queryMatches.length - coded }
  const results = queryMatches.filter((e) => matchesFilter(filter, stock[e.part.id]))
  const browsing = tokens.length === 0 && filter === 'all'

  return (
    <div className="flex flex-col gap-4">
      <SearchControls
        query={query}
        onQueryChange={setQuery}
        filter={filter}
        onFilterChange={setFilter}
        placeholder={`Search ${machine.name} parts, part no., stock code`}
        counts={counts}
      />
      <FirebaseNotice />

      {browsing ? (
        <section aria-labelledby="sections-heading" className="flex flex-col gap-2">
          <h2
            id="sections-heading"
            className="font-mono text-xs tracking-widest text-muted-foreground uppercase"
          >
            {machine.sections.length} sections / assemblies
          </h2>
          <ul className="-mx-4 divide-y divide-border border-y border-border bg-card sm:mx-0 sm:rounded-lg sm:border">
            {machine.sections.map((s) => {
              const sectionCoded = s.parts.filter((p) => stock[p.id]?.stockCode).length
              return (
                <li key={s.id}>
                  <Link
                    href={`/machine/${machine.id}/${s.id}`}
                    className="flex items-center gap-3 px-4 py-3 hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none active:bg-muted"
                  >
                    <span className="flex min-w-0 flex-1 flex-col gap-1">
                      {s.code ? (
                        <span className="font-mono text-[11px] tracking-wide text-muted-foreground">
                          {s.code}
                        </span>
                      ) : null}
                      <span className="text-[15px] leading-snug font-semibold text-pretty">
                        {s.title || s.code}
                      </span>
                      <span className="flex items-center gap-2">
                        <ProgressBar value={sectionCoded} max={s.parts.length} className="w-24" />
                        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                          {sectionCoded}/{s.parts.length} coded
                        </span>
                      </span>
                    </span>
                    <ChevronRight className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
                  </Link>
                </li>
              )
            })}
          </ul>
        </section>
      ) : (
        <section aria-label="Search results" className="flex flex-col gap-2">
          <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase" aria-live="polite">
            {results.length} {results.length === 1 ? 'part' : 'parts'} found
          </p>
          <PartsList
            key={`${deferredQuery}|${filter}`}
            machine={machine.id}
            entries={results}
            stock={stock}
            showSection
            emptyMessage="No parts match. Try a part number, a name, or fewer words."
          />
        </section>
      )}
    </div>
  )
}

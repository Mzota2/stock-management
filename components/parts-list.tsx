'use client'

import { useState } from 'react'
import { PartEditor } from './part-editor'
import { PartRow } from './part-row'
import type { SearchablePart } from '@/lib/search'
import type { MachineId, Part, StockMap } from '@/lib/types'

const PAGE = 60

interface PartsListProps {
  machine: MachineId
  entries: SearchablePart[]
  stock: StockMap
  showSection?: boolean
  emptyMessage: string
}

export function PartsList({ machine, entries, stock, showSection, emptyMessage }: PartsListProps) {
  const [selected, setSelected] = useState<{ part: Part; sectionLabel: string } | null>(null)
  const [limit, setLimit] = useState(PAGE)
  const visible = entries.slice(0, limit)

  if (entries.length === 0) {
    return (
      <p className="rounded-lg border border-dashed border-input px-4 py-10 text-center text-sm text-muted-foreground">
        {emptyMessage}
      </p>
    )
  }

  return (
    <>
      <ul className="-mx-4 divide-y divide-border border-y border-border bg-card sm:mx-0 sm:rounded-lg sm:border">
        {visible.map((e) => (
          <PartRow
            key={e.part.id}
            part={e.part}
            record={stock[e.part.id]}
            sectionLabel={showSection ? e.sectionLabel : undefined}
            onSelect={(part) => setSelected({ part, sectionLabel: e.sectionLabel })}
          />
        ))}
      </ul>
      {entries.length > limit ? (
        <button
          type="button"
          onClick={() => setLimit((l) => l + PAGE)}
          className="h-12 w-full rounded-lg border border-border bg-card text-sm font-semibold hover:bg-muted"
        >
          Show more ({entries.length - limit} remaining)
        </button>
      ) : null}

      <PartEditor
        machine={machine}
        part={selected?.part ?? null}
        record={selected ? stock[selected.part.id] : undefined}
        sectionLabel={selected?.sectionLabel}
        onClose={() => setSelected(null)}
      />
    </>
  )
}

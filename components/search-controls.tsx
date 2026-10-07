'use client'

import { Search, X } from 'lucide-react'
import type { StockFilter } from '@/lib/search'
import { cn } from '@/lib/utils'

interface SearchControlsProps {
  query: string
  onQueryChange: (q: string) => void
  filter: StockFilter
  onFilterChange: (f: StockFilter) => void
  placeholder: string
  counts: Record<StockFilter, number>
}

const FILTERS: { value: StockFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'uncoded', label: 'No code' },
  { value: 'coded', label: 'Coded' },
]

export function SearchControls({
  query,
  onQueryChange,
  filter,
  onFilterChange,
  placeholder,
  counts,
}: SearchControlsProps) {
  return (
    <div className="sticky top-0 z-20 -mx-4 flex flex-col gap-3 border-b border-border bg-background/95 px-4 py-3 backdrop-blur">
      <div className="relative">
        <label htmlFor="part-search" className="sr-only">
          Search parts
        </label>
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-5 -translate-y-1/2 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          id="part-search"
          type="search"
          inputMode="search"
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder={placeholder}
          className="h-12 w-full rounded-lg border border-input bg-card pr-11 pl-10 text-base shadow-[inset_0_1px_2px_oklch(0_0_0/0.08)] outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 [&::-webkit-search-cancel-button]:hidden"
        />
        {query ? (
          <button
            type="button"
            onClick={() => onQueryChange('')}
            className="absolute top-1/2 right-1.5 flex size-9 -translate-y-1/2 items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Clear search</span>
          </button>
        ) : null}
      </div>
      <div className="flex gap-2" role="radiogroup" aria-label="Filter by stock code">
        {FILTERS.map((f) => {
          const active = filter === f.value
          return (
            <button
              key={f.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onFilterChange(f.value)}
              className={cn(
                'flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium transition-colors',
                active
                  ? 'border-panel bg-panel text-panel-foreground'
                  : 'border-border bg-card text-foreground hover:bg-muted',
              )}
            >
              {f.label}
              <span
                className={cn(
                  'font-mono text-xs tabular-nums',
                  active ? 'text-panel-foreground/70' : 'text-muted-foreground',
                )}
              >
                {counts[f.value]}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

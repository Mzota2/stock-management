import { Plus } from 'lucide-react'
import type { Part, StockRecord } from '@/lib/types'

interface PartRowProps {
  part: Part
  record?: StockRecord
  sectionLabel?: string
  onSelect: (part: Part) => void
}

export function PartRow({ part, record, sectionLabel, onSelect }: PartRowProps) {
  const coded = Boolean(record?.stockCode)
  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(part)}
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none active:bg-muted"
      >
        <span
          className="mt-0.5 flex h-6 min-w-8 shrink-0 items-center justify-center rounded-sm border border-border bg-background px-1 font-mono text-[11px] text-muted-foreground tabular-nums"
          aria-label={part.item ? `Item ${part.item}` : undefined}
        >
          {part.item || '·'}
        </span>

        <span className="flex min-w-0 flex-1 flex-col gap-0.5">
          <span className="text-[15px] leading-snug font-semibold text-pretty">
            {part.description || 'Unnamed part'}
          </span>
          {part.descriptionAlt ? (
            <span className="text-xs leading-snug text-muted-foreground uppercase">
              {part.descriptionAlt}
            </span>
          ) : null}
          <span className="flex flex-wrap items-center gap-x-3 gap-y-0.5 pt-0.5 font-mono text-xs text-muted-foreground">
            <span>
              <span className="sr-only">Part number </span>
              <span className="text-foreground">{part.partNumber || '—'}</span>
            </span>
            {part.qty ? <span>QTY {part.qty}</span> : null}
            {record?.location ? <span>BIN {record.location}</span> : null}
          </span>
          {sectionLabel ? (
            <span className="truncate pt-0.5 text-xs text-muted-foreground">{sectionLabel}</span>
          ) : null}
        </span>

        {coded ? (
          <span className="flex shrink-0 flex-col items-end gap-0.5">
            <span className="sr-only">Stock code</span>
            <span className="rounded-sm border-2 border-ok bg-card px-1.5 py-0.5 font-mono text-xs font-bold tracking-wide text-ok">
              {record!.stockCode}
            </span>
            {record?.onHand !== null && record?.onHand !== undefined ? (
              <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                {record.onHand} on hand
              </span>
            ) : null}
          </span>
        ) : (
          <span className="flex shrink-0 items-center gap-1 rounded-sm border border-dashed border-input px-1.5 py-1 font-mono text-[11px] text-muted-foreground uppercase">
            <Plus className="size-3" aria-hidden="true" />
            Code
          </span>
        )}
      </button>
    </li>
  )
}

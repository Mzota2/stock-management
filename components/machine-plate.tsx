'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { useStock } from '@/hooks/use-stock'
import type { MachineSummary } from '@/lib/types'
import { ProgressBar } from './progress-bar'

function Rivet({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`absolute size-2.5 rounded-full border border-input bg-muted shadow-[inset_0_-1px_1px_oklch(0_0_0/0.15)] ${className}`}
    />
  )
}

export function MachinePlate({ machine, index }: { machine: MachineSummary; index: number }) {
  const { stock } = useStock(machine.id)
  const coded = Object.values(stock).filter((r) => r.stockCode).length

  return (
    <Link
      href={`/machine/${machine.id}`}
      className="group relative flex flex-col gap-5 rounded-xl border border-input bg-card p-6 shadow-[0_1px_0_oklch(1_0_0)_inset,0_2px_6px_oklch(0_0_0/0.06)] transition-transform focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none active:scale-[0.99]"
    >
      <Rivet className="top-2.5 left-2.5" />
      <Rivet className="top-2.5 right-2.5" />
      <Rivet className="bottom-2.5 left-2.5" />
      <Rivet className="right-2.5 bottom-2.5" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <span className="font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
            Machine {String(index + 1).padStart(2, '0')} · Model
          </span>
          <span className="font-mono text-sm font-semibold">{machine.model}</span>
        </div>
        <span className="flex size-10 items-center justify-center rounded-full bg-panel text-panel-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
          <ArrowRight className="size-5" aria-hidden="true" />
        </span>
      </div>

      <h2 className="font-condensed text-6xl leading-none font-black tracking-tight uppercase">
        {machine.name}
      </h2>

      <dl className="grid grid-cols-3 border-t border-border pt-4">
        <div className="flex flex-col gap-0.5">
          <dt className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Sections</dt>
          <dd className="font-mono text-lg font-semibold tabular-nums">{machine.sectionCount}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Parts</dt>
          <dd className="font-mono text-lg font-semibold tabular-nums">{machine.partCount}</dd>
        </div>
        <div className="flex flex-col gap-0.5">
          <dt className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">Coded</dt>
          <dd className="font-mono text-lg font-semibold text-ok tabular-nums">{coded}</dd>
        </div>
      </dl>
      <ProgressBar value={coded} max={machine.partCount} />
    </Link>
  )
}

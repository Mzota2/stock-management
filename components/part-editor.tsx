'use client'

import { useState } from 'react'
import { Loader2, Lock } from 'lucide-react'
import { useAuth } from './auth-provider'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { saveStockRecord } from '@/hooks/use-stock'
import { isFirebaseConfigured } from '@/lib/firebase'
import type { MachineId, Part, StockRecord } from '@/lib/types'

interface PartEditorProps {
  machine: MachineId
  part: Part | null
  record?: StockRecord
  sectionLabel?: string
  onClose: () => void
}

export function PartEditor({ machine, part, record, sectionLabel, onClose }: PartEditorProps) {
  return (
    <Drawer open={part !== null} onOpenChange={(open) => !open && onClose()} showSwipeHandle>
      <DrawerContent>
        {part ? (
          <PartEditorForm
            key={part.id}
            machine={machine}
            part={part}
            record={record}
            sectionLabel={sectionLabel}
            onDone={onClose}
          />
        ) : null}
      </DrawerContent>
    </Drawer>
  )
}

const fieldClass =
  'h-12 w-full rounded-lg border border-input bg-card px-3 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-60'

function PartEditorForm({
  machine,
  part,
  record,
  sectionLabel,
  onDone,
}: {
  machine: MachineId
  part: Part
  record?: StockRecord
  sectionLabel?: string
  onDone: () => void
}) {
  const [stockCode, setStockCode] = useState(record?.stockCode ?? '')
  const [location, setLocation] = useState(record?.location ?? '')
  const [onHand, setOnHand] = useState(
    record?.onHand !== null && record?.onHand !== undefined ? String(record.onHand) : '',
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { isAdmin } = useAuth()
  const canEdit = isFirebaseConfigured && isAdmin
  const locked = !canEdit || saving

  async function persist(values: { stockCode: string; location: string; onHand: string }) {
    setSaving(true)
    setError(null)
    const parsed = values.onHand.trim() === '' ? null : Number(values.onHand)
    if (parsed !== null && (!Number.isFinite(parsed) || parsed < 0)) {
      setError('On hand must be a positive number.')
      setSaving(false)
      return
    }
    try {
      await saveStockRecord({
        partId: part.id,
        machine,
        partNumber: part.partNumber,
        stockCode: values.stockCode.trim().toUpperCase().slice(0, 64),
        location: values.location.trim().toUpperCase().slice(0, 32),
        onHand: parsed === null ? null : Math.floor(parsed),
      })
      onDone()
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not save. Try again.')
      setSaving(false)
    }
  }

  return (
    <form
      className="flex min-h-0 flex-1 flex-col"
      onSubmit={(e) => {
        e.preventDefault()
        persist({ stockCode, location, onHand })
      }}
    >
      <DrawerHeader className="gap-1 pb-4 text-left group-data-[swipe-axis=y]/drawer-popup:text-left">
        <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
          {machine.toUpperCase()} · Item {part.item || '—'}
        </span>
        <DrawerTitle className="font-condensed text-2xl leading-tight font-bold text-pretty uppercase">
          {part.description || 'Unnamed part'}
        </DrawerTitle>
        <DrawerDescription className="text-left text-pretty">
          {part.descriptionAlt ? `${part.descriptionAlt} · ` : ''}
          {sectionLabel}
        </DrawerDescription>
      </DrawerHeader>

      <div className="flex flex-col gap-4 overflow-y-auto px-4 pb-4">
        <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-border bg-border">
          <div className="flex flex-col gap-0.5 bg-background px-3 py-2">
            <dt className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              Part No.
            </dt>
            <dd className="font-mono text-base font-semibold break-all">{part.partNumber || '—'}</dd>
          </div>
          <div className="flex flex-col gap-0.5 bg-background px-3 py-2">
            <dt className="font-mono text-[10px] tracking-widest text-muted-foreground uppercase">
              Qty on machine
            </dt>
            <dd className="font-mono text-base font-semibold">{part.qty || '—'}</dd>
          </div>
        </dl>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="stock-code" className="text-sm font-semibold">
            Stock code
          </label>
          <input
            id="stock-code"
            value={stockCode}
            onChange={(e) => setStockCode(e.target.value)}
            placeholder="e.g. SC-104522"
            autoCapitalize="characters"
            autoComplete="off"
            spellCheck={false}
            disabled={locked}
            className={`${fieldClass} font-mono text-lg font-semibold tracking-wide uppercase placeholder:normal-case placeholder:font-normal`}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="bin-location" className="text-sm font-semibold">
              Bin / location
            </label>
            <input
              id="bin-location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="A3-02"
              autoCapitalize="characters"
              autoComplete="off"
              disabled={locked}
              className={`${fieldClass} font-mono uppercase`}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="on-hand" className="text-sm font-semibold">
              On hand
            </label>
            <input
              id="on-hand"
              type="number"
              inputMode="numeric"
              min={0}
              step={1}
              value={onHand}
              onChange={(e) => setOnHand(e.target.value)}
              placeholder="0"
              disabled={locked}
              className={`${fieldClass} font-mono tabular-nums`}
            />
          </div>
        </div>

        {!isFirebaseConfigured ? (
          <p className="text-sm text-muted-foreground">
            Connect Firestore to save stock codes for this part.
          </p>
        ) : !isAdmin ? (
          <p className="flex items-center gap-2 rounded-lg border border-border bg-card p-3 text-sm text-muted-foreground">
            <Lock className="size-4 shrink-0" aria-hidden="true" />
            View only. Ask an admin to change stock codes.
          </p>
        ) : null}
        {error ? (
          <p className="text-sm font-medium text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>

      <DrawerFooter className="flex-row gap-2 pb-[max(env(safe-area-inset-bottom),1rem)]">
        {!canEdit ? (
          <DrawerClose
            render={<Button type="button" variant="outline" className="h-12 flex-1 text-base" />}
          >
            Close
          </DrawerClose>
        ) : (
          <>
        {record ? (
          <Button
            type="button"
            variant="outline"
            className="h-12 flex-1 text-base"
            disabled={saving || !isFirebaseConfigured}
            onClick={() => persist({ stockCode: '', location: '', onHand: '' })}
          >
            Clear
          </Button>
        ) : (
          <DrawerClose
            render={<Button type="button" variant="outline" className="h-12 flex-1 text-base" />}
          >
            Cancel
          </DrawerClose>
        )}
        <Button
          type="submit"
          className="h-12 flex-[2] text-base font-semibold"
          disabled={saving || !isFirebaseConfigured}
        >
          {saving ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : null}
          {saving ? 'Saving…' : 'Save stock code'}
        </Button>
          </>
        )}
      </DrawerFooter>
    </form>
  )
}

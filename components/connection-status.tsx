'use client'

import { isFirebaseConfigured } from '@/lib/firebase'
import { cn } from '@/lib/utils'

export function ConnectionStatus() {
  return (
    <div
      className="flex shrink-0 items-center gap-1.5 rounded-sm border border-panel-foreground/20 px-2 py-1"
      role="status"
    >
      <span
        className={cn(
          'size-2 rounded-full',
          isFirebaseConfigured ? 'bg-ok shadow-[0_0_6px_var(--ok)]' : 'bg-primary',
        )}
        aria-hidden="true"
      />
      <span className="font-mono text-[10px] tracking-widest uppercase">
        {isFirebaseConfigured ? 'Live' : 'Offline'}
      </span>
    </div>
  )
}

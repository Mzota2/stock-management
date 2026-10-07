'use client'

import { TriangleAlert } from 'lucide-react'
import { isFirebaseConfigured } from '@/lib/firebase'

export function FirebaseNotice() {
  if (isFirebaseConfigured) return null
  return (
    <div className="flex gap-3 rounded-lg border border-primary/40 bg-card p-4 text-sm leading-relaxed">
      <TriangleAlert className="mt-0.5 size-5 shrink-0 text-primary" aria-hidden="true" />
      <div className="flex flex-col gap-1">
        <p className="font-semibold">Firestore not connected</p>
        <p className="text-muted-foreground">
          Parts are browsable, but stock codes can&apos;t be saved yet. Add{' '}
          <code className="font-mono text-xs">NEXT_PUBLIC_FIREBASE_API_KEY</code>,{' '}
          <code className="font-mono text-xs">NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN</code>,{' '}
          <code className="font-mono text-xs">NEXT_PUBLIC_FIREBASE_PROJECT_ID</code> and{' '}
          <code className="font-mono text-xs">NEXT_PUBLIC_FIREBASE_APP_ID</code> in the Vars panel.
        </p>
      </div>
    </div>
  )
}

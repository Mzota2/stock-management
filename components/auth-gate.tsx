'use client'

import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { useAuth } from './auth-provider'
import { isFirebaseConfigured } from '@/lib/firebase'

export function AuthGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const mustRedirect = isFirebaseConfigured && !loading && !user

  useEffect(() => {
    if (mustRedirect) router.replace(`/login?next=${encodeURIComponent(pathname)}`)
  }, [mustRedirect, pathname, router])

  if (!isFirebaseConfigured) return <>{children}</>

  if (loading || !user) {
    return (
      <div className="flex min-h-dvh flex-col items-center justify-center gap-3 text-muted-foreground" role="status">
        <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
        <span className="font-mono text-xs tracking-widest uppercase">Checking access</span>
      </div>
    )
  }

  return <>{children}</>
}

'use client'

import { useState } from 'react'
import useSWRSubscription from 'swr/subscription'
import { collection, doc, onSnapshot, orderBy, query, updateDoc } from 'firebase/firestore'
import { Loader2, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useAuth, type Role } from './auth-provider'
import { getDb, USERS_COLLECTION } from '@/lib/firebase'

interface UserRow {
  uid: string
  name: string
  email: string
  role: Role
}

export function UsersManager() {
  const { user, isAdmin } = useAuth()
  const db = getDb()
  const [pending, setPending] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const { data, error: loadError } = useSWRSubscription<UserRow[], Error, string | null>(
    db && isAdmin ? 'users' : null,
    (_key, { next }) =>
      onSnapshot(
        query(collection(db!, USERS_COLLECTION), orderBy('email')),
        (snap) =>
          next(
            null,
            snap.docs.map((d) => ({
              uid: d.id,
              name: d.data().name ?? '',
              email: d.data().email ?? '',
              role: d.data().role === 'admin' ? 'admin' : 'viewer',
            })),
          ),
        (err) => next(err),
      ),
  )

  if (!isAdmin) {
    return <p className="text-sm text-muted-foreground">Only admins can manage users.</p>
  }

  async function setRole(uid: string, role: Role) {
    if (!db) return
    setPending(uid)
    setError(null)
    try {
      await updateDoc(doc(db, USERS_COLLECTION, uid), { role })
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not update role.')
    } finally {
      setPending(null)
    }
  }

  if (loadError) {
    return (
      <p className="text-sm font-medium text-destructive" role="alert">
        {loadError.message}
      </p>
    )
  }

  if (!data) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground" role="status">
        <Loader2 className="size-4 animate-spin" aria-hidden="true" />
        <span className="text-sm">Loading users…</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-3">
      {error ? (
        <p className="text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}
      <ul className="flex flex-col divide-y divide-border overflow-hidden rounded-lg border border-border bg-card">
        {data.map((u) => {
          const isSelf = u.uid === user?.uid
          const isRowAdmin = u.role === 'admin'
          return (
            <li key={u.uid} className="flex items-center gap-3 p-3">
              <div className="flex min-w-0 flex-1 flex-col">
                <span className="flex items-center gap-1.5 truncate font-semibold">
                  {u.name || u.email}
                  {isSelf ? <span className="font-mono text-[10px] text-muted-foreground uppercase">(you)</span> : null}
                </span>
                <span className="truncate text-sm text-muted-foreground">{u.email}</span>
              </div>
              <span
                className={
                  isRowAdmin
                    ? 'flex items-center gap-1 rounded-sm bg-primary px-2 py-1 font-mono text-[10px] font-bold tracking-widest text-primary-foreground uppercase'
                    : 'rounded-sm border border-border px-2 py-1 font-mono text-[10px] font-bold tracking-widest text-muted-foreground uppercase'
                }
              >
                {isRowAdmin ? <ShieldCheck className="size-3" aria-hidden="true" /> : null}
                {u.role}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-9 shrink-0"
                disabled={isSelf || pending === u.uid}
                onClick={() => setRole(u.uid, isRowAdmin ? 'viewer' : 'admin')}
              >
                {pending === u.uid ? <Loader2 className="size-4 animate-spin" aria-hidden="true" /> : null}
                {isRowAdmin ? 'Revoke' : 'Make admin'}
              </Button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

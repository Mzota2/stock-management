'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { LogOut, ShieldCheck, UserRound, Users } from 'lucide-react'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Button } from '@/components/ui/button'
import { useAuth } from './auth-provider'
import { cn } from '@/lib/utils'

export function UserMenu() {
  const { user, isAdmin, signOut } = useAuth()
  const router = useRouter()
  const [open, setOpen] = useState(false)

  if (!user) return null

  const label = user.displayName || user.email || 'Account'
  const initials = label
    .split(/[\s@.]+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((s) => s[0]?.toUpperCase())
    .join('')

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={cn(
          'relative flex size-10 shrink-0 items-center justify-center rounded-md border font-mono text-sm font-bold focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none',
          isAdmin
            ? 'border-primary bg-primary text-primary-foreground'
            : 'border-panel-foreground/25 text-panel-foreground hover:bg-panel-foreground/10',
        )}
      >
        {initials || <UserRound className="size-5" aria-hidden="true" />}
        <span className="sr-only">Account menu for {label}</span>
      </button>

      <Drawer open={open} onOpenChange={setOpen} showSwipeHandle>
        <DrawerContent>
          <DrawerHeader className="gap-1 pb-4 text-left group-data-[swipe-axis=y]/drawer-popup:text-left">
            <span className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
              Signed in
            </span>
            <DrawerTitle className="font-condensed truncate text-2xl font-bold uppercase">
              {user.displayName || 'Operator'}
            </DrawerTitle>
            <DrawerDescription className="truncate text-left">{user.email}</DrawerDescription>
          </DrawerHeader>

          <div className="flex flex-col gap-3 px-4 pb-2">
            <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
              {isAdmin ? (
                <ShieldCheck className="size-5 shrink-0 text-primary" aria-hidden="true" />
              ) : (
                <UserRound className="size-5 shrink-0 text-muted-foreground" aria-hidden="true" />
              )}
              <div className="flex flex-col">
                <span className="font-mono text-xs font-bold tracking-widest uppercase">
                  {isAdmin ? 'Admin' : 'Viewer'}
                </span>
                <span className="text-sm text-muted-foreground">
                  {isAdmin ? 'Can assign and edit stock codes.' : 'Can view parts and stock codes.'}
                </span>
              </div>
            </div>

            {isAdmin ? (
              <Link
                href="/admin/users"
                onClick={() => setOpen(false)}
                className="flex h-12 items-center gap-3 rounded-lg border border-border bg-card px-3 font-semibold hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
              >
                <Users className="size-5" aria-hidden="true" />
                Manage users
              </Link>
            ) : null}
          </div>

          <DrawerFooter className="pb-[max(env(safe-area-inset-bottom),1rem)]">
            <Button
              variant="outline"
              className="h-12 text-base"
              onClick={async () => {
                await signOut()
                setOpen(false)
                router.replace('/login')
              }}
            >
              <LogOut className="size-5" aria-hidden="true" />
              Sign out
            </Button>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>
    </>
  )
}

import type { Metadata } from 'next'
import { AppHeader } from '@/components/app-header'
import { UsersManager } from '@/components/users-manager'

export const metadata: Metadata = { title: 'Manage users — Parts Crib' }

export default function AdminUsersPage() {
  return (
    <>
      <AppHeader eyebrow="Admin" title="Users & roles" backHref="/" backLabel="All machines" />
      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
          Viewers can browse parts and stock codes. Admins can also assign and edit stock codes.
        </p>
        <UsersManager />
      </main>
    </>
  )
}

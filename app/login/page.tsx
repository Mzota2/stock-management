import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthForm } from '@/components/auth-form'
import { AuthShell } from '@/components/auth-shell'

export const metadata: Metadata = { title: 'Sign in — Parts Crib' }

export default function LoginPage() {
  return (
    <AuthShell eyebrow="Operator access" title="Sign in">
      <Suspense>
        <AuthForm mode="login" />
      </Suspense>
    </AuthShell>
  )
}

import type { Metadata } from 'next'
import { Suspense } from 'react'
import { AuthForm } from '@/components/auth-form'
import { AuthShell } from '@/components/auth-shell'

export const metadata: Metadata = { title: 'Create account — Parts Crib' }

export default function SignupPage() {
  return (
    <AuthShell eyebrow="New operator" title="Create account">
      <Suspense>
        <AuthForm mode="signup" />
      </Suspense>
    </AuthShell>
  )
}

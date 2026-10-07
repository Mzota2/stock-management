'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FirebaseNotice } from './firebase-notice'
import { authErrorMessage, useAuth } from './auth-provider'
import { isFirebaseConfigured } from '@/lib/firebase'

const fieldClass =
  'h-12 w-full rounded-lg border border-input bg-card px-3 text-base outline-none placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/30 disabled:opacity-60'

function safeNext(value: string | null) {
  return value && value.startsWith('/') && !value.startsWith('//') ? value : '/'
}

export function AuthForm({ mode }: { mode: 'login' | 'signup' }) {
  const { user, loading, signIn, signUp } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const next = safeNext(searchParams.get('next'))

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!loading && user) router.replace(next)
  }, [loading, user, next, router])

  const isSignup = mode === 'signup'
  const disabled = !isFirebaseConfigured || submitting

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (isSignup && password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    setSubmitting(true)
    try {
      if (isSignup) await signUp(name.slice(0, 80), email, password)
      else await signIn(email, password)
    } catch (err) {
      setError(authErrorMessage(err))
      setSubmitting(false)
    }
  }

  const altHref = `${isSignup ? '/login' : '/signup'}${next !== '/' ? `?next=${encodeURIComponent(next)}` : ''}`

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4" noValidate>
      <FirebaseNotice />

      {isSignup ? (
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="text-sm font-semibold">
            Full name
          </label>
          <input
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoComplete="name"
            placeholder="Jane Fitter"
            disabled={disabled}
            className={fieldClass}
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-sm font-semibold">
          Email
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          inputMode="email"
          autoCapitalize="none"
          placeholder="you@plant.com"
          disabled={disabled}
          className={fieldClass}
        />
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-sm font-semibold">
          Password
        </label>
        <input
          id="password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isSignup ? 'new-password' : 'current-password'}
          placeholder={isSignup ? 'At least 6 characters' : '••••••••'}
          disabled={disabled}
          className={fieldClass}
        />
      </div>

      {error ? (
        <p className="text-sm font-medium text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <Button type="submit" className="h-12 text-base font-semibold" disabled={disabled}>
        {submitting ? <Loader2 className="size-5 animate-spin" aria-hidden="true" /> : null}
        {isSignup ? 'Create account' : 'Sign in'}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        {isSignup ? 'Already have an account? ' : 'New to the crib? '}
        <Link href={altHref} className="font-semibold text-foreground underline underline-offset-4">
          {isSignup ? 'Sign in' : 'Create an account'}
        </Link>
      </p>

      {isSignup ? (
        <p className="text-center text-xs leading-relaxed text-muted-foreground text-pretty">
          New accounts can view all parts and stock codes. An admin can grant edit rights.
        </p>
      ) : null}
    </form>
  )
}

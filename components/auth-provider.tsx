'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth'
import { doc, onSnapshot, serverTimestamp, setDoc } from 'firebase/firestore'
import { getDb, getFirebaseAuth, isFirebaseConfigured, USERS_COLLECTION } from '@/lib/firebase'

export type Role = 'admin' | 'viewer'

interface AuthContextValue {
  user: User | null
  role: Role | null
  isAdmin: boolean
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

function requireAuth() {
  const auth = getFirebaseAuth()
  if (!auth) throw new Error('Firebase is not configured')
  return auth
}

async function createProfile(user: User, name: string) {
  const db = getDb()
  if (!db) return
  await setDoc(doc(db, USERS_COLLECTION, user.uid), {
    email: user.email ?? '',
    name: name || user.displayName || '',
    role: 'viewer',
    createdAt: serverTimestamp(),
  })
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [role, setRole] = useState<Role | null>(null)
  const [loading, setLoading] = useState(isFirebaseConfigured)

  useEffect(() => {
    const auth = getFirebaseAuth()
    const db = getDb()
    if (!auth || !db) return

    let unsubscribeProfile: (() => void) | undefined

    const unsubscribeAuth = onAuthStateChanged(auth, (nextUser) => {
      unsubscribeProfile?.()
      unsubscribeProfile = undefined
      setUser(nextUser)

      if (!nextUser) {
        setRole(null)
        setLoading(false)
        return
      }

      setLoading(true)
      unsubscribeProfile = onSnapshot(
        doc(db, USERS_COLLECTION, nextUser.uid),
        (snap) => {
          if (!snap.exists()) {
            createProfile(nextUser, nextUser.displayName ?? '').catch(() => {})
            setRole('viewer')
          } else {
            setRole(snap.data().role === 'admin' ? 'admin' : 'viewer')
          }
          setLoading(false)
        },
        () => {
          setRole('viewer')
          setLoading(false)
        },
      )
    })

    return () => {
      unsubscribeProfile?.()
      unsubscribeAuth()
    }
  }, [])

  const value: AuthContextValue = {
    user,
    role,
    isAdmin: role === 'admin',
    loading,
    async signIn(email, password) {
      await signInWithEmailAndPassword(requireAuth(), email.trim(), password)
    },
    async signUp(name, email, password) {
      const cred = await createUserWithEmailAndPassword(requireAuth(), email.trim(), password)
      if (name.trim()) await updateProfile(cred.user, { displayName: name.trim() })
      await createProfile(cred.user, name.trim())
    },
    async signOut() {
      await firebaseSignOut(requireAuth())
    },
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}

export function authErrorMessage(error: unknown): string {
  const code = (error as { code?: string })?.code ?? ''
  switch (code) {
    case 'auth/invalid-credential':
    case 'auth/wrong-password':
    case 'auth/user-not-found':
      return 'Email or password is incorrect.'
    case 'auth/email-already-in-use':
      return 'An account with this email already exists.'
    case 'auth/invalid-email':
      return 'Enter a valid email address.'
    case 'auth/weak-password':
      return 'Password must be at least 6 characters.'
    case 'auth/too-many-requests':
      return 'Too many attempts. Wait a moment and try again.'
    case 'auth/network-request-failed':
      return 'Network error. Check your connection.'
    case 'auth/operation-not-allowed':
      return 'Email/password sign-in is not enabled in Firebase.'
    default:
      return error instanceof Error ? error.message : 'Something went wrong. Try again.'
  }
}

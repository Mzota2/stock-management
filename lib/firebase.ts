import { getApp, getApps, initializeApp, type FirebaseApp } from 'firebase/app'
import { getAuth, type Auth } from 'firebase/auth'
import { getFirestore, type Firestore } from 'firebase/firestore'

const config = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

export const isFirebaseConfigured = Boolean(config.apiKey && config.projectId && config.appId)

export const STOCK_COLLECTION = 'stockCodes'
export const USERS_COLLECTION = 'users'

let db: Firestore | null = null
let auth: Auth | null = null

function getFirebaseApp(): FirebaseApp | null {
  if (!isFirebaseConfigured) return null
  return getApps().length ? getApp() : initializeApp(config)
}

export function getDb(): Firestore | null {
  if (db) return db
  const app = getFirebaseApp()
  if (!app) return null
  db = getFirestore(app)
  return db
}

export function getFirebaseAuth(): Auth | null {
  if (auth) return auth
  const app = getFirebaseApp()
  if (!app) return null
  auth = getAuth(app)
  return auth
}

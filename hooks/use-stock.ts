'use client'

import useSWRSubscription from 'swr/subscription'
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  where,
  type Timestamp,
} from 'firebase/firestore'
import { getDb, getFirebaseAuth, STOCK_COLLECTION } from '@/lib/firebase'
import type { MachineId, StockMap, StockRecord } from '@/lib/types'

export function useStock(machine: MachineId) {
  const db = getDb()
  const { data, error } = useSWRSubscription<StockMap, Error, [string, MachineId] | null>(
    db ? ['stock', machine] : null,
    ([, machineId], { next }) => {
      const q = query(collection(db!, STOCK_COLLECTION), where('machine', '==', machineId))
      return onSnapshot(
        q,
        (snap) => {
          const map: StockMap = {}
          snap.forEach((d) => {
            const v = d.data()
            map[d.id] = {
              partId: d.id,
              machine: v.machine,
              partNumber: v.partNumber ?? '',
              stockCode: v.stockCode ?? '',
              location: v.location ?? '',
              onHand: typeof v.onHand === 'number' ? v.onHand : null,
              updatedAt: (v.updatedAt as Timestamp | null)?.toMillis?.(),
            }
          })
          next(null, map)
        },
        (err) => next(err),
      )
    },
  )

  return {
    stock: data ?? {},
    isLoading: Boolean(db) && !data && !error,
    error,
    connected: Boolean(db),
  }
}

export async function saveStockRecord(record: Omit<StockRecord, 'updatedAt'>) {
  const db = getDb()
  if (!db) throw new Error('Firestore is not configured')
  const ref = doc(db, STOCK_COLLECTION, record.partId)
  const isEmpty = !record.stockCode && !record.location && record.onHand === null
  if (isEmpty) {
    await deleteDoc(ref)
    return
  }
  await setDoc(
    ref,
    { ...record, updatedBy: getFirebaseAuth()?.currentUser?.uid ?? null, updatedAt: serverTimestamp() },
    { merge: true },
  )
}

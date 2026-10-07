import { AppHeader } from '@/components/app-header'
import { FirebaseNotice } from '@/components/firebase-notice'
import { MachinePlate } from '@/components/machine-plate'
import { getMachineSummaries } from '@/lib/machines'

export default function HomePage() {
  const machines = getMachineSummaries()
  return (
    <>
      <AppHeader eyebrow="Parts crib · Stock register" title="Select machine" />
      <main className="mx-auto flex max-w-3xl flex-col gap-4 px-4 py-6 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        <p className="text-sm leading-relaxed text-pretty text-muted-foreground">
          Pick a machine to browse its assemblies, search parts and assign stock codes.
        </p>
        <FirebaseNotice />
        <div className="grid gap-4 md:grid-cols-2">
          {machines.map((m, i) => (
            <MachinePlate key={m.id} machine={m} index={i} />
          ))}
        </div>
      </main>
    </>
  )
}

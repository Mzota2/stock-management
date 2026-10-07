import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AppHeader } from '@/components/app-header'
import { MachineView } from '@/components/machine-view'
import { getMachine, MACHINE_IDS } from '@/lib/machines'

export function generateStaticParams() {
  return MACHINE_IDS.map((machineId) => ({ machineId }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ machineId: string }>
}): Promise<Metadata> {
  const machine = getMachine((await params).machineId)
  return { title: machine ? `${machine.name} ${machine.model} — Parts Crib` : 'Parts Crib' }
}

export default async function MachinePage({ params }: { params: Promise<{ machineId: string }> }) {
  const machine = getMachine((await params).machineId)
  if (!machine) notFound()

  return (
    <>
      <AppHeader eyebrow={machine.model} title={machine.name} backHref="/" backLabel="All machines" />
      <main className="mx-auto max-w-3xl px-4 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        <MachineView machine={machine} />
      </main>
    </>
  )
}

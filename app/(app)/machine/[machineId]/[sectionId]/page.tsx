import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { AppHeader } from '@/components/app-header'
import { SectionView } from '@/components/section-view'
import { getMachine, MACHINE_IDS } from '@/lib/machines'

type Params = Promise<{ machineId: string; sectionId: string }>

export function generateStaticParams() {
  return MACHINE_IDS.flatMap((machineId) =>
    getMachine(machineId)!.sections.map((s) => ({ machineId, sectionId: s.id })),
  )
}

async function load(params: Params) {
  const { machineId, sectionId } = await params
  const machine = getMachine(machineId)
  const section = machine?.sections.find((s) => s.id === sectionId)
  return machine && section ? { machine, section } : null
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const data = await load(params)
  return { title: data ? `${data.section.title || data.section.code} — ${data.machine.name}` : 'Parts Crib' }
}

export default async function SectionPage({ params }: { params: Params }) {
  const data = await load(params)
  if (!data) notFound()
  const { machine, section } = data

  return (
    <>
      <AppHeader
        eyebrow={`${machine.name} · ${section.code}`}
        title={section.title || section.code}
        backHref={`/machine/${machine.id}`}
        backLabel={`Back to ${machine.name}`}
      />
      <main className="mx-auto max-w-3xl px-4 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        <SectionView machineId={machine.id} section={section} />
      </main>
    </>
  )
}

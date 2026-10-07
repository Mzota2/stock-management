export function AuthShell({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <header className="bg-panel text-panel-foreground">
        <div className="mx-auto flex max-w-md flex-col gap-1 px-4 pt-[max(env(safe-area-inset-top),2.5rem)] pb-8">
          <span className="font-mono text-[11px] tracking-widest text-panel-foreground/60 uppercase">
            Parts crib · GALDI &amp; NIMCO
          </span>
          <span className="font-mono text-xs tracking-widest text-[#7bbde8] uppercase">{eyebrow}</span>
          <h1 className="font-condensed text-4xl leading-none font-bold tracking-wide uppercase">
            {title}
          </h1>
        </div>
        <div className="hazard-stripe h-1.5" aria-hidden="true" />
      </header>
      <main className="mx-auto w-full max-w-md flex-1 px-4 py-6 pb-[max(env(safe-area-inset-bottom),1.5rem)]">
        {children}
      </main>
    </div>
  )
}

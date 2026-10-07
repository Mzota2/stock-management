import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import { ConnectionStatus } from './connection-status'
import { UserMenu } from './user-menu'

interface AppHeaderProps {
  eyebrow: string
  title: string
  backHref?: string
  backLabel?: string
}

export function AppHeader({ eyebrow, title, backHref, backLabel = 'Back' }: AppHeaderProps) {
  return (
    <header className="bg-panel text-panel-foreground">
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-4 pt-[max(env(safe-area-inset-top),0.75rem)] pb-3">
        {backHref ? (
          <Link
            href={backHref}
            className="-ml-2 flex size-10 shrink-0 items-center justify-center rounded-md text-panel-foreground/80 hover:bg-panel-foreground/10 hover:text-panel-foreground focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <ChevronLeft className="size-6" aria-hidden="true" />
            <span className="sr-only">{backLabel}</span>
          </Link>
        ) : null}
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-mono text-[11px] tracking-widest text-panel-foreground/60 uppercase">
            {eyebrow}
          </span>
          <h1 className="font-condensed truncate text-xl leading-tight font-bold tracking-wide uppercase">
            {title}
          </h1>
        </div>
        <ConnectionStatus />
        <UserMenu />
      </div>
      <div className="hazard-stripe h-1.5" aria-hidden="true" />
    </header>
  )
}

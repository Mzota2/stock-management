import { cn } from '@/lib/utils'

export function ProgressBar({
  value,
  max,
  className,
}: {
  value: number
  max: number
  className?: string
}) {
  const pct = max > 0 ? Math.round((value / max) * 100) : 0
  return (
    <span
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={value}
      aria-label={`${value} of ${max} parts coded`}
      className={cn('block h-1.5 overflow-hidden rounded-full bg-muted', className)}
    >
      <span className="block h-full rounded-full bg-ok transition-[width]" style={{ width: `${pct}%` }} />
    </span>
  )
}

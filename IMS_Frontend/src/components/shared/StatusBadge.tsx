import { cn } from '@/lib/utils'
import type { OperationStatus } from '@/types'

const statusConfig: Record<OperationStatus, { label: string; className: string }> = {
  draft: { label: 'Draft', className: 'bg-surface-tertiary text-text-secondary border-border' },
  confirmed: { label: 'Confirmed', className: 'bg-primary-light text-primary-700 border-primary/20' },
  validated: { label: 'Validated', className: 'bg-success-light text-emerald-700 border-success/20' },
  ready: { label: 'Ready', className: 'bg-primary-light text-primary-700 border-primary/20' },
  waiting: { label: 'Waiting', className: 'bg-warning-light text-amber-700 border-warning/20' },
  done: { label: 'Done', className: 'bg-success-light text-emerald-700 border-success/20' },
  cancelled: { label: 'Cancelled', className: 'bg-danger-light text-red-700 border-danger/20' },
}

export function StatusBadge({ status, className }: { status: OperationStatus; className?: string }) {
  const config = statusConfig[status] || statusConfig.draft
  return (
    <span className={cn('inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors', config.className, className)}>
      <span className={cn('h-1.5 w-1.5 rounded-full', {
        'bg-text-muted': status === 'draft',
        'bg-primary': status === 'ready' || status === 'confirmed',
        'bg-warning': status === 'waiting',
        'bg-success': status === 'done' || status === 'validated',
        'bg-danger': status === 'cancelled',
      })} />
      {config.label}
    </span>
  )
}

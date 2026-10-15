import { FACTORY_STATUS_LABELS } from '@/lib/constants'
import type { FactoryOrderStatus } from '@/types/factory-order'

const STYLES: Record<FactoryOrderStatus, string> = {
  draft: 'bg-status-pending/10 text-status-pending',
  sent: 'bg-status-sent/10 text-status-sent',
  in_production: 'bg-status-production/10 text-status-production',
  ready: 'bg-status-partial/10 text-status-partial',
  delivered: 'bg-status-paid/10 text-status-paid',
}

export function FactoryStatusBadge({ status }: { status: FactoryOrderStatus }) {
  return (
    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${STYLES[status]}`}>
      {FACTORY_STATUS_LABELS[status]}
    </span>
  )
}

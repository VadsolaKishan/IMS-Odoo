import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '@/lib/api/client'
import { queryKeys } from '@/lib/query/keys'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/StateDisplay'
import { Search, History, ArrowDownToLine, ArrowUpFromLine, ArrowLeftRight, ClipboardList } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PaginatedResponse, LedgerEntry } from '@/types'

const typeConfig: Record<string, { icon: React.ElementType; color: string; bg: string }> = {
  receipt: { icon: ArrowDownToLine, color: 'text-success', bg: 'bg-success-light' },
  delivery: { icon: ArrowUpFromLine, color: 'text-danger', bg: 'bg-danger-light' },
  transfer: { icon: ArrowLeftRight, color: 'text-primary', bg: 'bg-primary-light' },
  adjustment: { icon: ClipboardList, color: 'text-warning', bg: 'bg-warning-light' },
}

export default function MoveHistoryPage() {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState('')
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.ledger.list({ search, type: typeFilter }),
    queryFn: () => api.get<PaginatedResponse<LedgerEntry>>('/inventory/ledger/', { params: { search: search || undefined, operation_type: typeFilter || undefined } }).then((r) => r.data),
  })
  if (isLoading) return <LoadingState />
  if (error) return <ErrorState onRetry={() => refetch()} />

  const types = ['', 'receipt', 'delivery', 'transfer', 'adjustment']

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div><h1 className="text-2xl font-bold text-text-primary">Move History</h1><p className="text-sm text-text-secondary">Track all inventory movements</p></div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" /><Input placeholder="Search by product or reference..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" /></div>
        <div className="flex gap-1 flex-wrap">{types.map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${typeFilter === t ? 'bg-primary text-white shadow-sm' : 'bg-surface text-text-secondary hover:bg-surface-tertiary border border-border'}`}>{t || 'All'}</button>
        ))}</div>
      </div>
      {data?.results && data.results.length > 0 ? (
        <>
          <Card className="hidden md:block overflow-hidden"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border bg-surface-secondary/50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Type</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Reference</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Product</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Qty Change</th>
            <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Qty After</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Source → Dest</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">By</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Date</th>
          </tr></thead><tbody className="divide-y divide-border">
            {data.results.map((entry, i) => {
              const cfg = typeConfig[entry.operation_type] || typeConfig.receipt
              const Icon = cfg.icon
              return (
                <motion.tr key={entry.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                  className={cn('hover:bg-surface-tertiary/50', entry.quantity_change > 0 ? 'bg-success/[0.02]' : entry.quantity_change < 0 ? 'bg-danger/[0.02]' : '')}
                >
                  <td className="px-4 py-3"><span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold', cfg.bg, cfg.color)}><Icon className="w-3 h-3" />{entry.operation_type}</span></td>
                  <td className="px-4 py-3 text-sm font-medium font-mono text-primary">{entry.reference}</td>
                  <td className="px-4 py-3 text-sm text-text-primary">{entry.product_name}</td>
                  <td className={cn("px-4 py-3 text-sm text-right font-bold", entry.quantity_change > 0 ? 'text-success' : 'text-danger')}>{entry.quantity_change > 0 ? '+' : ''}{entry.quantity_change}</td>
                  <td className="px-4 py-3 text-sm text-right text-text-secondary">{entry.quantity_after}</td>
                  <td className="px-4 py-3 text-xs text-text-muted">{entry.source_location_name || '—'} → {entry.destination_location_name || '—'}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{entry.performed_by_name}</td>
                  <td className="px-4 py-3 text-sm text-text-muted">{new Date(entry.timestamp).toLocaleDateString()}</td>
                </motion.tr>
              )
            })}
          </tbody></table></div></Card>
          <div className="md:hidden space-y-2">{data.results.map((entry) => {
            const cfg = typeConfig[entry.operation_type] || typeConfig.receipt
            const Icon = cfg.icon
            return (
              <Card key={entry.id} className={cn("p-4", entry.quantity_change > 0 ? 'border-l-4 border-l-success' : 'border-l-4 border-l-danger')}>
                <div className="flex items-start justify-between">
                  <div><span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold', cfg.bg, cfg.color)}><Icon className="w-3 h-3" />{entry.operation_type}</span>
                    <p className="text-sm font-semibold text-text-primary mt-1">{entry.product_name}</p>
                    <p className="text-xs text-text-muted font-mono">{entry.reference}</p>
                  </div>
                  <span className={cn("text-lg font-bold", entry.quantity_change > 0 ? 'text-success' : 'text-danger')}>{entry.quantity_change > 0 ? '+' : ''}{entry.quantity_change}</span>
                </div>
                <div className="flex items-center justify-between mt-2 text-xs text-text-muted">
                  <span>{entry.performed_by_name}</span>
                  <span>{new Date(entry.timestamp).toLocaleDateString()}</span>
                </div>
              </Card>
            )
          })}</div>
        </>
      ) : <EmptyState icon={<History className="w-12 h-12" />} title="No movements yet" description="Movements will appear here after inventory operations." />}
    </motion.div>
  )
}

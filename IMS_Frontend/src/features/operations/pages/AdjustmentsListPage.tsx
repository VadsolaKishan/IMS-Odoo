import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '@/lib/api/client'
import { queryKeys } from '@/lib/query/keys'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/StateDisplay'
import { Plus, Search, ClipboardList } from 'lucide-react'
import type { PaginatedResponse, Adjustment } from '@/types'

export default function AdjustmentsListPage() {
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.adjustments.list({ search, status: statusFilter }),
    queryFn: () => api.get<PaginatedResponse<Adjustment>>('/inventory/adjustments/', { params: { search, status: statusFilter || undefined } }).then((r) => r.data),
  })
  if (isLoading) return <LoadingState />
  if (error) return <ErrorState onRetry={() => refetch()} />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div><h1 className="text-2xl font-bold text-text-primary">Adjustments</h1><p className="text-sm text-text-secondary">Reconcile inventory counts</p></div>
        <Link to="/operations/adjustments/new"><Button className="gap-2"><Plus className="w-4 h-4" /> New Adjustment</Button></Link>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" /><Input placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" /></div>
      </div>
      {data?.results && data.results.length > 0 ? (
        <>
          <Card className="hidden md:block overflow-hidden"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border bg-surface-secondary/50">
            <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Reference</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Location</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Reason</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Status</th>
            <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Responsible</th>
          </tr></thead><tbody className="divide-y divide-border">
            {data.results.map((item, i) => (
              <motion.tr key={item.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} className="hover:bg-surface-tertiary/50">
                <td className="px-4 py-3"><Link to={`/operations/adjustments/${item.id}`} className="text-sm font-semibold text-primary hover:underline">{item.reference}</Link></td>
                <td className="px-4 py-3 text-sm text-text-secondary">{item.location_name}</td>
                <td className="px-4 py-3 text-sm text-text-secondary">{item.reason}</td>
                <td className="px-4 py-3"><StatusBadge status={item.status} /></td>
                <td className="px-4 py-3 text-sm text-text-secondary">{item.created_by_name || '—'}</td>
              </motion.tr>
            ))}
          </tbody></table></div></Card>
          <div className="md:hidden space-y-2">{data.results.map((item) => (
            <Link key={item.id} to={`/operations/adjustments/${item.id}`}><Card className="p-4 hover:shadow-card-hover transition-all">
              <div className="flex items-start justify-between"><div><p className="text-sm font-semibold text-primary">{item.reference}</p><p className="text-xs text-text-secondary mt-0.5">{item.location_name} • {item.reason}</p></div><StatusBadge status={item.status} /></div>
            </Card></Link>
          ))}</div>
        </>
      ) : <EmptyState icon={<ClipboardList className="w-12 h-12" />} title="No adjustments found" description="Create an adjustment to reconcile inventory." action={<Link to="/operations/adjustments/new"><Button size="sm">Create Adjustment</Button></Link>} />}
    </motion.div>
  )
}

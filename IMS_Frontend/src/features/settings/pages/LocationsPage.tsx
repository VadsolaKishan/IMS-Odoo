import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '@/lib/api/client'
import { queryKeys } from '@/lib/query/keys'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/StateDisplay'
import { Plus, Search, MapPin, Pencil } from 'lucide-react'
import { useAuth } from '@/lib/guards/AuthContext'
import { cn } from '@/lib/utils'
import type { PaginatedResponse, Location } from '@/types'

export default function LocationsPage() {
  const [search, setSearch] = useState('')
  const { user } = useAuth()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.settings.locations({ search }),
    queryFn: () => api.get<PaginatedResponse<Location>>('/warehouses/locations/', { params: { search: search || undefined } }).then((r) => r.data),
  })
  if (isLoading) return <LoadingState />
  if (error) return <ErrorState onRetry={() => refetch()} />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div><h1 className="text-2xl font-bold">Locations</h1><p className="text-sm text-text-secondary">Manage storage locations</p></div>
        {user?.role !== 'warehouse_staff' && <Button className="gap-2"><Plus className="w-4 h-4" /> Add Location</Button>}
      </div>
      <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" /><Input placeholder="Search locations..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" /></div>
      {data?.results && data.results.length > 0 ? (
        <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border bg-surface-secondary/50">
          <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Name</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Code</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Warehouse</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Type</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Status</th>
          <th className="w-10"></th>
        </tr></thead><tbody className="divide-y divide-border">{data.results.map((loc, i) => (
          <motion.tr key={loc.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-surface-tertiary/50 group">
            <td className="px-4 py-3 text-sm font-medium">{loc.name}</td>
            <td className="px-4 py-3 text-sm text-text-muted font-mono">{loc.code}</td>
            <td className="px-4 py-3 text-sm text-text-secondary">{loc.warehouse_name}</td>
            <td className="px-4 py-3"><span className="text-xs font-medium px-2 py-0.5 rounded-full bg-surface-tertiary text-text-secondary capitalize">{loc.location_type}</span></td>
            <td className="px-4 py-3"><span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', loc.is_active ? 'bg-success-light text-emerald-700' : 'bg-surface-tertiary text-text-muted')}><span className={cn('w-1.5 h-1.5 rounded-full', loc.is_active ? 'bg-success' : 'bg-text-muted')} />{loc.is_active ? 'Active' : 'Inactive'}</span></td>
            <td className="px-4 py-2">
              {user?.role !== 'warehouse_staff' && (
                <button className="p-1.5 rounded-lg hover:bg-surface-tertiary opacity-0 group-hover:opacity-100 transition-all font-medium">
                  <Pencil className="w-3.5 h-3.5 text-text-muted" />
                </button>
              )}
            </td>
          </motion.tr>
        ))}</tbody></table></div></Card>
      ) : <EmptyState icon={<MapPin className="w-12 h-12" />} title="No locations" description="Add locations to your warehouses." action={<Button size="sm">Add Location</Button>} />}
    </motion.div>
  )
}

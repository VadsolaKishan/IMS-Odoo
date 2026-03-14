import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '@/lib/api/client'
import { queryKeys } from '@/lib/query/keys'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/StateDisplay'
import { Plus, Warehouse as WarehouseIcon, Pencil, MapPin } from 'lucide-react'
import { useAuth } from '@/lib/guards/AuthContext'
import { cn } from '@/lib/utils'
import type { PaginatedResponse, Warehouse } from '@/types'

export default function WarehousesPage() {
  const { user } = useAuth()
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.settings.warehouses,
    queryFn: () => api.get<PaginatedResponse<Warehouse>>('/warehouses/').then((r) => r.data),
  })

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState onRetry={() => refetch()} />

  const warehouses = data?.results || []

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex items-center justify-between">
        <div><h1 className="text-2xl font-bold text-text-primary">Warehouses</h1><p className="text-sm text-text-secondary">Manage storage facilities</p></div>
        {user?.role !== 'warehouse_staff' && <Button className="gap-2"><Plus className="w-4 h-4" /> Add Warehouse</Button>}
      </div>
      {warehouses.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {warehouses.map((wh, i) => (
            <motion.div key={wh.id} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Card className="hover:shadow-card-hover transition-all group">
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center group-hover:scale-110 transition-transform">
                        <WarehouseIcon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <CardTitle className="text-base">{wh.name}</CardTitle>
                        <p className="text-xs text-text-muted font-mono">{wh.code}</p>
                      </div>
                    </div>
                    {user?.role !== 'warehouse_staff' && (
                      <button className="p-1.5 rounded-lg hover:bg-surface-tertiary opacity-0 group-hover:opacity-100 transition-all">
                        <Pencil className="w-3.5 h-3.5 text-text-muted" />
                      </button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-1.5 text-xs text-text-secondary">
                    <MapPin className="w-3 h-3" />
                    {wh.address}{wh.city ? `, ${wh.city}` : ''}{wh.state ? `, ${wh.state}` : ''}
                  </div>
                  <div className="mt-2">
                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', wh.is_active ? 'bg-success-light text-emerald-700' : 'bg-surface-tertiary text-text-muted')}>
                      <span className={cn('w-1.5 h-1.5 rounded-full', wh.is_active ? 'bg-success' : 'bg-text-muted')} />
                      {wh.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      ) : <EmptyState icon={<WarehouseIcon className="w-12 h-12" />} title="No warehouses" description="Add your first warehouse." action={<Button size="sm">Add Warehouse</Button>} />}
    </motion.div>
  )
}

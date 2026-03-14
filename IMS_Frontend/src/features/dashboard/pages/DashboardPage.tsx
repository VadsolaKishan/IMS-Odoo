import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { queryKeys } from '@/lib/query/keys'
import api from '@/lib/api/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingState, ErrorState } from '@/components/shared/StateDisplay'
import { ArrowDownToLine, ArrowUpFromLine, Boxes, TrendingDown, AlertTriangle, Package } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { DashboardOverview, DashboardStockItemsResponse } from '@/types'

const containerVariants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}
const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

function AnimatedCounter({ value }: { value: number }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: 'spring', stiffness: 200, damping: 15 }}
      className="text-2xl font-bold"
    >
      {value}
    </motion.span>
  )
}

function KpiCard({ icon: Icon, title, value, details, color }: {
  icon: React.ElementType; title: string; value: number
  details: { label: string; value: number; color: string }[]
  color: string
}) {
  return (
    <motion.div variants={itemVariants}>
      <Card className="relative overflow-hidden group hover:shadow-card-hover transition-all duration-300">
        <div className={cn('absolute top-0 left-0 right-0 h-1 rounded-t-xl', color)} />
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-medium text-text-secondary">{title}</CardTitle>
            <div className={cn('p-2 rounded-xl transition-transform group-hover:scale-110', color.replace('bg-', 'bg-') + '/10')}>
              <Icon className={cn('w-5 h-5', color.replace('bg-', 'text-'))} />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <AnimatedCounter value={value} />
          <div className="flex flex-wrap gap-2 mt-3">
            {details.map((d) => (
              <span key={d.label} className={cn('inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full', d.color)}>
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                {d.value} {d.label}
              </span>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function DashboardPage() {
  const { data: overview, isLoading: loadingOverview, error: overviewError, refetch: refetchOverview } = useQuery({
    queryKey: queryKeys.dashboard.overview,
    queryFn: () => api.get<DashboardOverview>('/dashboard/overview/').then((r) => r.data),
  })

  const { data: lowStock } = useQuery({
    queryKey: queryKeys.dashboard.lowStock,
    queryFn: () => api.get<DashboardStockItemsResponse>('/dashboard/low-stock/').then((r) => r.data),
  })

  const { data: outOfStock } = useQuery({
    queryKey: queryKeys.dashboard.outOfStock,
    queryFn: () => api.get<DashboardStockItemsResponse>('/dashboard/out-of-stock/').then((r) => r.data),
  })

  if (loadingOverview) return <LoadingState />
  if (overviewError) return <ErrorState onRetry={() => refetchOverview()} />

  const ov = overview || {
    products: { total: 0, in_stock: 0, low_stock: 0, out_of_stock: 0 },
    operations: { pending_receipts: 0, pending_deliveries: 0, scheduled_transfers: 0 },
    today: { receipts_validated: 0, deliveries_validated: 0 },
    activity: { movements_last_7_days: 0 },
  }
  const lowStockItems = lowStock?.items || []
  const outOfStockItems = outOfStock?.items || []

  return (
    <motion.div variants={containerVariants} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={itemVariants} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Dashboard</h1>
          <p className="text-sm text-text-secondary mt-0.5">Overview of your inventory operations</p>
        </div>
      </motion.div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <KpiCard
          icon={ArrowDownToLine} title="Receipts" value={ov.operations.pending_receipts} color="bg-primary"
          details={[
            { label: 'Validated Today', value: ov.today.receipts_validated, color: 'bg-success-light text-success' },
            { label: 'Movements (7d)', value: ov.activity.movements_last_7_days, color: 'bg-primary-light text-primary' },
          ]}
        />
        <KpiCard
          icon={ArrowUpFromLine} title="Deliveries" value={ov.operations.pending_deliveries} color="bg-secondary"
          details={[
            { label: 'Validated Today', value: ov.today.deliveries_validated, color: 'bg-success-light text-success' },
            { label: 'Transfers', value: ov.operations.scheduled_transfers, color: 'bg-primary-light text-primary' },
          ]}
        />
        <KpiCard
          icon={Boxes} title="Stock" value={ov.products.total} color="bg-accent"
          details={[
            { label: 'Low Stock', value: lowStockItems.length, color: 'bg-warning-light text-amber-700' },
            { label: 'Out of Stock', value: outOfStockItems.length, color: 'bg-danger-light text-danger' },
          ]}
        />
      </div>

      {/* Low Stock & Out of Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-warning" />
                <CardTitle className="text-base">Low Stock Items</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {lowStockItems.length > 0 ? (
                <div className="space-y-2">
                  {lowStockItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-surface-secondary hover:bg-surface-tertiary transition-colors">
                      <div>
                        <p className="text-sm font-medium text-text-primary">{item.name}</p>
                        <p className="text-xs text-text-muted">{item.category}</p>
                      </div>
                      <span className="text-sm font-semibold text-warning">{item.current_stock ?? 0}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted text-center py-6">No low stock items</p>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div variants={itemVariants}>
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-danger" />
                <CardTitle className="text-base">Out of Stock</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {outOfStockItems.length > 0 ? (
                <div className="space-y-2">
                  {outOfStockItems.slice(0, 5).map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-2 px-3 rounded-lg bg-danger-light/30 hover:bg-danger-light/50 transition-colors">
                      <div className="flex items-center gap-2">
                        <Package className="w-4 h-4 text-danger" />
                        <div>
                          <p className="text-sm font-medium text-text-primary">{item.name}</p>
                          <p className="text-xs text-text-muted">{item.category}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold text-danger">0</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-text-muted text-center py-6">All products in stock ✓</p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </motion.div>
  )
}

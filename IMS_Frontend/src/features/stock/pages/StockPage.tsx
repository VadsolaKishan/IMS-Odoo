import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '@/lib/api/client'
import { queryKeys } from '@/lib/query/keys'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/StateDisplay'
import { Search, Boxes, Filter } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PaginatedResponse, StockRecord } from '@/types'

export default function StockPage() {
  const [search, setSearch] = useState('')
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.stock.list({ search }),
    queryFn: () => api.get<PaginatedResponse<StockRecord>>('/warehouses/stock/', { params: { search: search || undefined } }).then((r) => r.data),
  })

  if (isLoading) return <LoadingState />
  if (error) return <ErrorState onRetry={() => refetch()} />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-text-primary">Stock</h1>
        <p className="text-sm text-text-secondary">Current inventory levels across all locations</p>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
          <Input placeholder="Search by product, SKU, or location..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" />
        </div>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-surface text-text-secondary hover:bg-surface-tertiary border border-border">
          <Filter className="w-3.5 h-3.5" /> Filters
        </button>
      </div>
      {data?.results && data.results.length > 0 ? (
        <>
          <Card className="hidden md:block overflow-hidden">
            <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border bg-surface-secondary/50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Product</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">SKU</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Warehouse</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Location</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase">On Hand</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Reserved</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Available</th>
            </tr></thead><tbody className="divide-y divide-border">
              {data.results.map((item, i) => (
                <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-surface-tertiary/50">
                  {(() => {
                    const reservedQuantity = item.reserved_quantity ?? 0
                    const availableQuantity = item.available_quantity ?? item.quantity - reservedQuantity
                    const locationName = item.location_name || item.location_code || '—'
                    return (
                      <>
                  <td className="px-4 py-3 text-sm font-medium text-text-primary">{item.product_name}</td>
                  <td className="px-4 py-3 text-sm text-text-muted font-mono">{item.product_sku}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{item.warehouse_name}</td>
                  <td className="px-4 py-3 text-sm text-text-secondary">{locationName}</td>
                  <td className="px-4 py-3 text-sm text-right font-semibold">{item.quantity}</td>
                  <td className="px-4 py-3 text-sm text-right text-text-muted">{reservedQuantity}</td>
                  <td className={cn("px-4 py-3 text-sm text-right font-semibold", availableQuantity <= 0 ? 'text-danger' : availableQuantity < 10 ? 'text-warning' : 'text-success')}>{availableQuantity}</td>
                      </>
                    )
                  })()}
                </motion.tr>
              ))}
            </tbody></table></div>
          </Card>
          <div className="md:hidden space-y-2">{data.results.map((item) => (
            <Card key={item.id} className="p-4">
              {(() => {
                const reservedQuantity = item.reserved_quantity ?? 0
                const availableQuantity = item.available_quantity ?? item.quantity - reservedQuantity
                const locationName = item.location_name || item.location_code || '—'
                return (
                  <>
                    <div className="flex items-start justify-between">
                      <div><p className="text-sm font-semibold text-text-primary">{item.product_name}</p><p className="text-xs text-text-muted font-mono">{item.product_sku}</p></div>
                      <span className={cn("text-lg font-bold", availableQuantity <= 0 ? 'text-danger' : availableQuantity < 10 ? 'text-warning' : 'text-success')}>{availableQuantity}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-text-muted">
                      <span>{item.warehouse_name}</span><span>•</span><span>{locationName}</span>
                      <span className="ml-auto">On hand: {item.quantity} | Reserved: {reservedQuantity}</span>
                    </div>
                  </>
                )
              })()}
            </Card>
          ))}</div>
        </>
      ) : <EmptyState icon={<Boxes className="w-12 h-12" />} title="No stock records" description="Stock will appear here once inventory operations are processed." />}
    </motion.div>
  )
}

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import api from '@/lib/api/client'
import { queryKeys } from '@/lib/query/keys'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StatusBadge } from '@/components/shared/StatusBadge'
import { LoadingState, ErrorState } from '@/components/shared/StateDisplay'
import { ArrowLeft, CheckCircle, Printer, XCircle, Plus, Trash2, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/lib/guards/AuthContext'
import type { Delivery } from '@/types'

export default function DeliveryDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = id === 'new'

  const { data: delivery, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.deliveries.detail(id!),
    queryFn: () => api.get<Delivery>(`/inventory/deliveries/${id}/`).then((r) => r.data),
    enabled: !isNew,
  })

  const validateMutation = useMutation({
    mutationFn: () => api.post(`/inventory/deliveries/${id}/validate/`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.deliveries.list() }); refetch() },
  })
  const cancelMutation = useMutation({
    mutationFn: () => api.post(`/inventory/deliveries/${id}/cancel/`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.deliveries.list() }); refetch() },
  })

  if (!isNew && isLoading) return <LoadingState />
  if (!isNew && error) return <ErrorState onRetry={() => refetch()} />

  const d = delivery
  const isEditable = isNew || d?.status === 'draft' || d?.status === 'confirmed'
  const steps = ['Draft', 'Confirmed', 'Validated']
  const stepsMap: Record<string, number> = { draft: 0, confirmed: 1, validated: 2, waiting: 1, ready: 1, done: 2, cancelled: -1 }
  const current = stepsMap[d?.status || 'draft'] ?? 0

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/operations/deliveries')} className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors"><ArrowLeft className="w-5 h-5" /></button>
          <div>
            <h1 className="text-xl font-bold text-text-primary">{isNew ? 'New Delivery' : d?.reference}</h1>
            <div className="flex items-center gap-1 text-xs mt-1">
              {steps.map((s, i) => (
                <div key={s} className="flex items-center gap-1">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${i <= current && d?.status !== 'cancelled' ? 'bg-secondary text-white' : 'bg-surface-tertiary text-text-muted'}`}>{s}</span>
                  {i < steps.length - 1 && <span className="text-text-muted">→</span>}
                </div>
              ))}
            </div>
          </div>
          {d && <StatusBadge status={d.status} />}
        </div>
        {!isNew && d && (
          <div className="flex items-center gap-2">
            {(d.status === 'draft' || d.status === 'confirmed') && user?.role !== 'warehouse_staff' && <Button onClick={() => validateMutation.mutate()} disabled={validateMutation.isPending} className="gap-1.5"><CheckCircle className="w-4 h-4" /> Validate</Button>}
            {d.status === 'validated' && <Button variant="outline" className="gap-1.5"><Printer className="w-4 h-4" /> Print</Button>}
            {(d.status === 'draft' || d.status === 'confirmed') && user?.role !== 'warehouse_staff' && <Button variant="destructive" onClick={() => cancelMutation.mutate()} className="gap-1.5"><XCircle className="w-4 h-4" /> Cancel</Button>}
          </div>
        )}
      </div>
      <Card>
        <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Delivery Address</Label><Input defaultValue={d?.customer_name || ''} placeholder="Enter address..." disabled={!isEditable} /></div>
          <div className="space-y-2"><Label>Source Location</Label><Input defaultValue={d?.source_location_name || ''} placeholder="Select location..." disabled={!isEditable} /></div>
          <div className="space-y-2"><Label>Schedule Date</Label><Input type="date" defaultValue={d?.scheduled_date?.split('T')[0] || ''} disabled={!isEditable} /></div>
          <div className="space-y-2"><Label>Responsible</Label><Input defaultValue={d?.created_by_name || ''} disabled className="opacity-60" /></div>
          <div className="sm:col-span-2 space-y-2"><Label>Notes</Label>
            <textarea className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[80px] resize-y disabled:opacity-50" defaultValue={d?.notes || ''} disabled={!isEditable} />
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Products</CardTitle>
            {isEditable && <Button size="sm" variant="outline" className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Add Product</Button>}
          </div>
        </CardHeader>
        <CardContent>
          {d?.status === 'confirmed' && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-warning-light text-amber-700 text-sm mb-4">
              <AlertTriangle className="w-4 h-4 shrink-0" /> Waiting for out-of-stock products to become available.
            </div>
          )}
          {d?.lines && d.lines.length > 0 ? (
            <table className="w-full">
              <thead><tr className="border-b border-border"><th className="text-left py-2 px-3 text-xs font-semibold text-text-secondary">Product</th><th className="text-right py-2 px-3 text-xs font-semibold text-text-secondary">Quantity</th>{isEditable && <th className="w-10"></th>}</tr></thead>
              <tbody className="divide-y divide-border">
                {d.lines.map((line) => (
                  <tr key={line.id} className="hover:bg-surface-tertiary/50"><td className="py-2.5 px-3 text-sm font-medium">{line.product_name}</td><td className="py-2.5 px-3 text-sm text-right font-semibold">{line.quantity}</td>
                    {isEditable && <td className="py-2.5 px-1"><button className="p-1 rounded hover:bg-danger-light text-text-muted hover:text-danger"><Trash2 className="w-3.5 h-3.5" /></button></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          ) : <p className="text-sm text-text-muted text-center py-8">No products added yet</p>}
        </CardContent>
      </Card>
    </motion.div>
  )
}

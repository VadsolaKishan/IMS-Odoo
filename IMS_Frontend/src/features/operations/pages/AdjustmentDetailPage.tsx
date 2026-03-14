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
import { ArrowLeft, CheckCircle, XCircle, Plus, Trash2 } from 'lucide-react'
import type { Adjustment } from '@/types'

export default function AdjustmentDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = id === 'new'
  const { data: adjustment, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.adjustments.detail(id!),
    queryFn: () => api.get<Adjustment>(`/inventory/adjustments/${id}/`).then((r) => r.data),
    enabled: !isNew,
  })
  const validateMutation = useMutation({ mutationFn: () => api.post(`/inventory/adjustments/${id}/validate/`), onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.adjustments.list() }); refetch() } })
  const cancelMutation = useMutation({ mutationFn: () => api.post(`/inventory/adjustments/${id}/cancel/`), onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.adjustments.list() }); refetch() } })

  if (!isNew && isLoading) return <LoadingState />
  if (!isNew && error) return <ErrorState onRetry={() => refetch()} />
  const a = adjustment
  const isEditable = isNew || a?.status === 'draft' || a?.status === 'confirmed'

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/operations/adjustments')} className="p-2 rounded-lg hover:bg-surface-tertiary"><ArrowLeft className="w-5 h-5" /></button>
          <h1 className="text-xl font-bold">{isNew ? 'New Adjustment' : a?.reference}</h1>
          {a && <StatusBadge status={a.status} />}
        </div>
        {!isNew && a && (a.status === 'draft' || a.status === 'confirmed') && (
          <div className="flex items-center gap-2">
            <Button onClick={() => validateMutation.mutate()} className="gap-1.5"><CheckCircle className="w-4 h-4" /> Validate</Button>
            <Button variant="destructive" onClick={() => cancelMutation.mutate()} className="gap-1.5"><XCircle className="w-4 h-4" /> Cancel</Button>
          </div>
        )}
      </div>
      <Card><CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2"><Label>Location</Label><Input defaultValue={a?.location_name || ''} placeholder="Select location..." disabled={!isEditable} /></div>
          <div className="space-y-2"><Label>Reason</Label><Input defaultValue={a?.reason || ''} placeholder="Reason for adjustment" disabled={!isEditable} /></div>
          <div className="sm:col-span-2 space-y-2"><Label>Notes</Label>
            <textarea className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary min-h-[80px] resize-y disabled:opacity-50" defaultValue={a?.notes || ''} disabled={!isEditable} />
          </div>
        </CardContent>
      </Card>
      <Card><CardHeader><div className="flex items-center justify-between"><CardTitle className="text-base">Product Lines</CardTitle>{isEditable && <Button size="sm" variant="outline" className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Add</Button>}</div></CardHeader>
        <CardContent>
          {a?.lines && a.lines.length > 0 ? (
            <div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border">
              <th className="text-left py-2 px-3 text-xs font-semibold text-text-secondary">Product</th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-text-secondary">Counted Qty</th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-text-secondary">System Qty</th>
              <th className="text-right py-2 px-3 text-xs font-semibold text-text-secondary">Difference</th>
              {isEditable && <th className="w-10"></th>}
            </tr></thead>
              <tbody className="divide-y divide-border">{a.lines.map((line) => {
                const diff = (line.counted_quantity || 0) - (line.system_quantity || 0)
                return (
                  <tr key={line.id} className="hover:bg-surface-tertiary/50">
                    <td className="py-2.5 px-3 text-sm font-medium">{line.product_name}</td>
                    <td className="py-2.5 px-3 text-sm text-right">{isEditable ? <Input type="number" defaultValue={line.counted_quantity || 0} className="w-20 h-8 text-right ml-auto" /> : <span className="font-semibold">{line.counted_quantity}</span>}</td>
                    <td className="py-2.5 px-3 text-sm text-right text-text-muted">{line.system_quantity}</td>
                    <td className={`py-2.5 px-3 text-sm text-right font-semibold ${diff > 0 ? 'text-success' : diff < 0 ? 'text-danger' : 'text-text-muted'}`}>{diff > 0 ? '+' : ''}{diff}</td>
                    {isEditable && <td className="py-2.5 px-1"><button className="p-1 rounded hover:bg-danger-light text-text-muted hover:text-danger"><Trash2 className="w-3.5 h-3.5" /></button></td>}
                  </tr>
                )
              })}</tbody>
            </table></div>
          ) : <p className="text-sm text-text-muted text-center py-8">No product lines added yet</p>}
        </CardContent>
      </Card>
    </motion.div>
  )
}

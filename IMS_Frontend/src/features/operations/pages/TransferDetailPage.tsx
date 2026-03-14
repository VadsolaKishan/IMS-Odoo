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
import { ArrowLeft, CheckCircle, XCircle, Plus, Trash2, ArrowDown, AlertCircle } from 'lucide-react'
import { useAuth } from '@/lib/guards/AuthContext'
import type { Transfer } from '@/types'

export default function TransferDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const isNew = id === 'new'
  const { data: transfer, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.transfers.detail(id!),
    queryFn: () => api.get<Transfer>(`/inventory/transfers/${id}/`).then((r) => r.data),
    enabled: !isNew,
  })
  const validateMutation = useMutation({ mutationFn: () => api.post(`/inventory/transfers/${id}/validate/`), onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.transfers.list() }); refetch() } })
  const cancelMutation = useMutation({ mutationFn: () => api.post(`/inventory/transfers/${id}/cancel/`), onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.transfers.list() }); refetch() } })

  if (!isNew && isLoading) return <LoadingState />
  if (!isNew && error) return <ErrorState onRetry={() => refetch()} />
  const t = transfer
  const isEditable = isNew || t?.status === 'draft' || t?.status === 'confirmed'

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-4xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/operations/transfers')} className="p-2 rounded-lg hover:bg-surface-tertiary"><ArrowLeft className="w-5 h-5" /></button>
          <div><h1 className="text-xl font-bold">{isNew ? 'New Transfer' : t?.reference}</h1></div>
          {t && <StatusBadge status={t.status} />}
        </div>
        {!isNew && t && (t.status === 'draft' || t.status === 'confirmed') && user?.role !== 'warehouse_staff' && (
          <div className="flex items-center gap-2">
            <Button onClick={() => validateMutation.mutate()} className="gap-1.5"><CheckCircle className="w-4 h-4" /> Validate</Button>
            <Button variant="destructive" onClick={() => cancelMutation.mutate()} className="gap-1.5"><XCircle className="w-4 h-4" /> Cancel</Button>
          </div>
        )}
      </div>
      <Card><CardHeader><CardTitle className="text-base">Transfer Details</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Source Location</Label><Input defaultValue={t?.source_location_name || ''} placeholder="Select source..." disabled={!isEditable} /></div>
            <div className="space-y-2"><Label>Destination Location</Label><Input defaultValue={t?.destination_location_name || ''} placeholder="Select destination..." disabled={!isEditable} /></div>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-primary-50 text-primary text-xs font-medium">
            <AlertCircle className="w-3.5 h-3.5" /> Source and Destination cannot be the same location
          </div>
          <div className="flex items-center justify-center text-text-muted"><ArrowDown className="w-5 h-5" /></div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Schedule Date</Label><Input type="date" defaultValue={t?.scheduled_date?.split('T')[0] || ''} disabled={!isEditable} /></div>
            <div className="space-y-2"><Label>Responsible</Label><Input defaultValue={t?.created_by_name || ''} disabled className="opacity-60" /></div>
          </div>
        </CardContent>
      </Card>
      <Card><CardHeader><div className="flex items-center justify-between"><CardTitle className="text-base">Products</CardTitle>{isEditable && <Button size="sm" variant="outline" className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Add</Button>}</div></CardHeader>
        <CardContent>
          {t?.lines && t.lines.length > 0 ? (
            <table className="w-full"><thead><tr className="border-b border-border"><th className="text-left py-2 px-3 text-xs font-semibold text-text-secondary">Product</th><th className="text-right py-2 px-3 text-xs font-semibold text-text-secondary">Quantity</th>{isEditable && <th className="w-10"></th>}</tr></thead>
              <tbody className="divide-y divide-border">{t.lines.map((line) => (<tr key={line.id} className="hover:bg-surface-tertiary/50"><td className="py-2.5 px-3 text-sm font-medium">{line.product_name}</td><td className="py-2.5 px-3 text-sm text-right font-semibold">{line.quantity}</td>{isEditable && <td className="py-2.5 px-1"><button className="p-1 rounded hover:bg-danger-light text-text-muted hover:text-danger"><Trash2 className="w-3.5 h-3.5" /></button></td>}</tr>))}</tbody>
            </table>
          ) : <p className="text-sm text-text-muted text-center py-8">No products added yet</p>}
        </CardContent>
      </Card>
    </motion.div>
  )
}

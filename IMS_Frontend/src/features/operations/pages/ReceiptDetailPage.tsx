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
import { ArrowLeft, CheckCircle, Printer, XCircle, Plus, Trash2, ImageIcon } from 'lucide-react'
import { useAuth } from '@/lib/guards/AuthContext'
import { DocumentImageUpload } from '@/components/shared/DocumentImageUpload'
import type { Receipt } from '@/types'

const stepsMap = { draft: 0, confirmed: 1, validated: 2, cancelled: -1, ready: 1, done: 2, waiting: 0 }

function StatusFlow({ status }: { status: string }) {
  const steps = ['Draft', 'Confirmed', 'Validated']
  const current = stepsMap[status as keyof typeof stepsMap] ?? 0
  return (
    <div className="flex items-center gap-1 text-xs">
      {steps.map((s, i) => (
        <div key={s} className="flex items-center gap-1">
          <span className={`px-2 py-0.5 rounded-full font-medium ${i <= current && status !== 'cancelled' ? 'bg-primary text-white' : 'bg-surface-tertiary text-text-muted'}`}>
            {s}
          </span>
          {i < steps.length - 1 && <span className="text-text-muted">→</span>}
        </div>
      ))}
    </div>
  )
}

export default function ReceiptDetailPage() {
  const { id } = useParams()
  const { user } = useAuth()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const isNew = id === 'new'

  const { data: receipt, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.receipts.detail(id!),
    queryFn: () => api.get<Receipt>(`/inventory/receipts/${id}/`).then((r) => r.data),
    enabled: !isNew,
  })

  const validateMutation = useMutation({
    mutationFn: () => api.post(`/inventory/receipts/${id}/validate/`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.receipts.list() }); refetch() },
  })

  const cancelMutation = useMutation({
    mutationFn: () => api.post(`/inventory/receipts/${id}/cancel/`),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: queryKeys.receipts.list() }); refetch() },
  })
  
  const uploadImageMutation = useMutation({
    mutationFn: (file: File) => {
      const formData = new FormData()
      formData.append('image', file)
      return api.patch(`/inventory/receipts/${id}/`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })
    },
    onSuccess: () => { refetch() },
  })

  if (!isNew && isLoading) return <LoadingState />
  if (!isNew && error) return <ErrorState onRetry={() => refetch()} />

  const r = receipt
  const isEditable = isNew || r?.status === 'draft' || r?.status === 'confirmed'

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/operations/receipts')} className="p-2 rounded-lg hover:bg-surface-tertiary transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-text-primary">{isNew ? 'New Receipt' : r?.reference}</h1>
            {r && <StatusFlow status={r.status} />}
          </div>
          {r && <StatusBadge status={r.status} />}
        </div>
        {!isNew && r && (
          <div className="flex items-center gap-2">
            {(r.status === 'draft' || r.status === 'confirmed') && user?.role !== 'warehouse_staff' && (
              <Button onClick={() => validateMutation.mutate()} disabled={validateMutation.isPending} className="gap-1.5">
                <CheckCircle className="w-4 h-4" /> {r.status === 'draft' ? 'Confirm / Validate' : 'Validate'}
              </Button>
            )}
            {r.status === 'validated' && (
              <Button variant="outline" className="gap-1.5"><Printer className="w-4 h-4" /> Print</Button>
            )}
            {(r.status === 'draft' || r.status === 'confirmed') && user?.role !== 'warehouse_staff' && (
              <Button variant="destructive" onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending} className="gap-1.5">
                <XCircle className="w-4 h-4" /> Cancel
              </Button>
            )}
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Metadata Form */}
        <div className="lg:col-span-2 space-y-4">
          <Card>
            <CardHeader><CardTitle className="text-base">Details</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Receive From (Supplier)</Label>
            <Input defaultValue={r?.supplier_name || ''} placeholder="Select supplier..." disabled={!isEditable} />
          </div>
          <div className="space-y-2">
            <Label>Destination Location</Label>
            <Input defaultValue={r?.destination_location_name || ''} placeholder="Select location..." disabled={!isEditable} />
          </div>
          <div className="space-y-2">
            <Label>Schedule Date</Label>
            <Input type="date" defaultValue={r?.scheduled_date?.split('T')[0] || ''} disabled={!isEditable} />
          </div>
          <div className="space-y-2">
            <Label>Responsible</Label>
            <Input defaultValue={r?.created_by_name || ''} disabled className="opacity-60" />
          </div>
          <div className="sm:col-span-2 space-y-2">
            <Label>Notes</Label>
            <textarea className="flex w-full rounded-lg border border-border bg-surface px-3 py-2 text-sm ring-offset-surface placeholder:text-text-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50 min-h-[80px] resize-y"
              defaultValue={r?.notes || ''} placeholder="Add notes..." disabled={!isEditable}
            />
          </div>
        </CardContent>
      </Card>
    </div>

    {/* Document Attachment */}
    <div className="lg:col-span-1">
      <Card className="h-full">
        <CardHeader><CardTitle className="text-base">Receipt Photo / Document</CardTitle></CardHeader>
        <CardContent>
          <DocumentImageUpload
            currentImage={r?.image}
            onUpload={(file) => uploadImageMutation.mutate(file)}
            disabled={!isEditable || uploadImageMutation.isPending}
            label="Upload receipt or incoming goods photo"
          />
          {r?.image && (
             <p className="text-[10px] text-text-muted mt-2 text-center break-all">
               Stored as: {r.image.split('/').pop()}
             </p>
          )}
        </CardContent>
      </Card>
    </div>
  </div>

      {/* Product Lines */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Products</CardTitle>
            {isEditable && <Button size="sm" variant="outline" className="gap-1.5"><Plus className="w-3.5 h-3.5" /> Add Product</Button>}
          </div>
        </CardHeader>
        <CardContent>
          {r?.lines && r.lines.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border">
                    <th className="w-12 py-2 px-3"></th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-text-secondary">Product</th>
                    <th className="text-left py-2 px-3 text-xs font-semibold text-text-secondary">SKU</th>
                    <th className="text-right py-2 px-3 text-xs font-semibold text-text-secondary">Quantity</th>
                    {isEditable && <th className="w-10"></th>}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {r.lines.map((line) => (
                    <tr key={line.id} className="hover:bg-surface-tertiary/50">
                      <td className="py-2.5 px-3">
                        {line.product_image ? (
                          <img src={line.product_image} alt="" className="w-8 h-8 rounded-md object-cover bg-surface-tertiary" />
                        ) : (
                          <div className="w-8 h-8 rounded-md bg-surface-tertiary flex items-center justify-center text-text-muted">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                        )}
                      </td>
                      <td className="py-2.5 px-3 text-sm font-medium">{line.product_name}</td>
                      <td className="py-2.5 px-3 text-sm text-text-secondary">{line.product_sku}</td>
                      <td className="py-2.5 px-3 text-sm text-right font-semibold">{line.quantity}</td>
                      {isEditable && (
                        <td className="py-2.5 px-1">
                          <button className="p-1 rounded hover:bg-danger-light text-text-muted hover:text-danger transition-colors">
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-text-muted text-center py-8">No products added yet</p>
          )}
        </CardContent>
      </Card>

      {/* Mobile sticky action bar */}
      {!isNew && r && isEditable && user?.role !== 'warehouse_staff' && (
        <div className="fixed bottom-14 left-0 right-0 bg-white/90 backdrop-blur-lg border-t border-border/50 p-3 flex gap-2 lg:hidden z-20">
          <Button onClick={() => validateMutation.mutate()} className="flex-1 gap-1.5">
            <CheckCircle className="w-4 h-4" /> {r.status === 'draft' ? 'Confirm / Validate' : 'Validate'}
          </Button>
          <Button variant="destructive" onClick={() => cancelMutation.mutate()} className="gap-1.5">
            <XCircle className="w-4 h-4" /> Cancel
          </Button>
        </div>
      )}
    </motion.div>
  )
}

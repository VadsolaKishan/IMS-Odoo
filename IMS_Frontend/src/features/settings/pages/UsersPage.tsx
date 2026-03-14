import { useState } from 'react'
import { useMutation } from '@tanstack/react-query'
import { Modal } from '@/components/ui/modal'
import { Label } from '@/components/ui/label'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import api from '@/lib/api/client'
import { queryKeys } from '@/lib/query/keys'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { LoadingState, ErrorState, EmptyState } from '@/components/shared/StateDisplay'
import { Plus, Search, Users as UsersIcon, Shield, Pencil } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { PaginatedResponse, User } from '@/types'


const roleColors: Record<string, string> = {
  admin: 'bg-accent/10 text-accent border-accent/20',
  inventory_manager: 'bg-primary-light text-primary-700 border-primary/20',
  warehouse_staff: 'bg-surface-tertiary text-text-secondary border-border',
}

const roleLabels: Record<string, string> = {
  admin: 'Admin',
  inventory_manager: 'Inventory Manager',
  warehouse_staff: 'Warehouse Staff',
}

export default function UsersPage() {
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [form, setForm] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    role: 'warehouse_staff',
    password: '',
    password_confirm: '',
  })
  const [formError, setFormError] = useState<string | null>(null)
  const mutation = useMutation({
    mutationFn: (payload: any) => api.post('/auth/users/create/', payload),
    onSuccess: () => {
      setModalOpen(false)
      setForm({ first_name: '', last_name: '', email: '', phone: '', role: 'warehouse_staff', password: '', password_confirm: '' })
      setFormError(null)
      refetch()
    },
    onError: (err: any) => {
      const data = err?.response?.data;
      if (typeof data === 'object' && data !== null) {
        // If it's a general detailed error
        if (data.detail) {
          setFormError(data.detail);
          return;
        }
        // If it's field validation errors, extract the first one
        const firstErrorKey = Object.keys(data)[0];
        if (firstErrorKey && Array.isArray(data[firstErrorKey])) {
          setFormError(`${firstErrorKey}: ${data[firstErrorKey][0]}`);
          return;
        } else if (firstErrorKey && typeof data[firstErrorKey] === 'string') {
          setFormError(`${firstErrorKey}: ${data[firstErrorKey]}`);
          return;
        }
      }
      setFormError('Failed to add user');
    }
  })
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: queryKeys.settings.users({ search }),
    queryFn: () => api.get<PaginatedResponse<User>>('/auth/users/', { params: { search: search || undefined } }).then((r) => r.data),
  })
  if (isLoading) return <LoadingState />
  // Show a clear forbidden message if 403 error
  if (error && (error as any).response && (error as any).response.status === 403) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Shield className="w-12 h-12 text-danger mb-4" />
        <h2 className="text-xl font-bold mb-2 text-danger">Access Denied</h2>
        <p className="text-text-secondary mb-4">You do not have permission to view users. Only admins can access this page.</p>
        <Button onClick={() => refetch()}>Retry</Button>
      </div>
    )
  }
  if (error) return <ErrorState onRetry={() => refetch()} />

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div><h1 className="text-2xl font-bold">Users</h1><p className="text-sm text-text-secondary">Manage system users & roles</p></div>
        <Button className="gap-2" onClick={() => setModalOpen(true)}><Plus className="w-4 h-4" /> Add User</Button>
        <Modal open={modalOpen} onClose={() => setModalOpen(false)}>
          <div className="mb-6">
            <h2 className="text-xl font-bold">Add New User</h2>
            <p className="text-sm text-text-secondary mt-1">Fill out the details below to create a new user account.</p>
          </div>
          <form className="space-y-5" onSubmit={e => {
            e.preventDefault()
            setFormError(null)
            const payload = {
              ...form,
              username: form.email.split('@')[0]
            }
            mutation.mutate(payload)
          }}>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>First Name</Label>
                <Input value={form.first_name} onChange={e => setForm(f => ({ ...f, first_name: e.target.value }))} required placeholder="John" />
              </div>
              <div className="space-y-2">
                <Label>Last Name</Label>
                <Input value={form.last_name} onChange={e => setForm(f => ({ ...f, last_name: e.target.value }))} required placeholder="Doe" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Email Address</Label>
              <Input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} required placeholder="john@example.com" />
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))} placeholder="+1 234 567 890" />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <select className="w-full h-11 rounded-xl bg-surface border border-border px-3 text-text focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-colors" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="warehouse_staff">Warehouse Staff</option>
                  <option value="inventory_manager">Inventory Manager</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Password</Label>
                <Input type="password" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} required placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label>Confirm Password</Label>
                <Input type="password" value={form.password_confirm} onChange={e => setForm(f => ({ ...f, password_confirm: e.target.value }))} required placeholder="••••••••" />
              </div>
            </div>

            {formError && (
              <div className="p-3 rounded-lg bg-danger/10 border border-danger/20 text-danger text-sm">
                {formError}
              </div>
            )}
            
            <div className="pt-2 flex justify-end gap-3">
              <Button type="button" variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? 'Adding User...' : 'Add User'}</Button>
            </div>
          </form>
        </Modal>
      </div>
      <div className="relative max-w-sm"><Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" /><Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9 h-9" /></div>
      {data?.results && data.results.length > 0 ? (
        <Card className="overflow-hidden"><div className="overflow-x-auto"><table className="w-full"><thead><tr className="border-b border-border bg-surface-secondary/50">
          <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Name</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Email</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Role</th>
          <th className="text-left px-4 py-3 text-xs font-semibold text-text-secondary uppercase">Status</th>
          <th className="w-10"></th>
        </tr></thead><tbody className="divide-y divide-border">{data.results.map((user, i) => (
          <motion.tr key={user.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} className="hover:bg-surface-tertiary/50 group">
            <td className="px-4 py-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold">{user.first_name[0]}{user.last_name[0]}</div>
                <span className="text-sm font-medium">{user.first_name} {user.last_name}</span>
              </div>
            </td>
            <td className="px-4 py-3 text-sm text-text-secondary">{user.email}</td>
            <td className="px-4 py-3"><span className={cn('inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-xs font-semibold', roleColors[user.role] || roleColors.warehouse_staff)}><Shield className="w-3 h-3" />{roleLabels[user.role] || user.role}</span></td>
            <td className="px-4 py-3"><span className={cn('inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium', user.is_active ? 'bg-success-light text-emerald-700' : 'bg-danger-light text-danger')}><span className={cn('w-1.5 h-1.5 rounded-full', user.is_active ? 'bg-success' : 'bg-danger')} />{user.is_active ? 'Active' : 'Disabled'}</span></td>
            <td className="px-4 py-2"><button className="p-1.5 rounded-lg hover:bg-surface-tertiary opacity-0 group-hover:opacity-100 transition-all"><Pencil className="w-3.5 h-3.5 text-text-muted" /></button></td>
          </motion.tr>
        ))}</tbody></table></div></Card>
      ) : <EmptyState icon={<UsersIcon className="w-12 h-12" />} title="No users" description="Add users to your team." action={<Button size="sm">Add User</Button>} />}
    </motion.div>
  )
}

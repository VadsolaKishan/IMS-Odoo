import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '@/lib/guards/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { UserCircle, Lock, CheckCircle, AlertCircle } from 'lucide-react'
import api from '@/lib/api/client'

export default function ProfilePage() {
  const { user, refreshProfile } = useAuth()
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pwForm, setPwForm] = useState({ current: '', new: '', confirm: '' })
  const [pwMsg, setPwMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true); setMsg(null)
    const formData = new FormData(e.target as HTMLFormElement)
    try {
      await api.patch('/auth/profile/', { first_name: formData.get('first_name'), last_name: formData.get('last_name'), phone: formData.get('phone') })
      await refreshProfile()
      setMsg({ type: 'success', text: 'Profile updated successfully' })
    } catch { setMsg({ type: 'error', text: 'Failed to update profile' }) }
    finally { setSaving(false) }
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault(); setPwMsg(null)
    if (pwForm.new !== pwForm.confirm) { setPwMsg({ type: 'error', text: 'Passwords do not match' }); return }
    if (pwForm.new.length < 8) { setPwMsg({ type: 'error', text: 'Password must be at least 8 characters' }); return }
    try {
      await api.post('/auth/change-password/', { old_password: pwForm.current, new_password: pwForm.new })
      setPwMsg({ type: 'success', text: 'Password changed successfully' })
      setPwForm({ current: '', new: '', confirm: '' })
    } catch { setPwMsg({ type: 'error', text: 'Failed. Check your current password.' }) }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-6">
      <div><h1 className="text-2xl font-bold text-text-primary">Profile</h1><p className="text-sm text-text-secondary">Manage your account settings</p></div>
      <Card>
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl gradient-primary flex items-center justify-center text-white text-xl font-bold shadow-lg">
              {user?.first_name?.[0]?.toUpperCase()}{user?.last_name?.[0]?.toUpperCase()}
            </div>
            <div><CardTitle className="text-lg">{user?.first_name} {user?.last_name}</CardTitle><p className="text-sm text-text-muted capitalize">{user?.role?.replace('_', ' ')}</p></div>
          </div>
        </CardHeader>
        <CardContent>
          {msg && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm mb-4 ${msg.type === 'success' ? 'bg-success-light text-emerald-700' : 'bg-danger-light text-danger'}`}>
              {msg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} {msg.text}
            </div>
          )}
          <form onSubmit={handleSaveProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="profile-fname">First Name</Label><Input id="profile-fname" name="first_name" defaultValue={user?.first_name} className="h-11" /></div>
              <div className="space-y-2"><Label htmlFor="profile-lname">Last Name</Label><Input id="profile-lname" name="last_name" defaultValue={user?.last_name} className="h-11" /></div>
            </div>
            <div className="space-y-2"><Label>Email</Label><Input value={user?.email} disabled className="h-11 opacity-60" /></div>
            <div className="space-y-2"><Label htmlFor="profile-phone">Phone</Label><Input id="profile-phone" name="phone" defaultValue={user?.phone} className="h-11" /></div>
            <Button type="submit" disabled={saving} className="gap-1.5">
              {saving ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <UserCircle className="w-4 h-4" />}
              {saving ? 'Saving...' : 'Save Changes'}
            </Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader><div className="flex items-center gap-2"><Lock className="w-4 h-4 text-text-muted" /><CardTitle className="text-base">Change Password</CardTitle></div></CardHeader>
        <CardContent>
          {pwMsg && (
            <div className={`flex items-center gap-2 p-3 rounded-lg text-sm mb-4 ${pwMsg.type === 'success' ? 'bg-success-light text-emerald-700' : 'bg-danger-light text-danger'}`}>
              {pwMsg.type === 'success' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />} {pwMsg.text}
            </div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2"><Label htmlFor="pw-current">Current Password</Label><Input id="pw-current" type="password" value={pwForm.current} onChange={(e) => setPwForm({ ...pwForm, current: e.target.value })} required className="h-11" /></div>
            <div className="space-y-2"><Label htmlFor="pw-new">New Password</Label><Input id="pw-new" type="password" value={pwForm.new} onChange={(e) => setPwForm({ ...pwForm, new: e.target.value })} required className="h-11" /></div>
            <div className="space-y-2"><Label htmlFor="pw-confirm">Confirm New Password</Label><Input id="pw-confirm" type="password" value={pwForm.confirm} onChange={(e) => setPwForm({ ...pwForm, confirm: e.target.value })} required className="h-11" /></div>
            <Button type="submit" variant="outline" className="gap-1.5"><Lock className="w-4 h-4" /> Change Password</Button>
          </form>
        </CardContent>
      </Card>
    </motion.div>
  )
}

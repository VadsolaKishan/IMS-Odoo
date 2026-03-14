import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, Eye, EyeOff, AlertCircle } from 'lucide-react'
import api from '@/lib/api/client'

export default function SignUpPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ first_name: '', last_name: '', email: '', password: '', confirmPassword: '' })
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (form.password.length < 8) { setError('Password must be at least 8 characters'); return }
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      const username = form.email.split('@')[0] || form.email
      await api.post('/auth/register/', {
        first_name: form.first_name,
        last_name: form.last_name,
        email: form.email,
        username,
        role: 'warehouse_staff',
        password: form.password,
        password_confirm: form.confirmPassword,
      })
      navigate('/login', { replace: true })
    } catch (err: any) {
      const data = err.response?.data
      if (data && typeof data === 'object') {
        // Look for the first field with an error array
        const errorField = Object.keys(data).find(key => Array.isArray(data[key]) && data[key].length > 0)
        if (errorField) {
          setError(`${errorField.charAt(0).toUpperCase() + errorField.slice(1).replace('_', ' ')}: ${data[errorField][0]}`)
          return
        }
        if (data.detail) {
          setError(data.detail)
          return
        }
      }
      setError('Registration failed. Please check your inputs and try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-accent/5 rounded-full blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-[420px] relative">
        <Card className="border-0 shadow-modal bg-white/80 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <div className="w-16 h-16 gradient-primary rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-3">
              <Package className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
            <p className="text-sm text-text-secondary mt-1">Join CoreInventory</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-3 rounded-lg bg-danger-light text-danger text-sm">
                  <AlertCircle className="w-4 h-4 shrink-0" /> {error}
                </motion.div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="signup-fname">First Name</Label>
                  <Input id="signup-fname" value={form.first_name} onChange={handleChange('first_name')} required className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-lname">Last Name</Label>
                  <Input id="signup-lname" value={form.last_name} onChange={handleChange('last_name')} required className="h-11" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-email">Email</Label>
                <Input id="signup-email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange('email')} required className="h-11" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-password">Password</Label>
                <div className="relative">
                  <Input id="signup-password" type={showPassword ? 'text' : 'password'} placeholder="8+ chars, upper+lower+special" value={form.password} onChange={handleChange('password')} required className="h-11 pr-10" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary" tabIndex={-1}>
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="signup-confirm">Confirm Password</Label>
                <Input id="signup-confirm" type="password" value={form.confirmPassword} onChange={handleChange('confirmPassword')} required className="h-11" />
              </div>
              <Button type="submit" className="w-full h-11 text-base font-semibold" disabled={loading}>
                {loading ? <div className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> Creating...</div> : 'Sign Up'}
              </Button>
              <p className="text-center text-sm text-text-secondary">
                Already have an account? <Link to="/login" className="text-primary font-medium hover:underline">Sign In</Link>
              </p>
            </form>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

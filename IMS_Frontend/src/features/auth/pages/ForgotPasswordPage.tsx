import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, AlertCircle, CheckCircle2 } from 'lucide-react'
import api from '@/lib/api/client'

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<1 | 2>(1)
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await api.post('/auth/password-reset/request/', { email })
      setStep(2)
      setSuccess('OTP has been sent to your email')
    } catch {
      setError('Email not found. Please check and try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return }
    setLoading(true)
    try {
      await api.post('/auth/password-reset/verify/', { email, otp, new_password: newPassword })
      setSuccess('Password reset successful! You can now sign in.')
      setStep(1)
    } catch {
      setError('Invalid OTP or reset failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-4">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl" />
      </div>
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="w-full max-w-[420px] relative">
        <Card className="border-0 shadow-modal bg-white/80 backdrop-blur-xl">
          <CardHeader className="text-center pb-2">
            <div className="w-14 h-14 gradient-primary rounded-2xl flex items-center justify-center shadow-lg mx-auto mb-3">
              <Package className="w-7 h-7 text-white" />
            </div>
            <CardTitle className="text-xl font-bold">{step === 1 ? 'Forgot Password' : 'Reset Password'}</CardTitle>
            <p className="text-sm text-text-secondary mt-1">
              {step === 1 ? 'Enter your email to receive an OTP' : 'Enter the OTP code and your new password'}
            </p>
          </CardHeader>
          <CardContent>
            {error && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-3 rounded-lg bg-danger-light text-danger text-sm mb-4">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 p-3 rounded-lg bg-success-light text-emerald-700 text-sm mb-4">
                <CheckCircle2 className="w-4 h-4 shrink-0" /> {success}
              </motion.div>
            )}

            {step === 1 ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="forgot-email">Email</Label>
                  <Input id="forgot-email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} required className="h-11" />
                </div>
                <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
                  {loading ? 'Sending...' : 'Send OTP'}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input value={email} disabled className="h-11 opacity-60" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forgot-otp">OTP Code</Label>
                  <Input id="forgot-otp" placeholder="Enter 6-digit OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required className="h-11 text-center tracking-widest text-lg font-mono" maxLength={6} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forgot-new-pw">New Password</Label>
                  <Input id="forgot-new-pw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="h-11" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="forgot-confirm-pw">Confirm Password</Label>
                  <Input id="forgot-confirm-pw" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required className="h-11" />
                </div>
                <Button type="submit" className="w-full h-11 font-semibold" disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            )}

            <p className="text-center text-sm text-text-secondary mt-4">
              <Link to="/login" className="text-primary font-medium hover:underline">Back to Sign In</Link>
            </p>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}

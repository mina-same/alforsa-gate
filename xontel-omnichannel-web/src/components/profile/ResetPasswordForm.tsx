import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowRight, Loader2, Eye, EyeOff, ChevronRight, ChevronLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useSelfResetPassword } from '@/api/users/hooks'
import { useLogout } from '@/api/auth/hooks'
import { toast } from 'sonner'

function extractBackendError(error: any): string | null {
  const detail = error?.response?.data?.detail
  if (!detail) return null
  if (typeof detail === 'string') return detail
  if (Array.isArray(detail)) {
    const msg = detail[0]?.msg || detail[0]?.message
    return msg || null
  }
  return null
}

export default function ResetPasswordForm() {
  const { t, i18n } = useTranslation(['chat', 'common'])
  const navigate = useNavigate()
  const isRTL = i18n.dir() === 'rtl'

  const { mutate: resetPassword, isPending: isResetting } = useSelfResetPassword()
  const { mutate: logout } = useLogout()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const handleReset = () => {
    if (!currentPassword) { toast.error(t('profile.current_password_required', { defaultValue: 'Current password is required' })); return }
    if (!newPassword) { toast.error(t('profile.password_required', { defaultValue: 'New password is required' })); return }
    if (newPassword.length < 8) { toast.error(t('profile.password_too_short', { defaultValue: 'Password must be at least 8 characters long' })); return }
    if (newPassword !== confirmPassword) { toast.error(t('profile.passwords_do_not_match', { defaultValue: 'Passwords do not match' })); return }

    resetPassword({ currentPassword, newPassword }, {
      onSuccess: () => {
        toast.success(t('profile.password_reset_success', { defaultValue: 'Password updated successfully' }))
        setTimeout(() => logout(), 1500)
      },
      onError: (error: any) => {
        const backendMsg = extractBackendError(error)
        toast.error(backendMsg || error.message || t('profile.password_reset_error', { defaultValue: 'Failed to reset password' }))
      },
    })
  }

  const EyeToggle = ({ show, onToggle }: { show: boolean; onToggle: () => void }) => (
    <button
      type="button"
      onClick={onToggle}
      className="absolute inset-y-0 end-3 flex items-center text-xon-text-secondary hover:text-xon-text-primary transition-colors"
      tabIndex={-1}
    >
      {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
    </button>
  )

  return (
    <div className="h-full flex flex-col bg-xon-surface overflow-hidden">
      {/* Header */}
      <header className="sticky top-0 z-10 py-[18px] shadow-sm bg-xon-surface-container flex items-center px-4 gap-3 flex-shrink-0">
        <button
          type="button"
          onClick={() => navigate('/profile/account')}
          className="p-1 rounded-lg hover:bg-xon-surface-container-hover transition-colors text-xon-text-primary"
        >
          {isRTL ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
        </button>
        <h2 className="text-base font-semibold text-xon-text-primary">
          {t('profile.reset_password', { defaultValue: 'Reset Password' })}
        </h2>
      </header>

      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto xon-scrollbar-hidden">
        <div className="mx-auto p-2 space-y-6">

          <section>
            <label className="text-[11px] font-bold text-xon-text-secondary uppercase tracking-widest px-1">
              {t('profile.reset_password', { defaultValue: 'Reset Password' })}
            </label>
            <div className="mt-2 bg-xon-surface-container rounded-2xl border border-xon-surface-outline overflow-hidden p-4 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reset_current_password" className="text-xon-text-primary">
                  {t('profile.current_password', { defaultValue: 'Current Password' })}
                </Label>
                <div className="relative">
                  <Input
                    id="reset_current_password"
                    type={showCurrent ? 'text' : 'password'}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    className="bg-xon-surface-container-hover border border-xon-surface-outline text-xon-text-primary focus-visible:ring-xon-primary pe-10"
                    disabled={isResetting}
                  />
                  <EyeToggle show={showCurrent} onToggle={() => setShowCurrent(v => !v)} />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset_new_password" className="text-xon-text-primary">
                  {t('profile.new_password', { defaultValue: 'New Password' })}
                </Label>
                <div className="relative">
                  <Input
                    id="reset_new_password"
                    type={showNew ? 'text' : 'password'}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="bg-xon-surface-container-hover border border-xon-surface-outline text-xon-text-primary focus-visible:ring-xon-primary pe-10"
                    disabled={isResetting}
                  />
                  <EyeToggle show={showNew} onToggle={() => setShowNew(v => !v)} />
                </div>
                <p className="text-[11px] text-xon-text-secondary">
                  {t('profile.password.placeholder', { defaultValue: 'At least 8 characters' })}
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="reset_confirm_password" className="text-xon-text-primary">
                  {t('profile.confirm_password', { defaultValue: 'Confirm New Password' })}
                </Label>
                <div className="relative">
                  <Input
                    id="reset_confirm_password"
                    type={showConfirm ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="bg-xon-surface-container-hover border border-xon-surface-outline text-xon-text-primary focus-visible:ring-xon-primary pe-10"
                    disabled={isResetting}
                  />
                  <EyeToggle show={showConfirm} onToggle={() => setShowConfirm(v => !v)} />
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1 border-xon-surface-outline text-xon-text-primary hover:bg-xon-surface-container-hover"
                  onClick={() => navigate('/profile/account')}
                  disabled={isResetting}
                >
                  {t('profile.cancel', { defaultValue: 'Cancel' })}
                </Button>
                <Button
                  type="button"
                  className="flex-1 bg-xon-primary text-xon-primary-on hover:opacity-90"
                  onClick={handleReset}
                  disabled={isResetting}
                >
                  {isResetting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" />{t('common.processing', { defaultValue: 'Processing...' })}</>
                  ) : (
                    t('profile.reset', { defaultValue: 'Reset' })
                  )}
                </Button>
              </div>
            </div>
          </section>

          <div className="p-4 bg-xon-surface-container-hover rounded-2xl border border-xon-surface-outline">
            <p className="text-[11px] leading-relaxed text-xon-text-secondary text-center">
              {t('profile.reset_password_description', {
                defaultValue: 'Enter your new password. You will need to log in again after changing your password.',
              })}
            </p>
          </div>

        </div>
      </div>
    </div>
  )
}

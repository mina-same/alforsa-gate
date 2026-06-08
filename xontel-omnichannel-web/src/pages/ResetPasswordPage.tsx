import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, KeyRound, Loader2, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { useSelfResetPassword } from '@/api/users/hooks'
import { toast } from 'sonner'
import { useLogout } from '@/api/auth/hooks'

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

export default function ResetPasswordPage() {
  const { t, i18n } = useTranslation(['chat', 'common'])
  const navigate = useNavigate()
  const isMobile = useIsMobile()
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
    if (!currentPassword) {
      toast.error(t('profile.current_password_required', { defaultValue: 'Current password is required' }))
      return
    }

    if (!newPassword) {
      toast.error(t('profile.password_required', { defaultValue: 'New password is required' }))
      return
    }

    if (newPassword.length < 8) {
      toast.error(t('profile.password_too_short', { defaultValue: 'Password must be at least 8 characters long' }))
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error(t('profile.passwords_do_not_match', { defaultValue: 'Passwords do not match' }))
      return
    }

    resetPassword({ currentPassword, newPassword }, {
      onSuccess: () => {
        toast.success(t('profile.password_reset_success', { defaultValue: 'Password updated successfully' }))
        setTimeout(() => {
          logout()
        }, 1500)
      },
      onError: (error: any) => {
        const backendMsg = extractBackendError(error)
        toast.error(
          backendMsg ||
          error.message ||
          t('profile.password_reset_error', { defaultValue: 'Failed to reset password' })
        )
      }
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

  const content = (
    <main className="flex-1 overflow-y-auto pb-24 px-5">
      <div className="py-6 space-y-8">
        <section>
          <label className="text-[11px] font-bold text-xon-text-secondary uppercase tracking-widest px-1">
            {t('profile.reset_password', { defaultValue: 'Reset Password' })}
          </label>

          <div className="mt-2 bg-xon-surface-container rounded-2xl shadow-sm border border-xon-surface-outline overflow-hidden p-4 space-y-4">
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
                  className="bg-xon-surface-container-hover border border-xon-surface-outline text-xon-text-primary placeholder:text-xon-text-secondary focus-visible:ring-xon-primary pe-10"
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
                  className="bg-xon-surface-container-hover border border-xon-surface-outline text-xon-text-primary placeholder:text-xon-text-secondary focus-visible:ring-xon-primary pe-10"
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
                  className="bg-xon-surface-container-hover border border-xon-surface-outline text-xon-text-primary placeholder:text-xon-text-secondary focus-visible:ring-xon-primary pe-10"
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
                onClick={() => navigate(-1)}
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
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.processing', { defaultValue: 'Processing...' })}
                  </>
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
    </main>
  )

  if (isMobile) {
    return (
      <div className="min-h-dvh bg-xon-surface">
        <header className="sticky top-0 z-20 bg-xon-surface md:bg-xon-surface/80 md:backdrop-blur-lg border-b border-xon-surface-outline px-4 h-16 flex items-center">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-xon-surface-container-hover transition-colors"
            aria-label={t('common.back', { defaultValue: 'Back' })}
          >
            <ChevronLeft className={`h-5 w-5 text-xon-text-primary ${isRTL ? 'rotate-180' : ''}`} />
          </button>
          <h1 className={`flex-1 text-center text-lg font-bold text-xon-text-primary ${isRTL ? 'ml-10' : 'mr-10'}`}>
            {t('profile.reset_password', { defaultValue: 'Reset Password' })}
          </h1>
        </header>

        {content}
        <MobileBottomNav />
      </div>
    )
  }

  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <div className="min-h-dvh bg-xon-surface">
          <div className="px-4 pt-4 md:px-8">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-2 text-sm text-xon-text-secondary hover:text-xon-text-primary transition-colors"
            >
              <ChevronLeft className={`h-4 w-4 ${isRTL ? 'rotate-180' : ''}`} />
              {t('common.back', { defaultValue: 'Back' })}
            </button>
          </div>

          <div className="px-4 pt-4 md:px-8">
            <div className="mx-auto w-full max-w-5xl">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-xon-container-green flex items-center justify-center flex-shrink-0">
                  <KeyRound className="h-5 w-5 text-xon-text-green" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-xon-text-primary truncate">
                    {t('profile.reset_password', { defaultValue: 'Reset Password' })}
                  </h1>
                  <p className="text-sm text-xon-text-secondary">
                    {t('profile.reset_password_description', { defaultValue: 'Change your password securely.' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-5xl">{content}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

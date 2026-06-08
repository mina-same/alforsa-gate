import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, KeyRound, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileBottomNav } from '@/components/MobileBottomNav'
import { useChangePassword } from '@/api/auth/hooks'
import { toast } from 'sonner'

export default function PasswordSettingsPage() {
  const { t, i18n } = useTranslation(['chat', 'common'])
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const isRTL = i18n.dir() === 'rtl'
  
  const { mutate: changePassword, isPending: isUpdating } = useChangePassword()

  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const handleSave = () => {
    if (!currentPassword) {
      toast.error(t('security.current_password_required', { defaultValue: 'Current password is required' }))
      return
    }

    if (!newPassword) {
      toast.error(t('security.new_password_required', { defaultValue: 'New password is required' }))
      return
    }

    if (newPassword.length < 8) {
      toast.error(t('security.password_too_short', { defaultValue: 'Password must be at least 8 characters long' }))
      return
    }

    if (newPassword !== confirmPassword) {
      toast.error(t('security.passwords_do_not_match', { defaultValue: 'Passwords do not match' }))
      return
    }

    changePassword({ oldPassword: currentPassword, newPassword }, {
      onSuccess: () => {
        toast.success(t('security.password_change_success', { defaultValue: 'Password changed successfully' }))
        setCurrentPassword('')
        setNewPassword('')
        setConfirmPassword('')
        setTimeout(() => navigate(-1), 1500)
      },
      onError: (error: any) => {
        toast.error(
          error.response?.data?.detail || 
          error.message || 
          t('security.password_change_error', { defaultValue: 'Failed to change password' })
        )
      }
    })
  }

  const form = (
    <main className="flex-1 overflow-y-auto pb-24 px-5">
      <div className="py-6 space-y-8">
        <section>
          <label className="text-[11px] font-bold text-xon-text-secondary uppercase tracking-widest px-1">
            {t('security.password_settings', { defaultValue: 'Password Settings' })}
          </label>

          <div className="mt-2 bg-xon-surface-container rounded-2xl shadow-sm border border-xon-surface-outline overflow-hidden p-4 space-y-4">
            <div className="space-y-2">
              <Label className="text-xon-text-primary" htmlFor="current_password">
                {t('security.current_password', { defaultValue: 'Current Password' })}
              </Label>
              <Input
                id="current_password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="bg-xon-surface-container-hover border border-xon-surface-outline text-xon-text-primary placeholder:text-xon-text-secondary focus-visible:ring-xon-primary"
                disabled={isUpdating}
              />
            </div>

            <div className="space-y-2">
              <Label className="text-xon-text-primary" htmlFor="new_password">
                {t('security.new_password', { defaultValue: 'New Password' })}
              </Label>
              <Input
                id="new_password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="bg-xon-surface-container-hover border border-xon-surface-outline text-xon-text-primary placeholder:text-xon-text-secondary focus-visible:ring-xon-primary"
                disabled={isUpdating}
              />
              <p className="text-[11px] text-xon-text-secondary">
                {t('security.password_hint', { defaultValue: 'Use at least 8 characters.' })}
              </p>
            </div>

            <div className="space-y-2">
              <Label className="text-xon-text-primary" htmlFor="confirm_password">
                {t('security.confirm_password', { defaultValue: 'Confirm Password' })}
              </Label>
              <Input
                id="confirm_password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="bg-xon-surface-container-hover border border-xon-surface-outline text-xon-text-primary placeholder:text-xon-text-secondary focus-visible:ring-xon-primary"
                disabled={isUpdating}
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="flex-1 border-xon-surface-outline text-xon-text-primary hover:bg-xon-surface-container-hover"
                onClick={() => navigate(-1)}
                disabled={isUpdating}
              >
                {t('profile.cancel', { defaultValue: 'Cancel' })}
              </Button>
              <Button 
                type="button" 
                className="flex-1 bg-xon-primary text-xon-primary-on hover:opacity-90"
                onClick={handleSave}
                disabled={isUpdating}
              >
                {isUpdating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('common.processing', { defaultValue: 'Processing...' })}
                  </>
                ) : (
                  t('profile.save', { defaultValue: 'Save' })
                )}
              </Button>
            </div>
          </div>
        </section>
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
          <h1
            className={`flex-1 text-center text-lg font-bold text-xon-text-primary ${
              isRTL ? 'ml-10' : 'mr-10'
            }`}
          >
            {t('security.password_settings', { defaultValue: 'Password Settings' })}
          </h1>
        </header>

        {form}
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
                <div className="h-11 w-11 rounded-2xl bg-xon-container-yellow flex items-center justify-center flex-shrink-0">
                  <KeyRound className="h-5 w-5 text-xon-text-yellow" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-xon-text-primary truncate">
                    {t('security.password_settings', { defaultValue: 'Password Settings' })}
                  </h1>
                  <p className="text-sm text-xon-text-secondary">
                    {t('security.password_settings_description', { defaultValue: 'Change password and requirements' })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto w-full max-w-5xl">{form}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

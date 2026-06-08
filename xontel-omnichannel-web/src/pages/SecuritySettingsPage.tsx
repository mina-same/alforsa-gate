import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, KeyRound, Shield, Smartphone } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileBottomNav } from '@/components/MobileBottomNav'

export default function SecuritySettingsPage() {
  const { t, i18n } = useTranslation(['chat', 'common'])
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const isRTL = i18n.dir() === 'rtl'

  const content = (
    <main className="bg-xon-surface flex-1 overflow-y-auto pb-24 px-5">
      <div className="py-6 space-y-8">
        <section>
          <label className="text-[11px] font-bold text-xon-text-secondary uppercase tracking-widest px-1">
            {t('profile.security', { defaultValue: 'Security' })}
          </label>
          <div className="mt-2 bg-xon-surface-container rounded-2xl shadow-sm border border-xon-surface-outline overflow-hidden">
            <button
              type="button"
              onClick={() => navigate('/profile/security/password')}
              className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-xon-surface-container-hover transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-xon-container-yellow flex items-center justify-center flex-shrink-0">
                  <KeyRound className="h-5 w-5 text-xon-text-yellow" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-xon-text-primary truncate">
                    {t('security.password_settings', { defaultValue: 'Password Settings' })}
                  </p>
                  <p className="text-xs text-xon-text-secondary truncate">
                    {t('security.password_settings_description', { defaultValue: 'Change password and requirements' })}
                  </p>
                </div>
              </div>
              <ChevronRight className={`h-4 w-4 text-xon-text-secondary flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => navigate('/profile/security/2fa')}
              className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-xon-surface-container-hover transition-colors border-t border-xon-surface-outline"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-xon-container-purple flex items-center justify-center flex-shrink-0">
                  <Smartphone className="h-5 w-5 text-xon-purple" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-xon-text-primary truncate">
                    {t('security.two_factor', { defaultValue: 'Two-Factor Authentication' })}
                  </p>
                  <p className="text-xs text-xon-text-secondary truncate">
                    {t('security.two_factor_description', { defaultValue: 'Protect your account with 2FA' })}
                  </p>
                </div>
              </div>
              <ChevronRight className={`h-4 w-4 text-xon-text-secondary flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => navigate('/profile/reset-password')}
              className="w-full flex items-center justify-between gap-4 p-4 text-left hover:bg-xon-surface-container-hover transition-colors border-t border-xon-surface-outline"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-xon-container-green flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-xon-text-green" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-xon-text-primary truncate">
                    {t('profile.reset_password', { defaultValue: 'Reset Password' })}
                  </p>
                  <p className="text-xs text-xon-text-secondary truncate">
                    {t('profile.reset_password_description', { defaultValue: 'Change your password securely.' })}
                  </p>
                </div>
              </div>
              <ChevronRight className={`h-4 w-4 text-xon-text-secondary flex-shrink-0 ${isRTL ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </section>

        <div className="p-4 bg-xon-surface-container-hover rounded-2xl border border-xon-surface-outline">
          <p className="text-[11px] leading-relaxed text-xon-text-secondary text-center">
            {t('security.note', {
              defaultValue:
                'Security settings help protect your account. Some options may require re-authentication.',
            })}
          </p>
        </div>

        <div className="hidden md:flex gap-2">
          <Button
            type="button"
            variant="outline"
            className="border-xon-surface-outline text-xon-text-primary hover:bg-xon-surface-container-hover"
          >
            {t('profile.cancel', { defaultValue: 'Cancel' })}
          </Button>
          <Button type="button" className="bg-xon-primary text-xon-primary-on hover:opacity-90">
            {t('profile.save', { defaultValue: 'Save' })}
          </Button>
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
          <h1
            className={`flex-1 text-center text-lg font-bold text-xon-text-primary ${
              isRTL ? 'ml-10' : 'mr-10'
            }`}
          >
            {t('profile.security', { defaultValue: 'Security' })}
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
                  <Shield className="h-5 w-5 text-xon-text-green" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-xon-text-primary truncate">
                    {t('profile.security', { defaultValue: 'Security' })}
                  </h1>
                  <p className="text-sm text-xon-text-secondary">
                    {t('profile.security_description', { defaultValue: 'Password and 2FA settings' })}
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

import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, QrCode, Smartphone, ShieldCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileBottomNav } from '@/components/MobileBottomNav'

function ToggleSwitch({
  checked,
  onCheckedChange,
}: {
  checked: boolean
  onCheckedChange: (next: boolean) => void
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onCheckedChange(!checked)}
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xon-primary focus-visible:ring-offset-2 focus-visible:ring-offset-xon-surface-container ${
        checked ? 'bg-xon-primary' : 'bg-xon-surface-outline'
      }`}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  )
}

export default function TwoFactorSettingsPage() {
  const { t, i18n } = useTranslation(['chat', 'common'])
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const isRTL = i18n.dir() === 'rtl'

  const [enabled, setEnabled] = useState(false)

  const content = (
    <main className="flex-1 overflow-y-auto pb-24 px-5">
      <div className="py-6 space-y-8">
        <section>
          <label className="text-[11px] font-bold text-xon-text-secondary uppercase tracking-widest px-1">
            {t('security.two_factor', { defaultValue: 'Two-Factor Authentication' })}
          </label>

          <div className="mt-2 bg-xon-surface-container rounded-2xl shadow-sm border border-xon-surface-outline overflow-hidden">
            <div className="flex items-center justify-between p-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-xon-container-green flex items-center justify-center flex-shrink-0">
                  <ShieldCheck className="h-5 w-5 text-xon-text-green" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-xon-text-primary truncate">
                    {t('security.enable_2fa', { defaultValue: 'Enable 2FA' })}
                  </p>
                  <p className="text-xs text-xon-text-secondary truncate">
                    {t('security.enable_2fa_description', { defaultValue: 'Require a verification code when signing in' })}
                  </p>
                </div>
              </div>
              <ToggleSwitch checked={enabled} onCheckedChange={setEnabled} />
            </div>

            <div className="flex items-center justify-between p-4 border-t border-xon-surface-outline">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-xon-container-purple flex items-center justify-center flex-shrink-0">
                  <Smartphone className="h-5 w-5 text-xon-purple" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-xon-text-primary truncate">
                    {t('security.authenticator_app', { defaultValue: 'Authenticator App' })}
                  </p>
                  <p className="text-xs text-xon-text-secondary truncate">
                    {t('security.authenticator_app_description', { defaultValue: 'Use an app to generate one-time codes' })}
                  </p>
                </div>
              </div>
              <Button type="button" variant="outline" className="border-xon-surface-outline text-xon-text-primary hover:bg-xon-surface-container-hover">
                {t('security.setup', { defaultValue: 'Setup' })}
              </Button>
            </div>

            <div className="flex items-center justify-between p-4 border-t border-xon-surface-outline">
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-10 h-10 rounded-xl bg-xon-container-yellow flex items-center justify-center flex-shrink-0">
                  <QrCode className="h-5 w-5 text-xon-text-yellow" />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-xon-text-primary truncate">
                    {t('security.backup_codes', { defaultValue: 'Backup Codes' })}
                  </p>
                  <p className="text-xs text-xon-text-secondary truncate">
                    {t('security.backup_codes_description', { defaultValue: 'Keep codes in a safe place' })}
                  </p>
                </div>
              </div>
              <Button type="button" variant="outline" className="border-xon-surface-outline text-xon-text-primary hover:bg-xon-surface-container-hover">
                {t('security.view', { defaultValue: 'View' })}
              </Button>
            </div>
          </div>
        </section>

        <div className="p-4 bg-xon-surface-container-hover rounded-2xl border border-xon-surface-outline">
          <p className="text-[11px] leading-relaxed text-xon-text-secondary text-center">
            {t('security.2fa_note', {
              defaultValue:
                'If you lose access to your authenticator, you can use backup codes to sign in.',
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
          <h1
            className={`flex-1 text-center text-lg font-bold text-xon-text-primary ${
              isRTL ? 'ml-10' : 'mr-10'
            }`}
          >
            {t('security.two_factor', { defaultValue: 'Two-Factor Authentication' })}
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
                  <ShieldCheck className="h-5 w-5 text-xon-text-green" />
                </div>
                <div className="min-w-0">
                  <h1 className="text-lg font-semibold text-xon-text-primary truncate">
                    {t('security.two_factor', { defaultValue: 'Two-Factor Authentication' })}
                  </h1>
                  <p className="text-sm text-xon-text-secondary">
                    {t('security.two_factor_description', { defaultValue: 'Protect your account with 2FA' })}
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

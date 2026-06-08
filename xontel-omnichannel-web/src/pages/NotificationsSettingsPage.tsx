import React, { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { BadgeCheck, Bell, ChevronLeft, Eye, PhoneCall, Vibrate, Volume2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { SidebarProvider, SidebarInset } from '@/components/ui/sidebar'
import { AppSidebar } from '@/components/app-sidebar'
import { useIsMobile } from '@/hooks/use-mobile'
import { MobileBottomNav } from '@/components/MobileBottomNav'

type ToggleKey =
  | 'pushNotifications'
  | 'showPreviews'
  | 'soundAlerts'
  | 'vibrate'
  | 'incomingCalls'
  | 'badgeNotifications'

type ToggleState = Record<ToggleKey, boolean>

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

export default function NotificationsSettingsPage() {
  const { t, i18n } = useTranslation(['chat', 'common'])
  const navigate = useNavigate()
  const isMobile = useIsMobile()
  const isRTL = i18n.dir() === 'rtl'

  const [toggles, setToggles] = useState<ToggleState>({
    pushNotifications: true,
    showPreviews: true,
    soundAlerts: true,
    vibrate: false,
    incomingCalls: true,
    badgeNotifications: true,
  })

  const sections = useMemo(
    () => [
      {
        title: t('notifications.general', { defaultValue: 'General' }),
        items: [
          {
            key: 'pushNotifications' as const,
            label: t('notifications.push', { defaultValue: 'Push Notifications' }),
            description: t('notifications.push_description', {
              defaultValue: 'Enable system alerts',
            }),
            icon: Bell,
            iconWrapClassName: 'bg-xon-primary/10',
            iconClassName: 'text-xon-primary',
          },
          {
            key: 'showPreviews' as const,
            label: t('notifications.previews', { defaultValue: 'Show Previews' }),
            description: t('notifications.previews_description', {
              defaultValue: 'Preview message in alerts',
            }),
            icon: Eye,
            iconWrapClassName: 'bg-xon-surface-hover',
            iconClassName: 'text-xon-text-secondary',
          },
        ],
      },
      {
        title: t('notifications.message_notifications', { defaultValue: 'Message Notifications' }),
        items: [
          {
            key: 'soundAlerts' as const,
            label: t('notifications.sound_alerts', { defaultValue: 'Sound Alerts' }),
            description: t('notifications.sound_alerts_description', {
              defaultValue: 'Custom message tone',
            }),
            icon: Volume2,
            iconWrapClassName: 'bg-xon-container-yellow',
            iconClassName: 'text-xon-text-yellow',
          },
          {
            key: 'vibrate' as const,
            label: t('notifications.vibrate', { defaultValue: 'Vibrate' }),
            description: t('notifications.vibrate_description', {
              defaultValue: 'Pulse for new messages',
            }),
            icon: Vibrate,
            iconWrapClassName: 'bg-xon-container-purple',
            iconClassName: 'text-xon-purple',
          },
        ],
      },
      {
        title: t('notifications.call_notifications', { defaultValue: 'Call Notifications' }),
        items: [
          {
            key: 'incomingCalls' as const,
            label: t('notifications.incoming_calls', { defaultValue: 'Incoming Calls' }),
            description: t('notifications.incoming_calls_description', {
              defaultValue: 'Ring for all calls',
            }),
            icon: PhoneCall,
            iconWrapClassName: 'bg-xon-container-green',
            iconClassName: 'text-xon-text-green',
          },
          {
            key: 'badgeNotifications' as const,
            label: t('notifications.badges', { defaultValue: 'Badge Notifications' }),
            description: t('notifications.badges_description', {
              defaultValue: 'Show missed count',
            }),
            icon: BadgeCheck,
            iconWrapClassName: 'bg-xon-container-red',
            iconClassName: 'text-xon-text-red',
          },
        ],
      },
    ],
    [t]
  )

  const SettingsContent = (
    <main className="flex-1 overflow-y-auto pb-24 px-5">
      <div className="py-6 space-y-8">
        {sections.map((section) => (
          <section key={section.title}>
            <label className="text-[11px] font-bold text-xon-text-secondary uppercase tracking-widest px-1">
              {section.title}
            </label>

            <div className="mt-2 bg-xon-surface-container rounded-2xl shadow-sm border border-xon-surface-outline overflow-hidden">
              {section.items.map((item, index) => {
                const Icon = item.icon
                return (
                  <div
                    key={item.key}
                    className={`flex items-center justify-between p-4 ${
                      index === 0 ? '' : 'border-t border-xon-surface-outline'
                    }`}
                  >
                    <div className="flex items-center gap-4 min-w-0">
                      <div
                        className={`w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 ${
                          item.iconWrapClassName
                        }`}
                      >
                        <Icon className={`h-5 w-5 ${item.iconClassName}`} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-xon-text-primary truncate">{item.label}</p>
                        <p className="text-xs text-xon-text-secondary truncate">{item.description}</p>
                      </div>
                    </div>

                    <ToggleSwitch
                      checked={toggles[item.key]}
                      onCheckedChange={(next) =>
                        setToggles((prev) => ({
                          ...prev,
                          [item.key]: next,
                        }))
                      }
                    />
                  </div>
                )
              })}
            </div>
          </section>
        ))}

        <div className="p-4 bg-xon-surface-container-hover rounded-2xl border border-xon-surface-outline">
          <p className="text-[11px] leading-relaxed text-xon-text-secondary text-center">
            {t('notifications.note', {
              defaultValue:
                'Disabling notifications may cause you to miss urgent business communications. Some system critical alerts cannot be turned off.',
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
              {t('profile.notifications', { defaultValue: 'Notifications' })}
            </h1>
        </header>

        {SettingsContent}
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
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="h-11 w-11 rounded-2xl bg-xon-primary/10 flex items-center justify-center flex-shrink-0">
                      <Bell className="h-5 w-5 text-xon-primary" />
                    </div>
                    <div className="min-w-0">
                      <h1 className="text-lg font-semibold text-xon-text-primary truncate">
                        {t('profile.notifications', { defaultValue: 'Notifications' })}
                      </h1>
                      <p className="text-sm text-xon-text-secondary">
                        {t('profile.notifications_description', {
                          defaultValue: 'Alerts, sounds and push prefs',
                        })}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="hidden md:flex items-center gap-2">
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
            </div>
          </div>

          <div className="mx-auto w-full max-w-5xl">
            <main className="flex-1 overflow-y-auto pb-10 px-4 md:px-8">
              <div className="py-6 space-y-8">
                {sections.map((section) => (
                  <section key={section.title}>
                    <label className="text-[11px] font-bold text-xon-text-secondary uppercase tracking-widest px-1">
                      {section.title}
                    </label>
                    <div className="mt-2 bg-xon-surface-container rounded-2xl shadow-sm border border-xon-surface-outline overflow-hidden">
                      {section.items.map((item, index) => {
                        const Icon = item.icon
                        return (
                          <div
                            key={item.key}
                            className={`flex items-center justify-between p-4 ${
                              index === 0 ? '' : 'border-t border-xon-surface-outline'
                            }`}
                          >
                            <div className="flex items-center gap-4 min-w-0">
                              <div
                                className={`w-10 h-10 flex items-center justify-center rounded-xl flex-shrink-0 ${
                                  item.iconWrapClassName
                                }`}
                              >
                                <Icon className={`h-5 w-5 ${item.iconClassName}`} />
                              </div>
                              <div className="min-w-0">
                                <p className="text-sm font-semibold text-xon-text-primary truncate">{item.label}</p>
                                <p className="text-xs text-xon-text-secondary truncate">{item.description}</p>
                              </div>
                            </div>
                            <ToggleSwitch
                              checked={toggles[item.key]}
                              onCheckedChange={(next) =>
                                setToggles((prev) => ({
                                  ...prev,
                                  [item.key]: next,
                                }))
                              }
                            />
                          </div>
                        )
                      })}
                    </div>
                  </section>
                ))}

                <div className="p-4 bg-xon-surface-container-hover rounded-2xl border border-xon-surface-outline">
                  <p className="text-[11px] leading-relaxed text-xon-text-secondary text-center">
                    {t('notifications.note', {
                      defaultValue:
                        'Disabling notifications may cause you to miss urgent business communications. Some system critical alerts cannot be turned off.',
                    })}
                  </p>
                </div>
              </div>
            </main>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}

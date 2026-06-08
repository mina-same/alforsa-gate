import React from 'react'
import { useTranslation } from 'react-i18next'
import { Skeleton } from '@/components/ui/skeleton'
import { getChannelIcon, getChannelLabel } from '@/utils/channelUtils'

interface Inbox {
  id: number
  name: string
  channel_type: string
}

interface InboxesSectionProps {
  userInboxes: Inbox[] | undefined
  isLoadingInboxes: boolean
  activeInboxId: number | null
  onInboxSwitch: (inboxId: number) => void
}

export default function InboxesSection({
  userInboxes,
  isLoadingInboxes,
  activeInboxId,
  onInboxSwitch,
}: InboxesSectionProps) {
  const { t } = useTranslation(['chat', 'common'])

  return (
    <section>
      <h3 className="text-xs font-semibold text-xon-text-secondary uppercase tracking-wider mb-4 px-1">
        {t('profile.inboxes')}
      </h3>
      {isLoadingInboxes ? (
        <div className="bg-xon-surface-container rounded-2xl p-6 shadow-sm border border-xon-surface-outline">
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, idx) => (
              <div
                key={idx}
                className="w-full flex items-center justify-between p-3 rounded-xl border border-xon-surface-outline"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Skeleton className="h-10 w-10 rounded-lg" />
                  <div className="min-w-0 space-y-2">
                    <Skeleton variant="text" className="h-4 w-40" />
                    <Skeleton variant="text" className="h-3 w-24" />
                  </div>
                </div>
                <Skeleton className="h-4 w-4 rounded-sm" />
              </div>
            ))}
          </div>
        </div>
      ) : userInboxes && userInboxes.length > 0 ? (
        <div className="space-y-3">
          {userInboxes.map((inbox: Inbox) => {
            const Icon = getChannelIcon(inbox.channel_type)
            const isActive = Number(inbox.id) === Number(activeInboxId)
            return (
              <button
                key={inbox.id}
                onClick={() => onInboxSwitch(inbox.id)}
                className={`w-full bg-xon-surface-container rounded-xl p-4 shadow-sm border flex items-center justify-between text-left transition-all duration-200 group hover:shadow-md ${
                  isActive
                    ? 'border-xon-primary ring-2 ring-xon-primary/20 bg-gradient-to-r from-xon-primary/10 to-transparent'
                    : 'border-xon-surface-outline hover:bg-xon-surface-container-hover hover:border-xon-primary/30'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-all ${
                      isActive
                        ? 'bg-xon-primary/20 text-xon-primary shadow-md'
                        : 'bg-xon-surface-hover text-xon-text-secondary group-hover:bg-xon-primary/10 group-hover:text-xon-primary'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm truncate text-xon-text-primary">{inbox.name}</p>
                    <p className="text-xs text-xon-text-secondary truncate">
                      {getChannelLabel(inbox.channel_type)}
                    </p>
                  </div>
                </div>
                {isActive ? (
                  <span className="text-[11px] font-semibold uppercase text-xon-primary flex items-center gap-1">
                    <span className="inline-block w-2 h-2 bg-xon-primary rounded-full animate-pulse"></span>
                    {t('profile.active', { defaultValue: 'Active' })}
                  </span>
                ) : (
                  <span className="w-5 h-5 border-2 border-xon-surface-outline rounded-full group-hover:border-xon-primary/50 transition-colors" />

                )}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="bg-xon-surface-container rounded-2xl p-6 shadow-sm border border-xon-surface-outline">
          <p className="text-sm text-xon-text-secondary">
            {t('profile.no_inboxes_assigned', {
              defaultValue: 'You are not a member of any inbox yet.',
            })}
          </p>
        </div>
      )}
    </section>
  )
}

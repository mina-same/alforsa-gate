import React from 'react'
import { useAuthUser } from '@/contexts/AuthContext'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useChannel } from '@/api/channels/hooks'
import { getChannelIcon, getChannelLabel } from '@/utils/channelUtils'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChevronDown, Copy, Globe, History, Laptop, Settings, ArrowLeft } from 'lucide-react'
import { useIsMobile } from '@/hooks/use-mobile'

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
      className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-xon-primary focus-visible:ring-offset-2 focus-visible:ring-offset-xon-surface-container ${checked ? 'bg-xon-primary' : 'bg-xon-surface-outline'
        }`}
    >
      <span
        className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-1 ring-black/5 transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'
          }`}
      />
    </button>
  )
}

export default function ChannelSettings() {
  const { i18n } = useTranslation()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const isMobile = useIsMobile()

  const inboxIdParam = searchParams.get('inbox_id')
  const inboxId = inboxIdParam ? Number(inboxIdParam) : undefined

  // Read user inboxes from localStorage (kept consistent with the rest of app)
  const storedInboxes = React.useMemo(() => {
    try {
      const parsed = JSON.parse(localStorage.getItem('userInboxes') || '[]')
      // Handle paginated response format with items array
      return (parsed.items || parsed) as any[]
    } catch {
      return []
    }
  }, [])

  const activeInbox = React.useMemo(() => {
    if (!inboxId) return undefined
    return storedInboxes.find((i: any) => Number(i.id) === Number(inboxId))
  }, [storedInboxes, inboxId])

  const channelId = activeInbox?.channel_id as number | undefined
  const { data: channel, isLoading, error } = useChannel(channelId || 0)

  const ChannelIcon = channel ? getChannelIcon(channel.channel_type) : Globe
  const channelLabel = channel ? getChannelLabel(channel.channel_type) : 'Channel'

  const [generalOpen, setGeneralOpen] = React.useState(true)
  const [technicalOpen, setTechnicalOpen] = React.useState(true)

  const [channelNameDraft, setChannelNameDraft] = React.useState('')

  React.useEffect(() => {
    if (!channelNameDraft) {
      setChannelNameDraft((channel?.name ?? activeInbox?.name ?? '').toString())
    }
  }, [channel?.name, activeInbox?.name, channelNameDraft])

  const currentUserAvatar = useAuthUser().avatar_url || ''

  const goBack = () => {
    const backUrl = `/?inbox_id=${inboxId ?? ''}`
    navigate(backUrl)
  }

  if (!inboxId || !activeInbox) {
    return (
      <div className="h-full w-full flex flex-col gap-4 items-center justify-center p-6">
        <div className="text-center">
          <p className="text-lg font-semibold mb-1 text-xon-text-primary">No channel selected</p>
          <p className="text-sm text-xon-text-secondary">Choose a channel from the sidebar to view its settings</p>
        </div>
        <Button onClick={() => navigate(`/${i18n.language}/`)} variant="outline" className="border-xon-surface-outline text-xon-text-primary hover:bg-xon-surface-container-hover">
          Back to conversations
        </Button>
      </div>
    )
  }


  const mobileView = (
    <div className="h-full w-full overflow-y-auto text-xon-text-primary pb-[calc(6rem+env(safe-area-inset-bottom))]">
      <header className="sticky top-0 z-30 bg-xon-container-blue/30 backdrop-blur-lg border-b border-xon-surface-outline px-4 py-3 flex items-center gap-4">
        <h1 className="text-lg font-semibold flex-1">Channel Settings</h1>
        <Avatar className="h-10 w-10 rounded-full border border-xon-surface-outline overflow-hidden">
          <AvatarImage src={currentUserAvatar} alt="Profile" />
          <AvatarFallback className="bg-xon-surface-container-hover text-xon-text-primary">U</AvatarFallback>
        </Avatar>
      </header>

      <main className="max-w-md mx-auto p-4 space-y-4">
        <div className="flex items-center gap-3 p-1 mb-2">
          <div className="w-12 h-12 rounded-xl bg-xon-primary/10 flex items-center justify-center">
            <ChannelIcon className="h-7 w-7 text-xon-primary" />
          </div>
          <div className="min-w-0">
            <h2 className="text-xl font-bold truncate">{activeInbox?.name || channel?.name || channelLabel}</h2>
            <p className="text-sm text-xon-text-secondary truncate">
              {channel ? `${channelLabel} Configuration` : 'Channel Configuration'}
            </p>
          </div>
        </div>

        {error ? (
          <div className="text-sm text-xon-text-red">Failed to load channel information.</div>
        ) : isLoading && !channel ? (
          <>
            <div className="bg-xon-surface-container rounded-2xl border border-xon-surface-outline overflow-hidden shadow-sm">
              <div className="px-5 py-4 flex items-center justify-between">
                <Skeleton variant="text" className="h-5 w-48" />
                <Skeleton variant="circle" className="h-5 w-5" />
              </div>
              <div className="px-5 pb-5 pt-2 space-y-4 border-t border-xon-surface-outline">
                <div className="space-y-2">
                  <Skeleton variant="text" className="h-3 w-28" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Skeleton variant="text" className="h-3 w-20" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton variant="text" className="h-3 w-20" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-xon-surface-container rounded-2xl border border-xon-surface-outline p-5 shadow-sm">
              <Skeleton variant="text" className="h-3 w-28 mb-4" />
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Skeleton variant="circle" className="h-3 w-3" />
                  <Skeleton variant="text" className="h-4 w-20" />
                </div>
                <Skeleton variant="text" className="h-4 w-14" />
              </div>
            </div>

            <div className="bg-xon-surface-container rounded-2xl border border-xon-surface-outline overflow-hidden shadow-sm">
              <div className="px-5 py-4 flex items-center justify-between">
                <Skeleton variant="text" className="h-5 w-24" />
                <Skeleton variant="circle" className="h-5 w-5" />
              </div>
              <div className="px-5 pb-5 pt-2 space-y-4 border-t border-xon-surface-outline">
                <div className="space-y-2">
                  <Skeleton variant="text" className="h-3 w-28" />
                  <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Skeleton variant="text" className="h-3 w-20" />
                  <Skeleton variant="text" className="h-4 w-2/3" />
                </div>
              </div>
            </div>
          </>
        ) : null}

        <div className="bg-xon-surface-container rounded-2xl border border-xon-surface-outline overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setGeneralOpen((v) => !v)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-xon-surface-container-hover transition-colors"
          >
            <div className="flex items-center gap-3">
              <Settings className="h-5 w-5 text-xon-text-secondary" />
              <span className="font-semibold text-base">General Information</span>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-xon-text-secondary transition-transform duration-300 ${generalOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {generalOpen ? (
            <div className="px-5 pb-5 pt-2 space-y-4 border-t border-xon-surface-outline">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-xon-text-secondary uppercase tracking-wider">Channel Name</label>
                <input
                  className="w-full h-12 px-4 rounded-xl border border-xon-surface-outline bg-xon-surface-container-hover text-xon-text-primary focus:outline-none focus:ring-2 focus:ring-xon-primary focus:border-transparent transition-all"
                  type="text"
                  value={channelNameDraft}
                  onChange={(e) => setChannelNameDraft(e.target.value)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-xon-text-secondary uppercase tracking-wider">Channel ID</label>
                  <div className="h-12 flex items-center px-4 bg-xon-surface-container-hover rounded-xl text-xon-text-secondary font-mono">
                    {channel?.id ?? '-'}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-xon-text-secondary uppercase tracking-wider">Inbox ID</label>
                  <div className="h-12 flex items-center px-4 bg-xon-surface-container-hover rounded-xl text-xon-text-secondary font-mono">
                    {activeInbox?.id ?? '-'}
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-xon-text-secondary uppercase tracking-wider">Channel Type</label>
                <div className="h-12 flex items-center px-4 bg-xon-surface-container-hover rounded-xl text-xon-text-secondary">
                  {channel ? channelLabel : '-'}
                </div>
              </div>
            </div>
          ) : null}
        </div>

        <div className="bg-xon-surface-container rounded-2xl border border-xon-surface-outline p-5 shadow-sm">
          <h3 className="text-xs font-semibold text-xon-text-secondary uppercase tracking-wider mb-4">Channel Status</h3>
          <div
            className={`flex items-center justify-between p-3 rounded-xl border ${channel?.is_active
              ? 'bg-xon-container-green border-xon-container-green/40'
              : 'bg-xon-surface-container-hover border-xon-surface-outline'
              }`}
          >
            <div className="flex items-center gap-3">
              <span className="relative flex h-3 w-3">
                {channel?.is_active ? (
                  <>
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-500 opacity-30" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500" />
                  </>
                ) : (
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-xon-surface-outline" />
                )}
              </span>
              <span
                className={`uppercase text-sm font-bold ${channel?.is_active ? 'text-xon-text-green' : 'text-xon-text-secondary'
                  }`}
              >
                {channel?.is_active ? 'Active' : 'Inactive'}
              </span>
            </div>
            <button type="button" className="text-xs font-bold text-xon-text-secondary hover:underline">
              Change
            </button>
          </div>
        </div>

        <div className="bg-xon-surface-container rounded-2xl border border-xon-surface-outline overflow-hidden shadow-sm">
          <button
            type="button"
            onClick={() => setTechnicalOpen((v) => !v)}
            className="w-full px-5 py-4 flex items-center justify-between hover:bg-xon-surface-container-hover transition-colors"
          >
            <div className="flex items-center gap-3">
              <Laptop className="h-5 w-5 text-xon-text-secondary" />
              <span className="font-semibold text-base">Technical</span>
            </div>
            <ChevronDown
              className={`h-5 w-5 text-xon-text-secondary transition-transform duration-300 ${technicalOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {technicalOpen ? (
            <div className="px-5 pb-5 pt-2 space-y-4 border-t border-xon-surface-outline">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-xon-text-secondary uppercase tracking-wider">Webhook URL</label>
                <div className="relative">
                  <input
                    className="w-full h-12 pl-4 pr-12 rounded-xl border border-xon-surface-outline bg-xon-surface-container-hover text-sm font-mono text-xon-text-secondary"
                    readOnly
                    type="text"
                    value={channel?.webhook_url ?? '-'}
                  />
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        if (channel?.webhook_url) await navigator.clipboard.writeText(channel.webhook_url)
                      } catch {
                        // ignore
                      }
                    }}
                    className="absolute right-2 top-2 p-2 hover:bg-xon-surface-container rounded-lg text-xon-primary"
                    aria-label="Copy webhook url"
                  >
                    <Copy className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-xon-text-secondary uppercase tracking-wider">Last Sync</label>
                <div className="flex items-center gap-2 text-xon-text-secondary italic text-sm">
                  <History className="h-4 w-4" />
                  {channel?.last_sync_at ? channel.last_sync_at : 'No sync recorded yet'}
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <div className="fixed bottom-24 left-0 right-0 bg-xon-surface-container/95 backdrop-blur border-t border-xon-surface-outline p-4 shadow-lg z-40">
        <div className="max-w-md mx-auto flex gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            className="flex-1 border-xon-surface-outline text-xon-text-primary hover:bg-xon-surface-container-hover transition-all"
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="flex-1 bg-xon-primary text-xon-primary-on hover:opacity-90 active:scale-95 transition-all"
          >
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )

  const [statusEnabled, setStatusEnabled] = React.useState(Boolean(channel?.is_active))

  React.useEffect(() => {
    setStatusEnabled(Boolean(channel?.is_active))
  }, [channel?.is_active])

  const desktopView = (
    <div className="h-full w-full overflow-y-autotext-xon-text-primary">
      <header className="h-16 border-b border-xon-surface-outline bg-xon-surface-container flex items-center px-8 sticky top-0 z-10">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-xon-primary/10 rounded-full flex items-center justify-center text-xon-primary flex-shrink-0">
            <ChannelIcon className="h-5 w-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-lg font-semibold truncate">{activeInbox?.name || channel?.name || channelLabel}</h2>
            <p className="text-xs text-xon-text-secondary truncate">Internal Communication Channel Settings</p>
          </div>
        </div>
        <div className="ml-auto flex items-center gap-4">
          <button
            type="button"
            className="flex items-center gap-2 bg-xon-surface-container-hover px-3 py-1.5 rounded-full text-xs font-medium hover:bg-xon-surface-hover transition-colors"
          >
            <span className="w-2 h-2 bg-green-500 rounded-full" />
            Open in app
          </button>
        </div>
      </header>

      <div className="max-w-5xl mx-auto p-8 space-y-6">
        <section className="bg-xon-surface-container rounded-xl border border-xon-surface-outline shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-xon-surface-outline">
            <h3 className="font-semibold text-xon-text-primary">General Information</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-xs font-medium text-xon-text-secondary uppercase tracking-wider">Channel Name</label>
              <input
                className="w-full bg-xon-surface-container-hover border border-xon-surface-outline rounded-lg focus:outline-none focus:ring-2 focus:ring-xon-primary/30 text-sm font-medium"
                type="text"
                value={channelNameDraft}
                onChange={(e) => setChannelNameDraft(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-xon-text-secondary uppercase tracking-wider">Channel Type</label>
              <div className="flex items-center h-[38px] px-3 bg-xon-surface-container-hover rounded-lg text-sm text-xon-text-secondary">
                {channel ? channelLabel : '-'}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-xon-text-secondary uppercase tracking-wider">Channel ID</label>
              <div className="flex items-center h-[38px] px-3 bg-xon-surface-container-hover rounded-lg text-sm text-xon-text-secondary font-mono">
                {channel?.id ?? '-'}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-xon-text-secondary uppercase tracking-wider">Inbox ID</label>
              <div className="flex items-center h-[38px] px-3 bg-xon-surface-container-hover rounded-lg text-sm text-xon-text-secondary font-mono">
                {activeInbox?.id ?? '-'}
              </div>
            </div>
          </div>
        </section>

        <section className="bg-xon-surface-container rounded-xl border border-xon-surface-outline shadow-sm">
          <div className="px-6 py-4 border-b border-xon-surface-outline">
            <h3 className="font-semibold text-xon-text-primary">Channel Status</h3>
          </div>
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-3 h-3 rounded-full ${statusEnabled ? 'bg-green-500 animate-pulse' : 'bg-xon-surface-outline'}`} />
              <span className="font-medium text-xon-text-secondary">{statusEnabled ? 'Active' : 'Inactive'}</span>
            </div>
            <ToggleSwitch checked={statusEnabled} onCheckedChange={setStatusEnabled} />
          </div>
        </section>

        <section className="bg-xon-surface-container rounded-xl border border-xon-surface-outline shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-xon-surface-outline">
            <h3 className="font-semibold text-xon-text-primary">Technical Details</h3>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-1">
              <label className="text-xs font-medium text-xon-text-secondary uppercase tracking-wider">Webhook URL</label>
              <div className="flex items-center gap-2">
                <div className="flex-1 flex items-center h-[38px] px-3 bg-xon-surface-container-hover border border-xon-surface-outline rounded-lg text-sm font-mono text-xon-text-secondary overflow-x-auto whitespace-nowrap xon-scrollbar-thin">
                  {channel?.webhook_url ?? '-'}
                </div>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      if (channel?.webhook_url) await navigator.clipboard.writeText(channel.webhook_url)
                    } catch {
                      // ignore
                    }
                  }}
                  className="p-2 text-xon-text-secondary hover:text-xon-primary transition-colors"
                  aria-label="Copy webhook url"
                >
                  <Copy className="h-5 w-5" />
                </button>
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-xon-text-secondary uppercase tracking-wider">Last Sync</label>
              <div className="flex items-center h-[38px] px-3 bg-xon-surface-container-hover rounded-lg text-sm text-xon-text-secondary">
                <History className="h-4 w-4 mr-2" />
                {channel?.last_sync_at ? channel.last_sync_at : 'Never synced'}
              </div>
            </div>
          </div>
        </section>

        <div className="flex items-center gap-4 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={goBack}
            className="bg-xon-surface-container hover:bg-xon-surface-container-hover text-xon-text-primary border border-xon-surface-outline px-8 py-2.5 rounded-lg font-semibold text-sm transition-all"
          >
            Cancel
          </Button>
          <Button type="button" className="bg-xon-primary text-xon-primary-on px-8 py-2.5 rounded-lg font-semibold text-sm shadow-lg shadow-black/10 transition-all active:scale-[0.98]">
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  )

  return isMobile ? mobileView : desktopView
}

import { FileText, Play, ChevronDown, ChevronUp } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { SegmentedToggle } from '@/components/ui/segmented-toggle'
import ConversationMediaViewer from '../ConversationMediaViewer'
import MessageReactionsDetails from '../MessageReactionsDetails'
import { normalizeMediaUrl } from '@/utils/urlHelper'
import { ContactLinkRow } from './ContactLinkRow'
import type { ConversationMediaItem } from '@/api/conversations/types'

interface MonthGroup {
  key: string
  title: string
  items: ConversationMediaItem[]
}

interface MediaSectionProps {
  activeTab: 'media' | 'documents' | 'links'
  onTabChange: (tab: 'media' | 'documents' | 'links') => void
  combinedMedia: ConversationMediaItem[]
  documentsMedia: ConversationMediaItem[]
  linkMedia: ConversationMediaItem[]
  groupedMedia: MonthGroup[]
  groupedDocuments: MonthGroup[]
  groupedLinks: MonthGroup[]
  collapsedGroups: Record<string, boolean>
  onToggleGroup: (key: string) => void
  isLoadingMedia: boolean
  isLoadingDocs: boolean
  isLoadingLinkMedia: boolean
  reactionsByMessageId: Map<number, any[]>
  numericConversationId: number
  isMediaViewerOpen: boolean
  mediaViewerMessageId: number | null
  onOpenMediaViewer: (messageId: number) => void
  onMediaViewerOpenChange: (open: boolean) => void
  reactionsDetailsOpen: boolean
  reactionsDetailsReactions: any[]
  reactionsDetailsContext: { title?: string; thumbnailUrl?: string } | undefined
  onReactionsDetailsOpenChange: (open: boolean) => void
  onReactionsDetailsSet: (reactions: any[], context: { title?: string; thumbnailUrl?: string }) => void
  formatBytes: (bytes: number | null) => string
}

export function MediaSection({
  activeTab, onTabChange,
  combinedMedia, documentsMedia, linkMedia,
  groupedMedia, groupedDocuments, groupedLinks,
  collapsedGroups, onToggleGroup,
  isLoadingMedia, isLoadingDocs, isLoadingLinkMedia,
  reactionsByMessageId,
  numericConversationId,
  isMediaViewerOpen, mediaViewerMessageId,
  onOpenMediaViewer, onMediaViewerOpenChange,
  reactionsDetailsOpen, reactionsDetailsReactions, reactionsDetailsContext,
  onReactionsDetailsOpenChange, onReactionsDetailsSet,
  formatBytes,
}: MediaSectionProps) {
  const { t } = useTranslation('chat')

  return (
    <div className="bg-xon-surface-container border-b border-xon-surface-outline px-4 py-4">
      <SegmentedToggle
        value={activeTab}
        onChange={(val) => onTabChange(val as 'media' | 'documents' | 'links')}
        options={[
          { label: t('conversations.profile.media_tab', 'Media ({{count}})', { count: combinedMedia.length }), value: 'media' },
          { label: t('conversations.profile.docs_tab', 'Docs ({{count}})', { count: documentsMedia.length }), value: 'documents' },
          { label: t('conversations.profile.links_tab', 'Links ({{count}})', { count: linkMedia.length }), value: 'links' },
        ]}
      />

      {/* Media Tab */}
      {activeTab === 'media' && (
        <div className="mt-4">
          {isLoadingMedia ? (
            <p className="text-xs text-xon-text-secondary">Loading media…</p>
          ) : combinedMedia.length === 0 ? (
            <p className="text-xs text-xon-text-secondary">No media yet</p>
          ) : (
            <div className="space-y-4">
              {groupedMedia.map((group) => (
                <div key={group.key}>
                  <button
                    type="button"
                    onClick={() => onToggleGroup(`media:${group.key}`)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <p className="text-[11px] font-semibold text-xon-text-secondary uppercase tracking-wider mb-2">
                      {group.title}
                    </p>
                    <span className="mb-2 inline-flex items-center gap-1 text-xs text-xon-text-secondary">
                      <span>{group.items.length}</span>
                      {collapsedGroups[`media:${group.key}`] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                  {!collapsedGroups[`media:${group.key}`] && (
                    <div className="grid grid-cols-4 gap-1.5">
                      {group.items.map((item) => {
                        const url = item.media_url || ''
                        if (!url) return null
                        const normalizedUrl = normalizeMediaUrl(url)
                        const isVideo = (item.media_type || '').toLowerCase().startsWith('video')
                        const tileReactions = reactionsByMessageId.get(item.message_id) || []
                        const groupedTileReactions = (() => {
                          if (!tileReactions.length) return [] as Array<{ emoji: string; count: number }>
                          const byEmoji = new Map<string, number>()
                          for (const r of tileReactions) {
                            const e = String((r as any)?.emoji || '').trim()
                            if (!e) continue
                            byEmoji.set(e, (byEmoji.get(e) || 0) + 1)
                          }
                          return Array.from(byEmoji.entries()).map(([emoji, count]) => ({ emoji, count }))
                        })()

                        return (
                          <button
                            key={item.message_id}
                            type="button"
                            className="aspect-square rounded-md bg-xon-surface-container-hover border border-xon-surface-outline overflow-hidden group relative"
                            onClick={() => onOpenMediaViewer(item.message_id)}
                          >
                            {isVideo ? (
                              <>
                                <video
                                  src={normalizedUrl}
                                  className="w-full h-full object-cover"
                                  muted
                                  playsInline
                                  preload="metadata"
                                />
                                <div className="absolute inset-0 bg-xon-surface-shadow-1/30 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute inset-0 flex items-center justify-center">
                                  <div className="h-8 w-8 rounded-full bg-xon-surface-shadow-2/60 flex items-center justify-center">
                                    <Play className="h-4 w-4 text-xon-text-inverse" />
                                  </div>
                                </div>
                              </>
                            ) : (
                              <img
                                src={normalizedUrl}
                                alt="Shared media"
                                className="w-full h-full object-cover transition group-hover:opacity-90"
                              />
                            )}

                            {groupedTileReactions.length > 0 && (
                              <div className="absolute bottom-1 left-1 z-10">
                                <button
                                  type="button"
                                  className="flex items-center gap-1 px-2 py-0.5 rounded-full border border-xon-surface-outline bg-xon-surface-container/90 backdrop-blur text-[11px] shadow-sm hover:bg-xon-surface-container-hover transition-colors"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    onReactionsDetailsSet(tileReactions, {
                                      title: item.media_name || 'Media',
                                      thumbnailUrl: normalizedUrl,
                                    })
                                  }}
                                  aria-label="View reactions"
                                >
                                  {groupedTileReactions.slice(0, 3).map((r) => (
                                    <span key={r.emoji} className="inline-flex items-center gap-0.5">
                                      <span>{r.emoji}</span>
                                      {r.count > 1 && (
                                        <span className="text-[10px] text-foreground/70">{r.count}</span>
                                      )}
                                    </span>
                                  ))}
                                  {groupedTileReactions.length > 3 && (
                                    <span className="text-[10px] text-foreground/70">
                                      +{groupedTileReactions.length - 3}
                                    </span>
                                  )}
                                </button>
                              </div>
                            )}
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <ConversationMediaViewer
        conversationId={numericConversationId}
        open={isMediaViewerOpen}
        onOpenChange={onMediaViewerOpenChange}
        initialMessageId={mediaViewerMessageId}
        items={combinedMedia}
      />

      {reactionsDetailsOpen && (
        <MessageReactionsDetails
          open={reactionsDetailsOpen}
          onOpenChange={onReactionsDetailsOpenChange}
          reactions={reactionsDetailsReactions}
          context={reactionsDetailsContext}
        />
      )}

      {/* Documents Tab */}
      {activeTab === 'documents' && (
        <div className="mt-4">
          {isLoadingDocs ? (
            <p className="text-xs text-xon-text-secondary">Loading documents…</p>
          ) : documentsMedia.length === 0 ? (
            <p className="text-xs text-xon-text-secondary">No documents yet</p>
          ) : (
            <div className="space-y-4">
              {groupedDocuments.map((group) => (
                <div key={group.key}>
                  <button
                    type="button"
                    onClick={() => onToggleGroup(`docs:${group.key}`)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <p className="text-[11px] font-semibold text-xon-text-secondary uppercase tracking-wider mb-2">
                      {group.title}
                    </p>
                    <span className="mb-2 inline-flex items-center gap-1 text-xs text-xon-text-secondary">
                      <span>{group.items.length}</span>
                      {collapsedGroups[`docs:${group.key}`] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                  {!collapsedGroups[`docs:${group.key}`] && (
                    <div className="space-y-2">
                      {group.items.map((item) => {
                        const url = item.media_url || ''
                        if (!url) return null
                        const rawName = item.media_name || url.split('/').pop() || 'Document'
                        const name = decodeURIComponent(rawName)
                        const extMatch = name.includes('.') ? name.split('.').pop() : ''
                        const extLabel = extMatch ? extMatch.toUpperCase() : 'FILE'
                        return (
                          <button
                            key={item.message_id}
                            type="button"
                            onClick={() => window.open(url, '_blank')}
                            className="w-full flex items-center gap-3 p-3 rounded-xl bg-xon-surface-container border border-xon-surface-outline hover:bg-xon-surface-container-hover transition-colors text-left"
                          >
                            <div className="h-11 w-11 rounded-lg bg-xon-container-yellow flex items-center justify-center flex-shrink-0">
                              <FileText className="h-5 w-5 text-xon-text-yellow" />
                            </div>
                            <div className="min-w-0 flex-1 space-y-0.5">
                              <p className="text-sm font-semibold text-xon-text-primary truncate">{name}</p>
                              <div className="flex items-center gap-2 pt-0.5">
                                <span className="text-[11px] text-xon-text-secondary truncate">
                                  {extLabel} • {formatBytes(item.media_size)}
                                </span>
                              </div>
                            </div>
                          </button>
                        )
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Links Tab */}
      {activeTab === 'links' && (
        <div className="mt-4">
          {isLoadingLinkMedia ? (
            <p className="text-xs text-xon-text-secondary">Loading links…</p>
          ) : linkMedia.length === 0 ? (
            <p className="text-xs text-xon-text-secondary">No links yet</p>
          ) : (
            <div className="space-y-4">
              {groupedLinks.map((group) => (
                <div key={group.key}>
                  <button
                    type="button"
                    onClick={() => onToggleGroup(`links:${group.key}`)}
                    className="w-full flex items-center justify-between text-left"
                  >
                    <p className="text-[11px] font-semibold text-xon-text-secondary uppercase tracking-wider mb-2">
                      {group.title}
                    </p>
                    <span className="mb-2 inline-flex items-center gap-1 text-xs text-xon-text-secondary">
                      <span>{group.items.length}</span>
                      {collapsedGroups[`links:${group.key}`] ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronUp className="h-4 w-4" />
                      )}
                    </span>
                  </button>
                  {!collapsedGroups[`links:${group.key}`] && (
                    <div className="space-y-2">
                      {group.items.map((item) => {
                        const url = item.media_url || ''
                        if (!url) return null
                        return <ContactLinkRow key={item.message_id} id={item.message_id} url={url} />
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

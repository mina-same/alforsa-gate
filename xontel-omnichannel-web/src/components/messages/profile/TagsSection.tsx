import { Plus, Tag, Check, X, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { ContactTags } from '@/api/tags/types'

interface TagsSectionProps {
  tags: ContactTags[]
  filteredTags: ContactTags[]
  newTag: string
  exactMatch: ContactTags | undefined
  isAddingTagActive: boolean
  isAddingTag: boolean
  isLoadingAvailableTags: boolean
  isAssignedToMe: boolean
  onNewTagChange: (v: string) => void
  onToggleAddTag: () => void
  onAddTag: () => void
  onRemoveTag: (tagId: number) => void
  onTagToggle: (tagId: number, isAssigned: boolean) => void
}

export function TagsSection({
  tags, filteredTags, newTag, exactMatch,
  isAddingTagActive, isAddingTag, isLoadingAvailableTags, isAssignedToMe,
  onNewTagChange, onToggleAddTag, onAddTag, onRemoveTag, onTagToggle,
}: TagsSectionProps) {
  const { t } = useTranslation('chat')

  return (
    <div className="px-4 py-4 border-t border-xon-surface-outline">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-xon-text-secondary uppercase tracking-wide text-start">
          {t('conversations.profile.tags', 'TAGS')}
        </p>
        {isAssignedToMe && (
          <button
            onClick={onToggleAddTag}
            className="p-1 hover:bg-xon-surface-container-hover rounded-full transition-colors text-xon-text-primary"
            title="Add tag"
          >
            <Plus
              className={`h-4 w-4 transition-transform duration-200 ${isAddingTagActive ? 'rotate-45' : ''}`}
            />
          </button>
        )}
      </div>

      {isAddingTagActive && (
        <div className="mt-2 mb-2 bg-xon-surface-container border border-xon-surface-outline rounded-xl overflow-hidden shadow-sm">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-xon-text-secondary uppercase">
                Manage Tags
              </span>
              {newTag.trim() && !exactMatch && (
                <button
                  onClick={onAddTag}
                  disabled={isAddingTag}
                  className="flex items-center gap-1.5 px-3 py-1 bg-xon-primary text-white rounded-lg text-xs font-bold hover:bg-xon-primary/90 transition-all shadow-sm active:scale-95 disabled:opacity-50"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add "{newTag}"</span>
                </button>
              )}
            </div>
            <input
              type="text"
              value={newTag}
              onChange={(e) => onNewTagChange(e.target.value)}
              placeholder="Search or type new tag..."
              className="w-full bg-xon-surface-container-hover border border-xon-surface-outline rounded-lg text-sm outline-none text-xon-text-primary px-3 py-2 focus:ring-1 focus:ring-xon-primary/30 transition-all"
              disabled={isAddingTag}
              autoFocus
            />
          </div>

          <div className="border-t border-xon-surface-outline" />

          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {isLoadingAvailableTags ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-xon-text-secondary" />
              </div>
            ) : filteredTags.length > 0 ? (
              <div className="p-2 space-y-1">
                {filteredTags.map((tag) => {
                  const isAssigned = tags.some((t) => t.id === tag.id)
                  return (
                    <div
                      key={tag.id}
                      onClick={() => onTagToggle(tag.id, isAssigned)}
                      className={`flex items-center justify-between p-1 rounded-lg cursor-pointer transition-all ${
                        isAssigned ? 'bg-xon-primary/5' : 'hover:bg-xon-surface-container-hover'
                      }`}
                    >
                      <div
                        className="flex items-center gap-2 px-2 py-1 rounded-lg text-white text-sm font-semibold shadow-sm"
                        style={{ backgroundColor: tag.color || '#3b82f6' }}
                      >
                        <Tag className="h-4 w-4 fill-white/20" />
                        <span>{tag.name}</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center transition-all border ${
                          isAssigned ? 'bg-xon-primary border-xon-primary' : 'bg-transparent border-xon-surface-outline'
                        }`}
                      >
                        {isAssigned && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 px-4 text-center">
                <p className="text-xs text-xon-text-secondary italic">
                  {newTag.trim() ? `No matches for "${newTag}"` : 'No existing tags found'}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {tags.length > 0
          ? tags.map((tag) => (
              <div
                key={tag.id}
                className="inline-flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg text-white text-xs font-semibold shadow-sm group"
                style={{ backgroundColor: tag.color || '#3b82f6' }}
              >
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 fill-white/20" />
                  <span>{tag.name}</span>
                </div>
                <button
                  onClick={() => onRemoveTag(tag.id)}
                  className="p-0.5 hover:bg-black/10 rounded transition-colors"
                  title="Remove tag"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          : !isAddingTagActive && (
              <p className="text-xs text-xon-text-secondary italic text-start w-full">
                {t('conversations.profile.no_tags_found', 'No tags assigned')}
              </p>
            )}
      </div>
    </div>
  )
}

import { Plus, Tag, Check, X, Loader2 } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import type { Label } from '@/api/labels/types'

interface LabelsSectionProps {
  appliedLabels: Label[]
  availableLabels: Label[]
  filteredLabels: Label[]
  newLabel: string
  exactLabelMatch: Label | undefined
  isAddingLabelActive: boolean
  isLoadingAvailableLabels: boolean
  onNewLabelChange: (v: string) => void
  onToggleAddLabel: () => void
  onAddNewLabel: () => void
  onApplyLabel: (id: number) => void
  onRemoveLabel: (id: number) => void
}

export function LabelsSection({
  appliedLabels, filteredLabels, newLabel, exactLabelMatch,
  isAddingLabelActive, isLoadingAvailableLabels,
  onNewLabelChange, onToggleAddLabel, onAddNewLabel, onApplyLabel, onRemoveLabel,
}: LabelsSectionProps) {
  const { t } = useTranslation('chat')

  return (
    <div className="px-4 py-4 border-t border-xon-surface-outline">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold text-xon-text-secondary uppercase tracking-wide text-start">
          {t('conversations.profile.labels', 'LABELS')}
        </p>
        <button
          onClick={onToggleAddLabel}
          className="p-1 hover:bg-xon-surface-container-hover rounded-full transition-colors text-xon-text-primary"
          title={t('conversations.profile.add_label', 'Add label')}
        >
          <Plus
            className={`h-4 w-4 transition-transform duration-200 ${isAddingLabelActive ? 'rotate-45' : ''}`}
          />
        </button>
      </div>

      {isAddingLabelActive && (
        <div className="mt-2 mb-2 bg-xon-surface-container border border-xon-surface-outline rounded-xl overflow-hidden shadow-sm">
          <div className="p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-xon-text-secondary uppercase">
                {t('conversations.profile.manage_labels', 'Manage Labels')}
              </span>
              {newLabel.trim() && !exactLabelMatch && (
                <button
                  onClick={onAddNewLabel}
                  className="flex items-center gap-1.5 px-3 py-1 bg-xon-primary text-white rounded-lg text-xs font-bold hover:bg-xon-primary/90 transition-all shadow-sm active:scale-95"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{t('conversations.profile.add_label_name', 'Add "{{name}}"', { name: newLabel })}</span>
                </button>
              )}
            </div>
            <input
              type="text"
              value={newLabel}
              onChange={(e) => onNewLabelChange(e.target.value)}
              placeholder={t('conversations.profile.search_label_placeholder', 'Search or type new label...')}
              className="w-full bg-xon-surface-container-hover border border-xon-surface-outline rounded-lg text-sm outline-none text-xon-text-primary px-3 py-2 focus:ring-1 focus:ring-xon-primary/30 transition-all"
              autoFocus
            />
          </div>

          <div className="border-t border-xon-surface-outline" />

          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {isLoadingAvailableLabels ? (
              <div className="flex items-center justify-center py-6">
                <Loader2 className="h-5 w-5 animate-spin text-xon-text-secondary" />
              </div>
            ) : filteredLabels.length > 0 ? (
              <div className="p-2 space-y-1">
                {filteredLabels.map((label) => {
                  const isApplied = appliedLabels.some((l) => l.id === label.id)
                  return (
                    <div
                      key={label.id}
                      onClick={() => isApplied ? onRemoveLabel(label.id) : onApplyLabel(label.id)}
                      className={`flex items-center justify-between p-1 rounded-lg cursor-pointer transition-all ${
                        isApplied ? 'bg-xon-primary/5' : 'hover:bg-xon-surface-container-hover'
                      }`}
                    >
                      <div
                        className="flex items-center gap-2 px-2 py-1 rounded-lg text-white text-sm font-semibold shadow-sm"
                        style={{ backgroundColor: label.color || '#3b82f6' }}
                      >
                        <Tag className="h-4 w-4 fill-white/20" />
                        <span>{label.title}</span>
                      </div>
                      <div
                        className={`w-5 h-5 rounded flex items-center justify-center transition-all border ${
                          isApplied ? 'bg-xon-primary border-xon-primary' : 'bg-transparent border-xon-surface-outline'
                        }`}
                      >
                        {isApplied && <Check className="h-3.5 w-3.5 text-white stroke-[3]" />}
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="py-8 px-4 text-center">
                <p className="text-xs text-xon-text-secondary italic">
                  {newLabel.trim()
                    ? t('conversations.profile.no_label_matches', 'No matches for "{{name}}"', { name: newLabel })
                    : t('conversations.profile.no_labels_found', 'No existing labels found')}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {appliedLabels.length > 0
          ? appliedLabels.map((label) => (
              <div
                key={label.id}
                className="inline-flex items-center gap-2 pl-2 pr-1 py-1 rounded-lg text-white text-xs font-semibold shadow-sm"
                style={{ backgroundColor: label.color || '#3b82f6' }}
              >
                <div className="flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 fill-white/20" />
                  <span>{label.title}</span>
                </div>
                <button
                  onClick={() => onRemoveLabel(label.id)}
                  className="p-0.5 hover:bg-black/10 rounded transition-colors"
                  title={t('conversations.profile.remove_label', 'Remove label')}
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              </div>
            ))
          : !isAddingLabelActive && (
              <p className="text-xs text-xon-text-secondary italic text-start w-full">
                {t('conversations.profile.no_labels_assigned', 'No labels assigned')}
              </p>
            )}
      </div>
    </div>
  )
}

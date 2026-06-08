import React, { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Progress } from '@/components/ui/progress'

interface ChatCapacity {
  max: number | undefined
  current: number
  percent: number
}

interface ChatCapacitySectionProps {
  chatCapacity: ChatCapacity
}

export default function ChatCapacitySection({ chatCapacity }: ChatCapacitySectionProps) {
  const { t } = useTranslation(['chat', 'common'])

  const textColor = chatCapacity.percent <= 50 ? 'text-emerald-600' : chatCapacity.percent <= 85 ? 'text-yellow-600' : 'text-red-600'
  const statusText = chatCapacity.percent <= 50 ? 'Good' : chatCapacity.percent <= 85 ? 'Busy' : 'At Capacity'

  return (
    <section>
      <h3 className="text-xs font-semibold text-xon-text-secondary uppercase tracking-wider mb-4 px-1">
        {t('profile.chat_capacity', { defaultValue: 'Chat Capacity' })}
      </h3>
      <div className="bg-xon-surface-container rounded-2xl p-6 shadow-sm border border-xon-surface-outline">
        <div className="flex items-end justify-between mb-6 gap-4">
          <div>
            <span className="text-5xl font-bold text-xon-text-primary">
              {chatCapacity.current}
            </span>
            <span className="text-xon-text-secondary text-sm ml-3">
              / {chatCapacity.max ?? '∞'}
            </span>
          </div>
          <div className={`px-3 py-1 rounded-full text-xs font-semibold ${textColor} bg-white/20`}>
            {statusText}
          </div>
        </div>
        <div className="space-y-2">
          <Progress value={chatCapacity.percent} className="h-3 rounded-full" />
          <div className="flex justify-between items-center text-xs text-xon-text-secondary">
            <span>{chatCapacity.percent.toFixed(0)}%</span>
            <span>{t('profile.chats', { defaultValue: 'chats' })}</span>
          </div>
        </div>
        <p className="text-xs text-xon-text-secondary mt-4 leading-relaxed">
          {t('profile.chat_capacity_description', {
            defaultValue: 'Current active chats assigned to you.',
          })}
        </p>
      </div>
    </section>
  )
}

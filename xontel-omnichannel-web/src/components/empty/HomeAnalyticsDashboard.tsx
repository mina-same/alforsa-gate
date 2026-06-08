import React, { useState } from 'react'
import {
  MessageSquare,
  CheckCircle2,
  TrendingUp,
  UserCheck,
  Inbox,
  Calendar,
  BarChart3,
  RefreshCw,
} from 'lucide-react'
import { useMyAgentAnalytics } from '@/api/analytics/hooks'
import { useTranslation } from 'react-i18next'

/** Format a Date as "YYYY-MM-DDTHH:MM" (compatible with datetime-local input) */
const toDateTimeLocalString = (d: Date) => {
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

/** Append seconds to datetime-local value for the API */
const toApiDateTime = (val: string) => `${val}:00`

const now = new Date()

const todayStartLocal = () => {
  const d = new Date(now)
  d.setHours(0, 0, 0, 0)
  return toDateTimeLocalString(d)
}

const todayEndLocal = () => {
  const d = new Date(now)
  d.setHours(23, 59, 0, 0)
  return toDateTimeLocalString(d)
}

const weekStartLocal = () => {
  const d = new Date(now)
  d.setDate(d.getDate() - 6)
  d.setHours(0, 0, 0, 0)
  return toDateTimeLocalString(d)
}

const monthStartLocal = () => {
  const d = new Date(now)
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return toDateTimeLocalString(d)
}

const getQuickRanges = (t: (key: string) => string) => [
  { label: t('chat:analytics.quick_ranges.today'), getStart: todayStartLocal, getEnd: todayEndLocal },
  { label: t('chat:analytics.quick_ranges.this_week'), getStart: weekStartLocal, getEnd: todayEndLocal },
  { label: t('chat:analytics.quick_ranges.this_month'), getStart: monthStartLocal, getEnd: todayEndLocal },
]

interface StatCardProps {
  icon: React.ReactNode
  label: string
  value: string | number
  color: string
  bg: string
  isLoading: boolean
}

function StatCard({ icon, label, value, color, bg, isLoading }: StatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border bg-card p-4 shadow-sm hover:shadow-md transition-all duration-200 group">
      <div className={`h-9 w-9 rounded-xl ${bg} ${color} flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      {isLoading ? (
        <div className="h-8 w-14 rounded-lg bg-muted animate-pulse" />
      ) : (
        <span className="text-2xl font-bold text-foreground tabular-nums">{value}</span>
      )}
      <span className="text-xs text-muted-foreground font-medium leading-tight">{label}</span>
    </div>
  )
}

export default function HomeAnalyticsDashboard() {
  const [startDate, setStartDate] = useState(todayStartLocal)
  const [endDate, setEndDate] = useState(todayEndLocal)
  const [activeRange, setActiveRange] = useState('')
  const { t } = useTranslation(['chat', 'common'])

  const QUICK_RANGES = getQuickRanges(t)

  const { data, isLoading, refetch, isFetching } = useMyAgentAnalytics({
    start_date: toApiDateTime(startDate),
    end_date: toApiDateTime(endDate),
  })

  const handleQuickRange = (range: (typeof QUICK_RANGES)[0]) => {
    const start = range.getStart()
    const end = range.getEnd()
    setStartDate(start)
    setEndDate(end)
    setActiveRange(range.label)
  }

  const handleStartChange = (val: string) => {
    setStartDate(val)
    setActiveRange('')
  }

  const handleEndChange = (val: string) => {
    setEndDate(val)
    setActiveRange('')
  }

  const resolutionRate =
    data == null
      ? '—'
      : data.resolution_rate <= 1
      ? `${(data.resolution_rate * 100).toFixed(1)}%`
      : `${data.resolution_rate.toFixed(1)}%`

  const stats: StatCardProps[] = [
    {
      label: t('chat:analytics.metrics.messages_sent'),
      value: data?.messages_sent.total ?? '—',
      icon: <MessageSquare className="w-5 h-5" />,
      color: 'text-blue-500',
      bg: 'bg-blue-500/10',
      isLoading,
    },
    {
      label: t('chat:analytics.metrics.assigned_messages'),
      value: data?.assigned_conversation_messages.total ?? '—',
      icon: <Inbox className="w-5 h-5" />,
      color: 'text-violet-500',
      bg: 'bg-violet-500/10',
      isLoading,
    },
    {
      label: t('chat:analytics.metrics.conversations_assigned'),
      value: data?.conversations_assigned ?? '—',
      icon: <UserCheck className="w-5 h-5" />,
      color: 'text-amber-500',
      bg: 'bg-amber-500/10',
      isLoading,
    },
    {
      label: t('chat:analytics.metrics.conversations_resolved'),
      value: data?.conversations_resolved ?? '—',
      icon: <CheckCircle2 className="w-5 h-5" />,
      color: 'text-emerald-500',
      bg: 'bg-emerald-500/10',
      isLoading,
    },
    {
      label: t('chat:analytics.metrics.resolution_rate'),
      value: isLoading ? '—' : resolutionRate,
      icon: <TrendingUp className="w-5 h-5" />,
      color: 'text-rose-500',
      bg: 'bg-rose-500/10',
      isLoading,
    },
  ]

  return (
    <section className="bg-xon-surface-container rounded-3xl p-4 shadow-lg border border-xon-surface-outline/50 hover:shadow-xl transition-shadow">
    <div className="w-full max-w-4xl mx-auto">
      {/* Header row */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-base font-bold text-foreground leading-tight">{t('chat:analytics.title')}</h2>
            <p className="text-xs text-muted-foreground">{t('chat:analytics.subtitle')}</p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => refetch()}
          disabled={isFetching}
          title={t('chat:analytics.refresh_title')}
          className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-muted/40 text-muted-foreground transition-all disabled:opacity-50"
        >
          <RefreshCw className={`h-4 w-4 ${isFetching ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Controls: quick range buttons + date pickers */}
      <div className="flex flex-col col-span-2 lg:col-span-4 gap-2 mb-5">
        <div className="flex items-center gap-1.5 flex-wrap">
          {QUICK_RANGES.map((range) => (
            <button
              key={range.label}
              type="button"
              onClick={() => handleQuickRange(range)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeRange === range.label
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/40 text-muted-foreground hover:bg-muted/70'
              }`}
            >
              {range.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-1.5">
          <div className="relative flex items-center flex-1 min-w-0">
            <Calendar className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none z-10" />
            <input
              type="datetime-local"
              value={startDate}
              max={endDate}
              onChange={(e) => handleStartChange(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer hover:border-primary/50 transition-colors"
            />
          </div>
          <span className="text-xs text-muted-foreground font-medium shrink-0">–</span>
          <div className="relative flex items-center flex-1 min-w-0">
            <Calendar className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none z-10" />
            <input
              type="datetime-local"
              value={endDate}
              min={startDate}
              onChange={(e) => handleEndChange(e.target.value)}
              className="w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 cursor-pointer hover:border-primary/50 transition-colors"
            />
          </div>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
        {stats.map((stat, i) => (
          <div key={stat.label} className={i === stats.length - 1 && stats.length % 2 !== 0 ? 'col-span-1 md:col-span-2 lg:col-span-1' : ''}>
            <StatCard {...stat} />
          </div>
        ))}
      </div>

      {data && (
        <p className="text-[11px] text-muted-foreground mt-3 text-right">
          {data.agent_name} · {data.is_active ? 'Active' : 'Inactive'}
        </p>
      )}
    </div>
    </section>
  )
}
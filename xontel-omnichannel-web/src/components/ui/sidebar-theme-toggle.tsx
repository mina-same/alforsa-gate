import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Sun, Moon } from 'lucide-react'
import { useSidebar } from './sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

type Theme = 'light' | 'dark'

function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light'

  const stored = window.localStorage.getItem('theme')
  if (stored === 'light' || stored === 'dark') return stored

  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches
  return prefersDark ? 'dark' : 'light'
}

function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return
  const root = document.documentElement
  if (theme === 'dark') {
    root.classList.add('dark')
  } else {
    root.classList.remove('dark')
  }
  window.localStorage.setItem('theme', theme)
}

export function SidebarThemeToggle() {
  const { i18n, t } = useTranslation("chat")
  const { state } = useSidebar()
  const [theme, setTheme] = useState<Theme>('light')
  const isRTL = i18n.language === 'ar'
  const isCollapsed = state === 'collapsed'

  useEffect(() => {
    const initial = getInitialTheme()
    setTheme(initial)
    applyTheme(initial)
  }, [])

  const isDark = theme === 'dark'

  const handleToggle = () => {
    const next: Theme = isDark ? 'light' : 'dark'
    setTheme(next)
    applyTheme(next)
  }

  const Icon = isDark ? Sun : Moon
  const label = isDark ? t("interface.light") : t("interface.dark")
  const ariaLabel = isDark ? t("interface.light_mode_toggle") : t("interface.dark_mode_toggle")

  const button = (
    <button
      type="button"
      onClick={handleToggle}
      className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:text-sidebar-accent-foreground ${!isCollapsed ? 'w-full px-2' : ''} ${isRTL && !isCollapsed ? 'flex-row' : ''}`}
      aria-label={ariaLabel}
    >
      <span className="flex items-center justify-center w-8 h-8 rounded-[12px] border border-xon-surface-outline-2 bg-xon-surface-container shrink-0 transition-all duration-200 hover:bg-sidebar-accent">
        <Icon className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} shrink-0 transition-transform duration-300 ${isDark ? 'rotate-0' : 'rotate-180'}`} />
      </span>
      {!isCollapsed && (
        <span className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>{label}</span>
      )}
    </button>
  )

  return isCollapsed ? (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent side="right" align="center">
        <p>{label}</p>
      </TooltipContent>
    </Tooltip>
  ) : (
    button
  )
}

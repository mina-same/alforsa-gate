import React, { useEffect, useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import { Button } from './button'

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

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light')

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

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      className="ml-auto h-9 w-9 rounded-full border border-white/20 bg-white text-slate-900 shadow-md shadow-black/20 transition-all duration-200 hover:bg-slate-100 hover:shadow-lg dark:bg-slate-900 dark:text-white dark:border-white/30 dark:hover:bg-slate-800"
      onClick={handleToggle}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
    >
      {isDark ? (
        <Sun className="h-4 w-4" />
      ) : (
        <Moon className="h-4 w-4" />
      )}
    </Button>
  )
}



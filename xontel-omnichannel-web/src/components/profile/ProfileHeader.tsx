import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'
import { ArrowLeft, Moon, Sun } from 'lucide-react'

interface ProfileHeaderProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export default function ProfileHeader({ theme, toggleTheme }: ProfileHeaderProps) {
  const { t, i18n } = useTranslation(['chat', 'common'])
  const navigate = useNavigate()
  const isRTL = i18n.dir() === 'rtl'

  return (
    <header className="h-16 border-b border-xon-surface-outline bg-xon-surface-container flex items-center justify-between px-6">
      <div className="flex items-center gap-3 min-w-0">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-xl"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className={`h-5 w-5 ${isRTL ? 'rotate-180' : ''}`} />
        </Button>
        <h1 className="text-lg font-semibold truncate">{t('profile.title')}</h1>
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="rounded-xl border-xon-surface-outline bg-xon-surface-container hover:bg-xon-surface-container-hover flex items-center"
          onClick={toggleTheme}
        >
          {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          <span className="ml-2 text-xs font-medium">
            {theme === 'dark' ? t('profile.theme.dark') : t('profile.theme.light')}
          </span>
        </Button>
      </div>
    </header>
  )
}

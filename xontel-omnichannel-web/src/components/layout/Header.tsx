import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import logoDark from '@assets/logos/logoDark.svg'
import logoArDark from '@assets/logos/logoArDark.svg'
import logoAr from '@assets/logos/logoAr.svg'
import logoLight from '@assets/logos/logoLight.svg'
import { ThemeToggle } from '@components/ui/theme-toggle'
import { LanguageSwitcher } from '@components/ui/language-switcher'

export default function Header() {
  const { i18n } = useTranslation()
  const isRTL = i18n.language === 'ar'
  const [isDarkMode, setIsDarkMode] = useState(false)

  useEffect(() => {
    // Check initial theme
    const isDark = document.documentElement.classList.contains('dark')
    setIsDarkMode(isDark)

    // Listen for theme changes
    const observer = new MutationObserver(() => {
      const isDark = document.documentElement.classList.contains('dark')
      setIsDarkMode(isDark)
    })

    observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
    return () => observer.disconnect()
  }, [])

  const currentLogo = isDarkMode ? (isRTL ? logoArDark : logoDark) : (isRTL ? logoAr : logoLight)

  return (
    <header className={`w-full border-b border-border/30 bg-transparent backdrop-blur-sm ${isRTL ? 'rtl' : 'ltr'}`}>
      <div className="flex items-center justify-between px-6 py-4">
        {/* Logo */}
        <img src={currentLogo} alt="Telsip" className="h-10 w-auto pl-5" />

        {/* Switchers */}
        <div className="flex items-center gap-2 pr-5">
          <LanguageSwitcher />
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}

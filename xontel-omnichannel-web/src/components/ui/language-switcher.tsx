import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { Button } from './button'
import { SUPPORTED_LANGUAGES, LANGUAGE_STORAGE_KEY } from '../../i18n'
import { Globe, Check, ChevronDown } from 'lucide-react'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()
  const navigate = useNavigate()
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const currentLang = i18n.language || 'en'

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])



  const handleLanguageChange = async (lang: string) => {
    if (lang === currentLang) {
      setIsOpen(false)
      return
    }

    try {
      await i18n.changeLanguage(lang)
    } catch (e) {
      console.error('changeLanguage failed', e)
    }

    // Update document direction
    try {
      document.documentElement.lang = lang
      document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr'
    } catch (e) {
      // ignore
    }

    // // Update storage
    // localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    // setIsOpen(false)

    // // Update URL: swap /en with /ar or vice versa
    // // Handle both /:lng/path and /path patterns
    // let newPath = location.pathname
    
    // // If path starts with /en or /ar, replace it
    // if (/^\/(en|ar)(\/|$)/.test(newPath)) {
    //   newPath = newPath.replace(/^\/(en|ar)/, `/${lang}`)
    // } else {
    //   // If no language prefix, add it
    //   newPath = `/${lang}${newPath}`
    // }

    // // Navigate without reload
    // navigate(newPath + location.search, { replace: true })
  }

  const getLanguageInfo = (lang: string) => {
    const info: Record<string, { name: string; flag: string; nativeName: string }> = {
      en: { name: 'English', flag: '🇬🇧', nativeName: 'English' },
      ar: { name: 'Arabic', flag: '🇸🇦', nativeName: 'العربية' },
    }
    return info[lang] || { name: lang, flag: '🌐', nativeName: lang }
  }

  const currentLangInfo = getLanguageInfo(currentLang)
  const isRTL = currentLang === 'ar'

  return (
    <div className="relative">
      <Button
        ref={buttonRef}
        type="button"
        variant="outline"
        className="h-9 px-3 rounded-full border border-white/20 bg-white text-slate-900 shadow-md shadow-black/20 transition-all duration-200 hover:bg-slate-100 hover:shadow-lg dark:bg-slate-900 dark:text-white dark:border-white/30 dark:hover:bg-slate-800 flex items-center gap-2"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={`Switch language. Current: ${currentLangInfo.nativeName}`}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <Globe className="w-4 h-4" />
        <span className="text-xs font-semibold">{currentLang.toUpperCase()}</span>
        <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
      </Button>

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute mt-2 w-48 rounded-lg border border-white/20 bg-white shadow-xl dark:bg-slate-900 dark:border-white/30 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 ${isRTL ? 'left-0' : 'right-0'
            }`}
          role="listbox"
        >
          {SUPPORTED_LANGUAGES.map((lang, index) => {
            const langInfo = getLanguageInfo(lang)
            const isSelected = currentLang === lang
            return (
              <button
                key={lang}
                onClick={() => handleLanguageChange(lang)}
                className={`w-full px-4 py-3 text-left text-sm transition-all duration-150 flex items-center justify-between group ${isSelected
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : 'text-foreground hover:bg-accent/50 dark:hover:bg-slate-800/50'
                  } ${index !== SUPPORTED_LANGUAGES.length - 1 ? 'border-b border-white/10 dark:border-white/5' : ''}`}
                role="option"
                aria-selected={isSelected}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{langInfo.flag}</span>
                  <div className="flex flex-col">
                    <span className="font-medium">{langInfo.name}</span>
                    <span className={`text-xs ${isSelected ? 'opacity-90' : 'opacity-60'}`}>
                      {langInfo.nativeName}
                    </span>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

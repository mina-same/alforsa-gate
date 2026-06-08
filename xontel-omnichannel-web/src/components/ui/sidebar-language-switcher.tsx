import React, { useState, useRef, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate, useLocation } from 'react-router-dom'
import { SUPPORTED_LANGUAGES, LANGUAGE_STORAGE_KEY } from '../../i18n'
import { Globe, Check, ChevronDown } from 'lucide-react'
import { useSidebar } from './sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from './tooltip'

export function SidebarLanguageSwitcher() {
  const { i18n, t } = useTranslation("chat")
  const navigate = useNavigate()
  const location = useLocation()
  const { state } = useSidebar()
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  const currentLang = i18n.language || 'en'
  const isCollapsed = state === 'collapsed'

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

  const handleLanguageChange = (lang: string) => {
    if (lang === currentLang) {
      setIsOpen(false)
      return
    }

    i18n.changeLanguage(lang)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    setIsOpen(false)

    // Update URL with new language prefix
    const pathWithoutLang = location.pathname.replace(/^\/(en|ar)/, '')
    const newPath = `/${pathWithoutLang || '/'}`
    navigate(newPath)
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

  const button = (
    <button
      ref={buttonRef}
      type="button"
      onClick={() => setIsOpen(!isOpen)}
      className={`flex items-center gap-2 text-sm font-medium transition-all duration-200 hover:text-sidebar-accent-foreground ${!isCollapsed ? 'w-full px-2' : ''} ${isRTL && !isCollapsed ? 'flex-row' : ''}`}
      aria-label={`Switch language. Current: ${currentLangInfo.nativeName}`}
      aria-expanded={isOpen}
      aria-haspopup="listbox"
    >
      <span className="flex items-center justify-center w-8 h-8 rounded-[12px] border border-xon-surface-outline-2 bg-xon-surface-container shrink-0 transition-all duration-200 hover:bg-sidebar-accent">
        <Globe className={`${isCollapsed ? 'w-5 h-5' : 'w-4 h-4'} shrink-0`} />
      </span>
      {!isCollapsed && (
        <>
          <span className={`flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>{t(`languages.${currentLang}`)}</span>
          <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
        </>
      )}
    </button>
  )

  return (
    <div className={`relative ${!isCollapsed ? 'w-full' : ''}`}>
      {isCollapsed ? (
        <Tooltip>
          <TooltipTrigger asChild>{button}</TooltipTrigger>
          <TooltipContent side="right" align="center">
            <p>{currentLangInfo.name}</p>
          </TooltipContent>
        </Tooltip>
      ) : (
        button
      )}

      {isOpen && (
        <div
          ref={dropdownRef}
          className={`absolute ${isCollapsed
              ? isRTL
                ? 'right-full mr-2 top-0'
                : 'left-full ml-2 top-0'
              : 'bottom-full mb-2'
            }  bg-sidebar shadow-lg z-50 overflow-hidden animate-in fade-in ${isCollapsed
              ? isRTL
                ? 'slide-in-from-right-2'
                : 'slide-in-from-left-2'
              : 'slide-in-from-bottom-2'
            } duration-200 ${isRTL && !isCollapsed ? 'right-0' : !isCollapsed ? 'left-0' : ''
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
                className={`w-full px-3 py-2 text-sm transition-all duration-150 flex items-center justify-between ${isSelected
                  ? 'bg-sidebar-primary text-sidebar-primary-foreground font-semibold'
                  : 'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  } ${index !== SUPPORTED_LANGUAGES.length - 1 ? 'border-b border-sidebar-border' : ''} ${isRTL ? 'flex-row' : ''}`}
                role="option"
                aria-selected={isSelected}
              >
                <div className={`flex items-center gap-2 ${isRTL ? 'flex-row' : ''}`}>
                  <span className="text-base">{langInfo.flag}</span>
                  <div className={`flex flex-col ${isRTL ? 'text-right' : 'text-left'}`}>
                    <span className="font-medium">{langInfo.name}</span>
                    <span className={`text-xs ${isSelected ? 'opacity-90' : 'opacity-60'}`}>
                      {langInfo.nativeName}
                    </span>
                  </div>
                </div>
                {isSelected && <Check className="w-4 h-4 shrink-0" />}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

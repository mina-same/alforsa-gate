import React from 'react'
import { useTranslation } from 'react-i18next'
import { SUPPORTED_LANGUAGES, LANGUAGE_STORAGE_KEY } from '@/i18n'

export default function LanguageSettingsSection() {
  const { t, i18n } = useTranslation(['chat', 'common'])

  const handleLanguageChange = (lang: string) => {
    if (lang === i18n.language) return
    i18n.changeLanguage(lang)
    localStorage.setItem(LANGUAGE_STORAGE_KEY, lang)
    const pathWithoutLang = window.location.pathname.replace(/^\/(en|ar)/, '')
    window.history.replaceState(null, '', `/${lang}${pathWithoutLang || '/'}` + window.location.search)
  }

  const currentLanguageInfo = SUPPORTED_LANGUAGES.map(lang => ({
    code: lang,
    name: t(`languages.${lang}`),
    flag: lang === 'en' ? '🇬🇧' : '🇸🇦',
  }))

  return (
    <section>
      <h3 className="text-xs font-semibold text-xon-text-secondary uppercase tracking-wider mb-4 px-1">
        {t('profile.settings')}
      </h3>
      <div className="bg-xon-surface-container rounded-2xl p-6 shadow-sm border border-xon-surface-outline">
        <div className="space-y-4">
          <div>
            <p className="text-sm font-semibold text-xon-text-primary">
              {t('profile.language')}
            </p>
            <p className="text-xs text-xon-text-secondary mt-1">
              {t('profile.language_description', {
                defaultValue: 'Affects the whole application interface.',
              })}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {currentLanguageInfo.map((lang) => {
              const isSelected = i18n.language === lang.code
              return (
                <button
                  key={lang.code}
                  onClick={() => handleLanguageChange(lang.code)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-medium transition-all duration-200 shadow-sm ${
                    isSelected
                      ? 'border-xon-primary bg-gradient-to-r from-xon-primary/10 to-xon-primary/5 text-xon-primary shadow-md ring-2 ring-xon-primary/20'
                      : 'border-xon-surface-outline hover:bg-gradient-to-r hover:from-xon-primary/5 hover:to-transparent hover:border-xon-primary/30 hover:shadow-md'
                  }`}
                >
                  <span className="text-base">{lang.flag}</span>
                  <span>{lang.name}</span>
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </section>
  )
}

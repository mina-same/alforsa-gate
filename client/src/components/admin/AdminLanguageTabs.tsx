import { cn } from '@/lib/utils'

export type AdminLanguage = 'en' | 'ar'

const LANGS: { code: AdminLanguage; flag: string; label: string }[] = [
  { code: 'en', flag: '🇬🇧', label: 'English' },
  { code: 'ar', flag: '🇸🇦', label: 'العربية' },
]

interface Props {
  activeLanguage: AdminLanguage
  onLanguageChange: (lang: AdminLanguage) => void
}

export default function AdminLanguageTabs({ activeLanguage, onLanguageChange }: Props) {
  return (
    <div className="flex items-center gap-2 p-1 bg-gray-100 rounded-lg w-fit">
      {LANGS.map(({ code, flag, label }) => (
        <button
          key={code}
          type="button"
          onClick={() => onLanguageChange(code)}
          className={cn(
            'flex items-center gap-2 px-4 py-1.5 rounded-md text-sm font-medium transition-all',
            activeLanguage === code
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          )}
        >
          <span className="text-base leading-none">{flag}</span>
          <span>{label}</span>
        </button>
      ))}
    </div>
  )
}

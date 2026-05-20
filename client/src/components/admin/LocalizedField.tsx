import { cn } from '@/lib/utils'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import type { AdminLanguage } from './AdminLanguageTabs'

type Loc = { en: string; ar?: string }

interface BaseProps {
  label: string
  value: Loc
  onChange: (val: Loc, lang?: AdminLanguage) => void
  activeLanguage: AdminLanguage
  placeholder?: string
  required?: boolean
  error?: boolean
  errorMessage?: string
}

export function LocalizedInput({
  label, value, onChange, activeLanguage, placeholder, required, error, errorMessage,
}: BaseProps) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <Input
        value={value[activeLanguage] ?? ''}
        onChange={e => onChange({ ...value, [activeLanguage]: e.target.value }, activeLanguage)}
        dir={activeLanguage === 'ar' ? 'rtl' : 'ltr'}
        placeholder={placeholder}
        className={cn(error && 'border-red-400 focus-visible:ring-red-400')}
      />
      {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
    </div>
  )
}

export function LocalizedTextarea({
  label, value, onChange, activeLanguage, placeholder, required, error, errorMessage, rows = 4,
}: BaseProps & { rows?: number }) {
  return (
    <div className="space-y-1.5">
      <Label>
        {label}
        {required && <span className="text-red-500 ml-0.5">*</span>}
      </Label>
      <Textarea
        value={value[activeLanguage] ?? ''}
        onChange={e => onChange({ ...value, [activeLanguage]: e.target.value }, activeLanguage)}
        dir={activeLanguage === 'ar' ? 'rtl' : 'ltr'}
        placeholder={placeholder}
        rows={rows}
        className={cn(error && 'border-red-400 focus-visible:ring-red-400')}
      />
      {errorMessage && <p className="text-xs text-red-500">{errorMessage}</p>}
    </div>
  )
}

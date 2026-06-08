import React from 'react'
import { useTranslation } from 'react-i18next'
import { Check } from 'lucide-react'

interface RobotCheckboxProps {
  checked: boolean
  onChange: (checked: boolean) => void
}

export default function RobotCheckbox({ checked, onChange }: RobotCheckboxProps) {
  const { t, i18n } = useTranslation('login')
  const isRTL = i18n.language === 'ar'

  return (
    <div 
      className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-all duration-200 cursor-pointer ${
        checked
          ? 'border-xon-primary bg-xon-container-blue'
          : 'border-xon-surface-outline bg-xon-surface-container-hover hover:border-xon-primary/60'
      }`}
      onClick={() => onChange(!checked)}
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault()
          onChange(!checked)
        }
      }}
    >
      {/* Checkbox */}
      <div className={`relative flex h-5 w-5 flex-shrink-0 items-center justify-center rounded border transition-all duration-200 ${
        checked
          ? 'border-xon-primary bg-xon-primary'
          : 'border-xon-surface-outline bg-xon-surface-container'
      }`}>
        {checked && (
          <Check className="h-3.5 w-3.5 text-xon-primary-on animate-in zoom-in-50 duration-150" />
        )}
      </div>

      {/* Content */}
      <div className={`flex flex-1 flex-col gap-0.5 ${isRTL ? 'text-right' : 'text-left'}`}>
        <label
          className="cursor-pointer text-sm font-medium text-xon-text-primary"
        >
          {t('robot_check_label') || "I'm not a robot"}
        </label>
        <span className="text-xs text-xon-text-secondary">
          {t('robot_check_description') || 'Verify that you are human'}
        </span>
      </div>
    </div>
  )
}

import { useState, type ReactNode, type InputHTMLAttributes, type TextareaHTMLAttributes } from 'react'
import type { AdminLanguage } from './AdminLanguageTabs'

export type Loc = { en: string; ar?: string }

// ─── Lang toggle (flag buttons) ───────────────────────────────────────────────

export function FieldLangTabs({ lang, onChange }: { lang: AdminLanguage; onChange: (l: AdminLanguage) => void }) {
  return (
    <div className="atf-field-lang-tabs" aria-label="Field language">
      <button
        type="button"
        className={`atf-field-lang-tab${lang === 'en' ? ' atf-field-lang-tab--active' : ''}`}
        onMouseDown={e => { e.preventDefault(); onChange('en') }}
        aria-label="English"
      >🇬🇧</button>
      <button
        type="button"
        className={`atf-field-lang-tab${lang === 'ar' ? ' atf-field-lang-tab--active' : ''}`}
        onMouseDown={e => { e.preventDefault(); onChange('ar') }}
        aria-label="Arabic"
      >🇸🇦</button>
    </div>
  )
}

// ─── Field wrapper ────────────────────────────────────────────────────────────

export function Field({ label, required, hint, error, labelChildren, children }: {
  label: string
  required?: boolean
  hint?: string
  error?: string
  labelChildren?: ReactNode
  children: ReactNode
}) {
  return (
    <div className="atf-field">
      {label && (
        <div className="atf-label-row">
          <label className="atf-label">
            {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
          </label>
          {labelChildren && <div className="atf-label-row__actions">{labelChildren}</div>}
        </div>
      )}
      {children}
      {hint && !error && <p className="atf-hint" style={{ marginTop: 4, marginBottom: 0 }}>{hint}</p>}
      {error && (
        <div className="atf-field-error">
          <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#dc2626"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}
    </div>
  )
}

// ─── Plain input / textarea ───────────────────────────────────────────────────

export function TextInput({ error, ...props }: InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...props}
      className={`atf-input${props.className ? ` ${props.className}` : ''}`}
      style={error ? { ...props.style, borderColor: '#dc2626' } : props.style}
    />
  )
}

export function TextArea({ error, ...props }: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      {...props}
      className={`atf-input atf-textarea${props.className ? ` ${props.className}` : ''}`}
      style={error ? { ...props.style, borderColor: '#dc2626' } : props.style}
    />
  )
}

// ─── Localized single-field input with flag toggle ────────────────────────────

export function LInput({ label, value, lang = 'en', onChange, placeholder, required, hint, error, errorMsg, labelChildren }: {
  label: string
  value: Loc
  lang?: AdminLanguage
  onChange: (v: Loc) => void
  placeholder?: string
  required?: boolean
  hint?: string
  error?: boolean
  errorMsg?: string
  labelChildren?: ReactNode
}) {
  const [activeLang, setActiveLang] = useState<AdminLanguage>(lang)
  const val = value[activeLang] ?? ''
  const isRtl = activeLang === 'ar'
  return (
    <Field label={label} required={required} hint={hint} error={errorMsg} labelChildren={labelChildren}>
      <div className={`atf-input-with-lang${isRtl ? ' atf-input-with-lang--rtl' : ''}`}>
        <TextInput
          value={val}
          onChange={e => onChange({ ...value, [activeLang]: e.target.value })}
          placeholder={placeholder}
          dir={isRtl ? 'rtl' : 'ltr'}
          error={error}
        />
        <FieldLangTabs lang={activeLang} onChange={setActiveLang} />
      </div>
    </Field>
  )
}

// ─── Localized textarea with flag toggle ──────────────────────────────────────

export function LTextarea({ label, value, lang = 'en', onChange, placeholder, required, hint, error, errorMsg, minHeight = 100 }: {
  label: string
  value: Loc
  lang?: AdminLanguage
  onChange: (v: Loc) => void
  placeholder?: string
  required?: boolean
  hint?: string
  error?: boolean
  errorMsg?: string
  minHeight?: number
}) {
  const [activeLang, setActiveLang] = useState<AdminLanguage>(lang)
  const val = value[activeLang] ?? ''
  const isRtl = activeLang === 'ar'
  return (
    <Field label={label} required={required} hint={hint} error={errorMsg}>
      <div className={`atf-textarea-with-lang${isRtl ? ' atf-textarea-with-lang--rtl' : ''}`}>
        <TextArea
          value={val}
          onChange={e => onChange({ ...value, [activeLang]: e.target.value })}
          placeholder={placeholder}
          dir={isRtl ? 'rtl' : 'ltr'}
          error={error}
          style={{ minHeight, resize: 'vertical' }}
        />
        <FieldLangTabs lang={activeLang} onChange={setActiveLang} />
      </div>
    </Field>
  )
}

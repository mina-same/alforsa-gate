import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ListChecks, FileText, Globe,
  Save, Loader2, ArrowLeft, Plus, X, Star, Eye, EyeOff, AlertCircle,
} from 'lucide-react'
import { tourService } from '../../../services/tourService'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import { type AdminLanguage } from '../AdminLanguageTabs'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Props { tourId?: string; onSaved: () => void; onCancel: () => void }

type Loc = { en: string; ar?: string }

const CURRENCIES = ['EGP', 'USD', 'SAR'] as const
type Currency = typeof CURRENCIES[number]

const defaultLoc = (): Loc => ({ en: '', ar: '' })

const defaultForm = () => ({
  heading:            defaultLoc(),
  slug:               defaultLoc(),
  Description:        { header: defaultLoc(), text: defaultLoc() },
  images:             [{ url: '', alt: '' }],
  tourLocation:       defaultLoc(),
  tourAvailability:   defaultLoc(),
  pickupAndDropOff:   defaultLoc(),
  tourType:           defaultLoc(),
  tourStyle:          defaultLoc(),
  duration:           defaultLoc(),
  meetingPoint:       defaultLoc(),
  cancellationPolicy: defaultLoc(),
  priceStartingFrom:  { EGP: 0, USD: 0, SAR: 0 } as Record<Currency, number>,
  inclusion:          [defaultLoc()],
  exclusion:          [defaultLoc()],
  tourHighlights:     [defaultLoc()],
  tourMapIframe:      '',
  isActive:           true,
  isFeatured:         false,
})

type FormData = ReturnType<typeof defaultForm>

// ─────────────────────────────────────────────────────────────────────────────
// Primitive UI atoms
// ─────────────────────────────────────────────────────────────────────────────

const inputBase = [
  'h-9 w-full rounded-lg border bg-white px-3 text-sm text-gray-900',
  'placeholder:text-gray-300 outline-none transition-colors',
  'hover:border-gray-300',
].join(' ')

const inputNormal = 'border-gray-200 focus:border-[#560ce3] focus:ring-2 focus:ring-[#560ce3]/10'
const inputError  = 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-400/10'

function FInput({
  value, onChange, placeholder, type = 'text', dir, error, className,
}: {
  value: string; onChange: (v: string) => void; placeholder?: string
  type?: string; dir?: string; error?: boolean; className?: string
}) {
  return (
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      dir={dir}
      className={cn(inputBase, error ? inputError : inputNormal, className)}
    />
  )
}

function FTextarea({
  value, onChange, placeholder, rows = 4, dir, error,
}: {
  value: string; onChange: (v: string) => void
  placeholder?: string; rows?: number; dir?: string; error?: boolean
}) {
  return (
    <textarea
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      dir={dir}
      className={cn(
        'w-full rounded-lg border bg-white px-3 py-2 text-sm text-gray-900',
        'placeholder:text-gray-300 outline-none transition-colors resize-none',
        'hover:border-gray-300',
        error ? inputError : inputNormal,
      )}
    />
  )
}

/** Labelled field wrapper */
function F({
  label, required, hint, error, children,
}: {
  label: string; required?: boolean; hint?: string; error?: string; children: React.ReactNode
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-gray-500">
        {label}{required && <span className="text-red-400 ml-0.5">*</span>}
      </p>
      {children}
      {hint  && !error && <p className="text-[11px] text-gray-400 leading-none">{hint}</p>}
      {error && (
        <p className="text-[11px] text-red-500 flex items-center gap-1 leading-none">
          <AlertCircle className="w-2.5 h-2.5 shrink-0" />{error}
        </p>
      )}
    </div>
  )
}

/** Card with header row */
function Card({
  title, subtitle, children, className,
}: {
  title: string; subtitle?: string; children: React.ReactNode; className?: string
}) {
  return (
    <div className={cn('rounded-xl border border-gray-200 bg-white overflow-hidden', className)}>
      <div className="px-5 py-4 border-b border-gray-100">
        <p className="text-sm font-semibold text-gray-900">{title}</p>
        {subtitle && <p className="text-xs text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      <div className="px-5 py-5 space-y-4">
        {children}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Localized field helpers
// ─────────────────────────────────────────────────────────────────────────────

function LInput({
  label, value, lang, onChange, placeholder, required, hint, error, errorMsg,
}: {
  label: string; value: Loc; lang: AdminLanguage; onChange: (v: Loc) => void
  placeholder?: string; required?: boolean; hint?: string; error?: boolean; errorMsg?: string
}) {
  return (
    <F label={label} required={required} hint={hint} error={errorMsg}>
      <FInput
        value={value[lang] ?? ''}
        onChange={v => onChange({ ...value, [lang]: v })}
        placeholder={placeholder}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        error={error}
      />
    </F>
  )
}

function LTextarea({
  label, value, lang, onChange, placeholder, required, rows, error, errorMsg,
}: {
  label: string; value: Loc; lang: AdminLanguage; onChange: (v: Loc) => void
  placeholder?: string; required?: boolean; rows?: number; error?: boolean; errorMsg?: string
}) {
  return (
    <F label={label} required={required} error={errorMsg}>
      <FTextarea
        value={value[lang] ?? ''}
        onChange={v => onChange({ ...value, [lang]: v })}
        placeholder={placeholder}
        dir={lang === 'ar' ? 'rtl' : 'ltr'}
        rows={rows}
        error={error}
      />
    </F>
  )
}

/** Compact localized list (highlights / inclusions / exclusions) */
function LList({
  label, items, lang, onChange, placeholder,
}: {
  label: string; items: Loc[]; lang: AdminLanguage
  onChange: (items: Loc[]) => void; placeholder?: string
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium text-gray-500">{label}</p>
        <button
          type="button"
          onClick={() => onChange([...items, defaultLoc()])}
          className="flex items-center gap-1 text-xs font-medium text-[#560ce3] hover:underline"
        >
          <Plus className="w-3 h-3" />Add row
        </button>
      </div>
      <div className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2 group">
            <span className="w-5 text-center text-[11px] text-gray-300 font-medium shrink-0">{i + 1}</span>
            <FInput
              value={item[lang] ?? ''}
              onChange={v => { const n = [...items]; n[i] = { ...item, [lang]: v }; onChange(n) }}
              placeholder={placeholder}
              dir={lang === 'ar' ? 'rtl' : 'ltr'}
              className="flex-1"
            />
            {items.length > 1 && (
              <button
                type="button"
                onClick={() => onChange(items.filter((_, j) => j !== i))}
                className="shrink-0 h-7 w-7 rounded flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Sidebar language toggle (minimal pill, no flags)
// ─────────────────────────────────────────────────────────────────────────────
function LangToggle({ lang, onChange }: { lang: AdminLanguage; onChange: (l: AdminLanguage) => void }) {
  return (
    <div className="inline-flex rounded-lg border border-gray-200 overflow-hidden text-xs font-medium">
      {(['en', 'ar'] as const).map(l => (
        <button
          key={l}
          type="button"
          onClick={() => onChange(l)}
          className={cn(
            'px-3 py-1.5 transition-colors',
            lang === l ? 'bg-[#560ce3] text-white' : 'text-gray-500 hover:bg-gray-50',
          )}
        >
          {l === 'en' ? 'EN' : 'AR'}
        </button>
      ))}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
  { id: 'details',  label: 'Details',  icon: ListChecks       },
  { id: 'content',  label: 'Content',  icon: FileText         },
  { id: 'seo',      label: 'SEO',      icon: Globe            },
] as const

const AdminTourForm = ({ tourId, onSaved, onCancel }: Props) => {
  const [form,     setForm]    = useState<FormData>(defaultForm())
  const [loading,  setLoading] = useState(!!tourId)
  const [saving,   setSaving]  = useState(false)
  const [errors,   setErrors]  = useState<Record<string, string>>({})
  const [section,  setSection] = useState<string>('overview')
  const [lang,     setLang]    = useState<AdminLanguage>('en')

  useEffect(() => {
    if (!tourId) return
    tourService.getById(tourId)
      .then((t: any) => setForm(t))
      .catch(() => alert('Failed to load tour.'))
      .finally(() => setLoading(false))
  }, [tourId])

  // ── helpers ────────────────────────────────────────────────────────────────

  const set = (path: string, value: unknown) => {
    setForm((prev: any) => {
      const next = { ...prev }
      const keys = path.split('.')
      let obj = next
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...obj[keys[i]] }
        obj = obj[keys[i]]
      }
      obj[keys[keys.length - 1]] = value
      return next
    })
    setErrors(e => { const n = { ...e }; delete n[path]; return n })
  }

  const autoSlug = (en: string) =>
    en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  const overviewErrorKeys = ['heading.en', 'slug.en', 'Description.header.en', 'Description.text.en', 'images.0.url']
  const sectionHasError = (id: string) =>
    id === 'overview' && overviewErrorKeys.some(k => errors[k])

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.heading.en.trim())            e['heading.en']            = 'Heading (English) is required'
    if (!form.slug.en.trim())               e['slug.en']               = 'Slug (English) is required'
    if (!form.Description.header.en.trim()) e['Description.header.en'] = 'Required'
    if (!form.Description.text.en.trim())   e['Description.text.en']   = 'Required'
    if (!form.images[0]?.url.trim())        e['images.0.url']          = 'At least one image is required'
    setErrors(e)
    if (Object.keys(e).length > 0 && overviewErrorKeys.some(k => e[k])) setSection('overview')
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      tourId ? await tourService.update(tourId, form) : await tourService.create(form)
      onSaved()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }

  // ── loading skeleton ───────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="flex gap-6">
        <div className="w-52 shrink-0 space-y-3">
          {[1, 0.6, 0.8, 0.7, 0.5].map((w, i) => (
            <div key={i} className="h-8 rounded-lg bg-gray-100 animate-pulse" style={{ width: `${w * 100}%` }} />
          ))}
        </div>
        <div className="flex-1 space-y-4">
          {[1, 0.8, 1, 0.6].map((w, i) => (
            <div key={i} className="h-20 rounded-xl bg-gray-100 animate-pulse" style={{ width: `${w * 100}%` }} />
          ))}
        </div>
      </div>
    )
  }

  // ── render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex gap-7 items-start">

      {/* ══════════════════════════════════════════════════════════════════════
          LEFT SIDEBAR
      ══════════════════════════════════════════════════════════════════════ */}
      <aside className="w-52 shrink-0 sticky top-6 space-y-5">

        {/* Back + title */}
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-700 transition-colors mb-3"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            All Tours
          </button>
          <h1 className="text-base font-bold text-gray-900">
            {tourId ? 'Edit Tour' : 'New Tour'}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5 truncate">
            {tourId
              ? (form.heading.en || 'Editing tour')
              : 'Create a new tour package'}
          </p>
        </div>

        {/* Language */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Language</p>
          <LangToggle lang={lang} onChange={setLang} />
        </div>

        {/* Section nav */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-1.5">Sections</p>
          <nav className="space-y-0.5">
            {SECTIONS.map(({ id, label, icon: Icon }) => {
              const active   = section === id
              const hasError = sectionHasError(id)
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSection(id)}
                  className={cn(
                    'w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all text-left',
                    active
                      ? 'bg-[#560ce3] text-white font-medium shadow-sm shadow-[#560ce3]/20'
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-800',
                  )}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {hasError && (
                    <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', active ? 'bg-red-300' : 'bg-red-500')} />
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Status */}
        <div>
          <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-widest mb-2">Publish</p>
          <div className="rounded-xl border overflow-hidden divide-y transition-colors"
          style={{ borderColor: form.isActive ? '#d1fae5' : '#e5e7eb', background: 'white' }}>
            {/* Active */}
            <label className={cn(
              'flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors',
              form.isActive ? 'bg-emerald-50/70' : 'bg-white hover:bg-gray-50/60',
            )}>
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                form.isActive ? 'bg-emerald-100' : 'bg-gray-100',
              )}>
                {form.isActive
                  ? <Eye className="w-3.5 h-3.5 text-emerald-600" />
                  : <EyeOff className="w-3.5 h-3.5 text-gray-400" />}
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-xs font-semibold transition-colors', form.isActive ? 'text-emerald-700' : 'text-gray-500')}>
                  {form.isActive ? 'Published' : 'Draft'}
                </p>
                <p className={cn('text-[11px] transition-colors', form.isActive ? 'text-emerald-500' : 'text-gray-400')}>
                  {form.isActive ? 'Visible on site' : 'Hidden from visitors'}
                </p>
              </div>
              <Switch checked={form.isActive} onCheckedChange={v => set('isActive', v)} />
            </label>

            {/* Featured */}
            <label className={cn(
              'flex items-center gap-3 px-3 py-3 cursor-pointer transition-colors',
              form.isFeatured ? 'bg-amber-50/70' : 'bg-white hover:bg-gray-50/60',
            )}>
              <div className={cn(
                'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 transition-colors',
                form.isFeatured ? 'bg-amber-100' : 'bg-gray-100',
              )}>
                <Star className={cn('w-3.5 h-3.5 transition-colors', form.isFeatured ? 'text-amber-500 fill-amber-500' : 'text-gray-400')} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={cn('text-xs font-semibold transition-colors', form.isFeatured ? 'text-amber-700' : 'text-gray-500')}>
                  {form.isFeatured ? 'Featured' : 'Not Featured'}
                </p>
                <p className={cn('text-[11px] transition-colors', form.isFeatured ? 'text-amber-500' : 'text-gray-400')}>
                  {form.isFeatured ? 'Shown on homepage' : 'Standard listing'}
                </p>
              </div>
              <Switch checked={form.isFeatured} onCheckedChange={v => set('isFeatured', v)} />
            </label>
          </div>
        </div>

        {/* Save */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={saving}
            className={cn(
              'w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all',
              'bg-[#560ce3] text-white shadow-sm shadow-[#560ce3]/20',
              'hover:bg-[#4509bb] hover:shadow-md hover:shadow-[#560ce3]/25',
              'disabled:opacity-60 disabled:cursor-not-allowed',
            )}
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            {saving ? 'Saving…' : tourId ? 'Save Changes' : 'Publish Tour'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="w-full py-2 rounded-xl text-sm text-gray-400 hover:text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>

      </aside>

      {/* ══════════════════════════════════════════════════════════════════════
          MAIN CONTENT
      ══════════════════════════════════════════════════════════════════════ */}
      <div className="flex-1 min-w-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={section}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.13 }}
            className="space-y-4"
          >

            {/* ── OVERVIEW ──────────────────────────────────────────────── */}
            {section === 'overview' && (
              <>
                <Card title="Identity" subtitle="Tour name and URL slug">
                  <div className="grid md:grid-cols-2 gap-4">
                    <LInput
                      label="Heading" required
                      value={form.heading} lang={lang}
                      placeholder={lang === 'ar' ? 'عنوان الجولة' : 'e.g. Nile River Journey'}
                      error={!!errors['heading.en']} errorMsg={errors['heading.en']}
                      onChange={v => {
                        set('heading', v)
                        if (!tourId && lang === 'en') set('slug', { ...form.slug, en: autoSlug(v.en) })
                      }}
                    />
                    <LInput
                      label="URL Slug" required
                      value={form.slug} lang={lang}
                      placeholder="nile-river-journey"
                      hint={lang === 'en' ? 'Auto-filled · lowercase, hyphens only' : undefined}
                      error={!!errors['slug.en']} errorMsg={errors['slug.en']}
                      onChange={v => set('slug', v)}
                    />
                  </div>
                </Card>

                <Card title="Starting Price" subtitle="Base price per person">
                  <div className="grid grid-cols-3 gap-4">
                    {CURRENCIES.map(c => (
                      <F key={c} label={c}>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-medium text-gray-400 pointer-events-none select-none">
                            {c === 'EGP' ? 'E£' : c === 'USD' ? '$' : '﷼'}
                          </span>
                          <FInput
                            type="number"
                            value={form.priceStartingFrom[c] ? String(form.priceStartingFrom[c]) : ''}
                            onChange={v => set('priceStartingFrom', { ...form.priceStartingFrom, [c]: Number(v) })}
                            placeholder="0"
                            className="pl-8"
                          />
                        </div>
                      </F>
                    ))}
                  </div>
                </Card>

                <Card title="Description" subtitle="Tagline and full body text">
                  <LInput
                    label="Header / Tagline" required
                    value={form.Description.header} lang={lang}
                    placeholder={lang === 'ar' ? 'وصف موجز' : 'A short compelling tagline'}
                    error={!!errors['Description.header.en']} errorMsg={errors['Description.header.en']}
                    onChange={v => set('Description.header', v)}
                  />
                  <LTextarea
                    label="Body" required rows={6}
                    value={form.Description.text} lang={lang}
                    placeholder={lang === 'ar' ? 'الوصف الكامل للجولة…' : 'Full description. HTML supported.'}
                    error={!!errors['Description.text.en']} errorMsg={errors['Description.text.en']}
                    onChange={v => set('Description.text', v)}
                  />
                </Card>

                <Card title="Images" subtitle="First image is the cover photo">
                  <div className="space-y-3">
                    {form.images.map((img, i) => (
                      <div key={i} className="flex items-start gap-3 group">
                        {/* Live thumbnail */}
                        <div className="w-12 h-12 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center shrink-0 overflow-hidden">
                          {img.url ? (
                            <img
                              src={img.url}
                              alt=""
                              className="w-full h-full object-cover"
                              onError={e => { (e.target as HTMLImageElement).style.display = 'none' }}
                            />
                          ) : (
                            <span className="text-gray-300 text-[10px] font-medium">IMG</span>
                          )}
                        </div>
                        <div className="flex-1 grid grid-cols-[1fr_auto] gap-2 min-w-0">
                          <FInput
                            type="url"
                            value={img.url}
                            onChange={v => { const imgs = [...form.images]; imgs[i] = { ...imgs[i], url: v }; set('images', imgs) }}
                            placeholder="https://…"
                            error={i === 0 && !!errors['images.0.url']}
                          />
                          <FInput
                            value={img.alt || ''}
                            onChange={v => { const imgs = [...form.images]; imgs[i] = { ...imgs[i], alt: v }; set('images', imgs) }}
                            placeholder="Alt text"
                            className="w-36"
                          />
                          {i === 0 && errors['images.0.url'] && (
                            <p className="col-span-2 text-[11px] text-red-500 flex items-center gap-1">
                              <AlertCircle className="w-2.5 h-2.5" />{errors['images.0.url']}
                            </p>
                          )}
                        </div>
                        {form.images.length > 1 && (
                          <button
                            type="button"
                            onClick={() => set('images', form.images.filter((_, j) => j !== i))}
                            className="h-9 w-9 rounded-lg flex items-center justify-center text-gray-300 hover:text-red-400 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={() => set('images', [...form.images, { url: '', alt: '' }])}
                      className={cn(
                        'w-full py-2.5 rounded-lg border-2 border-dashed border-gray-200',
                        'text-xs font-medium text-gray-400',
                        'flex items-center justify-center gap-1.5',
                        'hover:border-[#560ce3]/30 hover:text-[#560ce3] transition-colors',
                      )}
                    >
                      <Plus className="w-3.5 h-3.5" />Add another image
                    </button>
                  </div>
                </Card>
              </>
            )}

            {/* ── DETAILS ───────────────────────────────────────────────── */}
            {section === 'details' && (
              <>
                <Card title="Location & Logistics" subtitle="Where, when and how guests join">
                  <div className="grid md:grid-cols-2 gap-4">
                    <LInput label="Location"          value={form.tourLocation}     lang={lang} onChange={v => set('tourLocation', v)}     placeholder={lang === 'ar' ? 'مثال: القاهرة، مصر' : 'e.g. Cairo, Egypt'} />
                    <LInput label="Availability"      value={form.tourAvailability} lang={lang} onChange={v => set('tourAvailability', v)} placeholder={lang === 'ar' ? 'طوال العام' : 'e.g. Year-round'} />
                    <LInput label="Pickup & Drop Off" value={form.pickupAndDropOff} lang={lang} onChange={v => set('pickupAndDropOff', v)} placeholder={lang === 'ar' ? 'من الفندق' : 'e.g. Your hotel'} />
                    <LInput label="Meeting Point"     value={form.meetingPoint}     lang={lang} onChange={v => set('meetingPoint', v)}     placeholder={lang === 'ar' ? 'بوابة المطار' : 'Airport arrivals hall'} />
                  </div>
                </Card>

                <Card title="Tour Info" subtitle="Type, style and duration">
                  <div className="grid md:grid-cols-3 gap-4">
                    <LInput label="Tour Type"  value={form.tourType}  lang={lang} onChange={v => set('tourType', v)}  placeholder={lang === 'ar' ? 'ثقافية وتاريخية' : 'Cultural & Historical'} />
                    <LInput label="Tour Style" value={form.tourStyle} lang={lang} onChange={v => set('tourStyle', v)} placeholder={lang === 'ar' ? 'جولة جماعية' : 'Guided Group Tour'} />
                    <LInput label="Duration"   value={form.duration}  lang={lang} onChange={v => set('duration', v)}  placeholder={lang === 'ar' ? '٨ أيام / ٧ ليالٍ' : '8 Days / 7 Nights'} />
                  </div>
                </Card>

                <Card title="Cancellation Policy" subtitle="Terms and conditions for cancellations">
                  <LTextarea
                    label="Policy text" rows={4}
                    value={form.cancellationPolicy} lang={lang}
                    onChange={v => set('cancellationPolicy', v)}
                    placeholder={lang === 'ar' ? 'شروط الإلغاء…' : 'Free cancellation up to 14 days before departure…'}
                  />
                </Card>
              </>
            )}

            {/* ── CONTENT ───────────────────────────────────────────────── */}
            {section === 'content' && (
              <>
                <Card title="Highlights" subtitle="Key selling points (one per line)">
                  <LList
                    label="Highlight items"
                    items={form.tourHighlights} lang={lang}
                    onChange={v => set('tourHighlights', v)}
                    placeholder={lang === 'ar' ? 'أضف نقطة مميزة…' : 'Add a highlight…'}
                  />
                </Card>

                <Card title="Included & Excluded" subtitle="What the price covers and what it doesn't">
                  <div className="grid md:grid-cols-2 gap-6">
                    <LList
                      label="Inclusions"
                      items={form.inclusion} lang={lang}
                      onChange={v => set('inclusion', v)}
                      placeholder={lang === 'ar' ? 'ما يشمله السعر…' : "What's included…"}
                    />
                    <LList
                      label="Exclusions"
                      items={form.exclusion} lang={lang}
                      onChange={v => set('exclusion', v)}
                      placeholder={lang === 'ar' ? 'ما لا يشمله السعر…' : "What's not included…"}
                    />
                  </div>
                </Card>

                <Card title="Map" subtitle="Embed a Google Maps location">
                  <F label="Iframe / src URL" hint="Paste a full <iframe> tag or just the src URL">
                    <FTextarea
                      value={form.tourMapIframe}
                      onChange={v => set('tourMapIframe', v)}
                      placeholder='<iframe src="https://www.google.com/maps/embed?…'
                      rows={3}
                    />
                  </F>
                </Card>
              </>
            )}

            {/* ── SEO ───────────────────────────────────────────────────── */}
            {section === 'seo' && (
              <Card title="Search Engine Metadata" subtitle="Controls how this tour appears in Google and social previews">
                <div className="flex items-start gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200 mb-2">
                  <AlertCircle className="w-3.5 h-3.5 text-gray-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-gray-500 leading-relaxed">
                    All fields are optional — leave blank to auto-populate from the tour heading and description when saved.
                  </p>
                </div>
                <LInput
                  label="Meta Title"
                  value={(form as any).seo?.metaTitle || defaultLoc()} lang={lang}
                  onChange={v => set('seo.metaTitle', v)}
                  placeholder={lang === 'ar' ? 'عنوان في محركات البحث…' : 'Page title for search engines…'}
                  hint={lang === 'en' ? '50–60 characters recommended' : undefined}
                />
                <LTextarea
                  label="Meta Description" rows={3}
                  value={(form as any).seo?.metaDescription || defaultLoc()} lang={lang}
                  onChange={v => set('seo.metaDescription', v)}
                  placeholder={lang === 'ar' ? 'وصف قصير يظهر في نتائج البحث…' : 'Brief description for search results…'}
                />
                <F label="Meta Image URL" hint="Recommended 1200 × 630 px — defaults to first tour image">
                  <FInput
                    type="url"
                    value={(form as any).seo?.metaImage?.url || ''}
                    onChange={v => set('seo.metaImage', { url: v })}
                    placeholder="https://…"
                  />
                </F>
              </Card>
            )}

          </motion.div>
        </AnimatePresence>
      </div>

    </div>
  )
}

export default AdminTourForm

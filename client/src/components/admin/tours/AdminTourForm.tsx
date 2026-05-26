import { useState, useCallback, useEffect, type InputHTMLAttributes, type ReactNode, type TextareaHTMLAttributes } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, ListChecks, FileText, Globe,
  Save, Loader2, ArrowLeft, AlertCircle, Plus, X,
  RefreshCw, Image as ImageIcon, GripVertical,
  Search, Upload, Star, Check, MapPin, ChevronDown, ChevronUp,
  PlaySquare, MessageSquare, Video, Users, BookOpen, FileDown,
  HelpCircle, Link2,
} from 'lucide-react'
import { tourService, type TourListItem } from '../../../services/tourService'
import { type AdminLanguage } from '../AdminLanguageTabs'
import { LRichTextEditor } from '../RichTextEditor'

// ─────────────────────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────────────────────

interface Props { tourId?: string; onSaved: () => void; onCancel: () => void }

type Loc = { en: string; ar?: string }
type TourImage = { url: string; alt: Loc; title: Loc }

const CURRENCIES = ['EGP', 'USD', 'SAR'] as const
type Currency = typeof CURRENCIES[number]

type FaqItem           = { question: Loc; answer: Loc }
type ReviewItem        = { type: 'youtube' | 'text' | 'video'; url?: string; title: Loc; content?: Loc }
type RelatedTourItem   = { id: string; title: Loc }
type NoteItem          = { title: Loc; text: Loc }
type ItineraryActivity = { heading: Loc; description: Loc; image?: TourImage }
type ItineraryDay      = { day: number; title: Loc; description: Loc; activities: ItineraryActivity[] }

const defaultLoc  = (): Loc           => ({ en: '', ar: '' })
const defaultFaq  = (): FaqItem       => ({ question: defaultLoc(), answer: defaultLoc() })
const defaultNote = (): NoteItem      => ({ title: defaultLoc(), text: defaultLoc() })
const defaultActivity = (): ItineraryActivity => ({ heading: defaultLoc(), description: defaultLoc() })
const defaultDay  = (n: number): ItineraryDay => ({ day: n, title: defaultLoc(), description: defaultLoc(), activities: [] })
const defaultReview = (): ReviewItem  => ({ type: 'text', title: defaultLoc(), content: defaultLoc() })

const defaultForm = () => ({
  idExternal:         '',
  heading:            defaultLoc(),
  headingDescription: defaultLoc(),
  slug:               defaultLoc(),
  Description:        { header: defaultLoc(), text: defaultLoc() },
  images:             [{ url: '', alt: defaultLoc(), title: defaultLoc() }] as TourImage[],
  gallery:            [] as TourImage[],
  tourLocation:       defaultLoc(),
  tourAvailability:   defaultLoc(),
  pickupAndDropOff:   defaultLoc(),
  tourType:           defaultLoc(),
  tourStyle:          defaultLoc(),
  duration:           defaultLoc(),
  meetingPoint:       defaultLoc(),
  cancellationPolicy: defaultLoc(),
  priceStartingFrom:  { EGP: 0, USD: 0, SAR: 0 } as Record<Currency, number>,
  inclusion:          [defaultLoc()] as Loc[],
  exclusion:          [defaultLoc()] as Loc[],
  tourHighlights:     [defaultLoc()] as Loc[],
  whatToPack:         [] as Loc[],
  whatYouWillLoveHtml: defaultLoc(),
  tags:               { en: [], ar: [] } as { en: string[]; ar?: string[] },
  notes:              [] as NoteItem[],
  tourMapIframe:      '',
  faqs:               [] as FaqItem[],
  relatedTours:       [] as RelatedTourItem[],
  reviews:            [] as ReviewItem[],
  reviewsCount:       0,
  groupSize:          { total: 0, remaining: 0 },
  itinerary:          { generalDescription: defaultLoc(), days: [] as ItineraryDay[] },
  isActive:           true,
  isFeatured:         false,
})

type FormData = ReturnType<typeof defaultForm>
type SeoData = {
  metaTitle?: Loc
  metaDescription?: Loc
  metaImage?: { url?: string; alt?: Loc; title?: Loc }
  metaKeywords?: { en: string[]; ar?: string[] }
}
type FormState = FormData & { seo?: SeoData }

const CURRENCY_META: Record<Currency, { symbol: string; flag: string }> = {
  EGP: { symbol: 'E£',  flag: '🇪🇬' },
  USD: { symbol: '$',   flag: '🇺🇸' },
  SAR: { symbol: 'SAR', flag: '🇸🇦' },
}

// ─────────────────────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────────────────────

const autoSlug = (en: string) =>
  en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

const truncate = (str: string, n: number) =>
  str.length > n ? str.slice(0, n - 1) + '…' : str

const toLoc = (value: unknown): Loc => {
  if (typeof value === 'string') return { en: value, ar: '' }
  if (value && typeof value === 'object') {
    const loc = value as Partial<Loc>
    return { en: loc.en ?? '', ar: loc.ar ?? '' }
  }
  return defaultLoc()
}

const getRecord = (value: unknown): Record<string, unknown> =>
  value && typeof value === 'object' ? value as Record<string, unknown> : {}

const normalizeImages = (images?: unknown[]): TourImage[] => {
  const source = images?.length ? images : [{}]
  return source.map((image) => {
    const img = getRecord(image)
    return {
      url:   typeof img.url === 'string' ? img.url : '',
      alt:   toLoc(img.alt),
      title: toLoc(img.title),
    }
  })
}

/** Normalize a Loc | Loc[] | string[] from API into a Loc[] for per-item rich text */
const normalizeLocArray = (raw: unknown): Loc[] => {
  if (Array.isArray(raw)) {
    if (raw.length === 0) return [defaultLoc()]
    return raw.map(item => toLoc(item))
  }
  if (raw && typeof raw === 'object') return [toLoc(raw)]
  if (typeof raw === 'string' && raw.trim()) return [{ en: raw, ar: '' }]
  return [defaultLoc()]
}

const normalizeFaqs = (raw: unknown): FaqItem[] => {
  if (!Array.isArray(raw) || raw.length === 0) return []
  return raw.map(f => {
    const r = getRecord(f)
    return { question: toLoc(r.question), answer: toLoc(r.answer) }
  })
}

const normalizeRelatedTours = (raw: unknown): RelatedTourItem[] => {
  if (!Array.isArray(raw) || raw.length === 0) return []
  return raw.map(t => {
    const r = getRecord(t)
    return { id: String(r.id ?? r._id ?? ''), title: toLoc(r.title) }
  })
}

const normalizeReviews = (raw: unknown): ReviewItem[] => {
  if (!Array.isArray(raw) || raw.length === 0) return []
  return raw.map(r => {
    const rec = getRecord(r)
    const type = rec.type === 'youtube' || rec.type === 'video' ? rec.type : 'text'
    return { type, url: typeof rec.url === 'string' ? rec.url : '', title: toLoc(rec.title), content: toLoc(rec.content) }
  })
}

const normalizeNotes = (raw: unknown): NoteItem[] => {
  if (!Array.isArray(raw) || raw.length === 0) return []
  return raw.map(n => {
    const r = getRecord(n)
    return { title: toLoc(r.title), text: toLoc(r.text) }
  })
}

const normalizeItinerary = (raw: unknown): { generalDescription: Loc; days: ItineraryDay[] } => {
  const base = { generalDescription: defaultLoc(), days: [] as ItineraryDay[] }
  if (!raw || typeof raw !== 'object') return base
  const r = getRecord(raw)
  const days = Array.isArray(r.days) ? r.days.map((d: unknown) => {
    const dr = getRecord(d)
    const activities = Array.isArray(dr.activities) ? dr.activities.map((a: unknown) => {
      const ar = getRecord(a)
      return {
        heading:     toLoc(ar.heading),
        description: toLoc(ar.description),
        image:       ar.image ? normalizeImages([ar.image])[0] : undefined,
      }
    }) : []
    return { day: Number(dr.day) || 1, title: toLoc(dr.title), description: toLoc(dr.description), activities }
  }) : []
  return { generalDescription: toLoc(r.generalDescription), days }
}

const normalizeTourForm = (tour: unknown): FormData => {
  const base = defaultForm()
  const tourRecord = getRecord(tour)
  const description = getRecord(tourRecord.Description)
  return {
    ...base,
    ...tourRecord,
    idExternal:   typeof tourRecord.idExternal === 'string' ? tourRecord.idExternal : '',
    headingDescription: toLoc(tourRecord.headingDescription),
    Description: {
      ...base.Description,
      ...description,
      header: toLoc(description.header),
      text:   toLoc(description.text),
    },
    images:            normalizeImages(Array.isArray(tourRecord.images) ? tourRecord.images : undefined),
    gallery:           normalizeImages(Array.isArray(tourRecord.gallery) && tourRecord.gallery.length ? tourRecord.gallery : undefined).filter(i => i.url),
    priceStartingFrom: { ...base.priceStartingFrom, ...getRecord(tourRecord.priceStartingFrom) },
    tourHighlights:    normalizeLocArray(tourRecord.tourHighlights),
    inclusion:         normalizeLocArray(tourRecord.inclusion),
    exclusion:         normalizeLocArray(tourRecord.exclusion),
    whatToPack:        normalizeLocArray(tourRecord.whatToPack).filter(l => l.en || l.ar),
    whatYouWillLoveHtml: toLoc(tourRecord.whatYouWillLoveHtml),
    tags:              (() => {
      const t = getRecord(tourRecord.tags)
      return { en: Array.isArray(t.en) ? t.en.map(String) : [], ar: Array.isArray(t.ar) ? t.ar.map(String) : [] }
    })(),
    notes:             normalizeNotes(tourRecord.notes),
    cancellationPolicy: toLoc(tourRecord.cancellationPolicy),
    faqs:              normalizeFaqs(tourRecord.faqs),
    relatedTours:      normalizeRelatedTours(tourRecord.relatedTours),
    reviews:           normalizeReviews(tourRecord.reviews),
    reviewsCount:      typeof tourRecord.reviewsCount === 'number' ? tourRecord.reviewsCount : 0,
    groupSize:         { ...base.groupSize, ...getRecord(tourRecord.groupSize) },
    itinerary:         normalizeItinerary(tourRecord.itinerary),
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Primitives
// ─────────────────────────────────────────────────────────────────────────────

function TextInput({
  error, ...props
}: InputHTMLAttributes<HTMLInputElement> & { error?: boolean }) {
  return (
    <input
      {...props}
      className={`atf-input${props.className ? ` ${props.className}` : ''}`}
      style={error ? { ...props.style, borderColor: '#dc2626' } : props.style}
    />
  )
}

function HtmlTextarea({
  error, ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement> & { error?: boolean }) {
  return (
    <textarea
      {...props}
      className={`atf-input atf-textarea atf-mixed-input${props.className ? ` ${props.className}` : ''}`}
      style={error ? { ...props.style, borderColor: '#dc2626' } : props.style}
    />
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Atoms
// ─────────────────────────────────────────────────────────────────────────────

function FieldLangTabs({ lang, onChange }: { lang: AdminLanguage; onChange: (lang: AdminLanguage) => void }) {
  return (
    <div className="atf-field-lang-tabs" aria-label="Field language">
      <button type="button" className={`atf-field-lang-tab${lang === 'en' ? ' atf-field-lang-tab--active' : ''}`}
        onClick={() => onChange('en')} aria-label="English">🇬🇧</button>
      <button type="button" className={`atf-field-lang-tab${lang === 'ar' ? ' atf-field-lang-tab--active' : ''}`}
        onClick={() => onChange('ar')} aria-label="Arabic">🇸🇦</button>
    </div>
  )
}

function Field({ label, required, hint, error, labelChildren, children }: {
  label: string; required?: boolean; hint?: string; error?: string
  labelChildren?: ReactNode; children: ReactNode
}) {
  return (
    <div className="atf-field">
      {label && (
        <div className="atf-label-row">
          <label className="atf-label">
            {label}{required && <span style={{ color: '#dc2626', marginLeft: 2 }}>*</span>}
          </label>
          {labelChildren && (
            <div className="atf-label-row__actions">{labelChildren}</div>
          )}
        </div>
      )}
      {children}
      {hint && !error && <p className="atf-hint" style={{ marginTop: 4, marginBottom: 0 }}>{hint}</p>}
      {error && (
        <div className="atf-field-error">
          <AlertCircle size={11} style={{ flexShrink: 0 }} />
          {error}
        </div>
      )}
    </div>
  )
}

/** Localized text input — lang toggle floats inside the input; swaps to left when Arabic */
function LInput({ label, value, lang, onChange, placeholder, required, hint, error, errorMsg, labelChildren }: {
  label: string; value: Loc; lang: AdminLanguage; onChange: (v: Loc) => void
  placeholder?: string; required?: boolean; hint?: string
  error?: boolean; errorMsg?: string; labelChildren?: ReactNode
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

function InputField({ label, required, hint, error, errorMsg, labelChildren, ...props }: InputHTMLAttributes<HTMLInputElement> & {
  label: string
  required?: boolean
  hint?: string
  error?: boolean
  errorMsg?: string
  labelChildren?: ReactNode
}) {
  return (
    <Field label={label} required={required} hint={hint} error={errorMsg} labelChildren={labelChildren}>
      <TextInput {...props} error={error} />
    </Field>
  )
}


function LSlugInput({ value, lang, heading, onChange, onRegenerate, error }: {
  value: Loc; lang: AdminLanguage; heading: string
  onChange: (v: Loc) => void; onRegenerate: () => void; error?: string
}) {
  const [activeLang, setActiveLang] = useState<AdminLanguage>(lang)
  const val = value[activeLang] ?? ''
  return (
    <Field
      label="URL Slug" required error={error}
      labelChildren={heading ? (
        <button type="button" className="atf-regen-btn" onClick={onRegenerate}>
          <RefreshCw size={10} /> Regenerate
        </button>
      ) : undefined}
    >
      <div className="atf-input-with-lang">
        <TextInput
          value={val}
          onChange={e => onChange({ ...value, [activeLang]: e.target.value })}
          placeholder="nile-river-journey"
          dir="ltr"
          error={!!error}
        />
        <FieldLangTabs lang={activeLang} onChange={setActiveLang} />
      </div>
      {value.en && (
        <div className="atf-slug-preview">
          <span className="atf-slug-preview__prefix">alforsa.com/tours/</span>
          <span className="atf-slug-preview__slug">{value.en}</span>
        </div>
      )}
    </Field>
  )
}

/** Chip/tag input — press Enter to add, × to remove, Backspace on empty removes last */
function TagsInput({ label, value, lang, onChange, placeholder }: {
  label: string
  value: { en: string[]; ar?: string[] }
  lang: AdminLanguage
  onChange: (v: { en: string[]; ar?: string[] }) => void
  placeholder?: string
}) {
  const [activeLang, setActiveLang] = useState<AdminLanguage>(lang)
  const [draft, setDraft] = useState('')
  const tags = value[activeLang] ?? []

  const commit = () => {
    const tag = draft.trim()
    if (tag && !tags.includes(tag)) {
      onChange({ ...value, [activeLang]: [...tags, tag] })
    }
    setDraft('')
  }

  return (
    <Field label={label}>
      <div className="atf-tags-input">
        {tags.map((tag, i) => (
          <span key={i} className="atf-tag">
            {tag}
            <button type="button" onClick={() => onChange({ ...value, [activeLang]: tags.filter((_, j) => j !== i) })}>
              <X size={9} />
            </button>
          </span>
        ))}
        <input
          className="atf-tags-input__field"
          value={draft}
          onChange={e => setDraft(e.target.value)}
          onKeyDown={e => {
            if (e.key === 'Enter') { e.preventDefault(); commit() }
            if (e.key === 'Backspace' && !draft && tags.length) {
              onChange({ ...value, [activeLang]: tags.slice(0, -1) })
            }
          }}
          placeholder={tags.length === 0 ? (placeholder ?? 'Type and press Enter…') : ''}
        />
        <div className="atf-tags-input__lang">
          <FieldLangTabs lang={activeLang} onChange={setActiveLang} />
        </div>
      </div>
    </Field>
  )
}

/**
 * Reusable image card — thumbnail on the left, URL + alt + title fields on the right.
 * isCover is optional: pass true/false to show cover controls, omit to hide them (e.g. SEO).
 */
function ImageCard({ img, lang, isCover, onUpdate, onRemove, onSetCover }: {
  img: TourImage; lang: AdminLanguage
  isCover?: boolean
  onUpdate: (img: TourImage) => void
  onRemove?: () => void
  onSetCover?: () => void
}) {
  const handleFile = (file?: File) => {
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => onUpdate({ ...img, url: String(reader.result || '') })
    reader.readAsDataURL(file)
  }

  const showHead = !!onRemove

  return (
    <div className="atf-image-card">
      {/* Thin strip: drag + remove */}
      {showHead && (
        <div className="atf-image-card__head">
          <span className="atf-drag-handle"><GripVertical size={12} /></span>
          <div style={{ flex: 1 }} />
          {onRemove && (
            <button type="button" className="atf-remove-btn" onClick={onRemove}><X size={14} /></button>
          )}
        </div>
      )}

      {/* Two-column body: thumbnail left, fields right */}
      <div className="atf-image-card__body">
        {/* Left — live thumbnail */}
        <div className="atf-image-card__thumb">
          {isCover !== undefined && (
            <div className="atf-image-card__cover-action">
              {isCover === true && <span className="atf-cover-badge">Cover</span>}
              {isCover === false && onSetCover && (
                <button type="button" className="atf-set-cover-btn" onClick={onSetCover}>Set as cover</button>
              )}
            </div>
          )}
          {img.url
            ? <img src={img.url} alt="" onError={e => { (e.target as HTMLImageElement).style.display = 'none' }} />
            : <div className="atf-image-card__thumb-empty"><ImageIcon size={22} style={{ stroke: '#d1d5db', fill: 'none' }} /></div>
          }
        </div>

        {/* Right — all text fields */}
        <div className="atf-image-card__fields">
          <Field label="Image URL">
            <TextInput
              value={img.url}
              onChange={e => onUpdate({ ...img, url: e.target.value })}
              placeholder="Paste image URL https://…"
            />
          </Field>

          <div className="atf-grid-2">
            <LInput
              label="Alt text"
              value={img.alt || defaultLoc()}
              lang={lang}
              onChange={v => onUpdate({ ...img, alt: v })}
              placeholder="Describe the image"
            />
            <LInput
              label="Image title"
              labelChildren={
                <label className="atf-upload-btn atf-upload-btn--sm">
                  <Upload size={11} /> Upload
                  <input type="file" accept="image/*" onChange={e => handleFile(e.target.files?.[0])} />
                </label>
              }
              value={img.title || defaultLoc()}
              lang={lang}
              onChange={v => onUpdate({ ...img, title: v })}
              placeholder="Image title"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Section config
// ─────────────────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 'overview',   label: 'Overview',   icon: LayoutDashboard },
  { id: 'details',    label: 'Details',    icon: ListChecks       },
  { id: 'content',    label: 'Content',    icon: FileText         },
  { id: 'itinerary',  label: 'Itinerary',  icon: MapPin           },
  { id: 'faqs',       label: 'FAQs',       icon: HelpCircle       },
  { id: 'reviews',    label: 'Reviews',    icon: MessageSquare    },
  { id: 'related',    label: 'Related & Docs', icon: Link2        },
  { id: 'seo',        label: 'SEO',        icon: Globe            },
] as const

const OVERVIEW_ERROR_KEYS = ['heading.en', 'slug.en', 'Description.header.en', 'Description.text.en', 'images.0.url'] as const

// ─────────────────────────────────────────────────────────────────────────────
// Main component
// ─────────────────────────────────────────────────────────────────────────────

const AdminTourForm = ({ tourId, onSaved, onCancel }: Props) => {
  const [form,           setForm]          = useState<FormState>(defaultForm())
  const [loading,        setLoading]        = useState(!!tourId)
  const [saving,         setSaving]         = useState(false)
  const [errors,         setErrors]         = useState<Record<string, string>>({})
  const [section,        setSection]        = useState<string>('overview')
  const [lang]           = useState<AdminLanguage>(() => 'en')
  const [isDirty,        setIsDirty]        = useState(false)
  const [priceCurrency,  setPriceCurrency]  = useState<Currency>('EGP')
  const [allTours,       setAllTours]       = useState<TourListItem[]>([])
  const [tourSearch,     setTourSearch]     = useState('')
  const [expandedDays,   setExpandedDays]   = useState<Set<number>>(new Set())

  useEffect(() => {
    if (!tourId) return
    tourService.getById(tourId)
      .then((t: unknown) => setForm(normalizeTourForm(t)))
      .catch(() => alert('Failed to load tour.'))
      .finally(() => setLoading(false))
  }, [tourId])

  useEffect(() => {
    if (section !== 'related') return
    tourService.list({ limit: 200, page: 1, isActive: true })
      .then(r => setAllTours(r.tours.filter(t => t._id !== tourId)))
      .catch(() => {})
  }, [section, tourId])

  // Cmd/Ctrl+S to save
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') {
        e.preventDefault()
        handleSubmit()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  })

  const set = (path: string, value: unknown) => {
    setForm((prev) => {
      const next = { ...prev }
      const keys = path.split('.')
      let obj = next as Record<string, unknown>
      for (let i = 0; i < keys.length - 1; i++) {
        obj[keys[i]] = { ...getRecord(obj[keys[i]]) }
        obj = obj[keys[i]] as Record<string, unknown>
      }
      obj[keys[keys.length - 1]] = value
      return next
    })
    setErrors(e => { const n = { ...e }; delete n[path]; return n })
    setIsDirty(true)
  }

  const updateImage = (index: number, img: TourImage) => {
    const imgs = [...form.images]
    imgs[index] = img
    set('images', imgs)
  }

  const setImageAsCover = (index: number) => {
    if (index === 0) return
    const imgs = [...form.images]
    const [moved] = imgs.splice(index, 1)
    imgs.unshift(moved)
    set('images', imgs)
  }

  // ── Completion helpers ──────────────────────────────────────────────────

  const sectionStatus = (id: string): 'error' | 'complete' | 'empty' => {
    if (id === 'overview' && OVERVIEW_ERROR_KEYS.some(k => errors[k])) return 'error'

    if (id === 'overview') {
      const filled = form.heading.en && form.slug.en && form.Description.text.en && form.images[0]?.url
      return filled ? 'complete' : 'empty'
    }
    if (id === 'details') {
      const filled = form.tourLocation.en || form.tourType.en || form.duration.en
      return filled ? 'complete' : 'empty'
    }
    if (id === 'content') {
      const filled =
        form.tourHighlights.some(i => i.en) ||
        form.inclusion.some(i => i.en) ||
        form.exclusion.some(i => i.en)
      return filled ? 'complete' : 'empty'
    }
    if (id === 'faqs') {
      const filled = form.faqs.some(faq => faq.question.en || faq.answer.en)
      return filled ? 'complete' : 'empty'
    }
    if (id === 'reviews') {
      const filled = form.reviewsCount || form.reviews.some(review => review.title.en || review.content?.en || review.url)
      return filled ? 'complete' : 'empty'
    }
    if (id === 'related') {
      const docs = (form as FormState & { tourDocuments?: Array<{ url: string; label: Loc }> }).tourDocuments ?? []
      const filled = form.relatedTours.length > 0 || docs.some(doc => doc.url || doc.label.en)
      return filled ? 'complete' : 'empty'
    }
    if (id === 'seo') {
      const seo = form.seo
      const filled = seo?.metaTitle?.en || seo?.metaDescription?.en
      return filled ? 'complete' : 'empty'
    }
    return 'empty'
  }

  // ── Validation ──────────────────────────────────────────────────────────

  const validate = useCallback(() => {
    const e: Record<string, string> = {}
    if (!form.heading.en.trim())            e['heading.en']            = 'Heading (English) is required'
    if (!form.slug.en.trim())               e['slug.en']               = 'Slug (English) is required'
    if (!form.Description.header.en.trim()) e['Description.header.en'] = 'Required'
    if (!form.Description.text.en.trim())   e['Description.text.en']   = 'Required'
    if (!form.images[0]?.url.trim())        e['images.0.url']          = 'At least one image is required'
    setErrors(e)
    if (Object.keys(e).length > 0 && OVERVIEW_ERROR_KEYS.some(k => e[k])) setSection('overview')
    return Object.keys(e).length === 0
  }, [form.Description.header.en, form.Description.text.en, form.heading.en, form.images, form.slug.en])

  const handleSubmit = useCallback(async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (tourId) {
        await tourService.update(tourId, form)
      } else {
        await tourService.create(form)
      }
      setIsDirty(false)
      onSaved()
    } catch (err: unknown) {
      const message = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { message?: string } } }).response?.data?.message
        : undefined
      alert(message || 'Save failed.')
    } finally {
      setSaving(false)
    }
  }, [form, tourId, onSaved, validate])

  // ── SEO preview values ──────────────────────────────────────────────────

  const seo = form.seo ?? {}
  const stripHtml = (s: string) => s.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim()
  const serpTitle = seo.metaTitle?.en || form.heading.en || ''
  const serpSlug  = form.slug.en || ''
  const serpDesc  = seo.metaDescription?.en
    ? truncate(stripHtml(seo.metaDescription.en), 160)
    : truncate(stripHtml(form.Description.text.en), 160)

  // ── Loading skeleton ────────────────────────────────────────────────────

  if (loading) {
    return (
      <div className="admin-content admin-content--tour-form">
        <div className="atf-form-header">
          <div className="atf-form-header__left">
            <div className="atl-skeleton" style={{ width: 32, height: 32, borderRadius: 7 }} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <div className="atl-skeleton" style={{ width: 120, height: 16 }} />
              <div className="atl-skeleton" style={{ width: 80, height: 12 }} />
            </div>
          </div>
        </div>
        <div className="atf-tabs">
          {[80, 70, 75, 50].map((w, i) => (
            <div key={i} className="atl-skeleton" style={{ width: w, height: 14, margin: '12px 18px', borderRadius: 4 }} />
          ))}
        </div>
        <div className="atf-panel">
          {[0, 1, 2].map((i) => (
            <div key={i} className="atf-card">
              <div className="atf-card__head"><div className="atl-skeleton" style={{ width: 140, height: 14 }} /></div>
              <div className="atf-card__body">
                <div className="atl-skeleton" style={{ height: 36, marginBottom: 12 }} />
                <div className="atl-skeleton" style={{ height: 36 }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  // ── Render ──────────────────────────────────────────────────────────────

  return (
    <div className="admin-content admin-content--tour-form">

      {/* ══════════════════════════════════════════════════════════════════
          FORM HEADER
      ══════════════════════════════════════════════════════════════════ */}
      <div className="atf-form-header">

        <div className="atf-form-header__left">
          <button type="button" className="atl-back-btn" onClick={onCancel}>
            <ArrowLeft size={15} style={{ stroke: 'currentColor', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }} />
          </button>
          <div>
            <div className="atf-breadcrumb">
              <span className="atf-breadcrumb__item" onClick={onCancel}>Tours</span>
              <span className="atf-breadcrumb__sep">›</span>
              <span className="atf-breadcrumb__current">
                {tourId ? (form.heading.en || 'Edit Tour') : 'New Tour'}
              </span>
            </div>
            <p className="atf-form-header__title">
              {tourId ? 'Edit Tour' : 'New Tour'}
            </p>
          </div>
        </div>

        <div className="atf-form-header__right">
          <div className="atf-status-row" style={{ margin: 0 }}>
            <label className="atf-status-item">
              <div className="atf-switch">
                <input type="checkbox" checked={form.isActive} onChange={e => set('isActive', e.target.checked)} />
                <span />
              </div>
              <div className="atf-switch-label">
                {form.isActive ? 'Published' : 'Draft'}
                <span>{form.isActive ? 'Visible on site' : 'Hidden'}</span>
              </div>
            </label>

            <label className="atf-status-item">
              <div className="atf-switch">
                <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} />
                <span />
              </div>
              <div className="atf-switch-label">
                {form.isFeatured ? 'Featured' : 'Normal'}
                <span>{form.isFeatured ? 'On homepage' : 'Standard'}</span>
              </div>
            </label>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION TABS
      ══════════════════════════════════════════════════════════════════ */}
      <div className="atf-tabs">
        {SECTIONS.map(({ id, label, icon: Icon }) => {
          const status = sectionStatus(id)
          return (
            <button
              key={id}
              type="button"
              className={`atf-tab${section === id ? ' atf-tab--active' : ''}`}
              onClick={() => setSection(id)}
            >
              <Icon size={13} style={{ stroke: 'currentColor', fill: 'none', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', flexShrink: 0 }} />
              {label}
              {status === 'error'    && <span className="atf-tab-dot" />}
              {status === 'complete' && <span className="atf-tab-dot atf-tab-dot--complete" />}
            </button>
          )
        })}
      </div>

      {/* ══════════════════════════════════════════════════════════════════
          SECTION CONTENT
      ══════════════════════════════════════════════════════════════════ */}
      <AnimatePresence mode="wait">
        <motion.div
          key={section}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.12 }}
          className="atf-panel"
        >

          {/* ── OVERVIEW ────────────────────────────────────────────── */}
          {section === 'overview' && (
            <>
              {/* Identity */}
              <div className="atf-card">
                <div className="atf-card__head"><h3>Identity</h3></div>
                <div className="atf-card__body">
                  <div className="atf-grid-2">
                    <LInput
                      label="Heading" required
                      value={form.heading} lang={lang}
                      placeholder={lang === 'ar' ? 'عنوان الجولة' : 'e.g. Nile River Journey'}
                      error={!!errors['heading.en']} errorMsg={errors['heading.en']}
                      onChange={v => {
                        set('heading', v)
                        if (!tourId) set('slug', { ...form.slug, en: autoSlug(v.en) })
                      }}
                    />

                    <LSlugInput
                      value={form.slug}
                      lang={lang}
                      heading={form.heading.en}
                      error={errors['slug.en']}
                      onChange={v => set('slug', v)}
                      onRegenerate={() => set('slug', { ...form.slug, en: autoSlug(form.heading.en) })}
                    />
                  </div>

                  <div className="atf-grid-2" style={{ marginTop: 14 }}>
                    <LInput
                      label="Heading Description"
                      value={form.headingDescription} lang={lang}
                      placeholder={lang === 'ar' ? 'وصف موجز للعنوان' : 'Short sub-heading under the title'}
                      onChange={v => set('headingDescription', v)}
                    />
                    <Field label="External ID" hint="Optional reference from an external system">
                      <TextInput
                        value={form.idExternal}
                        onChange={e => set('idExternal', e.target.value)}
                        placeholder="e.g. EXT-001"
                      />
                    </Field>
                  </div>
                </div>
              </div>

              {/* Starting Price */}
              <div className="atf-card">
                <div className="atf-card__head">
                  <h3>Starting Price</h3>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: '#9ca3af' }}>Base price per person</span>
                </div>
                <div className="atf-card__body">
                  <div className="atf-starting-price">
                    {/* Currency tab selector */}
                    <div className="atf-price-tabs">
                      {CURRENCIES.map(c => (
                        <button key={c} type="button"
                          className={`atf-price-tab${priceCurrency === c ? ' atf-price-tab--active' : ''}`}
                          onClick={() => setPriceCurrency(c)}
                        >
                          <span>{CURRENCY_META[c].flag}</span>
                          {c}
                        </button>
                      ))}
                    </div>

                    {/* Single styled price input for the active currency */}
                    <div className="atf-price-single">
                      <div className="atf-price-single__prefix">
                        <span className="atf-price-single__flag">{CURRENCY_META[priceCurrency].flag}</span>
                        <span className="atf-price-single__symbol">{CURRENCY_META[priceCurrency].symbol}</span>
                      </div>
                      <input
                        type="number"
                        className="atf-price-input"
                        value={form.priceStartingFrom[priceCurrency] || ''}
                        onChange={e => set('priceStartingFrom', {
                          ...form.priceStartingFrom,
                          [priceCurrency]: Number(e.target.value),
                        })}
                        placeholder="0"
                        min="0"
                      />
                      <span className="atf-price-single__suffix">per person</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="atf-card">
                <div className="atf-card__head"><h3>Description</h3></div>
                <div className="atf-card__body">
                  <LInput
                    label="Header / Tagline" required
                    value={form.Description.header} lang={lang}
                    placeholder={lang === 'ar' ? 'وصف موجز' : 'A short compelling tagline'}
                    error={!!errors['Description.header.en']} errorMsg={errors['Description.header.en']}
                    onChange={v => set('Description.header', v)}
                  />
                  <div style={{ marginTop: 16 }}>
                    <LRichTextEditor
                      label="Body" required
                      value={form.Description.text} lang={lang}
                      placeholder={lang === 'ar' ? 'الوصف الكامل للجولة…' : 'Full description…'}
                      errorMsg={errors['Description.text.en']}
                      onChange={v => set('Description.text', v)}
                    />
                  </div>
                </div>
              </div>

              {/* Images */}
              <div className="atf-card">
                <div className="atf-card__head">
                  <h3>Images</h3>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: '#9ca3af' }}>First image is the cover photo</span>
                </div>
                <div className="atf-card__body">
                  {errors['images.0.url'] && (
                    <div className="atf-field-error" style={{ marginBottom: 10 }}>
                      <AlertCircle size={11} style={{ flexShrink: 0 }} />
                      {errors['images.0.url']}
                    </div>
                  )}
                  {form.images.map((img, i) => (
                    <ImageCard
                      key={i}
                      img={img}
                      lang={lang}
                      isCover={i === 0}
                      onUpdate={updated => updateImage(i, updated)}
                      onRemove={form.images.length > 1 ? () => set('images', form.images.filter((_, j) => j !== i)) : undefined}
                      onSetCover={() => setImageAsCover(i)}
                    />
                  ))}
                  <button type="button" className="atf-add-btn"
                    onClick={() => set('images', [...form.images, { url: '', alt: defaultLoc(), title: defaultLoc() }])}
                  >
                    <Plus size={13} />
                    Add another image
                  </button>
                </div>
              </div>

              {/* Gallery */}
              <div className="atf-card">
                <div className="atf-card__head">
                  <h3>Gallery</h3>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: '#9ca3af' }}>Additional photos — not shown as cover</span>
                </div>
                <div className="atf-card__body">
                  {form.gallery.map((img, i) => (
                    <ImageCard
                      key={i}
                      img={img}
                      lang={lang}
                      onUpdate={updated => {
                        const g = [...form.gallery]; g[i] = updated; set('gallery', g)
                      }}
                      onRemove={() => set('gallery', form.gallery.filter((_, j) => j !== i))}
                    />
                  ))}
                  <button type="button" className="atf-add-btn"
                    onClick={() => set('gallery', [...form.gallery, { url: '', alt: defaultLoc(), title: defaultLoc() }])}
                  >
                    <Plus size={13} /> Add gallery image
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── DETAILS ─────────────────────────────────────────────── */}
          {section === 'details' && (
            <>
              <div className="atf-card">
                <div className="atf-card__head">
                  <h3>Location &amp; Logistics</h3>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: '#9ca3af' }}>Where, when and how guests join</span>
                </div>
                <div className="atf-card__body">
                  <div className="atf-grid-2">
                    <LInput label="Location"              value={form.tourLocation}     lang={lang} onChange={v => set('tourLocation', v)}     placeholder={lang === 'ar' ? 'مثال: القاهرة، مصر' : 'e.g. Cairo, Egypt'} />
                    <LInput label="Availability"          value={form.tourAvailability} lang={lang} onChange={v => set('tourAvailability', v)} placeholder={lang === 'ar' ? 'طوال العام' : 'e.g. Year-round'} />
                    <LInput label="Pickup &amp; Drop Off" value={form.pickupAndDropOff} lang={lang} onChange={v => set('pickupAndDropOff', v)} placeholder={lang === 'ar' ? 'من الفندق' : 'e.g. Your hotel'} />
                    <LInput label="Meeting Point"         value={form.meetingPoint}     lang={lang} onChange={v => set('meetingPoint', v)}     placeholder={lang === 'ar' ? 'بوابة المطار' : 'Airport arrivals hall'} />
                  </div>
                </div>
              </div>

              <div className="atf-card">
                <div className="atf-card__head">
                  <h3>Tour Info</h3>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: '#9ca3af' }}>Type, style and duration</span>
                </div>
                <div className="atf-card__body">
                  <div className="atf-grid-3">
                    <LInput label="Tour Type"  value={form.tourType}  lang={lang} onChange={v => set('tourType', v)}  placeholder={lang === 'ar' ? 'ثقافية وتاريخية' : 'Cultural & Historical'} />
                    <LInput label="Tour Style" value={form.tourStyle} lang={lang} onChange={v => set('tourStyle', v)} placeholder={lang === 'ar' ? 'جولة جماعية' : 'Guided Group Tour'} />
                    <LInput label="Duration"   value={form.duration}  lang={lang} onChange={v => set('duration', v)}  placeholder={lang === 'ar' ? '٨ أيام / ٧ ليالٍ' : '8 Days / 7 Nights'} />
                  </div>
                </div>
              </div>

              <div className="atf-card">
                <div className="atf-card__head"><h3>Cancellation Policy</h3></div>
                <div className="atf-card__body">
                  <LRichTextEditor
                    label="Policy text"
                    value={form.cancellationPolicy} lang={lang}
                    onChange={v => set('cancellationPolicy', v)}
                    placeholder={lang === 'ar' ? 'شروط الإلغاء…' : 'Free cancellation up to 14 days before departure…'}
                    minHeight={100}
                  />
                </div>
              </div>

              {/* Group Size */}
              <div className="atf-card">
                <div className="atf-card__head">
                  <h3>Group Size</h3>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: '#9ca3af' }}>Capacity &amp; availability</span>
                </div>
                <div className="atf-card__body">
                  <div className="atf-stat-pair">
                    <Field label="Total Capacity" hint="Maximum group size">
                      <div className="atf-number-input-wrap">
                        <Users size={14} className="atf-number-input-wrap__icon" />
                        <TextInput
                          type="number"
                          value={form.groupSize.total || ''}
                          onChange={e => set('groupSize', { ...form.groupSize, total: Number(e.target.value) })}
                          placeholder="0"
                          min="0"
                          className="atf-number-input-wrap__input"
                        />
                      </div>
                    </Field>
                    <Field label="Available Spots" hint="Remaining bookable places">
                      <div className="atf-number-input-wrap">
                        <Users size={14} className="atf-number-input-wrap__icon" />
                        <TextInput
                          type="number"
                          value={form.groupSize.remaining || ''}
                          onChange={e => set('groupSize', { ...form.groupSize, remaining: Number(e.target.value) })}
                          placeholder="0"
                          min="0"
                          className="atf-number-input-wrap__input"
                        />
                      </div>
                    </Field>
                  </div>
                </div>
              </div>

            </>
          )}

          {/* ── REVIEWS ────────────────────────────────────────────── */}
          {section === 'reviews' && (
            <>
              {/* Reviews */}
              <div className="atf-card">
                <div className="atf-card__head">
                  <h3>Reviews</h3>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: '#9ca3af' }}>Manual override + review entries</span>
                </div>
                <div className="atf-card__body">
                  <div className="atf-stat-pair" style={{ marginBottom: 20 }}>
                    <Field label="Review Count" hint="Total number of reviews displayed">
                      <TextInput
                        type="number"
                        value={form.reviewsCount || ''}
                        onChange={e => set('reviewsCount', Number(e.target.value))}
                        placeholder="0"
                        min="0"
                      />
                    </Field>
                    <Field label="Average Rating" hint="Displayed star rating (0–5)">
                      <TextInput
                        type="number"
                        value={(form as FormState & { averageRating?: number }).averageRating || ''}
                        onChange={e => set('averageRating', Number(e.target.value))}
                        placeholder="4.8"
                        min="0"
                        max="5"
                        step="0.1"
                      />
                    </Field>
                  </div>

                  {form.reviews.map((review, i) => (
                    <div key={i} className="atf-review-item">
                      <div className="atf-review-item__head">
                        <div className="atf-review-item__type-tabs">
                          {(['youtube', 'text', 'video'] as const).map(t => (
                            <button key={t} type="button"
                              className={`atf-review-item__type-btn${review.type === t ? ' atf-review-item__type-btn--active' : ''}`}
                              onClick={() => { const arr = [...form.reviews]; arr[i] = { ...review, type: t }; set('reviews', arr) }}
                            >
                              {t === 'youtube' ? <PlaySquare size={11} /> : t === 'video' ? <Video size={11} /> : <MessageSquare size={11} />}
                              {t.charAt(0).toUpperCase() + t.slice(1)}
                            </button>
                          ))}
                        </div>
                        <button type="button" className="atf-remove-btn"
                          onClick={() => set('reviews', form.reviews.filter((_, j) => j !== i))}>
                          <X size={14} />
                        </button>
                      </div>

                      <LInput
                        label="Title"
                        value={review.title} lang={lang}
                        onChange={v => { const arr = [...form.reviews]; arr[i] = { ...review, title: v }; set('reviews', arr) }}
                        placeholder={lang === 'ar' ? 'عنوان التقييم' : 'Review title'}
                      />
                      {(review.type === 'youtube' || review.type === 'video') && (
                        <div style={{ marginTop: 12 }}>
                          <Field label="URL">
                            <TextInput
                              value={review.url || ''}
                              onChange={e => { const arr = [...form.reviews]; arr[i] = { ...review, url: e.target.value }; set('reviews', arr) }}
                              placeholder={review.type === 'youtube' ? 'https://youtube.com/watch?v=…' : 'https://…'}
                            />
                          </Field>
                        </div>
                      )}
                      <div style={{ marginTop: 12 }}>
                        <LRichTextEditor
                          label="Content"
                          value={review.content || defaultLoc()} lang={lang}
                          compact minHeight={60}
                          onChange={v => { const arr = [...form.reviews]; arr[i] = { ...review, content: v }; set('reviews', arr) }}
                          placeholder={lang === 'ar' ? 'نص التقييم…' : 'Review text…'}
                        />
                      </div>
                    </div>
                  ))}
                  <button type="button" className="atf-add-btn"
                    onClick={() => set('reviews', [...form.reviews, defaultReview()])}>
                    <Plus size={13} /> Add review
                  </button>
                </div>
              </div>

            </>
          )}

          {section === 'details' && (
            <>
              {/* Notes */}
              <div className="atf-card">
                <div className="atf-card__head">
                  <h3>Notes</h3>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: '#9ca3af' }}>Important notices for travellers</span>
                </div>
                <div className="atf-card__body">
                  {form.notes.map((note, i) => (
                    <div key={i} className="atf-faq-item">
                      <div className="atf-faq-item__num">{i + 1}</div>
                      <div className="atf-faq-item__inner">
                        <LInput
                          label="Note Title"
                          value={note.title} lang={lang}
                          onChange={v => { const arr = [...form.notes]; arr[i] = { ...note, title: v }; set('notes', arr) }}
                          placeholder={lang === 'ar' ? 'عنوان الملاحظة' : 'e.g. Dress Code'}
                        />
                        <div style={{ marginTop: 12 }}>
                          <LRichTextEditor
                            label="Note Text"
                            value={note.text} lang={lang}
                            compact minHeight={60}
                            onChange={v => { const arr = [...form.notes]; arr[i] = { ...note, text: v }; set('notes', arr) }}
                            placeholder={lang === 'ar' ? 'تفاصيل الملاحظة…' : 'Note details…'}
                          />
                        </div>
                      </div>
                      <button type="button" className="atf-remove-btn"
                        style={{ position: 'absolute', top: 10, right: 10 }}
                        onClick={() => set('notes', form.notes.filter((_, j) => j !== i))}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button type="button" className="atf-add-btn"
                    onClick={() => set('notes', [...form.notes, defaultNote()])}>
                    <Plus size={13} /> Add note
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── CONTENT ─────────────────────────────────────────────── */}
          {section === 'content' && (
            <>
              {/* Highlights */}
              <div className="atf-card">
                <div className="atf-card__head">
                  <h3>Highlights</h3>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: '#9ca3af' }}>Key selling points</span>
                </div>
                <div className="atf-card__body">
                  {form.tourHighlights.map((item, i) => (
                    <div key={i} className="atf-list-rte-item">
                      <div className="atf-list-rte-item__bullet">
                        <span className="atf-list-bullet atf-list-bullet--star">
                          <Star size={10} />
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <LRichTextEditor
                          label=""
                          value={item}
                          lang={lang}
                          compact
                          minHeight={52}
                          placeholder={lang === 'ar' ? 'أضف نقطة مميزة…' : 'e.g. Private guided Pyramids tour'}
                          onChange={v => {
                            const arr = [...form.tourHighlights]
                            arr[i] = v
                            set('tourHighlights', arr)
                          }}
                        />
                      </div>
                      {form.tourHighlights.length > 1 && (
                        <button type="button" className="atf-remove-btn"
                          onClick={() => set('tourHighlights', form.tourHighlights.filter((_, j) => j !== i))}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="atf-add-btn"
                    onClick={() => set('tourHighlights', [...form.tourHighlights, defaultLoc()])}>
                    <Plus size={13} /> Add highlight
                  </button>
                </div>
              </div>

              {/* Inclusions */}
              <div className="atf-card">
                <div className="atf-card__head">
                  <h3>Inclusions</h3>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: '#9ca3af' }}>What's included in the price</span>
                </div>
                <div className="atf-card__body">
                  {form.inclusion.map((item, i) => (
                    <div key={i} className="atf-list-rte-item">
                      <div className="atf-list-rte-item__bullet">
                        <span className="atf-list-bullet atf-list-bullet--check">
                          <Check size={10} />
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <LRichTextEditor
                          label=""
                          value={item}
                          lang={lang}
                          compact
                          minHeight={52}
                          placeholder={lang === 'ar' ? 'ما يشمله السعر…' : 'e.g. Airport transfers'}
                          onChange={v => {
                            const arr = [...form.inclusion]
                            arr[i] = v
                            set('inclusion', arr)
                          }}
                        />
                      </div>
                      {form.inclusion.length > 1 && (
                        <button type="button" className="atf-remove-btn"
                          onClick={() => set('inclusion', form.inclusion.filter((_, j) => j !== i))}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="atf-add-btn"
                    onClick={() => set('inclusion', [...form.inclusion, defaultLoc()])}>
                    <Plus size={13} /> Add inclusion
                  </button>
                </div>
              </div>

              {/* Exclusions */}
              <div className="atf-card">
                <div className="atf-card__head">
                  <h3>Exclusions</h3>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: '#9ca3af' }}>What's not included</span>
                </div>
                <div className="atf-card__body">
                  {form.exclusion.map((item, i) => (
                    <div key={i} className="atf-list-rte-item">
                      <div className="atf-list-rte-item__bullet">
                        <span className="atf-list-bullet atf-list-bullet--cross">
                          <X size={10} />
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <LRichTextEditor
                          label=""
                          value={item}
                          lang={lang}
                          compact
                          minHeight={52}
                          placeholder={lang === 'ar' ? 'ما لا يشمله السعر…' : 'e.g. International flights'}
                          onChange={v => {
                            const arr = [...form.exclusion]
                            arr[i] = v
                            set('exclusion', arr)
                          }}
                        />
                      </div>
                      {form.exclusion.length > 1 && (
                        <button type="button" className="atf-remove-btn"
                          onClick={() => set('exclusion', form.exclusion.filter((_, j) => j !== i))}>
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                  <button type="button" className="atf-add-btn"
                    onClick={() => set('exclusion', [...form.exclusion, defaultLoc()])}>
                    <Plus size={13} /> Add exclusion
                  </button>
                </div>
              </div>

              {/* What You'll Love */}
              <div className="atf-card">
                <div className="atf-card__head">
                  <h3>What You'll Love</h3>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: '#9ca3af' }}>Featured experience block</span>
                </div>
                <div className="atf-card__body">
                  <LRichTextEditor
                    label=""
                    value={form.whatYouWillLoveHtml} lang={lang}
                    minHeight={120}
                    placeholder={lang === 'ar' ? 'ما ستحبه في هذه الرحلة…' : 'Describe what makes this tour special…'}
                    onChange={v => set('whatYouWillLoveHtml', v)}
                  />
                </div>
              </div>

              {/* What to Pack */}
              <div className="atf-card">
                <div className="atf-card__head">
                  <h3>What to Pack</h3>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: '#9ca3af' }}>Packing checklist items</span>
                </div>
                <div className="atf-card__body">
                  {form.whatToPack.map((item, i) => (
                    <div key={i} className="atf-list-rte-item">
                      <div className="atf-list-rte-item__bullet">
                        <span className="atf-list-bullet atf-list-bullet--star">
                          <BookOpen size={10} />
                        </span>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <LRichTextEditor
                          label=""
                          value={item} lang={lang}
                          compact minHeight={52}
                          placeholder={lang === 'ar' ? 'أضف عنصرًا…' : 'e.g. Comfortable walking shoes'}
                          onChange={v => { const arr = [...form.whatToPack]; arr[i] = v; set('whatToPack', arr) }}
                        />
                      </div>
                      <button type="button" className="atf-remove-btn"
                        onClick={() => set('whatToPack', form.whatToPack.filter((_, j) => j !== i))}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button type="button" className="atf-add-btn"
                    onClick={() => set('whatToPack', [...form.whatToPack, defaultLoc()])}>
                    <Plus size={13} /> Add item
                  </button>
                </div>
              </div>

              {/* Tags */}
              <div className="atf-card">
                <div className="atf-card__head"><h3>Tags</h3></div>
                <div className="atf-card__body">
                  <TagsInput
                    label="Tour Tags"
                    value={form.tags}
                    lang={lang}
                    onChange={v => set('tags', v)}
                    placeholder="e.g. pyramids, nile, luxury"
                  />
                </div>
              </div>

            </>
          )}

          {/* ── FAQS ──────────────────────────────────────────────── */}
          {section === 'faqs' && (
            <>
              {/* FAQ */}
              <div className="atf-card">
                <div className="atf-card__head">
                  <h3>FAQs</h3>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: '#9ca3af' }}>Frequently asked questions</span>
                </div>
                <div className="atf-card__body">
                  {form.faqs.map((faq, i) => (
                    <div key={i} className="atf-faq-item">
                      <div className="atf-faq-item__num">{i + 1}</div>
                      <div className="atf-faq-item__inner">
                        <LInput
                          label="Question"
                          value={faq.question} lang={lang}
                          onChange={v => { const arr = [...form.faqs]; arr[i] = { ...faq, question: v }; set('faqs', arr) }}
                          placeholder={lang === 'ar' ? 'اكتب السؤال هنا…' : 'e.g. Is this tour suitable for children?'}
                        />
                        <div style={{ marginTop: 12 }}>
                          <LRichTextEditor
                            label="Answer"
                            value={faq.answer} lang={lang}
                            compact minHeight={72}
                            onChange={v => { const arr = [...form.faqs]; arr[i] = { ...faq, answer: v }; set('faqs', arr) }}
                            placeholder={lang === 'ar' ? 'اكتب الإجابة هنا…' : 'Yes, this tour is family-friendly…'}
                          />
                        </div>
                      </div>
                      <button type="button" className="atf-remove-btn"
                        style={{ position: 'absolute', top: 10, right: 10 }}
                        onClick={() => set('faqs', form.faqs.filter((_, j) => j !== i))}>
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button type="button" className="atf-add-btn"
                    onClick={() => set('faqs', [...form.faqs, defaultFaq()])}>
                    <Plus size={13} /> Add FAQ
                  </button>
                </div>
              </div>

            </>
          )}

          {/* ── RELATED & DOCS ─────────────────────────────────────── */}
          {section === 'related' && (
            <>
              {/* Related Tours */}
              <div className="atf-card">
                <div className="atf-card__head">
                  <h3>Related Tours</h3>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: '#9ca3af' }}>Tours shown as recommendations</span>
                </div>
                <div className="atf-card__body">
                  {form.relatedTours.length > 0 && (
                    <div className="atf-selected-tours">
                      {form.relatedTours.map((rt, i) => (
                        <span key={i} className="atf-tag">
                          {rt.title.en || rt.id}
                          <button type="button"
                            onClick={() => set('relatedTours', form.relatedTours.filter((_, j) => j !== i))}>
                            <X size={9} />
                          </button>
                        </span>
                      ))}
                    </div>
                  )}
                  <div className="atf-related-tours__search">
                    <div className="atf-input-icon-wrap">
                      <Search size={13} className="atf-input-icon-wrap__icon" />
                      <TextInput
                        value={tourSearch}
                        onChange={e => setTourSearch(e.target.value)}
                        placeholder="Search tours to link…"
                        className="atf-input-icon-wrap__input"
                      />
                    </div>
                  </div>
                  <div className="atf-related-tours__list">
                    {allTours
                      .filter(t =>
                        t.heading.en.toLowerCase().includes(tourSearch.toLowerCase()) ||
                        (t.heading.ar ?? '').includes(tourSearch)
                      )
                      .map(t => {
                        const isSelected = form.relatedTours.some(r => r.id === t._id)
                        return (
                          <div
                            key={t._id}
                            className={`atf-tour-option${isSelected ? ' atf-tour-option--selected' : ''}`}
                            onClick={() => {
                              if (isSelected) {
                                set('relatedTours', form.relatedTours.filter(r => r.id !== t._id))
                              } else {
                                set('relatedTours', [...form.relatedTours, { id: t._id, title: { en: t.heading.en, ar: t.heading.ar } }])
                              }
                            }}
                          >
                            {t.images?.[0]?.url
                              ? <img src={t.images[0].url} alt="" className="atf-tour-option__thumb" />
                              : <div className="atf-tour-option__thumb" />
                            }
                            <span className="atf-tour-option__title">{t.heading.en}</span>
                            <div className={`atf-tour-option__check${isSelected ? ' atf-tour-option__check--active' : ''}`}>
                              {isSelected && <Check size={9} />}
                            </div>
                          </div>
                        )
                      })
                    }
                    {allTours.length === 0 && (
                      <p style={{ fontSize: 12.5, color: '#9ca3af', textAlign: 'center', padding: '14px 0' }}>
                        Loading tours…
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Map */}
              <div className="atf-card">
                <div className="atf-card__head">
                  <h3>Map</h3>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: '#9ca3af' }}>Embed a Google Maps location</span>
                </div>
                <div className="atf-card__body">
                  <Field label="Iframe / src URL" hint="Paste a full <iframe> tag or just the src URL">
                    <HtmlTextarea
                      value={form.tourMapIframe}
                      onChange={e => set('tourMapIframe', e.target.value)}
                      placeholder='<iframe src="https://www.google.com/maps/embed?…'
                      rows={3}
                    />
                  </Field>
                </div>
              </div>

              {/* PDF Documents */}
              <div className="atf-card">
                <div className="atf-card__head">
                  <h3>Documents</h3>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: '#9ca3af' }}>PDFs and downloadable files</span>
                </div>
                <div className="atf-card__body">
                  {((form as FormState & { tourDocuments?: Array<{ url: string; label: Loc }> }).tourDocuments ?? []).map((doc, i) => {
                    const docs = (form as FormState & { tourDocuments?: Array<{ url: string; label: Loc }> }).tourDocuments ?? []
                    return (
                      <div key={i} className="atf-doc-item">
                        <div className="atf-doc-item__icon"><FileDown size={16} /></div>
                        <div className="atf-doc-item__fields">
                          <Field label="File URL or Upload">
                            <div style={{ display: 'flex', gap: 8 }}>
                              <TextInput
                                value={doc.url}
                                onChange={e => {
                                  const arr = [...docs]; arr[i] = { ...doc, url: e.target.value }
                                  set('tourDocuments', arr)
                                }}
                                placeholder="https://… or upload below"
                                style={{ flex: 1 }}
                              />
                              <label className="atf-upload-btn atf-upload-btn--sm" style={{ flexShrink: 0 }}>
                                <Upload size={11} /> Upload
                                <input type="file" accept=".pdf,.doc,.docx"
                                  onChange={e => {
                                    const file = e.target.files?.[0]
                                    if (!file) return
                                    const reader = new FileReader()
                                    reader.onload = () => {
                                      const arr = [...docs]; arr[i] = { ...doc, url: String(reader.result || '') }
                                      set('tourDocuments', arr)
                                    }
                                    reader.readAsDataURL(file)
                                  }}
                                />
                              </label>
                            </div>
                          </Field>
                          <LInput
                            label="Label"
                            value={doc.label} lang={lang}
                            onChange={v => {
                              const arr = [...docs]; arr[i] = { ...doc, label: v }
                              set('tourDocuments', arr)
                            }}
                            placeholder={lang === 'ar' ? 'اسم الملف' : 'e.g. Tour Brochure'}
                          />
                        </div>
                        <button type="button" className="atf-remove-btn"
                          onClick={() => set('tourDocuments', docs.filter((_, j) => j !== i))}>
                          <X size={14} />
                        </button>
                      </div>
                    )
                  })}
                  <button type="button" className="atf-add-btn"
                    onClick={() => {
                      const docs = (form as FormState & { tourDocuments?: Array<{ url: string; label: Loc }> }).tourDocuments ?? []
                      set('tourDocuments', [...docs, { url: '', label: defaultLoc() }])
                    }}>
                    <Plus size={13} /> Add document
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── ITINERARY ────────────────────────────────────────── */}
          {section === 'itinerary' && (
            <>
              <div className="atf-card">
                <div className="atf-card__head">
                  <h3>General Description</h3>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: '#9ca3af' }}>Optional overview shown above the day list</span>
                </div>
                <div className="atf-card__body">
                  <LRichTextEditor
                    label=""
                    value={form.itinerary.generalDescription} lang={lang}
                    minHeight={100}
                    placeholder={lang === 'ar' ? 'وصف عام للرحلة…' : 'Brief overview of the full journey…'}
                    onChange={v => set('itinerary', { ...form.itinerary, generalDescription: v })}
                  />
                </div>
              </div>

              <div className="atf-card">
                <div className="atf-card__head">
                  <h3>Day-by-Day Itinerary</h3>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: '#9ca3af' }}>{form.itinerary.days.length} day{form.itinerary.days.length !== 1 ? 's' : ''}</span>
                </div>
                <div className="atf-card__body">
                  {form.itinerary.days.map((day, di) => {
                    const isOpen = expandedDays.has(di)
                    return (
                      <div key={di} className="atf-itinerary-day">
                        <div className="atf-itinerary-day__head"
                          onClick={() => setExpandedDays(prev => {
                            const n = new Set(prev)
                            if (n.has(di)) n.delete(di); else n.add(di)
                            return n
                          })}
                        >
                          <span className="atf-itinerary-day__badge">Day {day.day}</span>
                          <span className="atf-itinerary-day__title">
                            {day.title.en || <span style={{ color: '#9ca3af', fontWeight: 400 }}>Untitled day</span>}
                          </span>
                          <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                            <span style={{ fontSize: 11.5, color: '#9ca3af' }}>{day.activities.length} {day.activities.length === 1 ? 'activity' : 'activities'}</span>
                            {isOpen ? <ChevronUp size={14} style={{ color: '#6b7280' }} /> : <ChevronDown size={14} style={{ color: '#6b7280' }} />}
                          </div>
                          <button type="button" className="atf-remove-btn"
                            onClick={e => { e.stopPropagation(); set('itinerary', { ...form.itinerary, days: form.itinerary.days.filter((_, j) => j !== di) }) }}>
                            <X size={14} />
                          </button>
                        </div>

                        {isOpen && (
                          <div className="atf-itinerary-day__body">
                            <div className="atf-grid-2" style={{ marginBottom: 14 }}>
                              <LInput
                                label="Day Title"
                                value={day.title} lang={lang}
                                onChange={v => {
                                  const days = [...form.itinerary.days]
                                  days[di] = { ...day, title: v }
                                  set('itinerary', { ...form.itinerary, days })
                                }}
                                placeholder={lang === 'ar' ? 'عنوان اليوم' : 'e.g. Arrival in Cairo'}
                              />
                              <InputField
                                label="Day Number"
                                type="number"
                                className="atf-day-number-input"
                                value={day.day}
                                min="1"
                                onChange={e => {
                                  const days = [...form.itinerary.days]
                                  days[di] = { ...day, day: Number(e.target.value) }
                                  set('itinerary', { ...form.itinerary, days })
                                }}
                              />
                            </div>

                            <LRichTextEditor
                              label="Day Description"
                              value={day.description} lang={lang}
                              minHeight={90}
                              onChange={v => {
                                const days = [...form.itinerary.days]
                                days[di] = { ...day, description: v }
                                set('itinerary', { ...form.itinerary, days })
                              }}
                              placeholder={lang === 'ar' ? 'وصف فعاليات اليوم…' : "Describe the day's events…"}
                            />

                            {/* Activities */}
                            {day.activities.length > 0 && (
                              <div style={{ marginTop: 16 }}>
                                <p className="atf-label" style={{ marginBottom: 10 }}>Activities</p>
                                {day.activities.map((act, ai) => (
                                  <div key={ai} className="atf-itinerary-activity">
                                    <div className="atf-itinerary-activity__head">
                                      <span>Activity {ai + 1}</span>
                                      <div style={{ flex: 1 }} />
                                      <button type="button" className="atf-remove-btn"
                                        onClick={() => {
                                          const days = [...form.itinerary.days]
                                          days[di] = { ...day, activities: day.activities.filter((_, j) => j !== ai) }
                                          set('itinerary', { ...form.itinerary, days })
                                        }}>
                                        <X size={14} />
                                      </button>
                                    </div>
                                    <LInput
                                      label="Activity Heading"
                                      value={act.heading} lang={lang}
                                      onChange={v => {
                                        const days = [...form.itinerary.days]
                                        const acts = [...day.activities]; acts[ai] = { ...act, heading: v }
                                        days[di] = { ...day, activities: acts }
                                        set('itinerary', { ...form.itinerary, days })
                                      }}
                                      placeholder={lang === 'ar' ? 'عنوان النشاط' : 'e.g. Visit the Pyramids'}
                                    />
                                    <div style={{ marginTop: 12 }}>
                                      <LRichTextEditor
                                        label="Activity Description"
                                        value={act.description} lang={lang}
                                        compact minHeight={60}
                                        onChange={v => {
                                          const days = [...form.itinerary.days]
                                          const acts = [...day.activities]; acts[ai] = { ...act, description: v }
                                          days[di] = { ...day, activities: acts }
                                          set('itinerary', { ...form.itinerary, days })
                                        }}
                                        placeholder={lang === 'ar' ? 'وصف النشاط…' : 'Activity details…'}
                                      />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            <button type="button" className="atf-add-btn" style={{ marginTop: day.activities.length > 0 ? 4 : 16 }}
                              onClick={() => {
                                const days = [...form.itinerary.days]
                                days[di] = { ...day, activities: [...day.activities, defaultActivity()] }
                                set('itinerary', { ...form.itinerary, days })
                              }}>
                              <Plus size={13} /> Add activity
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}

                  <button type="button" className="atf-add-btn"
                    onClick={() => {
                      const n = form.itinerary.days.length + 1
                      const newDay = defaultDay(n)
                      set('itinerary', { ...form.itinerary, days: [...form.itinerary.days, newDay] })
                      setExpandedDays(prev => new Set([...prev, form.itinerary.days.length]))
                    }}>
                    <Plus size={13} /> Add day
                  </button>
                </div>
              </div>
            </>
          )}

          {/* ── SEO ─────────────────────────────────────────────────── */}
          {section === 'seo' && (
            <>
              {/* Live SERP preview */}
              <div className="atf-serp-preview">
                <div className="atf-serp-preview__label">
                  <Search size={12} />
                  Search preview
                </div>
                <div className="atf-serp-preview__title">
                  {serpTitle || <span className="atf-serp-preview__placeholder">Tour title will appear here</span>}
                </div>
                <div className="atf-serp-preview__url">
                  alforsa.com › tours
                  {serpSlug && <><span> › </span>{serpSlug}</>}
                </div>
                <div className="atf-serp-preview__desc">
                  {serpDesc || <span className="atf-serp-preview__placeholder">Meta description will appear here…</span>}
                </div>
              </div>

              <div className="atf-card">
                <div className="atf-card__head">
                  <h3>Search Engine Metadata</h3>
                  <span style={{ fontSize: 11.5, fontWeight: 500, color: '#9ca3af' }}>Leave blank to auto-fill from tour content</span>
                </div>
                <div className="atf-card__body">
                  <LInput
                    label="Meta Title"
                    value={seo.metaTitle || defaultLoc()} lang={lang}
                    onChange={v => set('seo.metaTitle', v)}
                    placeholder={lang === 'ar' ? 'عنوان في محركات البحث…' : 'Page title for search engines…'}
                  />
                  <div style={{ marginTop: 16 }}>
                    <LRichTextEditor
                      label="Meta Description"
                      value={seo.metaDescription || defaultLoc()} lang={lang}
                      compact minHeight={80}
                      onChange={v => set('seo.metaDescription', v)}
                      placeholder={lang === 'ar' ? 'وصف قصير يظهر في نتائج البحث…' : 'Brief description for search results…'}
                    />
                  </div>
                  <div style={{ marginTop: 16 }}>
                    <TagsInput
                      label="Meta Keywords"
                      value={seo.metaKeywords || { en: [], ar: [] }}
                      lang={lang}
                      onChange={v => set('seo.metaKeywords', v)}
                      placeholder="e.g. Egypt tours, Pyramids, Nile cruise"
                    />
                  </div>

                  {/* Meta Image — same ImageCard component, no cover controls */}
                  <div style={{ marginTop: 16 }}>
                    <p className="atf-label" style={{ marginBottom: 6 }}>Meta Image</p>
                    <p className="atf-hint" style={{ margin: '0 0 8px' }}>Recommended 1200 × 630 px — defaults to first tour image</p>
                    <ImageCard
                      img={{
                        url:   seo.metaImage?.url   || '',
                        alt:   seo.metaImage?.alt   || defaultLoc(),
                        title: seo.metaImage?.title || defaultLoc(),
                      }}
                      lang={lang}
                      onUpdate={v => set('seo.metaImage', { url: v.url, alt: v.alt, title: v.title })}
                    />
                  </div>
                </div>
              </div>
            </>
          )}

        </motion.div>
      </AnimatePresence>

      {/* ══════════════════════════════════════════════════════════════════
          FIXED SAVE BAR
      ══════════════════════════════════════════════════════════════════ */}
      <div className="atf-save-bar">
        <div className="atf-save-bar__left">
          {isDirty && <span className="atf-unsaved-pill">Unsaved changes</span>}
        </div>
        <div className="atf-save-bar__right">
          <button type="button" className="quick-action-btn quick-action-btn--outline"
            onClick={onCancel} disabled={saving}
          >
            Cancel
          </button>
          <button type="button" className="quick-action-btn quick-action-btn--primary"
            onClick={handleSubmit} disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}
          >
            {saving
              ? <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} />
              : <Save size={14} style={{ stroke: 'currentColor', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }} />}
            {saving ? 'Saving…' : tourId ? 'Save Changes' : 'Publish Tour'}
          </button>
          {!saving && (
            <span className="atf-kbd" title="Keyboard shortcut">⌘S</span>
          )}
        </div>
      </div>

    </div>
  )
}

export default AdminTourForm

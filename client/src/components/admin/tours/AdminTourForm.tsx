import { useState, useEffect } from 'react'
import { tourService } from '../../../services/tourService'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { ArrowLeft, Plus, X, Star, Eye } from 'lucide-react'

interface Props {
  tourId?: string
  onSaved: () => void
  onCancel: () => void
}

type Loc = { en: string; ar?: string }

const LANGS = [
  { code: 'en' as const, flag: '🇬🇧', label: 'EN' },
  { code: 'ar' as const, flag: '🇸🇦', label: 'AR' },
]

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
  isActive:           true,
  isFeatured:         false,
})

type FormData = ReturnType<typeof defaultForm>

// ── Localized field with flag-tab switcher ────────────────────────────────────
function LocalizedInput({
  label, value, onChange, multiline = false, required = false, error,
}: {
  label: string
  value: Loc
  onChange: (val: Loc) => void
  multiline?: boolean
  required?: boolean
  error?: string
}) {
  const [active, setActive] = useState<'en' | 'ar'>('en')
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <Label>{label}{required && <span className="text-red-500 ml-0.5">*</span>}</Label>
        <div className="flex gap-1">
          {LANGS.map(({ code, flag }) => (
            <button
              key={code}
              type="button"
              onClick={() => setActive(code)}
              className={cn(
                'text-lg leading-none p-1 rounded-md transition-all border',
                active === code
                  ? 'border-purple-500 bg-purple-50 opacity-100 shadow-sm'
                  : 'border-transparent opacity-40 hover:opacity-70 hover:bg-gray-50'
              )}
            >
              {flag}
            </button>
          ))}
        </div>
      </div>
      {multiline ? (
        <Textarea
          value={value[active] ?? ''}
          onChange={e => onChange({ ...value, [active]: e.target.value })}
          dir={active === 'ar' ? 'rtl' : 'ltr'}
          className={error ? 'border-red-400 focus-visible:ring-red-400' : ''}
          rows={4}
        />
      ) : (
        <Input
          value={value[active] ?? ''}
          onChange={e => onChange({ ...value, [active]: e.target.value })}
          dir={active === 'ar' ? 'rtl' : 'ltr'}
          className={error ? 'border-red-400 focus-visible:ring-red-400' : ''}
        />
      )}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

// ── Localized list row ────────────────────────────────────────────────────────
function LocalizedListRow({
  item, total, placeholder, onChange, onRemove,
}: {
  item: Loc
  total: number
  placeholder?: string
  onChange: (val: Loc) => void
  onRemove: () => void
}) {
  const [active, setActive] = useState<'en' | 'ar'>('en')
  return (
    <div className="mb-2">
      <div className="flex items-center gap-1 mb-1">
        {LANGS.map(({ code, flag }) => (
          <button
            key={code}
            type="button"
            onClick={() => setActive(code)}
            className={cn(
              'text-base leading-none p-0.5 rounded border transition-all',
              active === code
                ? 'border-purple-500 bg-purple-50 opacity-100'
                : 'border-transparent opacity-35 hover:opacity-60'
            )}
          >
            {flag}
          </button>
        ))}
      </div>
      <div className="flex gap-2 items-center">
        <Input
          placeholder={placeholder}
          value={item[active] ?? ''}
          onChange={e => onChange({ ...item, [active]: e.target.value })}
          dir={active === 'ar' ? 'rtl' : 'ltr'}
        />
        {total > 1 && (
          <Button type="button" variant="ghost" size="icon" onClick={onRemove}
            className="text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0">
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

// ── Localized list (highlights / inclusions / exclusions) ─────────────────────
function LocalizedList({
  label, items, onChange, placeholder,
}: {
  label: string
  items: Loc[]
  onChange: (items: Loc[]) => void
  placeholder?: string
}) {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{label}</span>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => onChange([...items, defaultLoc()])}
          className="h-7 text-purple-600 hover:text-purple-700 hover:bg-purple-50 text-xs"
        >
          <Plus className="h-3 w-3" /> Add
        </Button>
      </div>
      {items.map((item, i) => (
        <LocalizedListRow
          key={i}
          item={item}
          total={items.length}
          placeholder={placeholder}
          onChange={val => { const next = [...items]; next[i] = val; onChange(next) }}
          onRemove={() => onChange(items.filter((_, j) => j !== i))}
        />
      ))}
    </div>
  )
}

// ── Main component ────────────────────────────────────────────────────────────
const AdminTourForm = ({ tourId, onSaved, onCancel }: Props) => {
  const [form, setForm]       = useState<FormData>(defaultForm())
  const [loading, setLoading] = useState(!!tourId)
  const [saving, setSaving]   = useState(false)
  const [errors, setErrors]   = useState<Record<string, string>>({})

  useEffect(() => {
    if (!tourId) return
    tourService.getById(tourId)
      .then((tour: any) => setForm(tour))
      .catch(() => alert('Failed to load tour'))
      .finally(() => setLoading(false))
  }, [tourId])

  const set = (path: string, value: any) => {
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

  const validate = () => {
    const e: Record<string, string> = {}
    if (!form.heading.en.trim())            e['heading.en']            = 'English heading is required'
    if (!form.slug.en.trim())               e['slug.en']               = 'English slug is required'
    if (!form.Description.header.en.trim()) e['Description.header.en'] = 'Required'
    if (!form.Description.text.en.trim())   e['Description.text.en']   = 'Required'
    if (!form.images[0]?.url.trim())        e['images.0.url']          = 'At least one image URL is required'
    setErrors(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async () => {
    if (!validate()) return
    setSaving(true)
    try {
      if (tourId) await tourService.update(tourId, form)
      else        await tourService.create(form)
      onSaved()
    } catch (err: any) {
      alert(err.response?.data?.message || 'Save failed. Please try again.')
    } finally {
      setSaving(false)
    }
  }

  const autoSlug = (en: string) =>
    en.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  if (loading) {
    return (
      <div className="p-6 space-y-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-12 rounded-lg bg-gray-100 animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">

      {/* Sticky header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100 shadow-sm">
        <div className="flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" onClick={onCancel} type="button" className="text-gray-500">
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div>
              <h1 className="text-base font-semibold text-gray-900">
                {tourId ? 'Edit Tour' : 'New Tour'}
              </h1>
              {tourId && form.heading.en && (
                <p className="text-xs text-gray-500 mt-0.5">{form.heading.en}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onCancel} disabled={saving} type="button">
              Cancel
            </Button>
            <Button size="sm" onClick={handleSubmit} disabled={saving} type="button">
              {saving ? 'Saving…' : tourId ? 'Save Changes' : 'Create Tour'}
            </Button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-6 py-6">
        <Tabs defaultValue="basic">
          <TabsList className="mb-4 w-full justify-start">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="details">Details</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          {/* ── BASIC ── */}
          <TabsContent value="basic" className="space-y-4">

            <Card>
              <CardHeader><CardTitle>Identity</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <LocalizedInput
                  label="Heading" required
                  value={form.heading}
                  error={errors['heading.en']}
                  onChange={v => {
                    set('heading', v)
                    if (!tourId) set('slug', { ...form.slug, en: autoSlug(v.en) })
                  }}
                />
                <LocalizedInput
                  label="Slug (URL)" required
                  value={form.slug}
                  error={errors['slug.en']}
                  onChange={v => set('slug', v)}
                />
                <Separator />
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={form.isActive}
                      onCheckedChange={v => set('isActive', v)}
                    />
                    <div>
                      <Label className="flex items-center gap-1.5">
                        <Eye className="h-3.5 w-3.5 text-gray-400" />
                        {form.isActive ? 'Active' : 'Inactive'}
                      </Label>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {form.isActive ? 'Visible on site' : 'Hidden from site'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={form.isFeatured}
                      onCheckedChange={v => set('isFeatured', v)}
                    />
                    <div>
                      <Label className="flex items-center gap-1.5">
                        <Star className="h-3.5 w-3.5 text-gray-400" />
                        {form.isFeatured ? 'Featured' : 'Not featured'}
                      </Label>
                      <p className="text-xs text-gray-400 mt-0.5">
                        {form.isFeatured ? 'Shown on homepage' : 'Standard listing'}
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Starting Price</CardTitle></CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3">
                  {CURRENCIES.map(c => (
                    <div key={c} className="space-y-1.5">
                      <Label className="text-xs text-gray-500">{c}</Label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-gray-400">{c}</span>
                        <Input
                          type="number"
                          min={0}
                          placeholder="0"
                          value={form.priceStartingFrom[c] || ''}
                          onChange={e => set('priceStartingFrom', { ...form.priceStartingFrom, [c]: Number(e.target.value) })}
                          className="pl-11"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Description</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <LocalizedInput
                  label="Header" required
                  value={form.Description.header}
                  error={errors['Description.header.en']}
                  onChange={v => set('Description.header', v)}
                />
                <LocalizedInput
                  label="Body" required multiline
                  value={form.Description.text}
                  error={errors['Description.text.en']}
                  onChange={v => set('Description.text', v)}
                />
              </CardContent>
            </Card>

            <Card>
              <CardHeader><CardTitle>Images</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                {form.images.map((img, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      type="url"
                      placeholder="Image URL *"
                      value={img.url}
                      onChange={e => {
                        const imgs = [...form.images]
                        imgs[i] = { ...imgs[i], url: e.target.value }
                        set('images', imgs)
                      }}
                      className={i === 0 && errors['images.0.url'] ? 'border-red-400' : ''}
                    />
                    <Input
                      placeholder="Alt text"
                      value={img.alt || ''}
                      onChange={e => {
                        const imgs = [...form.images]
                        imgs[i] = { ...imgs[i], alt: e.target.value }
                        set('images', imgs)
                      }}
                      className="w-36 shrink-0"
                    />
                    {form.images.length > 1 && (
                      <Button type="button" variant="ghost" size="icon"
                        className="text-gray-400 hover:text-red-500 hover:bg-red-50 shrink-0"
                        onClick={() => set('images', form.images.filter((_, j) => j !== i))}>
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {errors['images.0.url'] && <p className="text-xs text-red-500">{errors['images.0.url']}</p>}
                <Button type="button" variant="outline" size="sm"
                  className="w-full mt-1 border-dashed text-gray-500 hover:text-purple-600 hover:border-purple-400 hover:bg-purple-50"
                  onClick={() => set('images', [...form.images, { url: '', alt: '' }])}>
                  <Plus className="h-3.5 w-3.5" /> Add Image
                </Button>
              </CardContent>
            </Card>

          </TabsContent>

          {/* ── DETAILS ── */}
          <TabsContent value="details" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Tour Details</CardTitle></CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <LocalizedInput label="Location"          value={form.tourLocation}       onChange={v => set('tourLocation', v)} />
                <LocalizedInput label="Availability"      value={form.tourAvailability}   onChange={v => set('tourAvailability', v)} />
                <LocalizedInput label="Pickup & Drop Off" value={form.pickupAndDropOff}   onChange={v => set('pickupAndDropOff', v)} />
                <LocalizedInput label="Tour Type"         value={form.tourType}           onChange={v => set('tourType', v)} />
                <LocalizedInput label="Tour Style"        value={form.tourStyle}          onChange={v => set('tourStyle', v)} />
                <LocalizedInput label="Duration"          value={form.duration}           onChange={v => set('duration', v)} />
                <LocalizedInput label="Meeting Point"     value={form.meetingPoint}       onChange={v => set('meetingPoint', v)} />
                <div className="md:col-span-2">
                  <LocalizedInput label="Cancellation Policy" multiline value={form.cancellationPolicy} onChange={v => set('cancellationPolicy', v)} />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── CONTENT ── */}
          <TabsContent value="content" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>Content</CardTitle></CardHeader>
              <CardContent className="space-y-2">
                <LocalizedList label="Highlights"   items={form.tourHighlights} onChange={v => set('tourHighlights', v)} placeholder="Enter highlight…" />
                <Separator className="my-3" />
                <LocalizedList label="Inclusions"   items={form.inclusion}      onChange={v => set('inclusion', v)}      placeholder="What's included…" />
                <Separator className="my-3" />
                <LocalizedList label="Exclusions"   items={form.exclusion}      onChange={v => set('exclusion', v)}      placeholder="What's not included…" />
                <Separator className="my-3" />
                <div className="space-y-1.5">
                  <Label>Map Embed</Label>
                  <Textarea
                    rows={3}
                    value={(form as any).tourMapIframe || ''}
                    onChange={e => set('tourMapIframe', e.target.value)}
                    placeholder="Paste Google Maps iframe src or full tag"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ── SEO ── */}
          <TabsContent value="seo" className="space-y-4">
            <Card>
              <CardHeader><CardTitle>SEO</CardTitle></CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-50 border border-blue-100">
                  <span className="text-xs text-blue-600">Leave blank to auto-populate from heading and description.</span>
                </div>
                <LocalizedInput
                  label="Meta Title"
                  value={(form as any).seo?.metaTitle || defaultLoc()}
                  onChange={v => set('seo.metaTitle', v)}
                />
                <LocalizedInput
                  label="Meta Description" multiline
                  value={(form as any).seo?.metaDescription || defaultLoc()}
                  onChange={v => set('seo.metaDescription', v)}
                />
                <div className="space-y-1.5">
                  <Label>Meta Image URL</Label>
                  <Input
                    type="url"
                    value={(form as any).seo?.metaImage?.url || ''}
                    onChange={e => set('seo.metaImage', { url: e.target.value })}
                    placeholder="https://…"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

        </Tabs>
      </div>
    </div>
  )
}

export default AdminTourForm

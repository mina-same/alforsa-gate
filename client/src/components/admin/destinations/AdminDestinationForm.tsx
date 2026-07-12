/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, Save, Loader2,
  Settings, Image, BarChart2, Info, MapPin, Cloud,
  UtensilsCrossed, DollarSign, CheckSquare, HelpCircle,
  LayoutGrid, Megaphone, Search as SearchLucide,
} from 'lucide-react';
import { destinationService } from '../../../services/destinationService';
import type { IDestination } from '../../../services/destinationService';
import { LInput, LTextarea, Field, TextInput } from '../AdminFormFields';

interface Props {
  destinationId?: string;
  onSaved:  () => void;
  onCancel: () => void;
}

// ─── Blank state ──────────────────────────────────────────────────────────────

const BLANK: any = {
  slug: '', countryFlag: '', primaryColor: '#0a5c44', isActive: true,
  heroImage: '', name: { en: '', ar: '' }, subtitle: { en: '', ar: '' },
  heroCta: { en: '', ar: '' }, heroExplore: { en: '', ar: '' },
  heroScroll: { en: '', ar: '' }, heroTagline: { en: '', ar: '' },
  stats: { capital: { en: '', ar: '' }, language: { en: '', ar: '' }, currency: { en: '', ar: '' }, bestSeason: { en: '', ar: '' } },
  aboutImage: '', aboutTitle: { en: '', ar: '' }, aboutText: { en: '', ar: '' },
  statCounters: [],
  attractionsTitle: { en: '', ar: '' }, attractionsSubtitle: { en: '', ar: '' }, attractions: [],
  seasonTitle: { en: '', ar: '' }, seasonSubtitle: { en: '', ar: '' }, seasons: [],
  foodTitle: { en: '', ar: '' }, foodSubtitle: { en: '', ar: '' }, foods: [],
  budgetTitle: { en: '', ar: '' }, budgets: [],
  practicalTitle: { en: '', ar: '' }, practicalSubtitle: { en: '', ar: '' }, practicalSections: [],
  faqTitle: { en: '', ar: '' }, faqSubtitle: { en: '', ar: '' }, faqs: [],
  galleryTitle: { en: '', ar: '' }, gallerySubtitle: { en: '', ar: '' }, gallery: [],
  ctaBgImage: '', ctaTitle: { en: '', ar: '' }, ctaText: { en: '', ar: '' },
  ctaBtn: { en: '', ar: '' }, seatsLabel: { en: '', ar: '' }, seatsRemaining: 30,
  seoTitle: { en: '', ar: '' }, seoDescription: { en: '', ar: '' },
  seoKeywords: { en: '', ar: '' }, canonicalPath: '',
};

const SECTIONS = [
  { id: 0,  label: 'Basic',       icon: Settings },
  { id: 1,  label: 'Hero',        icon: Image },
  { id: 2,  label: 'Stats',       icon: BarChart2 },
  { id: 3,  label: 'About',       icon: Info },
  { id: 4,  label: 'Attractions', icon: MapPin },
  { id: 5,  label: 'Seasons',     icon: Cloud },
  { id: 6,  label: 'Food',        icon: UtensilsCrossed },
  { id: 7,  label: 'Budget',      icon: DollarSign },
  { id: 8,  label: 'Practical',   icon: CheckSquare },
  { id: 9,  label: 'FAQs',        icon: HelpCircle },
  { id: 10, label: 'Gallery',     icon: LayoutGrid },
  { id: 11, label: 'CTA',         icon: Megaphone },
  { id: 12, label: 'SEO',         icon: SearchLucide },
] as const;

// ─── Component ────────────────────────────────────────────────────────────────

const AdminDestinationForm = ({ destinationId, onSaved, onCancel }: Props) => {
  const [form, setForm]       = useState<any>(BLANK);
  const [tab, setTab]         = useState(0);
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(!!destinationId);
  const [error, setError]     = useState<string | null>(null);
  const savedSnapshot         = useRef<string>(JSON.stringify(BLANK));

  const isDirty = JSON.stringify(form) !== savedSnapshot.current;

  useEffect(() => {
    if (!destinationId) return;
    destinationService.getById(destinationId)
      .then((d: IDestination) => {
        const merged = { ...BLANK, ...d };
        setForm(merged);
        savedSnapshot.current = JSON.stringify(merged);
      })
      .catch(() => setError('Failed to load destination'))
      .finally(() => setLoading(false));
  }, [destinationId]);

  const set = (path: string, value: any) => {
    setForm((prev: any) => {
      const next = { ...prev };
      const keys = path.split('.');
      let cur = next;
      for (let i = 0; i < keys.length - 1; i++) {
        cur[keys[i]] = { ...cur[keys[i]] };
        cur = cur[keys[i]];
      }
      cur[keys[keys.length - 1]] = value;
      return next;
    });
  };

  // Shorthand for top-level Loc fields
  const lp = (path: string) => ({
    value: form[path] || { en: '', ar: '' },
    onChange: (v: any) => set(path, v),
  });

  // Update a single item inside an array field
  const setItem = (field: string, index: number, patch: any) =>
    setForm((prev: any) => {
      const arr = [...(prev[field] || [])];
      arr[index] = { ...arr[index], ...patch };
      return { ...prev, [field]: arr };
    });

  const removeItem = (field: string, index: number) =>
    setForm((prev: any) => ({ ...prev, [field]: (prev[field] || []).filter((_: any, j: number) => j !== index) }));

  const addItem = (field: string, blank: any) =>
    setForm((prev: any) => ({ ...prev, [field]: [...(prev[field] || []), blank] }));

  const handleSubmit = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      if (destinationId) {
        await destinationService.update(destinationId, form);
      } else {
        await destinationService.create(form);
      }
      savedSnapshot.current = JSON.stringify(form);
      onSaved();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [form, destinationId, onSaved]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSubmit(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSubmit]);

  // ── Skeleton ──────────────────────────────────────────────────────────────
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
          {[80, 70, 90, 60, 80, 60].map((w, i) => (
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
    );
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="admin-content admin-content--tour-form">

      {/* ── Form header ───────────────────────────────────────────────────── */}
      <div className="atf-form-header">
        <div className="atf-form-header__left">
          <button type="button" className="atl-back-btn" onClick={onCancel}>
            <ArrowLeft size={15} style={{ stroke: 'currentColor', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }} />
          </button>
          <div>
            <div className="atf-breadcrumb">
              <span className="atf-breadcrumb__item" onClick={onCancel}>Destinations</span>
              <span className="atf-breadcrumb__sep">›</span>
              <span className="atf-breadcrumb__current">
                {destinationId ? (form.name?.en || 'Edit Destination') : 'New Destination'}
              </span>
            </div>
            <p className="atf-form-header__title">
              {destinationId ? 'Edit Destination' : 'New Destination'}
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
          </div>
        </div>
      </div>

      {error && <div className="atf-error" style={{ margin: '0 0 12px' }}>{error}</div>}

      {/* ── Tabs ──────────────────────────────────────────────────────────── */}
      <div className="atf-tabs">
        {SECTIONS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            type="button"
            className={`atf-tab${tab === id ? ' atf-tab--active' : ''}`}
            onClick={() => setTab(id)}
          >
            <Icon size={13} style={{ stroke: 'currentColor', fill: 'none', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', flexShrink: 0 }} />
            {label}
          </button>
        ))}
      </div>

      {/* ── Panel ─────────────────────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={tab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.12 }}
          className="atf-panel"
        >

          {/* Basic */}
          {tab === 0 && (
            <div className="atf-card">
              <div className="atf-card__head"><h3>Basic Info</h3></div>
              <div className="atf-card__body">
                <Field label="Slug *">
                  <TextInput value={form.slug} onChange={(e) => set('slug', e.target.value)} required placeholder="russia" />
                </Field>
                <Field label="Country Flag Emoji">
                  <TextInput value={form.countryFlag} onChange={(e) => set('countryFlag', e.target.value)} placeholder="🇷🇺" />
                </Field>
                <Field label="Primary Color">
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <input type="color" value={form.primaryColor?.replace('var(--tg-theme-primary, ', '').replace(')', '') || '#0a5c44'} onChange={(e) => set('primaryColor', e.target.value)} style={{ width: 40, height: 40, border: 'none', borderRadius: 6, cursor: 'pointer' }} />
                    <TextInput value={form.primaryColor} onChange={(e) => set('primaryColor', e.target.value)} placeholder="#0a5c44" />
                  </div>
                </Field>
                <Field label="Canonical Path">
                  <TextInput value={form.canonicalPath} onChange={(e) => set('canonicalPath', e.target.value)} placeholder="/destination/russia" />
                </Field>
              </div>
            </div>
          )}

          {/* Hero */}
          {tab === 1 && (
            <div className="atf-card">
              <div className="atf-card__head"><h3>Hero Section</h3></div>
              <div className="atf-card__body">
                <Field label="Hero Image URL *">
                  <TextInput value={form.heroImage} onChange={(e) => set('heroImage', e.target.value)} required placeholder="https://…" />
                </Field>
                {form.heroImage && <img src={form.heroImage} alt="preview" style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10, marginBottom: 12 }} onError={(e: any) => { e.currentTarget.style.display = 'none'; }} />}
                <LInput label="Name *"          {...lp('name')}        required />
                <LInput label="Subtitle"         {...lp('subtitle')}    />
                <LInput label="CTA Button"       {...lp('heroCta')}     />
                <LInput label="Explore Button"   {...lp('heroExplore')} />
                <LInput label="Scroll Label"     {...lp('heroScroll')}  />
                <LInput label="Hero Tagline"     {...lp('heroTagline')} />
              </div>
            </div>
          )}

          {/* Stats */}
          {tab === 2 && (
            <div className="atf-card">
              <div className="atf-card__head"><h3>Quick Stats Bar</h3></div>
              <div className="atf-card__body">
                <LInput label="Capital"     value={form.stats?.capital    || { en: '', ar: '' }} onChange={v => set('stats.capital', v)} />
                <LInput label="Language"    value={form.stats?.language   || { en: '', ar: '' }} onChange={v => set('stats.language', v)} />
                <LInput label="Currency"    value={form.stats?.currency   || { en: '', ar: '' }} onChange={v => set('stats.currency', v)} />
                <LInput label="Best Season" value={form.stats?.bestSeason || { en: '', ar: '' }} onChange={v => set('stats.bestSeason', v)} />
              </div>
            </div>
          )}

          {/* About */}
          {tab === 3 && (
            <>
              <div className="atf-card">
                <div className="atf-card__head"><h3>About Section</h3></div>
                <div className="atf-card__body">
                  <Field label="About Image URL">
                    <TextInput value={form.aboutImage} onChange={(e) => set('aboutImage', e.target.value)} placeholder="https://…" />
                  </Field>
                  <LInput    label="About Title" {...lp('aboutTitle')} />
                  <LTextarea label="About Text"  {...lp('aboutText')} minHeight={100} />
                </div>
              </div>
              <div className="atf-card">
                <div className="atf-card__head"><h3>Stat Counters</h3></div>
                <div className="atf-card__body">
                  {(form.statCounters || []).map((sc: any, i: number) => (
                    <div key={i} style={{ background: '#f9fafb', borderRadius: 10, padding: 14, marginBottom: 10 }}>
                      <div style={{ display: 'grid', gridTemplateColumns: '80px 1fr auto', gap: 8, alignItems: 'flex-start' }}>
                        <Field label="Value">
                          <TextInput value={sc.value} onChange={(e) => setItem('statCounters', i, { value: e.target.value })} placeholder="29" />
                        </Field>
                        <LInput
                          label="Label"
                          value={sc.label || { en: '', ar: '' }}
                          onChange={v => setItem('statCounters', i, { label: v })}
                        />
                        <button type="button" onClick={() => removeItem('statCounters', i)} style={{ marginTop: 22, background: '#fee2e2', border: 'none', borderRadius: 6, padding: '7px 10px', cursor: 'pointer', color: '#dc2626' }}>✕</button>
                      </div>
                    </div>
                  ))}
                  <button type="button" className="atf-btn atf-btn--outline" onClick={() => addItem('statCounters', { value: '', label: { en: '', ar: '' } })}>+ Add Counter</button>
                </div>
              </div>
            </>
          )}

          {/* Attractions */}
          {tab === 4 && (
            <div className="atf-card">
              <div className="atf-card__head"><h3>Attractions</h3></div>
              <div className="atf-card__body">
                <LInput    label="Section Title"    {...lp('attractionsTitle')} />
                <LInput    label="Section Subtitle" {...lp('attractionsSubtitle')} />
                {(form.attractions || []).map((a: any, i: number) => (
                  <div key={i} style={{ background: '#f9fafb', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: '#374151' }}>Attraction {i + 1}</span>
                      <button type="button" onClick={() => removeItem('attractions', i)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', color: '#dc2626', fontSize: 12 }}>Remove</button>
                    </div>
                    <Field label="Image URL">
                      <TextInput value={a.img} onChange={(e) => setItem('attractions', i, { img: e.target.value })} placeholder="https://…" />
                    </Field>
                    <LInput
                      label="City"
                      value={a.city || { en: '', ar: '' }}
                      onChange={v => setItem('attractions', i, { city: v })}
                    />
                    <LInput
                      label="Name"
                      value={a.name || { en: '', ar: '' }}
                      onChange={v => setItem('attractions', i, { name: v })}
                    />
                    <LTextarea
                      label="Description"
                      value={a.desc || { en: '', ar: '' }}
                      onChange={v => setItem('attractions', i, { desc: v })}
                      minHeight={80}
                    />
                  </div>
                ))}
                <button type="button" className="atf-btn atf-btn--outline" onClick={() => addItem('attractions', { img: '', city: { en: '', ar: '' }, name: { en: '', ar: '' }, desc: { en: '', ar: '' } })}>+ Add Attraction</button>
              </div>
            </div>
          )}

          {/* Seasons */}
          {tab === 5 && (
            <div className="atf-card">
              <div className="atf-card__head"><h3>Seasons</h3></div>
              <div className="atf-card__body">
                <LInput label="Section Title"    {...lp('seasonTitle')} />
                <LInput label="Section Subtitle" {...lp('seasonSubtitle')} />
                {(form.seasons || []).map((s: any, i: number) => (
                  <div key={i} style={{ background: '#f9fafb', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>Season {i + 1}</span>
                      <button type="button" onClick={() => removeItem('seasons', i)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', color: '#dc2626', fontSize: 12 }}>Remove</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 8 }}>
                      <Field label="Icon (Lucide name)">
                        <select className="atf-input" value={s.icon} onChange={(e) => setItem('seasons', i, { icon: e.target.value })}>
                          {['Snowflake', 'Flower2', 'Sun', 'Leaf', 'Mountain', 'Waves', 'Globe'].map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                        </select>
                      </Field>
                      <Field label="Highlighted">
                        <label style={{ display: 'flex', gap: 8, alignItems: 'center', cursor: 'pointer', marginTop: 8 }}>
                          <input type="checkbox" checked={s.highlight} onChange={(e) => setItem('seasons', i, { highlight: e.target.checked })} />
                          <span style={{ fontSize: 13 }}>Accent card</span>
                        </label>
                      </Field>
                    </div>
                    <LInput    label="Name" value={s.name || { en: '', ar: '' }} onChange={v => setItem('seasons', i, { name: v })} />
                    <LInput    label="Tag"  value={s.tag  || { en: '', ar: '' }} onChange={v => setItem('seasons', i, { tag: v })} />
                    <LTextarea label="Description" value={s.desc || { en: '', ar: '' }} onChange={v => setItem('seasons', i, { desc: v })} minHeight={80} />
                  </div>
                ))}
                <button type="button" className="atf-btn atf-btn--outline" onClick={() => addItem('seasons', { icon: 'Sun', highlight: false, name: { en: '', ar: '' }, desc: { en: '', ar: '' }, tag: { en: '', ar: '' } })}>+ Add Season</button>
              </div>
            </div>
          )}

          {/* Food */}
          {tab === 6 && (
            <div className="atf-card">
              <div className="atf-card__head"><h3>Food &amp; Cuisine</h3></div>
              <div className="atf-card__body">
                <LInput label="Section Title"    {...lp('foodTitle')} />
                <LInput label="Section Subtitle" {...lp('foodSubtitle')} />
                {(form.foods || []).map((f: any, i: number) => (
                  <div key={i} style={{ background: '#f9fafb', borderRadius: 10, padding: 14, marginBottom: 10 }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '56px 1fr auto', gap: 12, alignItems: 'flex-start' }}>
                      <Field label="Emoji">
                        <TextInput value={f.emoji} onChange={(e) => setItem('foods', i, { emoji: e.target.value })} placeholder="🍲" style={{ textAlign: 'center', fontSize: 22 }} />
                      </Field>
                      <div>
                        <LInput    label="Name"        value={f.name || { en: '', ar: '' }} onChange={v => setItem('foods', i, { name: v })} />
                        <LTextarea label="Description" value={f.desc || { en: '', ar: '' }} onChange={v => setItem('foods', i, { desc: v })} minHeight={60} />
                      </div>
                      <button type="button" onClick={() => removeItem('foods', i)} style={{ marginTop: 22, background: '#fee2e2', border: 'none', borderRadius: 6, padding: '7px 10px', cursor: 'pointer', color: '#dc2626' }}>✕</button>
                    </div>
                  </div>
                ))}
                <button type="button" className="atf-btn atf-btn--outline" onClick={() => addItem('foods', { emoji: '', name: { en: '', ar: '' }, desc: { en: '', ar: '' } })}>+ Add Dish</button>
              </div>
            </div>
          )}

          {/* Budget */}
          {tab === 7 && (
            <div className="atf-card">
              <div className="atf-card__head"><h3>Budget Guide</h3></div>
              <div className="atf-card__body">
                <LInput label="Section Title" {...lp('budgetTitle')} />
                {(form.budgets || []).map((b: any, i: number) => (
                  <div key={i} style={{ background: '#f9fafb', borderRadius: 10, padding: 14, marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>Tier {i + 1}</span>
                      <button type="button" onClick={() => removeItem('budgets', i)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', color: '#dc2626', fontSize: 12 }}>Remove</button>
                    </div>
                    <LInput    label="Level"       value={b.level || { en: '', ar: '' }} onChange={v => setItem('budgets', i, { level: v })} placeholder="Budget" />
                    <LInput    label="Range"       value={b.range || { en: '', ar: '' }} onChange={v => setItem('budgets', i, { range: v })} placeholder="SAR 8,000–12,000" />
                    <LTextarea label="Description" value={b.desc  || { en: '', ar: '' }} onChange={v => setItem('budgets', i, { desc: v })}  minHeight={70} />
                  </div>
                ))}
                <button type="button" className="atf-btn atf-btn--outline" onClick={() => addItem('budgets', { level: { en: '', ar: '' }, range: { en: '', ar: '' }, desc: { en: '', ar: '' } })}>+ Add Tier</button>
              </div>
            </div>
          )}

          {/* Practical */}
          {tab === 8 && (
            <div className="atf-card">
              <div className="atf-card__head"><h3>Practical Info</h3></div>
              <div className="atf-card__body">
                <LInput label="Section Title"    {...lp('practicalTitle')} />
                <LInput label="Section Subtitle" {...lp('practicalSubtitle')} />
                {(form.practicalSections || []).map((sec: any, i: number) => (
                  <div key={i} style={{ background: '#f9fafb', borderRadius: 10, padding: 14, marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>Section {i + 1}</span>
                      <button type="button" onClick={() => removeItem('practicalSections', i)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', color: '#dc2626', fontSize: 12 }}>Remove</button>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 12, marginBottom: 8 }}>
                      <Field label="Icon">
                        <select className="atf-input" value={sec.icon} onChange={(e) => setItem('practicalSections', i, { icon: e.target.value })}>
                          {['FileCheck', 'CreditCard', 'Train', 'Globe', 'Landmark', 'Palette'].map((ic) => <option key={ic} value={ic}>{ic}</option>)}
                        </select>
                      </Field>
                      <LInput
                        label="Title"
                        value={sec.title || { en: '', ar: '' }}
                        onChange={v => setItem('practicalSections', i, { title: v })}
                      />
                    </div>
                    {(sec.items || []).map((item: any, j: number) => (
                      <div key={j} style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 6, marginBottom: 6 }}>
                        <LInput
                          label=""
                          value={item || { en: '', ar: '' }}
                          onChange={v => {
                            const arr = [...form.practicalSections];
                            arr[i] = { ...arr[i], items: arr[i].items.map((it: any, k: number) => k === j ? v : it) };
                            set('practicalSections', arr);
                          }}
                        />
                        <button type="button" onClick={() => {
                          const arr = [...form.practicalSections];
                          arr[i] = { ...arr[i], items: arr[i].items.filter((_: any, k: number) => k !== j) };
                          set('practicalSections', arr);
                        }} style={{ marginTop: 0, background: '#fee2e2', border: 'none', borderRadius: 6, padding: '7px 10px', cursor: 'pointer', color: '#dc2626' }}>✕</button>
                      </div>
                    ))}
                    <button type="button" className="atf-btn atf-btn--outline" style={{ fontSize: 12, padding: '4px 10px', marginTop: 4 }} onClick={() => {
                      const arr = [...form.practicalSections];
                      arr[i] = { ...arr[i], items: [...(arr[i].items || []), { en: '', ar: '' }] };
                      set('practicalSections', arr);
                    }}>+ Add Item</button>
                  </div>
                ))}
                <button type="button" className="atf-btn atf-btn--outline" onClick={() => addItem('practicalSections', { icon: 'FileCheck', title: { en: '', ar: '' }, items: [] })}>+ Add Section</button>
              </div>
            </div>
          )}

          {/* FAQs */}
          {tab === 9 && (
            <div className="atf-card">
              <div className="atf-card__head"><h3>FAQs</h3></div>
              <div className="atf-card__body">
                <LInput label="Section Title"    {...lp('faqTitle')} />
                <LInput label="Section Subtitle" {...lp('faqSubtitle')} />
                {(form.faqs || []).map((faq: any, i: number) => (
                  <div key={i} style={{ background: '#f9fafb', borderRadius: 10, padding: 14, marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontWeight: 600, fontSize: 13 }}>FAQ {i + 1}</span>
                      <button type="button" onClick={() => removeItem('faqs', i)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', color: '#dc2626', fontSize: 12 }}>Remove</button>
                    </div>
                    <LInput
                      label="Question"
                      value={faq.question || { en: '', ar: '' }}
                      onChange={v => setItem('faqs', i, { question: v })}
                    />
                    <LTextarea
                      label="Answer"
                      value={faq.answer || { en: '', ar: '' }}
                      onChange={v => setItem('faqs', i, { answer: v })}
                      minHeight={90}
                    />
                  </div>
                ))}
                <button type="button" className="atf-btn atf-btn--outline" onClick={() => addItem('faqs', { question: { en: '', ar: '' }, answer: { en: '', ar: '' } })}>+ Add FAQ</button>
              </div>
            </div>
          )}

          {/* Gallery */}
          {tab === 10 && (
            <div className="atf-card">
              <div className="atf-card__head"><h3>Photo Gallery</h3></div>
              <div className="atf-card__body">
                <LInput label="Section Title"    {...lp('galleryTitle')} />
                <LInput label="Section Subtitle" {...lp('gallerySubtitle')} />
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12, marginTop: 12 }}>
                  {(form.gallery || []).map((g: any, i: number) => (
                    <div key={i} style={{ background: '#f9fafb', borderRadius: 10, padding: 12 }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 6 }}>
                        <button type="button" onClick={() => removeItem('gallery', i)} style={{ background: '#fee2e2', border: 'none', borderRadius: 6, padding: '2px 8px', cursor: 'pointer', color: '#dc2626', fontSize: 12 }}>Remove</button>
                      </div>
                      <Field label="Image URL">
                        <TextInput value={g.url} onChange={(e) => setItem('gallery', i, { url: e.target.value })} placeholder="https://…" />
                      </Field>
                      {g.url && <img src={g.url} alt="" style={{ width: '100%', height: 100, objectFit: 'cover', borderRadius: 6, marginBottom: 8 }} onError={(e: any) => { e.currentTarget.style.display = 'none'; }} />}
                      <LInput
                        label="Caption"
                        value={g.caption || { en: '', ar: '' }}
                        onChange={v => setItem('gallery', i, { caption: v })}
                      />
                    </div>
                  ))}
                </div>
                <button type="button" className="atf-btn atf-btn--outline" style={{ marginTop: 12 }} onClick={() => addItem('gallery', { url: '', caption: { en: '', ar: '' }, alt: { en: '', ar: '' } })}>+ Add Photo</button>
              </div>
            </div>
          )}

          {/* CTA */}
          {tab === 11 && (
            <div className="atf-card">
              <div className="atf-card__head"><h3>Call to Action</h3></div>
              <div className="atf-card__body">
                <Field label="CTA Background Image URL">
                  <TextInput value={form.ctaBgImage} onChange={(e) => set('ctaBgImage', e.target.value)} placeholder="https://…" />
                </Field>
                <LInput    label="CTA Title"       {...lp('ctaTitle')}   />
                <LTextarea label="CTA Text"        {...lp('ctaText')}    minHeight={90} />
                <LInput    label="CTA Button Text" {...lp('ctaBtn')}     />
                <LInput    label="Seats Label"     {...lp('seatsLabel')} />
                <Field label="Seats Remaining">
                  <TextInput type="number" value={form.seatsRemaining} onChange={(e) => set('seatsRemaining', Number(e.target.value))} min={0} />
                </Field>
              </div>
            </div>
          )}

          {/* SEO */}
          {tab === 12 && (
            <div className="atf-card">
              <div className="atf-card__head"><h3>SEO Settings</h3></div>
              <div className="atf-card__body">
                <LInput    label="SEO Title"       {...lp('seoTitle')} />
                <LTextarea label="SEO Description" {...lp('seoDescription')} minHeight={90} />
                <LInput    label="SEO Keywords"    value={form.seoKeywords || { en: '', ar: '' }} onChange={v => set('seoKeywords', v)} />
                <Field label="Canonical Path">
                  <TextInput value={form.canonicalPath} onChange={(e) => set('canonicalPath', e.target.value)} placeholder="/destination/russia" />
                </Field>
              </div>
            </div>
          )}

        </motion.div>
      </AnimatePresence>

      {/* ── Save bar ──────────────────────────────────────────────────────── */}
      <div className="atf-save-bar">
        <div className="atf-save-bar__left">
          {isDirty && <span className="atf-unsaved-pill">Unsaved changes</span>}
        </div>
        <div className="atf-save-bar__right">
          <button type="button" className="quick-action-btn quick-action-btn--outline" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
          <button type="button" className="quick-action-btn quick-action-btn--primary" onClick={handleSubmit} disabled={saving}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
            {saving
              ? <Loader2 size={14} style={{ animation: 'spin 0.7s linear infinite' }} />
              : <Save size={14} style={{ stroke: 'currentColor', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }} />}
            {saving ? 'Saving…' : destinationId ? 'Save Changes' : 'Publish Destination'}
          </button>
          {!saving && <span className="atf-kbd" title="Keyboard shortcut">⌘S</span>}
        </div>
      </div>

    </div>
  );
};

export default AdminDestinationForm;

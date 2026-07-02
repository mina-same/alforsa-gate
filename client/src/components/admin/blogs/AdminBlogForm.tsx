/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Save, Loader2, FileText, Image, Settings, Tag, Search } from 'lucide-react';
import { blogService } from '../../../services/destinationService';
import { LInput, LTextarea, Field, TextInput } from '../AdminFormFields';
import { LRichTextEditor } from '../RichTextEditor';

interface Props {
  blogId?:  string;
  onSaved:  () => void;
  onCancel: () => void;
}

const SECTIONS = [
  { id: 0, label: 'Basic',   icon: Settings },
  { id: 1, label: 'Content', icon: FileText  },
  { id: 2, label: 'Media',   icon: Image     },
  { id: 3, label: 'Options', icon: Tag       },
  { id: 4, label: 'SEO',     icon: Search    },
] as const;

const BLANK: any = {
  slug: '', title: { en: '', ar: '' }, excerpt: { en: '', ar: '' },
  body: { en: '', ar: '' }, coverImage: '', author: 'Alforsa Gate',
  publishedAt: '', readTime: 5, tags: '', destinationSlugs: '',
  isPublished: false, isFeatured: false,
  seoTitle: { en: '', ar: '' }, seoDescription: { en: '', ar: '' },
  seoKeywords: { en: '', ar: '' }, seoImage: '',
};

const AdminBlogForm = ({ blogId, onSaved, onCancel }: Props) => {
  const [form, setForm]       = useState<any>(BLANK);
  const [tab, setTab]         = useState(0);
  const [saving, setSaving]   = useState(false);
  const [loading, setLoading] = useState(!!blogId);
  const [error, setError]     = useState<string | null>(null);

  useEffect(() => {
    if (!blogId) return;
    blogService.getById(blogId)
      .then((b: any) => setForm({
        ...BLANK, ...b,
        tags: (b.tags || []).join(', '),
        destinationSlugs: (b.destinationSlugs || []).join(', '),
        publishedAt: b.publishedAt ? b.publishedAt.slice(0, 10) : '',
        seoTitle:       b.seoTitle       || { en: '', ar: '' },
        seoDescription: b.seoDescription || { en: '', ar: '' },
        seoKeywords:    b.seoKeywords    || { en: '', ar: '' },
        seoImage:       b.seoImage       || '',
      }))
      .catch(() => setError('Failed to load blog'))
      .finally(() => setLoading(false));
  }, [blogId]);

  const set  = (key: string, value: any) => setForm((prev: any) => ({ ...prev, [key]: value }));

  const handleSubmit = useCallback(async () => {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        ...form,
        tags: form.tags ? form.tags.split(',').map((t: string) => t.trim()).filter(Boolean) : [],
        destinationSlugs: form.destinationSlugs
          ? form.destinationSlugs.split(',').map((s: string) => s.trim().toLowerCase()).filter(Boolean)
          : [],
        publishedAt: form.publishedAt || undefined,
      };
      if (blogId) {
        await blogService.update(blogId, payload);
      } else {
        await blogService.create(payload);
      }
      onSaved();
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Save failed');
    } finally {
      setSaving(false);
    }
  }, [form, blogId, onSaved]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 's') { e.preventDefault(); handleSubmit(); }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [handleSubmit]);

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
          {[80, 70, 60, 70].map((w, i) => (
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

  return (
    <div className="admin-content admin-content--tour-form">

      {/* ── Header ───────────────────────────────────────────────────────── */}
      <div className="atf-form-header">
        <div className="atf-form-header__left">
          <button type="button" className="atl-back-btn" onClick={onCancel}>
            <ArrowLeft size={15} style={{ stroke: 'currentColor', fill: 'none', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }} />
          </button>
          <div>
            <div className="atf-breadcrumb">
              <span className="atf-breadcrumb__item" onClick={onCancel}>Blogs</span>
              <span className="atf-breadcrumb__sep">›</span>
              <span className="atf-breadcrumb__current">
                {blogId ? (form.title?.en || 'Edit Blog') : 'New Blog'}
              </span>
            </div>
            <p className="atf-form-header__title">{blogId ? 'Edit Blog' : 'New Blog'}</p>
          </div>
        </div>

        <div className="atf-form-header__right">
          <label className="atf-status-item">
            <div className="atf-switch">
              <input type="checkbox" checked={form.isPublished} onChange={e => set('isPublished', e.target.checked)} />
              <span />
            </div>
            <div className="atf-switch-label">
              {form.isPublished ? 'Published' : 'Draft'}
              <span>{form.isPublished ? 'Visible on site' : 'Hidden'}</span>
            </div>
          </label>
          <button type="button" className="atf-save-btn" onClick={handleSubmit} disabled={saving}>
            {saving
              ? <Loader2 size={15} style={{ animation: 'spin 1s linear infinite' }} />
              : <Save size={15} />
            }
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      </div>

      {error && <div className="atf-error" style={{ margin: '0 0 12px' }}>{error}</div>}

      {/* ── Tabs ─────────────────────────────────────────────────────────── */}
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

      {/* ── Panel ────────────────────────────────────────────────────────── */}
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
                  <TextInput
                    value={form.slug}
                    onChange={e => set('slug', e.target.value)}
                    required
                    placeholder="russia-travel-tips"
                  />
                </Field>
                <Field label="Author">
                  <TextInput
                    value={form.author}
                    onChange={e => set('author', e.target.value)}
                    placeholder="Alforsa Gate"
                  />
                </Field>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <Field label="Published At">
                    <TextInput type="date" value={form.publishedAt} onChange={e => set('publishedAt', e.target.value)} />
                  </Field>
                  <Field label="Read Time (min)">
                    <TextInput type="number" value={form.readTime} onChange={e => set('readTime', Number(e.target.value))} min={1} />
                  </Field>
                </div>
              </div>
            </div>
          )}

          {/* Content */}
          {tab === 1 && (
            <div className="atf-card">
              <div className="atf-card__head"><h3>Content</h3></div>
              <div className="atf-card__body">
                <LInput
                  label="Title *"
                  value={form.title}
                  onChange={v => set('title', v)}
                  required
                  placeholder="Article title…"
                />
                <LTextarea
                  label="Excerpt"
                  value={form.excerpt}
                  onChange={v => set('excerpt', v)}
                  placeholder="Short summary…"
                  minHeight={90}
                />
                <LRichTextEditor
                  label="Body"
                  value={form.body}
                  lang="en"
                  onChange={v => set('body', v)}
                  placeholder="Full article…"
                  minHeight={280}
                />
              </div>
            </div>
          )}

          {/* Media */}
          {tab === 2 && (
            <div className="atf-card">
              <div className="atf-card__head"><h3>Cover Image</h3></div>
              <div className="atf-card__body">
                <Field label="Cover Image URL">
                  <TextInput
                    value={form.coverImage}
                    onChange={e => set('coverImage', e.target.value)}
                    placeholder="https://…"
                  />
                </Field>
                {form.coverImage && (
                  <img
                    src={form.coverImage}
                    alt="preview"
                    style={{ width: '100%', maxHeight: 260, objectFit: 'cover', borderRadius: 10, marginTop: 8 }}
                    onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                  />
                )}
              </div>
            </div>
          )}

          {/* Options */}
          {tab === 3 && (
            <div className="atf-card">
              <div className="atf-card__head"><h3>Tags &amp; Settings</h3></div>
              <div className="atf-card__body">
                <Field label="Tags (comma-separated)" hint="Used for filtering and related content. Example: travel, russia, saudi">
                  <TextInput value={form.tags} onChange={e => set('tags', e.target.value)} placeholder="travel, russia, saudi" />
                </Field>
                <Field label="Destination Slugs (comma-separated)" hint="Links this blog to destination pages. Must match destination slugs exactly. Example: russia, europe">
                  <TextInput value={form.destinationSlugs} onChange={e => set('destinationSlugs', e.target.value)} placeholder="russia, europe" />
                </Field>
                <div style={{ display: 'flex', gap: 24, marginTop: 16 }}>
                  <label className="atf-status-item">
                    <div className="atf-switch">
                      <input type="checkbox" checked={form.isPublished} onChange={e => set('isPublished', e.target.checked)} />
                      <span />
                    </div>
                    <div className="atf-switch-label">Published<span>Visible on site</span></div>
                  </label>
                  <label className="atf-status-item">
                    <div className="atf-switch">
                      <input type="checkbox" checked={form.isFeatured} onChange={e => set('isFeatured', e.target.checked)} />
                      <span />
                    </div>
                    <div className="atf-switch-label">Featured<span>Show on homepage</span></div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* SEO */}
          {tab === 4 && (
            <>
              <div className="atf-card">
                <div className="atf-card__head"><h3>Search Engine Preview</h3></div>
                <div className="atf-card__body">
                  {/* Live Google-style preview */}
                  <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 10, padding: '14px 18px', marginBottom: 20, fontFamily: 'Arial, sans-serif' }}>
                    <div style={{ fontSize: 12, color: '#006621', marginBottom: 2 }}>alforsa-gate.com › blog › {form.slug || 'article-slug'}</div>
                    <div style={{ fontSize: 18, color: '#1a0dab', fontWeight: 400, marginBottom: 4, lineHeight: 1.3 }}>
                      {form.seoTitle?.en || form.title?.en || 'Page title appears here'}
                    </div>
                    <div style={{ fontSize: 13, color: '#545454', lineHeight: 1.5 }}>
                      {form.seoDescription?.en || form.excerpt?.en || 'Meta description appears here. This is what users see in Google results before clicking your article.'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="atf-card">
                <div className="atf-card__head"><h3>Meta Tags</h3></div>
                <div className="atf-card__body">
                  <LInput
                    label="SEO Title"
                    value={form.seoTitle || { en: '', ar: '' }}
                    onChange={v => set('seoTitle', v)}
                    placeholder="Article title for search engines…"
                    hint="Shown as the clickable headline in Google results. Keep under 60 characters. If left empty, the blog title is used."
                  />
                  <LTextarea
                    label="SEO Description"
                    value={form.seoDescription || { en: '', ar: '' }}
                    onChange={v => set('seoDescription', v)}
                    placeholder="Brief summary for search engines…"
                    hint="Appears below the title in Google results. Aim for 140–160 characters. If left empty, the excerpt is used."
                    minHeight={90}
                  />
                  <LInput
                    label="SEO Keywords"
                    value={form.seoKeywords || { en: '', ar: '' }}
                    onChange={v => set('seoKeywords', v)}
                    placeholder="russia travel, visit moscow, best time to visit…"
                    hint="Comma-separated keywords. Modern search engines rely more on content than this tag, but it's good practice to fill it in."
                  />
                </div>
              </div>

              <div className="atf-card">
                <div className="atf-card__head"><h3>Social Sharing Image</h3></div>
                <div className="atf-card__body">
                  <Field
                    label="OG Image URL"
                    hint="Image shown when this article is shared on WhatsApp, Twitter, Facebook, etc. Recommended size: 1200×630 px. If left empty, the cover image is used."
                  >
                    <TextInput
                      value={form.seoImage}
                      onChange={e => set('seoImage', e.target.value)}
                      placeholder="https://…"
                    />
                  </Field>
                  {form.seoImage && (
                    <img
                      src={form.seoImage}
                      alt="OG preview"
                      style={{ width: '100%', maxHeight: 200, objectFit: 'cover', borderRadius: 10, marginTop: 8 }}
                      onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                    />
                  )}
                </div>
              </div>
            </>
          )}

        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AdminBlogForm;

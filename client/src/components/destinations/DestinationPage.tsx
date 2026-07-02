/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Landmark, Languages, BadgeDollarSign, CalendarDays,
  FileCheck, CreditCard, Train, Globe, Palette,
  Snowflake, Flower2, Sun, Leaf, Mountain, Waves,
  CheckCircle, ChevronsDown, Users, Plus, Minus, MapPin,
} from 'lucide-react';
import HeaderFour from '../../layouts/headers/HeaderFour';
import FooterThree from '../../layouts/footers/FooterThree';
import GallerySection from './GallerySection';
import RelatedBlogsSection from './RelatedBlogsSection';
import { useDestination } from '../../hooks/useDestination';
import { useLangPrefix } from '../../hooks/useLangPrefix';

// ─── Icon maps ────────────────────────────────────────────────────────────────

const SEASON_ICONS: Record<string, any> = {
  Snowflake, Flower2, Sun, Leaf, Mountain, Waves, Globe,
};

const PRACTICAL_ICONS: Record<string, any> = {
  FileCheck, CreditCard, Train, Globe, Landmark, Palette,
};

const STAT_ICONS = [Landmark, Globe, Palette];
const QUICK_STAT_ICONS = [Landmark, Languages, BadgeDollarSign, CalendarDays];

const FOOD_COLORS = ['#e8f4f0', '#fdf3e8', '#eef0fd', '#fdeaea', '#e8f8ea', '#fdf7e8'];
const BUDGET_COLORS = ['#6c757d', 'var(--tg-theme-primary, #0a5c44)', '#c0a000'];

// ─── Skeleton ─────────────────────────────────────────────────────────────────

const Skeleton = () => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f9fafb' }}>
    <div style={{ textAlign: 'center', color: '#9ca3af' }}>
      <div style={{ width: 40, height: 40, border: '3px solid #e5e7eb', borderTopColor: '#0a5c44', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
      <p style={{ fontSize: 14 }}>Loading destination…</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  </div>
);

// ─── Component ────────────────────────────────────────────────────────────────

const DestinationPage = () => {
  const { slug = 'russia' } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const prefix   = useLangPrefix();
  const lang     = (i18n.language?.startsWith('ar') ? 'ar' : 'en') as 'en' | 'ar';
  const isRtl    = lang === 'ar';
  const dir      = isRtl ? 'rtl' : 'ltr';

  const { destination: d, loading, error } = useDestination(slug);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  if (loading) return <Skeleton />;

  if (error || !d) {
    return (
      <>
        <HeaderFour />
        <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '60px 20px' }}>
          <div>
            <h2 style={{ marginBottom: 12, color: '#1a1a2e' }}>Destination not found</h2>
            <p style={{ color: '#666', marginBottom: 24 }}>{error || 'This destination does not exist.'}</p>
            <Link to={`${prefix}`} className="tg-btn">Go Home</Link>
          </div>
        </div>
        <FooterThree />
      </>
    );
  }

  const PRIMARY = d.primaryColor || 'var(--tg-theme-primary, #0a5c44)';
  const t = (field?: { en: string; ar?: string }) => field?.[lang] || field?.en || '';
  const countryFlag = d.countryFlag || '';

  return (
    <>
      <Helmet>
        <html lang={lang} dir={dir} />
        <title>{t(d.seoTitle) || t(d.name)}</title>
        <meta name="description" content={t(d.seoDescription)} />
        <meta name="robots" content="index, follow" />
        {d.seoKeywords && <meta name="keywords" content={d.seoKeywords[lang] || d.seoKeywords.en} />}
        <meta property="og:title"       content={t(d.seoTitle) || t(d.name)} />
        <meta property="og:description" content={t(d.seoDescription)} />
        <meta property="og:type"        content="website" />
        <meta property="og:image"       content={d.heroImage} />
        <meta name="twitter:card"       content="summary_large_image" />
        {d.canonicalPath && <link rel="canonical" href={d.canonicalPath} />}
      </Helmet>

      <HeaderFour isTransparent />

      <main>
        {/* ── HERO ── */}
        <section style={{
          minHeight: '100vh', display: 'flex', alignItems: 'center', position: 'relative',
          background: `linear-gradient(to bottom, rgba(0,0,0,0.55) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.7) 100%), url('${d.heroImage}') center/cover no-repeat`,
        }}>
          <div className="container">
            <div className="row justify-content-center">
              <div className="col-lg-8 text-center">
                <div style={{ background: 'rgba(0,0,0,0.45)', backdropFilter: 'blur(8px)', borderRadius: 20, padding: '48px 40px', color: '#fff', direction: dir }}>
                  <span style={{ fontSize: 12, letterSpacing: 3, textTransform: 'uppercase', opacity: 0.75, display: 'block', marginBottom: 16 }}>
                    {countryFlag} {t(d.heroTagline)}
                  </span>
                  <h1 style={{ fontSize: 'clamp(38px,6vw,76px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 18, color: '#fff' }}>{t(d.name)}</h1>
                  <p style={{ fontSize: 17, opacity: 0.85, maxWidth: 520, margin: '0 auto 32px' }}>{t(d.subtitle)}</p>
                  <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
                    <Link to={`${prefix}/tours`} className="tg-btn" style={{ background: PRIMARY, color: '#fff', borderColor: 'transparent', padding: '14px 32px', borderRadius: 100 }}>
                      {t(d.heroCta) || (lang === 'ar' ? 'احجز جولة' : 'Book a Tour')}
                    </Link>
                    <a href="#attractions" style={{ color: '#fff', border: '1.5px solid rgba(255,255,255,0.6)', padding: '14px 32px', borderRadius: 100, textDecoration: 'none', fontSize: 15 }}>
                      {t(d.heroExplore) || (lang === 'ar' ? 'استكشف المعالم' : 'Explore Attractions')}
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style={{ position: 'absolute', bottom: 30, left: '50%', transform: 'translateX(-50%)', color: 'rgba(255,255,255,0.6)', textAlign: 'center' }}>
            <div style={{ width: 1, height: 40, background: 'rgba(255,255,255,0.4)', margin: '0 auto 8px' }} />
            <ChevronsDown size={18} style={{ display: 'block', margin: '0 auto 4px' }} />
            <span style={{ fontSize: 11, letterSpacing: 2, textTransform: 'uppercase' }}>{t(d.heroScroll) || 'Scroll'}</span>
          </div>
        </section>

        {/* ── QUICK STATS ── */}
        {d.stats && (
          <section style={{ background: PRIMARY, padding: '28px 0' }}>
            <div className="container">
              <div className="row text-center" style={{ color: '#fff' }}>
                {[
                  { label: t(d.stats.capital)    ? (lang === 'ar' ? 'العاصمة' : 'Capital')     : '', value: t(d.stats.capital),    Icon: QUICK_STAT_ICONS[0] },
                  { label: t(d.stats.language)   ? (lang === 'ar' ? 'اللغة' : 'Language')       : '', value: t(d.stats.language),   Icon: QUICK_STAT_ICONS[1] },
                  { label: t(d.stats.currency)   ? (lang === 'ar' ? 'العملة' : 'Currency')      : '', value: t(d.stats.currency),   Icon: QUICK_STAT_ICONS[2] },
                  { label: t(d.stats.bestSeason) ? (lang === 'ar' ? 'أفضل موسم' : 'Best Season') : '', value: t(d.stats.bestSeason), Icon: QUICK_STAT_ICONS[3] },
                ].map((s, i) => (
                  <div key={i} className="col-6 col-md-3" style={{ padding: '10px 0', borderRight: i < 3 ? '1px solid rgba(255,255,255,0.2)' : 'none' }}>
                    <s.Icon size={22} style={{ opacity: 0.8, marginBottom: 6 }} />
                    <div style={{ fontSize: 16, fontWeight: 700 }}>{s.value}</div>
                    <div style={{ fontSize: 11, opacity: 0.75, textTransform: 'uppercase', letterSpacing: 1 }}>{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── ABOUT ── */}
        {(d.aboutTitle || d.aboutText) && (
          <section className="pt-80 pb-60" style={{ background: '#fff' }}>
            <div className="container">
              <div className="row align-items-center" style={{ direction: dir }}>
                {d.aboutImage && (
                  <div className="col-lg-6 mb-30">
                    <img src={d.aboutImage} alt={t(d.name)} style={{ width: '100%', borderRadius: 16, boxShadow: '0 20px 60px rgba(0,0,0,0.12)' }}
                      onError={(e: any) => { e.currentTarget.style.display = 'none'; }} />
                  </div>
                )}
                <div className={`col-lg-6 mb-30 ${d.aboutImage ? (isRtl ? 'pe-lg-5' : 'ps-lg-5') : ''}`}>
                  {countryFlag && <h5 className="tg-section-subtitle mb-15">{countryFlag} {t(d.name)}</h5>}
                  {d.aboutTitle && <h2 className="mb-20">{t(d.aboutTitle)}</h2>}
                  {d.aboutText  && <p style={{ fontSize: 16, lineHeight: 1.8, color: '#555', marginBottom: 28 }}>{t(d.aboutText)}</p>}
                  {d.statCounters && d.statCounters.length > 0 && (
                    <div style={{ display: 'flex', gap: 28, flexWrap: 'wrap' }}>
                      {d.statCounters.map((s, i) => {
                        const Icon = STAT_ICONS[i] || Landmark;
                        return (
                          <div key={i} style={{ textAlign: 'center' }}>
                            <Icon size={22} style={{ color: PRIMARY, marginBottom: 4 }} />
                            <div style={{ fontSize: 22, fontWeight: 800, color: PRIMARY }}>{s.value}</div>
                            <div style={{ fontSize: 11, color: '#888' }}>{t(s.label)}</div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── ATTRACTIONS ── */}
        {d.attractions && d.attractions.length > 0 && (
          <section id="attractions" className="tg-grey-bg pt-80 pb-50">
            <div className="container">
              <div className="col-12 text-center mb-40">
                {d.attractionsSubtitle && <h5 className="tg-section-subtitle mb-15">{t(d.attractionsSubtitle)}</h5>}
                {d.attractionsTitle    && <h2>{t(d.attractionsTitle)}</h2>}
              </div>
              <div className="row">
                {d.attractions.map((item, idx) => (
                  <div key={idx} className="col-lg-4 col-md-6 mb-30">
                    <div style={{ borderRadius: 16, overflow: 'hidden', background: '#fff', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', height: '100%', direction: dir }}>
                      <div style={{ height: 220, overflow: 'hidden', position: 'relative' }}>
                        <img src={item.img} alt={t(item.name)}
                          style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform 0.4s' }}
                          onMouseOver={(e: any) => (e.currentTarget.style.transform = 'scale(1.05)')}
                          onMouseOut={(e: any)  => (e.currentTarget.style.transform = 'scale(1)')}
                          onError={(e: any)     => { e.currentTarget.src = '/assets/img/destination/des.jpg'; }}
                        />
                        <span style={{ position: 'absolute', top: 12, [isRtl ? 'right' : 'left']: 12, background: 'rgba(0,0,0,0.55)', color: '#fff', fontSize: 11, padding: '3px 10px', borderRadius: 100, backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', gap: 4 }}>
                          <MapPin size={11} /> {t(item.city)}
                        </span>
                      </div>
                      <div style={{ padding: '20px 22px' }}>
                        <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 10 }}>{t(item.name)}</h4>
                        <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, margin: 0 }}>{t(item.desc)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── BEST TIME / SEASONS ── */}
        {d.seasons && d.seasons.length > 0 && (
          <section className="pt-80 pb-50" style={{ background: '#fff' }}>
            <div className="container">
              <div className="col-12 text-center mb-40">
                {d.seasonSubtitle && <h5 className="tg-section-subtitle mb-15">{t(d.seasonSubtitle)}</h5>}
                {d.seasonTitle    && <h2>{t(d.seasonTitle)}</h2>}
              </div>
              <div className="row">
                {d.seasons.map((s, i) => {
                  const Icon = SEASON_ICONS[s.icon] || Sun;
                  return (
                    <div key={i} className="col-lg-3 col-md-6 mb-25">
                      <div style={{ background: s.highlight ? PRIMARY : '#f8f9ff', borderRadius: 16, padding: '28px 22px', textAlign: 'center', height: '100%',
                        color: s.highlight ? '#fff' : 'inherit', boxShadow: s.highlight ? `0 8px 30px rgba(10,92,68,0.25)` : '0 2px 12px rgba(0,0,0,0.06)', direction: dir }}>
                        <div style={{ marginBottom: 12, color: s.highlight ? '#fff' : PRIMARY }}><Icon size={36} /></div>
                        <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1.5,
                          background: s.highlight ? 'rgba(255,255,255,0.2)' : PRIMARY, color: '#fff',
                          padding: '3px 12px', borderRadius: 100, display: 'inline-block', marginBottom: 12 }}>{t(s.tag)}</span>
                        <h5 style={{ fontSize: 15, fontWeight: 700, marginBottom: 10 }}>{t(s.name)}</h5>
                        <p style={{ fontSize: 13, lineHeight: 1.7, opacity: s.highlight ? 0.9 : 0.7, margin: 0 }}>{t(s.desc)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── BUDGET ── */}
        {d.budgets && d.budgets.length > 0 && (
          <section className="tg-grey-bg pt-80 pb-50">
            <div className="container">
              <div className="col-12 text-center mb-40">
                {d.budgetTitle && <h2>{t(d.budgetTitle)}</h2>}
              </div>
              <div className="row justify-content-center">
                {d.budgets.map((b, i) => (
                  <div key={i} className="col-lg-4 col-md-6 mb-25">
                    <div style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', direction: dir, borderTop: `4px solid ${BUDGET_COLORS[i] || PRIMARY}` }}>
                      <h5 style={{ fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{t(b.level)}</h5>
                      <div style={{ fontSize: 22, fontWeight: 800, color: PRIMARY, marginBottom: 8 }}>{t(b.range)}</div>
                      <p style={{ fontSize: 13, color: '#777', margin: 0 }}>{t(b.desc)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── CUISINE ── */}
        {d.foods && d.foods.length > 0 && (
          <section className="pt-80 pb-50" style={{ background: '#fff' }}>
            <div className="container">
              <div className="col-12 text-center mb-40">
                {d.foodSubtitle && <h5 className="tg-section-subtitle mb-15">{t(d.foodSubtitle)}</h5>}
                {d.foodTitle    && <h2>{t(d.foodTitle)}</h2>}
              </div>
              <div className="row">
                {d.foods.map((f, i) => (
                  <div key={i} className="col-lg-2 col-md-4 col-6 mb-25">
                    <div style={{ background: FOOD_COLORS[i % FOOD_COLORS.length], borderRadius: 14, padding: '22px 16px', textAlign: 'center', height: '100%', direction: dir }}>
                      <div style={{ fontSize: 38, lineHeight: 1, marginBottom: 12 }}>{f.emoji}</div>
                      <h6 style={{ fontSize: 14, fontWeight: 700, marginBottom: 6 }}>{t(f.name)}</h6>
                      <p style={{ fontSize: 12, color: '#666', margin: 0, lineHeight: 1.5 }}>{t(f.desc)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* ── PRACTICAL INFO ── */}
        {d.practicalSections && d.practicalSections.length > 0 && (
          <section className="tg-grey-bg pt-80 pb-50">
            <div className="container">
              <div className="col-12 text-center mb-40">
                {d.practicalSubtitle && <h5 className="tg-section-subtitle mb-15">{t(d.practicalSubtitle)}</h5>}
                {d.practicalTitle    && <h2>{t(d.practicalTitle)}</h2>}
              </div>
              <div className="row">
                {d.practicalSections.map((section, i) => {
                  const Icon = PRACTICAL_ICONS[section.icon] || FileCheck;
                  return (
                    <div key={i} className="col-lg-4 mb-30">
                      <div style={{ background: '#fff', borderRadius: 16, padding: '28px 24px', boxShadow: '0 4px 20px rgba(0,0,0,0.07)', height: '100%', direction: dir }}>
                        <div style={{ width: 56, height: 56, borderRadius: 14, background: '#f0f7f4', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 18 }}>
                          <Icon size={26} style={{ color: PRIMARY }} />
                        </div>
                        <h4 style={{ fontSize: 18, fontWeight: 700, marginBottom: 16 }}>{t(section.title)}</h4>
                        <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                          {section.items.map((item, j) => (
                            <li key={j} style={{ fontSize: 14, color: '#555', padding: '7px 0', borderBottom: j < section.items.length - 1 ? '1px solid #f0f0f0' : 'none',
                              display: 'flex', alignItems: 'flex-start', gap: 8, flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                              <CheckCircle size={14} style={{ color: PRIMARY, flexShrink: 0, marginTop: 3 }} />
                              {item[lang] || item.en}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── CTA ── */}
        <section style={{ background: 'linear-gradient(135deg, #071220 0%, #0d2b4e 100%)', padding: '80px 0', position: 'relative', overflow: 'hidden' }}>
          {d.ctaBgImage && (
            <div style={{ position: 'absolute', inset: 0, backgroundImage: `url('${d.ctaBgImage}')`, backgroundSize: 'cover', backgroundPosition: 'center', opacity: 0.1 }} />
          )}
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div className="row justify-content-center text-center" style={{ direction: dir }}>
              <div className="col-lg-7">
                {d.ctaTitle && <h2 style={{ color: '#fff', marginBottom: 16, fontSize: 'clamp(28px,4vw,42px)' }}>{t(d.ctaTitle)}</h2>}
                {d.ctaText  && <p style={{ color: 'rgba(255,255,255,0.8)', fontSize: 16, marginBottom: 32 }}>{t(d.ctaText)}</p>}
                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', alignItems: 'center' }}>
                  <Link to={`${prefix}/tours`} className="tg-btn" style={{ background: PRIMARY, color: '#fff', borderColor: 'transparent', padding: '14px 36px', borderRadius: 100, fontSize: 15, fontWeight: 600 }}>
                    {t(d.ctaBtn) || (lang === 'ar' ? 'عرض الجولات' : 'View Tours')}
                  </Link>
                  {d.seatsRemaining !== undefined && (
                    <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6 }}>
                      <Users size={16} style={{ color: '#f4c542' }} />
                      <span style={{ color: '#f4c542', fontWeight: 800, fontSize: 18 }}>{d.seatsRemaining}</span>
                      {t(d.seatsLabel) || (lang === 'ar' ? 'مقعد متبقي' : 'seats remaining')}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── FAQ ── */}
        {d.faqs && d.faqs.length > 0 && (
          <section className="pt-80 pb-100" style={{ background: '#fff', position: 'relative', zIndex: 1 }}>
            <div className="container">
              <div className="col-12 text-center mb-40">
                {d.faqSubtitle && <h5 className="tg-section-subtitle mb-15">{t(d.faqSubtitle)}</h5>}
                {d.faqTitle    && <h2>{t(d.faqTitle)}</h2>}
              </div>
              <div className="row justify-content-center">
                <div className="col-lg-8">
                  {d.faqs.map((faq, i) => {
                    const isOpen = openFaq === i;
                    return (
                      <div key={i} style={{ borderBottom: '1px solid #eee', direction: dir }}>
                        <button onClick={() => setOpenFaq(isOpen ? null : i)}
                          style={{ width: '100%', background: 'none', border: 'none', padding: '20px 0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', textAlign: isRtl ? 'right' : 'left', gap: 12 }}>
                          <span style={{ fontSize: 16, fontWeight: 600, color: isOpen ? PRIMARY : '#222', flex: 1 }}>{t(faq.question)}</span>
                          <span style={{ flexShrink: 0, color: PRIMARY }}>
                            {isOpen ? <Minus size={18} /> : <Plus size={18} />}
                          </span>
                        </button>
                        {isOpen && (
                          <div style={{ paddingBottom: 20, fontSize: 15, color: '#555', lineHeight: 1.8 }}>{t(faq.answer)}</div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* ── GALLERY ── */}
        {d.gallery && d.gallery.length > 0 && (
          <GallerySection
            items={d.gallery}
            title={t(d.galleryTitle)}
            subtitle={t(d.gallerySubtitle)}
            lang={lang}
            primaryColor={PRIMARY}
          />
        )}

        {/* ── RELATED BLOGS ── */}
        {d.relatedBlogs && d.relatedBlogs.length > 0 && (
          <RelatedBlogsSection
            blogs={d.relatedBlogs}
            title={lang === 'ar' ? 'مقالات ذات صلة' : 'Related Articles'}
            subtitle={lang === 'ar' ? 'اقرأ المزيد' : 'Read More'}
            lang={lang}
            primaryColor={PRIMARY}
          />
        )}
      </main>

      <FooterThree />
    </>
  );
};

export default DestinationPage;

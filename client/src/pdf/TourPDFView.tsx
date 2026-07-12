import { forwardRef } from 'react';
import { getLang } from '../utils/getLang';
import type { ITourFull } from '../services/tourService';

// ── helpers ────────────────────────────────────────────────────────────────────

function strip(s: string): string {
  return s.replace(/<[^>]*>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s{2,}/g, ' ').trim();
}
function gl(field: any, lang: string): string { return getLang(field, lang); }
function glText(field: any, lang: string): string { return strip(gl(field, lang)); }
function formatPrice(p?: { EGP?: number; USD?: number; SAR?: number }): string {
  if (!p) return '';
  return [
    p.EGP && `EGP ${p.EGP.toLocaleString()}`,
    p.USD && `USD ${p.USD.toLocaleString()}`,
    p.SAR && `SAR ${p.SAR.toLocaleString()}`,
  ].filter(Boolean).join('  ·  ');
}

// ── palette ─────────────────────────────────────────────────────────────────────

const C = {
  brand:    '#1490a8',
  brandDk:  '#0d6e82',
  brandLt:  '#e6f5f8',
  gold:     '#f0a500',
  dark:     '#020615',
  mid:      '#454546',
  border:   '#e1e1e1',
  bg:       '#f8f8f8',
  white:    '#ffffff',
  red:      '#ef4444',
  redBg:    '#fef2f2',
  greenBg:  '#f0fdf4',
  green:    '#15803d',
  amberBg:  '#fffbeb',
};

const FONT = "'Segoe UI', Arial, 'Helvetica Neue', sans-serif";

// ── types ────────────────────────────────────────────────────────────────────────

export interface TourPDFViewProps {
  tour:          ITourFull;
  lang:          string;
  imageBase64s?: string[];
  logoBase64?:   string;   // white logo (for dark backgrounds)
  logoGreen?:    string;   // green logo (for light backgrounds)
  qrBase64?:     string;   // QR code data URL
  tourUrl?:      string;   // full tour URL for QR display
}

// ── component ────────────────────────────────────────────────────────────────────

const TourPDFView = forwardRef<HTMLDivElement, TourPDFViewProps>(
  ({ tour, lang, imageBase64s = [], logoBase64, logoGreen, qrBase64, tourUrl }, ref) => {

    const rtl  = lang === 'ar';
    const ta   = rtl ? 'right' as const : 'left' as const;
    const dir  = rtl ? 'rtl' : 'ltr';
    const row  = rtl ? 'row-reverse' as const : 'row' as const;

    // ── data ──────────────────────────────────────────────────────────────────

    const title        = gl(tour.heading, lang);
    const location     = gl(tour.tourLocation, lang);
    const duration     = gl(tour.duration, lang);
    const tourType     = gl(tour.tourType, lang);
    const availability = gl(tour.tourAvailability, lang);
    const description  = glText(tour.Description?.text, lang);
    const highlights   = (tour.tourHighlights ?? []).map(h => glText(h, lang)).filter(Boolean);
    const inclusions   = (tour.inclusion  ?? []).map(i => glText(i, lang)).filter(Boolean);
    const exclusions   = (tour.exclusion  ?? []).map(e => glText(e, lang)).filter(Boolean);
    const days         = tour.itinerary?.days ?? [];
    const notes        = tour.notes ?? [];
    const cancellation = glText(tour.cancellationPolicy, lang);
    const priceStr     = formatPrice(tour.priceStartingFrom);
    const whatToPack   = (tour.whatToPack ?? []).map(w => glText(w, lang)).filter(Boolean);

    const imgs        = imageBase64s.filter(Boolean);
    const coverImg    = imgs[0] ?? null;
    const galleryImgs = imgs.slice(1, 7);

    // ── sub-components ────────────────────────────────────────────────────────

    /* Branded footer strip that appears at the bottom of every page section */
    const PageFooter = () => (
      <div style={{
        backgroundColor: C.brandDk,
        padding:         '10px 32px',
        display:         'flex',
        flexDirection:   row,
        alignItems:      'center',
        justifyContent:  'space-between',
        gap:             12,
      }}>
        {/* Logo */}
        {logoBase64 ? (
          <img src={logoBase64} alt="Alforsa Gate" style={{ display: 'block', maxHeight: 28, width: 'auto', maxWidth: 160, objectFit: 'contain' }} />
        ) : (
          <span style={{ color: C.white, fontSize: 12, fontWeight: 700, fontFamily: FONT }}>Alforsa Gate</span>
        )}
        <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, fontFamily: FONT }}>alforsa-gate.com</span>
      </div>
    );

    /* Teal header band that introduces each inner section */
    const SectionHeader = ({ children }: { children: React.ReactNode }) => (
      <div style={{
        backgroundColor: C.brand,
        padding:         '10px 32px',
        display:         'flex',
        flexDirection:   row,
        alignItems:      'center',
        justifyContent:  'space-between',
      }}>
        <div style={{ display: 'flex', flexDirection: row, alignItems: 'center', gap: 10 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: C.gold, flexShrink: 0 }} />
          <span style={{ color: C.white, fontSize: 12, fontWeight: 700, fontFamily: FONT }}>{children}</span>
        </div>
        {logoBase64 && (
          <img src={logoBase64} alt="Alforsa Gate" style={{ display: 'block', maxHeight: 22, width: 'auto', maxWidth: 130, objectFit: 'contain', opacity: 0.8 }} />
        )}
      </div>
    );

    /* Section title inside a page body */
    const SectionTitle = ({ children }: { children: React.ReactNode }) => (
      <div style={{
        fontSize:     14,
        fontWeight:   700,
        color:        C.brand,
        borderBottom: `2px solid ${C.brandLt}`,
        paddingBottom: 8,
        marginBottom:  14,
        textAlign:    ta,
        fontFamily:   FONT,
      }}>{children}</div>
    );

    /* Bullet dot for highlight / what-to-pack lists */
    const Dot = () => (
      <div style={{
        width: 7, height: 7, borderRadius: '50%',
        backgroundColor: C.brand,
        marginTop: 5, flexShrink: 0,
      }} />
    );

    // ── render ────────────────────────────────────────────────────────────────

    return (
      <div ref={ref} dir={dir} style={{ width: 794, backgroundColor: C.white, fontFamily: FONT, color: C.dark }}>

        {/* ── COVER ──────────────────────────────────────────────────────────── */}
        <div style={{ position: 'relative', height: 400, backgroundColor: C.brandDk, overflow: 'hidden' }}>
          {coverImg ? (
            <img src={coverImg} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.75 }} />
          ) : (
            <div style={{ width: '100%', height: '100%', background: `linear-gradient(135deg, ${C.brandDk} 0%, ${C.brand} 100%)` }} />
          )}

          {/* Logo top corner */}
          <div style={{
            position:        'absolute',
            top:             22,
            [rtl ? 'left' : 'right']: 28,
            backgroundColor: 'rgba(255,255,255,0.13)',
            borderRadius:    8,
            padding:         '8px 16px',
          }}>
            {logoBase64 ? (
              <img src={logoBase64} alt="Alforsa Gate" style={{ height: 32, objectFit: 'contain', display: 'block' }} />
            ) : (
              <span style={{ color: C.white, fontSize: 13, fontWeight: 700 }}>Alforsa Gate</span>
            )}
          </div>

          {/* Bottom gradient overlay with title */}
          <div style={{
            position:   'absolute',
            bottom:     0, left: 0, right: 0,
            padding:    '28px 40px 36px',
            background: 'linear-gradient(0deg, rgba(0,0,0,0.78) 0%, rgba(0,0,0,0) 100%)',
          }}>
            {/* "TOUR DOCUMENT" tag */}
            <div style={{
              color:         C.gold,
              fontSize:      9,
              fontWeight:    700,
              letterSpacing: 2.5,
              marginBottom:  10,
              textAlign:     ta,
              textTransform: 'uppercase',
            }}>
              {rtl ? 'وثيقة الجولة السياحية' : 'Tour Document'}
            </div>

            {/* Tour title */}
            <div style={{ color: C.white, fontSize: 26, fontWeight: 700, lineHeight: 1.35, marginBottom: 10, textAlign: ta }}>
              {title}
            </div>

            {/* Location */}
            {location && (
              <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 13, marginBottom: 16, textAlign: ta }}>
                {location}
              </div>
            )}

            {/* Chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: row, gap: 8 }}>
              {duration    && <span style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 20, padding: '4px 14px', color: C.white, fontSize: 11 }}>{duration}</span>}
              {tourType    && <span style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 20, padding: '4px 14px', color: C.white, fontSize: 11 }}>{tourType}</span>}
              {availability && <span style={{ background: 'rgba(255,255,255,0.18)', borderRadius: 20, padding: '4px 14px', color: C.white, fontSize: 11 }}>{availability}</span>}
              {priceStr    && (
                <span style={{ background: C.gold, borderRadius: 20, padding: '4px 14px', color: C.dark, fontSize: 11, fontWeight: 700 }}>
                  {rtl ? `يبدأ من ${priceStr}` : `From ${priceStr}`}
                </span>
              )}
            </div>
          </div>
        </div>
        <PageFooter />

        {/* ── OVERVIEW ───────────────────────────────────────────────────────── */}
        <SectionHeader>{rtl ? 'نظرة عامة' : 'Overview'}</SectionHeader>
        <div style={{ padding: '28px 36px 24px' }}>

          {/* Info cards */}
          {(duration || tourType || location || availability) && (
            <div style={{ display: 'flex', flexDirection: row, gap: 10, flexWrap: 'wrap', marginBottom: 22 }}>
              {[
                { label: rtl ? 'المدة'  : 'Duration',    value: duration },
                { label: rtl ? 'النوع'  : 'Type',         value: tourType },
                { label: rtl ? 'الموقع' : 'Location',     value: location },
                { label: rtl ? 'التوفر' : 'Availability', value: availability },
              ].filter(c => c.value).map((card, i) => (
                <div key={i} style={{ flex: '1 1 130px', backgroundColor: C.brandLt, borderRadius: 8, padding: '10px 14px' }}>
                  <div style={{ fontSize: 8, color: C.brand, fontWeight: 700, letterSpacing: 0.8, textTransform: 'uppercase', marginBottom: 4, textAlign: ta }}>
                    {card.label}
                  </div>
                  <div style={{ fontSize: 12, color: C.dark, fontWeight: 700, textAlign: ta }}>{card.value}</div>
                </div>
              ))}
            </div>
          )}

          {/* Price hero */}
          {priceStr && (
            <div style={{
              backgroundColor: C.brand, borderRadius: 10, padding: '16px 22px',
              marginBottom: 24, display: 'flex', flexDirection: row,
              alignItems: 'center', justifyContent: 'space-between',
            }}>
              <div>
                <div style={{ color: '#a7f3d0', fontSize: 9, fontWeight: 700, textTransform: 'uppercase', textAlign: ta }}>
                  {rtl ? 'السعر يبدأ من' : 'Price Starting From'}
                </div>
                <div style={{ color: C.white, fontSize: 22, fontWeight: 700, marginTop: 4, textAlign: ta }}>{priceStr}</div>
                <div style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9, marginTop: 2, textAlign: ta }}>
                  {rtl ? 'لكل شخص' : 'per person'}
                </div>
              </div>
            </div>
          )}

          {/* Description */}
          {description && (
            <div style={{ marginBottom: 22 }}>
              <SectionTitle>{rtl ? 'عن هذه الجولة' : 'About This Tour'}</SectionTitle>
              <p style={{ fontSize: 12, lineHeight: 1.85, color: C.mid, margin: 0, textAlign: ta }}>{description}</p>
            </div>
          )}

          {/* Highlights */}
          {highlights.length > 0 && (
            <div>
              <SectionTitle>{rtl ? 'أبرز ما في الرحلة' : 'Tour Highlights'}</SectionTitle>
              <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: row, gap: 8 }}>
                {highlights.map((h, i) => (
                  <div key={i} style={{ width: 'calc(50% - 4px)', display: 'flex', flexDirection: row, alignItems: 'flex-start', gap: 8 }}>
                    <Dot />
                    <span style={{ fontSize: 11, lineHeight: 1.65, color: C.dark, textAlign: ta }}>{h}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        <PageFooter />

        {/* ── GALLERY ────────────────────────────────────────────────────────── */}
        {galleryImgs.length > 0 && (
          <>
            <SectionHeader>{rtl ? 'معرض الصور' : 'Photo Gallery'}</SectionHeader>
            <div style={{ padding: '28px 36px 24px' }}>
              <div style={{ display: 'flex', flexDirection: row, gap: 8, marginBottom: 8 }}>
                {galleryImgs.slice(0, 2).map((img, i) => (
                  <div key={i} style={{ flex: 1, height: 200, borderRadius: 8, overflow: 'hidden' }}>
                    <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                ))}
              </div>
              {galleryImgs.length > 2 && (
                <div style={{ display: 'flex', flexDirection: row, gap: 8 }}>
                  {galleryImgs.slice(2, 5).map((img, i) => (
                    <div key={i} style={{ flex: 1, height: 150, borderRadius: 8, overflow: 'hidden' }}>
                      <img src={img} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </div>
                  ))}
                </div>
              )}
            </div>
            <PageFooter />
          </>
        )}

        {/* ── ITINERARY ──────────────────────────────────────────────────────── */}
        {days.length > 0 && (
          <>
            <SectionHeader>{rtl ? 'خطة الجولة' : 'Itinerary'}</SectionHeader>
            <div style={{ padding: '28px 36px 24px' }}>
              {(days as any[]).map((day, i) => (
                <div key={i} style={{
                  backgroundColor: C.bg,
                  borderRadius:    8,
                  padding:         '12px 16px',
                  marginBottom:    10,
                  borderLeft:  rtl ? 'none' : `3px solid ${C.brand}`,
                  borderRight: rtl ? `3px solid ${C.brand}` : 'none',
                }}>
                  <div style={{ display: 'flex', flexDirection: row, alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <div style={{ backgroundColor: C.brand, borderRadius: 4, padding: '2px 10px' }}>
                      <span style={{ color: C.white, fontSize: 10, fontWeight: 700 }}>
                        {rtl ? `اليوم ${day.day}` : `Day ${day.day}`}
                      </span>
                    </div>
                    {day.title && (
                      <span style={{ fontSize: 12, fontWeight: 700, color: C.dark, textAlign: ta }}>
                        {gl(day.title, lang)}
                      </span>
                    )}
                  </div>
                  {day.description && (
                    <p style={{ fontSize: 11, lineHeight: 1.7, color: C.mid, margin: 0, textAlign: ta }}>
                      {glText(day.description, lang)}
                    </p>
                  )}
                </div>
              ))}
            </div>
            <PageFooter />
          </>
        )}

        {/* ── INCLUSIONS / EXCLUSIONS / WHAT TO PACK ─────────────────────────── */}
        {(inclusions.length > 0 || exclusions.length > 0 || whatToPack.length > 0) && (
          <>
            <SectionHeader>{rtl ? 'التفاصيل' : 'Details'}</SectionHeader>
            <div style={{ padding: '28px 36px 24px' }}>

              {(inclusions.length > 0 || exclusions.length > 0) && (
                <div style={{ marginBottom: 24 }}>
                  <SectionTitle>{rtl ? 'مشمول / غير مشمول' : 'Included / Excluded'}</SectionTitle>
                  <div style={{ display: 'flex', flexDirection: row, gap: 16 }}>
                    {inclusions.length > 0 && (
                      <div style={{ flex: 1, backgroundColor: C.greenBg, borderRadius: 8, padding: '12px 16px' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.green, marginBottom: 10, textAlign: ta }}>
                          {rtl ? 'مشمول' : 'Included'}
                        </div>
                        {inclusions.map((item, i) => (
                          <div key={i} style={{ display: 'flex', flexDirection: row, alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                            <span style={{ color: C.green, fontWeight: 700, fontSize: 14, lineHeight: '1.3' }}>+</span>
                            <span style={{ fontSize: 11, lineHeight: 1.6, color: C.dark, textAlign: ta }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                    {exclusions.length > 0 && (
                      <div style={{ flex: 1, backgroundColor: C.redBg, borderRadius: 8, padding: '12px 16px' }}>
                        <div style={{ fontSize: 12, fontWeight: 700, color: C.red, marginBottom: 10, textAlign: ta }}>
                          {rtl ? 'غير مشمول' : 'Excluded'}
                        </div>
                        {exclusions.map((item, i) => (
                          <div key={i} style={{ display: 'flex', flexDirection: row, alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                            <span style={{ color: C.red, fontWeight: 700, fontSize: 14, lineHeight: '1.3' }}>-</span>
                            <span style={{ fontSize: 11, lineHeight: 1.6, color: C.dark, textAlign: ta }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {whatToPack.length > 0 && (
                <div>
                  <SectionTitle>{rtl ? 'ماذا تحضر' : 'What to Pack'}</SectionTitle>
                  <div style={{ display: 'flex', flexWrap: 'wrap', flexDirection: row, gap: 8 }}>
                    {whatToPack.map((item, i) => (
                      <div key={i} style={{ width: 'calc(50% - 4px)', display: 'flex', flexDirection: row, alignItems: 'flex-start', gap: 8 }}>
                        <Dot />
                        <span style={{ fontSize: 11, lineHeight: 1.65, color: C.dark, textAlign: ta }}>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <PageFooter />
          </>
        )}

        {/* ── NOTES & CANCELLATION ───────────────────────────────────────────── */}
        {(notes.length > 0 || cancellation) && (
          <>
            <SectionHeader>{rtl ? 'ملاحظات مهمة' : 'Important Info'}</SectionHeader>
            <div style={{ padding: '28px 36px 24px' }}>

              {(notes as any[]).length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <SectionTitle>{rtl ? 'ملاحظات' : 'Notes'}</SectionTitle>
                  {(notes as any[]).map((note, i) => (
                    <div key={i} style={{
                      backgroundColor: C.amberBg,
                      borderRadius:    6,
                      padding:         '10px 14px',
                      marginBottom:    8,
                      borderLeft:  rtl ? 'none' : `2px solid ${C.gold}`,
                      borderRight: rtl ? `2px solid ${C.gold}` : 'none',
                    }}>
                      {note.title && (
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#92400e', marginBottom: 4, textAlign: ta }}>
                          {gl(note.title, lang)}
                        </div>
                      )}
                      {note.text && (
                        <p style={{ fontSize: 11, lineHeight: 1.65, color: '#78350f', margin: 0, textAlign: ta }}>
                          {glText(note.text, lang)}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {cancellation && (
                <div>
                  <SectionTitle>{rtl ? 'سياسة الإلغاء' : 'Cancellation Policy'}</SectionTitle>
                  <p style={{ fontSize: 12, lineHeight: 1.85, color: C.mid, margin: 0, textAlign: ta }}>{cancellation}</p>
                </div>
              )}
            </div>
            <PageFooter />
          </>
        )}

        {/* ── QR CODE BANNER (always last) ───────────────────────────────────── */}
        <div style={{ backgroundColor: C.white, borderTop: `4px solid ${C.brand}` }}>
          <div style={{
            display:       'flex',
            flexDirection: row,
            alignItems:    'stretch',
            minHeight:     160,
          }}>

            {/* Left column — logo + tagline + URL */}
            <div style={{
              flex:            1,
              display:         'flex',
              flexDirection:   'column',
              justifyContent:  'center',
              gap:             12,
              padding:         '28px 32px',
              backgroundColor: C.bg,
            }}>
              {/* Logo — fixed max dimensions to prevent stretching */}
              {logoGreen ? (
                <img
                  src={logoGreen}
                  alt="Alforsa Gate"
                  style={{
                    display:   'block',
                    maxHeight: 54,
                    width:     'auto',
                    maxWidth:  210,
                    objectFit: 'contain',
                  }}
                />
              ) : (
                <div style={{ fontSize: 20, fontWeight: 700, color: C.brand }}>Alforsa Gate</div>
              )}

              <div style={{ fontSize: 12, color: C.mid, lineHeight: 1.65, textAlign: ta }}>
                {rtl
                  ? 'امسح رمز QR لعرض تفاصيل الجولة كاملة والحجز أونلاين'
                  : 'Scan the QR code to view the full tour details and book online.'}
              </div>

              {tourUrl && (
                <div style={{
                  display:         'flex',
                  flexDirection:   row,
                  alignItems:      'center',
                  gap:             6,
                  backgroundColor: C.brandLt,
                  borderRadius:    6,
                  padding:         '6px 12px',
                  border:          `1px solid ${C.brand}30`,
                  alignSelf:       'flex-start',
                }}>
                  <div style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: C.brand, flexShrink: 0 }} />
                  <span style={{
                    fontSize:  10,
                    color:     C.brand,
                    fontWeight: 600,
                    wordBreak: 'break-all',
                  }}>{tourUrl}</span>
                </div>
              )}
            </div>

            {/* Vertical divider */}
            <div style={{ width: 1, backgroundColor: C.border, flexShrink: 0 }} />

            {/* Right column — QR code */}
            {qrBase64 && (
              <div style={{
                width:           200,
                flexShrink:      0,
                display:         'flex',
                flexDirection:   'column',
                alignItems:      'center',
                justifyContent:  'center',
                gap:             10,
                padding:         '24px 20px',
                backgroundColor: C.white,
              }}>
                {/* "Book Online" label above QR */}
                <div style={{
                  fontSize:        9,
                  fontWeight:      700,
                  color:           C.brand,
                  letterSpacing:   1.5,
                  textTransform:   'uppercase',
                }}>
                  {rtl ? 'احجز أونلاين' : 'Book Online'}
                </div>

                {/* QR frame with brand accent */}
                <div style={{
                  borderRadius:    12,
                  overflow:        'hidden',
                  border:          `3px solid ${C.brand}`,
                  boxShadow:       `0 0 0 4px ${C.brandLt}`,
                }}>
                  <img src={qrBase64} alt="QR Code" style={{ width: 120, height: 120, display: 'block' }} />
                </div>

                {/* Caption */}
                <div style={{ fontSize: 9, color: C.mid, textAlign: 'center', lineHeight: 1.4 }}>
                  {rtl ? 'امسح بكاميرا هاتفك' : 'Scan with your phone camera'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Final brand strip */}
        <div style={{
          backgroundColor: C.brandDk,
          padding:         '10px 36px',
          display:         'flex',
          flexDirection:   row,
          alignItems:      'center',
          justifyContent:  'space-between',
        }}>
          {logoBase64 ? (
            <img
              src={logoBase64}
              alt="Alforsa Gate"
              style={{ display: 'block', maxHeight: 24, width: 'auto', maxWidth: 140, objectFit: 'contain' }}
            />
          ) : (
            <span style={{ color: C.white, fontSize: 11, fontWeight: 700, fontFamily: FONT }}>Alforsa Gate</span>
          )}
          <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 9, fontFamily: FONT }}>
            {rtl ? 'تم إنشاؤه بواسطة بوابة الفرصة' : 'Generated by Alforsa Gate'} · alforsa-gate.com
          </span>
        </div>

      </div>
    );
  }
);

TourPDFView.displayName = 'TourPDFView';
export default TourPDFView;

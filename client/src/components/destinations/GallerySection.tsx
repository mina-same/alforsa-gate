import { useState } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import type { IGalleryItem } from '../../services/destinationService';

interface Props {
  items: IGalleryItem[];
  title?: string;
  subtitle?: string;
  lang: 'en' | 'ar';
  primaryColor: string;
}

const GallerySection = ({ items, title, subtitle, lang }: Props) => {
  const [lightbox, setLightbox] = useState<number | null>(null);
  const dir = lang === 'ar' ? 'rtl' : 'ltr';

  const prev = () => setLightbox((i) => (i !== null ? (i - 1 + items.length) % items.length : null));
  const next = () => setLightbox((i) => (i !== null ? (i + 1) % items.length : null));

  if (!items || items.length === 0) return null;

  return (
    <section className="pt-80 pb-100" style={{ background: '#fff', marginBottom: 40 }}>
      <div className="container">
        {(title || subtitle) && (
          <div className="col-12 text-center mb-40" style={{ direction: dir }}>
            {subtitle && <h5 className="tg-section-subtitle mb-15">{subtitle}</h5>}
            {title   && <h2>{title}</h2>}
          </div>
        )}

        {/* Masonry-style grid */}
        <div style={{
          columns: '3 280px',
          columnGap: 16,
        }}>
          {items.map((item, idx) => (
            <div
              key={idx}
              onClick={() => setLightbox(idx)}
              style={{
                breakInside: 'avoid',
                marginBottom: 16,
                borderRadius: 12,
                overflow: 'hidden',
                cursor: 'pointer',
                position: 'relative',
                background: '#f0f0f0',
              }}
            >
              <img
                src={item.url}
                alt={item.alt?.[lang] || item.caption?.[lang] || ''}
                style={{ width: '100%', display: 'block', transition: 'transform 0.4s' }}
                onMouseOver={(e: any) => (e.currentTarget.style.transform = 'scale(1.04)')}
                onMouseOut={(e: any)  => (e.currentTarget.style.transform = 'scale(1)')}
                onError={(e: any)     => { e.currentTarget.style.display = 'none'; }}
              />
              {item.caption?.[lang] && (
                <div style={{
                  position: 'absolute', bottom: 0, left: 0, right: 0,
                  background: 'linear-gradient(transparent, rgba(0,0,0,0.6))',
                  color: '#fff', fontSize: 12, padding: '24px 12px 10px',
                  direction: dir,
                }}>
                  {item.caption[lang]}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.92)',
            zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <button
            onClick={(e) => { e.stopPropagation(); prev(); }}
            style={{ position: 'absolute', left: 20, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
          >
            <ChevronLeft size={22} />
          </button>

          <div onClick={(e) => e.stopPropagation()} style={{ maxWidth: '85vw', maxHeight: '85vh', textAlign: 'center' }}>
            <img
              src={items[lightbox].url}
              alt={items[lightbox].alt?.[lang] || ''}
              style={{ maxWidth: '100%', maxHeight: '75vh', borderRadius: 8, objectFit: 'contain' }}
            />
            {items[lightbox].caption?.[lang] && (
              <p style={{ color: 'rgba(255,255,255,0.8)', marginTop: 12, fontSize: 14 }}>
                {items[lightbox].caption![lang]}
              </p>
            )}
            <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 12, marginTop: 4 }}>
              {lightbox + 1} / {items.length}
            </p>
          </div>

          <button
            onClick={(e) => { e.stopPropagation(); next(); }}
            style={{ position: 'absolute', right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
          >
            <ChevronRight size={22} />
          </button>

          <button
            onClick={() => setLightbox(null)}
            style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 40, height: 40, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
          >
            <X size={18} />
          </button>
        </div>
      )}
    </section>
  );
};

export default GallerySection;

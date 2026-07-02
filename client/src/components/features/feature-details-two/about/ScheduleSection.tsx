import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTourDetails } from '../../../../hooks/useTourDetails';
import { getLang } from '../../../../utils/getLang';

// ── full-screen lightbox ──────────────────────────────────────────────────────

const Lightbox = ({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) => (
  <div
    role="dialog"
    aria-modal="true"
    aria-label="Schedule lightbox"
    onClick={onClose}
    style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      backgroundColor: 'rgba(0,0,0,0.92)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      cursor: 'zoom-out',
    }}
  >
    <button
      aria-label="Close"
      onClick={onClose}
      style={{
        position: 'absolute', top: 16, right: 16,
        background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
        width: 42, height: 42, cursor: 'pointer', color: '#fff', fontSize: 18,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <i className="fa-solid fa-xmark" />
    </button>
    <img
      src={src}
      alt={alt}
      onClick={e => e.stopPropagation()}
      style={{
        maxWidth: '95vw', maxHeight: '92vh',
        objectFit: 'contain', borderRadius: 8,
        boxShadow: '0 8px 48px rgba(0,0,0,0.6)',
        cursor: 'default',
      }}
    />
  </div>
);

// ── main component ────────────────────────────────────────────────────────────

const ScheduleSection = () => {
  const { tour, lang } = useTourDetails();
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);

  const img = tour?.scheduleImage;
  if (!img?.url) return null;

  const alt = getLang(img.alt, lang) || t('tour.sections.schedule');

  return (
    <>
      <div className="tg-tour-about-map mb-40">
        <h4 className="tg-tour-about-title mb-20">
          <i className="fa-solid fa-calendar-days mr-10 tg-tour-section-title-icon" />
          {t('tour.sections.schedule')}
        </h4>

        {/* Clickable schedule image — opens full-screen for easy reading */}
        <div
          role="button"
          tabIndex={0}
          aria-label={`${t('tour.sections.schedule')} — ${t('common.click_to_enlarge', 'click to enlarge')}`}
          onClick={() => setOpen(true)}
          onKeyDown={e => e.key === 'Enter' && setOpen(true)}
          style={{
            cursor: 'zoom-in',
            borderRadius: 12,
            overflow: 'hidden',
            border: '1.5px solid var(--tg-border-color, #e8e8e8)',
            boxShadow: '0 2px 16px rgba(0,0,0,0.08)',
            transition: 'box-shadow 0.25s, transform 0.25s',
            display: 'block',
            maxWidth: '100%',
          }}
          onMouseEnter={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 32px rgba(0,0,0,0.18)';
            (e.currentTarget as HTMLDivElement).style.transform = 'scale(1.01)';
          }}
          onMouseLeave={e => {
            (e.currentTarget as HTMLDivElement).style.boxShadow = '0 2px 16px rgba(0,0,0,0.08)';
            (e.currentTarget as HTMLDivElement).style.transform = 'scale(1)';
          }}
        >
          <img
            src={img.url}
            alt={alt}
            style={{ width: '100%', height: 'auto', display: 'block' }}
            loading="lazy"
          />
        </div>

        <p style={{
          marginTop: 10, fontSize: 12,
          color: 'var(--tg-body-color, #888)', textAlign: 'center',
        }}>
          <i className="fa-solid fa-magnifying-glass-plus mr-6" />
          {t('common.click_to_enlarge', 'Click image to view full size')}
        </p>
      </div>

      {open && <Lightbox src={img.url} alt={alt} onClose={() => setOpen(false)} />}
    </>
  );
};

export default ScheduleSection;

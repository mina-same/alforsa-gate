import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTourDetails } from '../../../../hooks/useTourDetails';
import { getLang } from '../../../../utils/getLang';
import VideoPopup from '../../../../modals/VideoPopup';

// ── helpers ────────────────────────────────────────────────────────────────────

function extractYouTubeId(url: string): string {
  if (!url) return '';
  // already a bare ID (no slash or dot)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url.trim())) return url.trim();
  const match = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : url.trim();
}

function ytThumb(id: string): string {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

// ── lightbox ───────────────────────────────────────────────────────────────────

interface LightboxProps {
  images: string[];
  startIndex: number;
  alts: string[];
  onClose: () => void;
}

const Lightbox = ({ images, startIndex, alts, onClose }: LightboxProps) => {
  const [idx, setIdx] = useState(startIndex);

  const prev = () => setIdx(i => (i - 1 + images.length) % images.length);
  const next = () => setIdx(i => (i + 1) % images.length);

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') prev();
    if (e.key === 'ArrowRight') next();
    if (e.key === 'Escape') onClose();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Image lightbox"
      tabIndex={0}
      onKeyDown={handleKey}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        backgroundColor: 'rgba(0,0,0,0.92)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      {/* Close */}
      <button
        aria-label="Close lightbox"
        onClick={onClose}
        style={{
          position: 'absolute', top: 18, right: 18,
          background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
          width: 42, height: 42, cursor: 'pointer', color: '#fff', fontSize: 18,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >
        <i className="fa-solid fa-xmark" />
      </button>

      {/* Prev */}
      {images.length > 1 && (
        <button
          aria-label="Previous image"
          onClick={prev}
          style={{
            position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
            width: 48, height: 48, cursor: 'pointer', color: '#fff', fontSize: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <i className="fa-solid fa-chevron-left" />
        </button>
      )}

      <img
        src={images[idx]}
        alt={alts[idx] || ''}
        style={{ maxWidth: '90vw', maxHeight: '88vh', objectFit: 'contain', borderRadius: 6 }}
      />

      {/* Next */}
      {images.length > 1 && (
        <button
          aria-label="Next image"
          onClick={next}
          style={{
            position: 'absolute', right: 18, top: '50%', transform: 'translateY(-50%)',
            background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%',
            width: 48, height: 48, cursor: 'pointer', color: '#fff', fontSize: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          <i className="fa-solid fa-chevron-right" />
        </button>
      )}

      {/* Counter */}
      {images.length > 1 && (
        <span style={{
          position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(255,255,255,0.7)', fontSize: 13,
        }}>
          {idx + 1} / {images.length}
        </span>
      )}
    </div>
  );
};

// ── gallery item ───────────────────────────────────────────────────────────────

const itemStyle: React.CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  borderRadius: 10,
  cursor: 'pointer',
  background: '#0d0d0d',
  aspectRatio: '4/3',
};

const imgStyle: React.CSSProperties = {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'block',
  transition: 'transform 0.3s ease',
};

const overlayBase: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
};

// ── main component ─────────────────────────────────────────────────────────────

const TourGallerySection = () => {
  const { tour, lang } = useTourDetails();
  const { t } = useTranslation();

  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [videoId, setVideoId] = useState('');
  const [videoOpen, setVideoOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const images = tour?.gallery ?? [];
  const rawVideos = tour?.tourVideos ?? [];
  const videoIds = rawVideos.map(extractYouTubeId).filter(Boolean);

  if (images.length === 0 && videoIds.length === 0) return null;

  // all image URLs + alts for lightbox
  const lightboxImages = images.map(img => img.url);
  const lightboxAlts = images.map(img => getLang(img.alt, lang));

  const openImage = (imgIndex: number) => {
    setLightboxIndex(imgIndex);
    setLightboxOpen(true);
  };

  const openVideo = (id: string) => {
    setVideoId(id);
    setVideoOpen(true);
  };

  return (
    <>
      <div className="tg-tour-about-map mb-40">
        <h4 className="tg-tour-about-title mb-15">
          <i className="fa-solid fa-images mr-10 tg-tour-section-title-icon"></i>
          {t('tour.sections.tour_gallery')}
        </h4>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 10,
          }}
          className="tg-gallery-grid"
        >
          {/* Image items */}
          {images.map((img, i) => (
            <div
              key={`img-${i}`}
              style={itemStyle}
              onClick={() => openImage(i)}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
              role="button"
              aria-label={getLang(img.alt, lang) || `Gallery image ${i + 1}`}
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && openImage(i)}
            >
              <img
                src={img.url}
                alt={getLang(img.alt, lang)}
                style={{
                  ...imgStyle,
                  transform: hoveredIdx === i ? 'scale(1.06)' : 'scale(1)',
                }}
                loading="lazy"
              />
              <div
                style={{
                  ...overlayBase,
                  backgroundColor: hoveredIdx === i ? 'rgba(0,0,0,0.25)' : 'transparent',
                  transition: 'background-color 0.3s',
                }}
              >
                {hoveredIdx === i && (
                  <i className="fa-solid fa-magnifying-glass-plus" style={{ color: '#fff', fontSize: 26 }} />
                )}
              </div>
            </div>
          ))}

          {/* Video items */}
          {videoIds.map((vid, i) => {
            const key = images.length + i;
            return (
              <div
                key={`vid-${i}`}
                style={itemStyle}
                onClick={() => openVideo(vid)}
                onMouseEnter={() => setHoveredIdx(key)}
                onMouseLeave={() => setHoveredIdx(null)}
                role="button"
                aria-label={`Play video ${i + 1}`}
                tabIndex={0}
                onKeyDown={e => e.key === 'Enter' && openVideo(vid)}
              >
                <img
                  src={ytThumb(vid)}
                  alt={`Video ${i + 1}`}
                  style={{
                    ...imgStyle,
                    transform: hoveredIdx === key ? 'scale(1.06)' : 'scale(1)',
                  }}
                  loading="lazy"
                />
                <div
                  style={{
                    ...overlayBase,
                    backgroundColor: 'rgba(0,0,0,0.35)',
                    transition: 'background-color 0.3s',
                  }}
                >
                  <div
                    style={{
                      width: 54,
                      height: 54,
                      borderRadius: '50%',
                      background: hoveredIdx === key ? 'var(--tg-color-1)' : 'rgba(255,255,255,0.9)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'background 0.25s',
                      boxShadow: '0 4px 16px rgba(0,0,0,0.3)',
                    }}
                  >
                    <i
                      className="fa-solid fa-play"
                      style={{
                        color: hoveredIdx === key ? '#fff' : 'var(--tg-color-1)',
                        fontSize: 18,
                        marginLeft: 3,
                      }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Responsive grid style */}
        <style>{`
          @media (max-width: 768px) { .tg-gallery-grid { grid-template-columns: repeat(2, 1fr) !important; } }
          @media (max-width: 480px) { .tg-gallery-grid { grid-template-columns: 1fr !important; } }
        `}</style>
      </div>

      {/* Lightbox */}
      {lightboxOpen && lightboxImages.length > 0 && (
        <Lightbox
          images={lightboxImages}
          startIndex={lightboxIndex}
          alts={lightboxAlts}
          onClose={() => setLightboxOpen(false)}
        />
      )}

      {/* Video modal */}
      <VideoPopup
        isVideoOpen={videoOpen}
        setIsVideoOpen={setVideoOpen}
        videoId={videoId}
      />
    </>
  );
};

export default TourGallerySection;

import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { useTourDetails } from '../../../../hooks/useTourDetails';
import { getLang } from '../../../../utils/getLang';
import TourPDFView from '../../../../pdf/TourPDFView';

// ── helpers ───────────────────────────────────────────────────────────────────

async function urlToBase64(url: string): Promise<string> {
  try {
    if (!url || !/^https?:\/\//.test(url)) return '';
    const res = await fetch(url, { mode: 'cors' });
    if (!res.ok) return '';
    const blob = await res.blob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror  = () => resolve('');
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}

/** Fetch a same-origin asset (no CORS header needed) as a base64 data URL. */
async function localToBase64(path: string): Promise<string> {
  try {
    const res = await fetch(path);
    if (!res.ok) return '';
    const blob = await res.blob();
    return new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror  = () => resolve('');
      reader.readAsDataURL(blob);
    });
  } catch {
    return '';
  }
}

// ── hooks ─────────────────────────────────────────────────────────────────────

function useImageBase64(urls: string[]): { images: string[]; ready: boolean } {
  const [images, setImages] = useState<string[]>([]);
  const [ready, setReady]   = useState(false);
  const key = urls.join('|');

  useEffect(() => {
    setReady(false);
    if (urls.length === 0) { setImages([]); setReady(true); return; }

    let cancelled = false;
    Promise.all(urls.map(urlToBase64)).then((results) => {
      if (!cancelled) { setImages(results); setReady(true); }
    });
    return () => { cancelled = true; };
  }, [key]); // eslint-disable-line react-hooks/exhaustive-deps

  return { images, ready };
}

// ── component ─────────────────────────────────────────────────────────────────

const TourDocumentsSection = () => {
  const { tour, lang } = useTourDetails();
  const { t }          = useTranslation();

  const [generating, setGenerating] = useState(false);
  const [logoWhite,  setLogoWhite]  = useState('');
  const [logoGreen,  setLogoGreen]  = useState('');
  const [qrBase64,   setQrBase64]   = useState('');
  const [assetsReady, setAssetsReady] = useState(false);

  const pdfRef = useRef<HTMLDivElement>(null);
  const docs   = tour?.tourDocuments ?? [];

  // Pre-fetch tour images as base64
  const imageUrls = tour
    ? [...(tour.images ?? []).map(i => i.url), ...(tour.gallery ?? []).map(i => i.url)].slice(0, 7)
    : [];
  const { images: imageBase64s, ready: imagesReady } = useImageBase64(imageUrls);

  // Load logos + QR once tour is known
  useEffect(() => {
    if (!tour) return;
    setAssetsReady(false);

    const tourSlug = getLang(tour.slug, 'en') || (tour as any)._id || '';
    const tourUrl  = `${window.location.origin}/tour/${tourSlug}`;

    Promise.all([
      localToBase64('/assets/img/logo/logo-white.png'),
      localToBase64('/assets/img/logo/logo-green.png'),
      QRCode.toDataURL(tourUrl, {
        width: 240, margin: 2,
        color: { dark: '#020615', light: '#ffffff' },
      }).catch(() => ''),
    ]).then(([white, green, qr]) => {
      setLogoWhite(white);
      setLogoGreen(green);
      setQrBase64(qr);
      setAssetsReady(true);
    });
  }, [tour?._id]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!tour) return null;

  const ready    = imagesReady && assetsReady;
  const fileName = `tour-${getLang(tour.slug, lang) || (tour as any)._id}.pdf`;
  const tourUrl  = `${window.location.origin}/tour/${getLang(tour.slug, 'en') || (tour as any)._id}`;

  // ── PDF generation ──────────────────────────────────────────────────────────

  const handleDownload = async () => {
    if (!pdfRef.current || generating) return;
    setGenerating(true);
    try {
      const canvas = await html2canvas(pdfRef.current, {
        scale:           2,
        useCORS:         true,
        allowTaint:      false,
        backgroundColor: '#ffffff',
        logging:         false,
      });

      const imgData = canvas.toDataURL('image/jpeg', 0.92);
      const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
      const pageW   = pdf.internal.pageSize.getWidth();
      const pageH   = pdf.internal.pageSize.getHeight();
      const imgW    = pageW;
      const imgH    = (canvas.height / canvas.width) * pageW;

      pdf.addImage(imgData, 'JPEG', 0, 0, imgW, imgH);

      let heightLeft = imgH - pageH;
      let offset     = -pageH;
      while (heightLeft > 0) {
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, offset, imgW, imgH);
        offset     -= pageH;
        heightLeft -= pageH;
      }

      pdf.save(fileName);
    } catch (err) {
      console.error('PDF generation failed:', err);
    } finally {
      setGenerating(false);
    }
  };

  // ── render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* Off-screen snapshot — captured by html2canvas on demand */}
      <div style={{ position: 'absolute', top: '-9999px', left: 0, width: 794, pointerEvents: 'none', zIndex: -1 }}>
        {ready && (
          <TourPDFView
            ref={pdfRef}
            tour={tour}
            lang={lang}
            imageBase64s={imageBase64s}
            logoBase64={logoWhite}
            logoGreen={logoGreen}
            qrBase64={qrBase64}
            tourUrl={tourUrl}
          />
        )}
      </div>

      <div className="tg-tour-about-inner tg-tour-about-2-inner tg-tour-about-2-inner--plain mb-30">
        <h4 className="tg-tour-about-title mb-15">
          <i className="fa-solid fa-file-lines mr-10 tg-tour-section-title-icon"></i>
          {t('tour.sections.tour_documents')}
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>

          {/* PDF download button */}
          <button
            onClick={handleDownload}
            disabled={!ready || generating}
            className="tg-btn tg-btn-theme"
            style={{
              display:     'inline-flex',
              alignItems:  'center',
              gap:         8,
              padding:     '11px 22px',
              fontSize:    14,
              border:      'none',
              opacity:     (!ready || generating) ? 0.7 : 1,
              cursor:      (!ready || generating) ? 'default' : 'pointer',
            }}
          >
            {(!ready || generating) ? (
              <><i className="fa-solid fa-spinner fa-spin" style={{ fontSize: 14 }}></i>&nbsp;{t('tour.pdf.generating')}</>
            ) : (
              <><i className="fa-solid fa-file-arrow-down" style={{ fontSize: 14 }}></i>&nbsp;{t('tour.pdf.download')}</>
            )}
          </button>

          {/* Existing uploaded documents */}
          {docs.map((doc, i) => (
            <a
              key={i}
              href={doc.url}
              target="_blank"
              rel="noopener noreferrer"
              className="tg-btn tg-btn-gray tg-btn-switch-animation"
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 18px', fontSize: 14 }}
            >
              <i className="fa-solid fa-file-pdf" style={{ color: '#ef4444', fontSize: 16 }}></i>
              {getLang(doc.label, lang)}
            </a>
          ))}

        </div>
      </div>
    </>
  );
};

export default TourDocumentsSection;

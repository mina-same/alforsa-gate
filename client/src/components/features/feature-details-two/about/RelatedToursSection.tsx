import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTourDetails } from '../../../../hooks/useTourDetails';
import { getLang } from '../../../../utils/getLang';

const RelatedToursSection = () => {
  const { tour, lang } = useTourDetails();
  const { t } = useTranslation();
  if (!tour?.relatedTours?.length) return null;

  const prefix = lang === 'ar' ? '/ar' : '/en';

  return (
    <div className="tg-tour-about-inner mb-40">
      <h4 className="tg-tour-about-title mb-20">{t('tour.sections.related_tours')}</h4>
      <div className="row g-3">
        {tour.relatedTours.map((rt) => (
          <div key={rt.id} className="col-md-4 col-sm-6">
            <Link
              to={`${prefix}/tour/${rt.id}`}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                background: '#f8f9fa',
                border: '1px solid #e9ecef',
                borderRadius: 8,
                padding: '14px 16px',
                color: 'inherit',
                textDecoration: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = 'var(--tg-color-1)';
                (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.08)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLElement).style.borderColor = '#e9ecef';
                (e.currentTarget as HTMLElement).style.boxShadow = 'none';
              }}
            >
              <i className="fa-sharp fa-solid fa-map-location-dot"
                style={{ color: 'var(--tg-color-1)', fontSize: 18, marginTop: 2, flexShrink: 0 }}
              ></i>
              <span style={{ fontSize: 14, fontWeight: 500, lineHeight: 1.5 }}>
                {getLang(rt.title, lang)}
              </span>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default RelatedToursSection;

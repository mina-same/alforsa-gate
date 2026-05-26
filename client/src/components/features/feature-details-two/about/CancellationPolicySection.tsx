import { useTranslation } from 'react-i18next';
import { useTourDetails } from '../../../../hooks/useTourDetails';
import { getLang } from '../../../../utils/getLang';

const CancellationPolicySection = () => {
  const { tour, lang } = useTourDetails();
  const { t } = useTranslation();
  if (!tour?.cancellationPolicy) return null;

  const text = getLang(tour.cancellationPolicy, lang);
  if (!text) return null;

  return (
    <div className="tg-tour-about-inner mb-40">
      <h4 className="tg-tour-about-title mb-15">
        <i className="fa-solid fa-shield-check mr-10 tg-tour-section-title-icon"></i>
        {t('tour.sections.cancellation_policy')}
      </h4>
      <div style={{
        background: '#f0f9ff',
        border: '1px solid #bae6fd',
        borderLeft: '4px solid #0284c7',
        borderRadius: 6,
        padding: '16px 20px',
      }}>
        <div style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <i className="fa-sharp fa-solid fa-shield-check" style={{ color: '#0284c7', fontSize: 18, marginTop: 3 }}></i>
          <p className="lh-28 mb-0" style={{ color: '#0c4a6e' }}>{text}</p>
        </div>
      </div>
    </div>
  );
};

export default CancellationPolicySection;

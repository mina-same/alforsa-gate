import { useTranslation } from 'react-i18next';
import { useTourDetails } from '../../../../hooks/useTourDetails';
import { getLang } from '../../../../utils/getLang';

const TourDocumentsSection = () => {
  const { tour, lang } = useTourDetails();
  const { t } = useTranslation();
  const docs = tour?.tourDocuments ?? [];
  if (docs.length === 0) return null;

  return (
    <div className="tg-tour-about-inner tg-tour-about-2-inner tg-tour-about-2-inner--plain mb-30">
      <h4 className="tg-tour-about-title mb-15">
        <i className="fa-solid fa-file-lines mr-10 tg-tour-section-title-icon"></i>
        {t('tour.sections.tour_documents')}
      </h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
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
  );
};

export default TourDocumentsSection;

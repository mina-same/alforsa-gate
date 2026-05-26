import { useTranslation } from 'react-i18next';
import { useTourDetails } from '../../../../hooks/useTourDetails';
import { getLang } from '../../../../utils/getLang';

const TagsSection = () => {
  const { tour, lang } = useTourDetails();
  const { t } = useTranslation();
  const tags = tour?.tags ?? [];
  if (tags.length === 0) return null;

  return (
    <div className="tg-tour-about-inner tg-tour-about-2-inner tg-tour-about-2-inner--plain mb-30">
      <h4 className="tg-tour-about-title mb-15">
        <i className="fa-solid fa-hashtag mr-10 tg-tour-section-title-icon"></i>
        {t('tour.sections.tags')}
      </h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {tags.map((tag, i) => (
          <span
            key={i}
            style={{
              display: 'inline-block',
              padding: '6px 14px',
              color: 'var(--tg-color-1, #7b2ff7)',
              borderRadius: 20,
              fontSize: 13,
              fontWeight: 500,
              border: '1px solid #e0d9ff',
            }}
          >
            {getLang(tag, lang)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default TagsSection;

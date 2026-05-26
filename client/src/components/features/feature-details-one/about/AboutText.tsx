import { useTranslation } from 'react-i18next';
import { useTourDetails } from '../../../../hooks/useTourDetails';
import { getLang } from '../../../../utils/getLang';

const AboutText = () => {
  const { tour, lang } = useTourDetails();
  const { t } = useTranslation();

  if (!tour) return null;

  const descriptionText = getLang(tour.Description?.text, lang);
  const descriptionHeader = getLang(tour.Description?.header, lang);
  const highlights = tour.tourHighlights ?? [];
  const whatYouLove = getLang(tour.whatYouWillLoveHtml, lang);

  return (
    <>
      <div className="tg-tour-about-inner mb-25">
        <h4 className="tg-tour-about-title mb-15">
          <i className="fa-solid fa-landmark mr-10 tg-tour-section-title-icon"></i>
          {descriptionHeader || t('tour.sections.about')}
        </h4>
        <div className="text-capitalize lh-28" dangerouslySetInnerHTML={{ __html: descriptionText }} />
      </div>

      {highlights.length > 0 && (
        <div className="tg-tour-about-inner mb-40">
          <h4 className="tg-tour-about-title mb-20">
            <i className="fa-solid fa-star mr-10 tg-tour-section-title-icon"></i>
            {t('tour.sections.highlights')}
          </h4>
          <div className="tg-tour-about-list">
            <ul>
              {highlights.map((h, i) => (
                <li key={i}>
                  <span className="icon mr-10"><i className="fa-sharp fa-solid fa-check fa-fw"></i></span>
                  <span className="text">{getLang(h, lang)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {whatYouLove && (
        <div className="tg-tour-about-inner mb-40">
          <h4 className="tg-tour-about-title mb-15">
            <i className="fa-solid fa-heart mr-10 tg-tour-section-title-icon"></i>
            {t('tour.sections.what_you_love')}
          </h4>
          <div className="tg-tour-about-list lh-28" dangerouslySetInnerHTML={{ __html: whatYouLove }} />
        </div>
      )}
    </>
  );
};

export default AboutText;

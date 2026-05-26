import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTourDetails } from '../../../../hooks/useTourDetails';
import { getLang } from '../../../../utils/getLang';

const renderRichText = (value: string) => (
  /<\/?[a-z][\s\S]*>/i.test(value)
    ? <div dangerouslySetInnerHTML={{ __html: value }} />
    : <p>{value}</p>
);

const ItinerarySection = () => {
  const { tour, lang } = useTourDetails();
  const { t } = useTranslation();
  const [openId, setOpenId] = useState<number>(1);

  if (!tour?.itinerary?.days?.length) return null;

  const { generalDescription, days } = tour.itinerary;
  const genDesc = generalDescription ? getLang(generalDescription, lang) : '';

  const toggle = (day: number) => setOpenId((prev) => (prev === day ? -1 : day));

  return (
    <div className="tg-tour-faq-wrap mb-40">
      <h4 className="tg-tour-about-title mb-15">
        <i className="fa-solid fa-route mr-10 tg-tour-section-title-icon"></i>
        {t('tour.sections.tour_plan')}
      </h4>
      {genDesc && (
        <p className="text-capitalize lh-28 mb-20">{genDesc}</p>
      )}
      <div className="tg-tour-about-faq-inner">
        <div className="tg-tour-about-faq" id="tourPlanAccordion">
          {days.map((dayItem) => {
            const isOpen = openId === dayItem.day;
            const title = getLang(dayItem.title, lang);
            const description = getLang(dayItem.description, lang);

            return (
              <div key={dayItem.day} className="accordion-item">
                <h2 className="accordion-header">
                  <button
                    className={`accordion-button${isOpen ? '' : ' collapsed'}`}
                    type="button"
                    onClick={() => toggle(dayItem.day)}
                  >
                    <span>Day-{String(dayItem.day).padStart(2, '0')}</span>
                    {title}
                  </button>
                </h2>
                {isOpen && (
                  <div className="accordion-collapse show">
                    <div className="accordion-body tg-tour-plan-body">
                      {renderRichText(description)}
                      {dayItem.activities?.length > 0 && (
                        <div className="tg-tour-about-list mt-15">
                          <ul>
                            {dayItem.activities.map((act, ai) => (
                              <li key={ai}>
                                <span className="icon mr-10">
                                  <i className="fa-sharp fa-solid fa-circle-dot fa-fw"></i>
                                </span>
                                <span className="text">
                                  <strong>{getLang(act.heading, lang)}</strong>
                                  {act.description && (
                                    <span>
                                      {' — '}{getLang(act.description, lang)}
                                    </span>
                                  )}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ItinerarySection;

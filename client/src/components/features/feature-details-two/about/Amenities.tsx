import { useTranslation } from 'react-i18next';
import { useTourDetails } from '../../../../hooks/useTourDetails';
import { getLang } from '../../../../utils/getLang';

const Amenities = () => {
  const { tour, lang } = useTourDetails();
  const { t } = useTranslation();

  const inclusion = tour?.inclusion ?? [];
  const exclusion = tour?.exclusion ?? [];

  if (inclusion.length === 0 && exclusion.length === 0) return null;

  return (
    <div className="tg-tour-about-inner mb-40">
      <h4 className="tg-tour-about-title mb-20">{t('tour.sections.included_excluded')}</h4>
      <div className="row">
        {inclusion.length > 0 && (
          <div className={exclusion.length > 0 ? 'col-lg-5' : 'col-12'}>
            <div className="tg-tour-about-list tg-tour-about-list-2">
              <ul>
                {inclusion.map((item, i) => (
                  <li key={i}>
                    <span className="icon mr-10">
                      <i className="fa-sharp fa-solid fa-check fa-fw"></i>
                    </span>
                    <span className="text">{getLang(item, lang)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
        {exclusion.length > 0 && (
          <div className={inclusion.length > 0 ? 'col-lg-7' : 'col-12'}>
            <div className="tg-tour-about-list tg-tour-about-list-2 disable">
              <ul>
                {exclusion.map((item, i) => (
                  <li key={i}>
                    <span className="icon mr-10">
                      <i className="fa-sharp fa-solid fa-xmark"></i>
                    </span>
                    <span className="text">{getLang(item, lang)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Amenities;

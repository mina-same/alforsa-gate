import { useTranslation } from 'react-i18next';
import { useTourDetails } from '../../../../hooks/useTourDetails';
import { getLang } from '../../../../utils/getLang';

const WhatToPackSection = () => {
  const { tour, lang } = useTourDetails();
  const { t } = useTranslation();

  const items = tour?.whatToPack ?? [];
  if (items.length === 0) return null;

  const half = Math.ceil(items.length / 2);
  const col1 = items.slice(0, half);
  const col2 = items.slice(half);

  return (
    <div className="tg-tour-about-inner tg-tour-about-2-inner tg-tour-about-2-inner--plain mb-30">
      <h4 className="tg-tour-about-title mb-20">
        <i className="fa-solid fa-bag-shopping mr-10" style={{ color: 'var(--tg-color-1, #7b2ff7)' }}></i>
        {t('tour.sections.what_to_pack')}
      </h4>
      <div className="row">
        <div className="col-lg-6 col-md-6">
          <div className="tg-tour-about-list tg-tour-about-list-2">
            <ul>
              {col1.map((item, i) => (
                <li key={i}>
                  <span className="icon mr-10"><i className="fa-sharp fa-solid fa-check fa-fw"></i></span>
                  <span className="text">{getLang(item, lang)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="col-lg-6 col-md-6">
          <div className="tg-tour-about-list tg-tour-about-list-2">
            <ul>
              {col2.map((item, i) => (
                <li key={i}>
                  <span className="icon mr-10"><i className="fa-sharp fa-solid fa-check fa-fw"></i></span>
                  <span className="text">{getLang(item, lang)}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhatToPackSection;

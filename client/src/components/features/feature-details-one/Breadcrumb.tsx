import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTourDetails } from '../../../hooks/useTourDetails';
import { getLang } from '../../../utils/getLang';

const Breadcrumb = () => {
  const { tour, lang } = useTourDetails();
  const { t } = useTranslation();
  const title = tour ? getLang(tour.heading, lang) : 'Tour Details';

  return (
    <>
      <div className="tg-breadcrumb-spacing-3 include-bg p-relative fix" style={{ backgroundImage: `url(/assets/img/breadcrumb/breadcrumb-2.jpg)` }}>
        <div className="tg-hero-top-shadow"></div>
      </div>
      <div className="tg-breadcrumb-list-2-wrap">
        <div className="container">
          <div className="row">
            <div className="col-12">
              <div className="tg-breadcrumb-list-2">
                <ul>
                  <li><Link to="/">{t('tour.breadcrumb.home')}</Link></li>
                  <li><i className="fa-sharp fa-solid fa-angle-right"></i></li>
                  <li><Link to="/tour-grid-1">{t('tour.breadcrumb.tour_grid')}</Link></li>
                  <li><i className="fa-sharp fa-solid fa-angle-right"></i></li>
                  <li><span>{title}</span></li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Breadcrumb;

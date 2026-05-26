import { Link } from 'react-router-dom';
import { useLangPrefix } from '../../../hooks/useLangPrefix';
import { useTourDetails } from '../../../hooks/useTourDetails';
import { getLang } from '../../../utils/getLang';

const BreadCrumb = () => {
  const { tour, lang } = useTourDetails();
  const prefix = useLangPrefix();
  const title = tour ? getLang(tour.heading, lang) : '…';

  return (
    <div className="tg-breadcrumb-list-2 mt-15">
      <div className="container">
        <div className="row">
          <div className="col-12">
            <div className="tg-breadcrumb-list-2 tg-breadcrumb-list-3">
              <ul>
                <li><Link to={`${prefix}/`}>Home</Link></li>
                <li><i className="fa-sharp fa-solid fa-angle-right"></i></li>
                <li><Link to={`${prefix}/tour-grid-1`}>Tours</Link></li>
                <li><i className="fa-sharp fa-solid fa-angle-right"></i></li>
                <li><span>{title}</span></li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BreadCrumb;

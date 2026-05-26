import { useTranslation } from 'react-i18next';
import NiceSelect from '../../../ui/NiceSelect';
import { useTourDetails } from '../../../hooks/useTourDetails';

const FeatureSidebar = () => {
  const { tour } = useTourDetails();
  const { t } = useTranslation();
  const selectHandler = () => {};

  const adultPrice = tour?.priceStartingFrom?.USD ?? 20;
  const remaining = tour?.groupSize?.remaining ?? 0;
  const total = tour?.groupSize?.total ?? 0;

  const qtyOptions = [
    { value: '01', text: '0' }, { value: '02', text: '01' },
    { value: '03', text: '02' }, { value: '04', text: '03' },
    { value: '05', text: '04' }, { value: '06', text: '05' },
    { value: '07', text: '06' }, { value: '08', text: '07' },
  ];

  return (
    <form onSubmit={(e) => e.preventDefault()}>
      <h4 className="tg-tour-about-title title-2 mb-15">{t('tour.sidebar.book_this_tour')}</h4>

      {total > 0 && (
        <div className="mb-15" style={{ fontSize: 13, color: '#555' }}>
          <span style={{ fontWeight: 600, color: remaining <= 4 ? '#ef4444' : '#22c55e' }}>
            {remaining} {t('tour.sidebar.spots_available')}
          </span>{' '}
          {t('tour.sidebar.available_out_of')} {total}
        </div>
      )}

      <div className="tg-booking-form-parent-inner mb-10">
        <div className="tg-tour-about-date p-relative">
          <input className="input" name="datetime-local" type="text" placeholder="When (Date)" />
          <span className="calender">
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M11.1111 1V3.80003M4.88888 1V3.80003M1 6.59992H15M2.55556 2.39988H13.4444C14.3036 2.39988 15 3.02668 15 3.79989V13.6C15 14.3732 14.3036 15 13.4444 15H2.55556C1.69645 15 1 14.3732 1 13.6V3.79989C1 3.02668 1.69645 2.39988 2.55556 2.39988Z" stroke="#560CE3" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="angle"><i className="fa-sharp fa-solid fa-angle-down"></i></span>
        </div>
      </div>

      <div className="tg-tour-about-time d-flex align-items-center mb-10">
        <span className="time">{t('tour.sidebar.time')}</span>
        <div className="form-check mr-15">
          <input className="form-check-input" type="radio" name="flexRadioDefault" id="time1" defaultChecked />
          <label className="form-check-label" htmlFor="time1">12:00</label>
        </div>
        <div className="form-check">
          <input className="form-check-input" type="radio" name="flexRadioDefault" id="time2" />
          <label className="form-check-label" htmlFor="time2">19:00</label>
        </div>
      </div>

      <div className="tg-tour-about-border-doted mb-15"></div>

      <div className="tg-tour-about-tickets-wrap mb-15">
        <span className="tg-tour-about-sidebar-title">{t('tour.sidebar.tickets')}</span>
        <div className="tg-tour-about-tickets mb-10">
          <div className="tg-tour-about-tickets-adult">
            <span>{t('tour.sidebar.adult')}</span>
            <p className="mb-0">{t('tour.sidebar.adult_age')} <span>${adultPrice}</span></p>
          </div>
          <div className="tg-tour-about-tickets-quantity">
            <NiceSelect className="select item-first" options={qtyOptions} defaultCurrent={0} onChange={selectHandler} name="" placeholder="" />
          </div>
        </div>
        <div className="tg-tour-about-tickets mb-10">
          <div className="tg-tour-about-tickets-adult">
            <span>{t('tour.sidebar.youth')}</span>
            <p className="mb-0">{t('tour.sidebar.youth_age')} <span>${Math.round(adultPrice * 0.8)}</span></p>
          </div>
          <div className="tg-tour-about-tickets-quantity">
            <NiceSelect className="select item-first" options={qtyOptions} defaultCurrent={0} onChange={selectHandler} name="" placeholder="" />
          </div>
        </div>
        <div className="tg-tour-about-tickets mb-10">
          <div className="tg-tour-about-tickets-adult">
            <span>{t('tour.sidebar.children')}</span>
            <p className="mb-0">{t('tour.sidebar.children_age')} <span>${Math.round(adultPrice * 0.6)}</span></p>
          </div>
          <div className="tg-tour-about-tickets-quantity">
            <NiceSelect className="select item-first" options={qtyOptions} defaultCurrent={0} onChange={selectHandler} name="" placeholder="" />
          </div>
        </div>
      </div>

      <div className="tg-tour-about-border-doted mb-15"></div>

      <div className="tg-tour-about-extra mb-10">
        <span className="tg-tour-about-sidebar-title mb-10 d-inline-block">{t('tour.sidebar.add_extra')}</span>
        <div className="tg-filter-list">
          <ul>
            <li>
              <div className="checkbox d-flex">
                <input className="tg-checkbox" type="checkbox" id="amenities" />
                <label htmlFor="amenities" className="tg-label">{t('tour.sidebar.service_per_booking')}</label>
              </div>
              <span className="quantity">$30.00</span>
            </li>
            <li>
              <div className="checkbox d-flex">
                <input className="tg-checkbox" type="checkbox" id="amenities-2" />
                <label htmlFor="amenities-2" className="tg-label">{t('tour.sidebar.service_per_person')}</label>
              </div>
              <span className="quantity">$20.00</span>
            </li>
            <li>
              <span className="adult">{t('tour.sidebar.adult')}:</span>
              <span className="quantity">${adultPrice}.00</span>
            </li>
            <li>
              <span className="adult">{t('tour.sidebar.youth')}:</span>
              <span className="quantity">${Math.round(adultPrice * 0.8)}.00</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="tg-tour-about-border-doted mb-15"></div>

      <div className="tg-tour-about-coast d-flex align-items-center flex-wrap justify-content-between mb-20">
        <span className="tg-tour-about-sidebar-title d-inline-block">{t('tour.sidebar.total_cost')}</span>
        <h5 className="total-price">${adultPrice}.00</h5>
      </div>

      <button type="submit" className="tg-btn tg-btn-switch-animation w-100">{t('tour.sidebar.book_now')}</button>
    </form>
  );
};

export default FeatureSidebar;

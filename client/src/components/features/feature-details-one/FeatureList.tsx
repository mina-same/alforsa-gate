import { useTranslation } from 'react-i18next';
import { useTourDetails } from '../../../hooks/useTourDetails';
import { getLang } from '../../../utils/getLang';

const FeatureList = () => {
  const { tour, lang } = useTourDetails();
  const { t } = useTranslation();

  if (!tour) return null;

  const items = [
    {
      id: 1,
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9.00001 4.19992V8.99992L12.2 10.5999M17 9C17 13.4183 13.4183 17 9 17C4.58172 17 1 13.4183 1 9C1 4.58172 4.58172 1 9 1C13.4183 1 17 4.58172 17 9Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      sub_title: t('tour.feature.duration'),
      title: tour.duration ? getLang(tour.duration, lang) : '—',
    },
    {
      id: 2,
      icon: (
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 8.5C16 12.6421 12.6421 16 8.5 16M16 8.5C16 4.35786 12.6421 1 8.5 1M16 8.5H1M8.5 16C4.35786 16 1 12.6421 1 8.5M8.5 16C10.376 13.9462 11.4421 11.281 11.5 8.5C11.4421 5.71903 10.376 3.05376 8.5 1M8.5 16C6.62404 13.9462 5.55794 11.281 5.5 8.5C5.55794 5.71903 6.62404 3.05376 8.5 1M1 8.5C1 4.35786 4.35786 1 8.5 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      sub_title: t('tour.feature.type'),
      title: tour.tourType ? getLang(tour.tourType, lang) : '—',
    },
    {
      id: 3,
      icon: (
        <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M1.7 17.2C1.5 17.2 1.3 17.1 1.2 17C1.1 16.8 1 16.7 1 16.5C1 15.1 1.4 13.7 2.1 12.4C2.8 11.2 3.9 10.1 5.1 9.4C4.6 8.8 4.2 8 4 7.2C3.9 6.4 3.9 5.5 4.1 4.8C4.3 4 4.8 3.2 5.3 2.6C5.9 2 6.6 1.5 7.3 1.3C7.9 1.1 8.5 1 9.1 1C9.3 1 9.6 1 9.8 1C10.6 1.1 11.4 1.4 12.1 1.9C12.8 2.4 13.3 3 13.7 3.7C14.1 4.4 14.3 5.2 14.3 6.1C14.3 7.3 13.9 8.5 13.1 9.4C13.7 9.8 14.3 10.2 14.9 10.7C15.7 11.5 16.2 12.3 16.7 13.3C17.1 14.3 17.3 15.3 17.3 16.4C17.3 16.6 17.2 16.8 17.1 16.9C17 17 16.8 17.1 16.6 17.1C16.5 17.1 16.4 17.1 16.3 17C16.2 17 16.1 16.9 16.1 16.8C16 16.7 16 16.7 15.9 16.6C15.9 16.5 15.8 16.4 15.8 16.3C15.8 15.4 15.6 14.6 15.3 13.8C15 13 14.5 12.3 13.8 11.7C13.2 11.2 12.6 10.7 11.9 10.4C11.1 10.9 10.2 11.2 9.1 11.2C8.1 11.2 7.1 10.9 6.3 10.4C5.2 10.9 4.2 11.7 3.5 12.8C2.8 13.9 2.4 15.1 2.4 16.4C2.4 16.6 2.3 16.8 2.2 16.9C2.1 17.1 1.9 17.2 1.7 17.2Z" fill="currentColor" />
        </svg>
      ),
      sub_title: t('tour.feature.group_size'),
      title: tour.groupSize
        ? `${tour.groupSize.remaining ?? 0} ${t('tour.feature.spots_left')} / ${tour.groupSize.total ?? 0} ${t('tour.feature.total')}`
        : '—',
    },
    {
      id: 4,
      icon: (
        <svg width="16" height="17" viewBox="0 0 16 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.5 6.52684L4.5 2.64944M1.21001 4.70401L8.00001 8.47683L14.79 4.70401M8 16V8.46931M15 11.4578V5.48102C14.9997 5.21899 14.9277 4.96165 14.7912 4.7348C14.6547 4.50794 14.4585 4.31956 14.2222 4.18855L8.77778 1.20018C8.5413 1.06904 8.27306 1 8 1C7.72694 1 7.4587 1.06904 7.22222 1.20018L1.77778 4.18855C1.54154 4.31956 1.34532 4.50794 1.2088 4.7348C1.07229 4.96165 1.00028 5.21899 1 5.48102V11.4578C1.00028 11.7198 1.07229 11.9771 1.2088 12.204C1.34532 12.4308 1.54154 12.6192 1.77778 12.7502L7.22222 15.7386C7.4587 15.8697 7.72694 15.9388 8 15.9388C8.27306 15.9388 8.5413 15.8697 8.77778 15.7386L14.2222 12.7502C14.4585 12.6192 14.6547 12.4308 14.7912 12.204C14.9277 11.9771 14.9997 11.7198 15 11.4578Z" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      sub_title: t('tour.feature.availability'),
      title: tour.tourAvailability ? getLang(tour.tourAvailability, lang) : '—',
    },
    {
      id: 5,
      icon: (
        <svg width="16" height="18" viewBox="0 0 16 18" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8 1C5.23858 1 3 3.23858 3 6C3 9.5 8 17 8 17C8 17 13 9.5 13 6C13 3.23858 10.7614 1 8 1Z" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="8" cy="6" r="2" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      ),
      sub_title: t('tour.feature.pickup'),
      title: tour.pickupAndDropOff ? getLang(tour.pickupAndDropOff, lang) : '—',
    },
    {
      id: 6,
      icon: (
        <svg width="17" height="17" viewBox="0 0 17 17" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M8.5 1L10.5 6H16L11.5 9.5L13 14.5L8.5 11L4 14.5L5.5 9.5L1 6H6.5L8.5 1Z" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ),
      sub_title: t('tour.feature.style'),
      title: tour.tourStyle ? getLang(tour.tourStyle, lang) : '—',
    },
  ];

  return (
    <ul className="tg-tour-feature-list-grid">
      {items.map((item) => (
        <li key={item.id} className="tg-tour-feature-list-grid__item" style={{ width: '33.33%', flexShrink: 0, boxSizing: 'border-box', paddingRight: 20, marginRight: 0 }}>
          <span className="icon" style={{ flexShrink: 0, marginTop: 2 }}>{item.icon}</span>
          <div>
            <span className="title">{item.sub_title}</span>
            <span className="duration">{item.title}</span>
          </div>
        </li>
      ))}
    </ul>
  );
};

export default FeatureList;

import { useTranslation } from 'react-i18next';
import { useTourDetails } from '../../../../hooks/useTourDetails';

const Review = () => {
  const { tour } = useTourDetails();
  const { t } = useTranslation();

  const rating = tour?.averageRating ?? 0;
  const count = tour?.reviewsCount ?? 0;

  const getRatingLabel = (r: number) => {
    if (r >= 4.8) return t('tour.review.excellent');
    if (r >= 4.5) return t('tour.review.very_good');
    if (r >= 4.0) return t('tour.review.good');
    if (r >= 3.0) return t('tour.review.average');
    return t('tour.review.below_average');
  };

  return (
    <div className="tg-tour-about-review-wrap mb-45">
      <h4 className="tg-tour-about-title mb-20">{t('tour.sections.customer_reviews')}</h4>
      <div className="tg-tour-about-review">
        <div className="head-reviews">
          <div className="review-left">
            <div className="review-info-inner">
              <h2>{rating.toFixed(1)}</h2>
              <span>{getRatingLabel(rating)}</span>
              <p>{t('tour.review.based_on')} {count.toLocaleString()} {t('tour.review.reviews')}</p>
            </div>
          </div>
          <div className="review-right">
            <div className="review-progress">
              {[
                { key: 'location', pct: 78, score: '3.9' },
                { key: 'accommodation', pct: 85, score: '4.3' },
                { key: 'guide_quality', pct: 96, score: '4.8' },
                { key: 'value', pct: 90, score: '4.5' },
                { key: 'transport', pct: 92, score: '4.6' },
              ].map((item, i) => (
                <div key={item.key} className={`item-review-progress${i === 4 ? ' mb-0' : ''}`}>
                  <div className="text-rv-progress"><p>{t(`tour.review.${item.key}`)}</p></div>
                  <div className="bar-rv-progress">
                    <div className="progress">
                      <div className="progress-bar" style={{ width: `${item.pct}%` }}> </div>
                    </div>
                  </div>
                  <div className="text-avarage"><p>{item.score}/5</p></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Review;

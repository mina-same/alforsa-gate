import { useTranslation } from 'react-i18next';
import { useTourDetails } from '../../../../hooks/useTourDetails';
import { getLang } from '../../../../utils/getLang';

const AVATARS = [
  '/assets/img/tour-details/avatar.png',
  '/assets/img/tour-details/avatr.png',
];

const ReviewDetails = () => {
  const { tour, lang } = useTourDetails();
  const { t } = useTranslation();

  const textReviews = (tour?.reviews ?? []).filter((r) => r.type === 'text');
  const videoReviews = (tour?.reviews ?? []).filter((r) => r.type === 'video' || r.type === 'youtube');

  if (textReviews.length === 0 && videoReviews.length === 0) return null;

  const count = tour?.reviewsCount ?? 0;

  return (
    <div className="tg-tour-about-cus-review-wrap mb-25">
      <h4 className="tg-tour-about-title mb-40">{count} {t('tour.review.reviews')}</h4>
      <ul>
        {textReviews.map((review, i) => (
          <li key={i}>
            <div className="tg-tour-about-cus-review d-flex mb-40">
              <div className="tg-tour-about-cus-review-thumb">
                <img src={AVATARS[i % AVATARS.length]} alt="avatar" />
              </div>
              <div>
                <div className="tg-tour-about-cus-name mb-5 d-flex align-items-center justify-content-between flex-wrap">
                  <h6 className="mr-10 mb-10 d-inline-block">{getLang(review.title, lang)}</h6>
                  <span className="tg-tour-about-cus-review-star mb-10 d-inline-block">
                    {[...Array(5)].map((_, si) => (
                      <i key={si} className="fa-sharp fa-solid fa-star"></i>
                    ))}
                  </span>
                </div>
                {review.content && (
                  <p className="lh-28 mb-10">{getLang(review.content, lang)}</p>
                )}
              </div>
            </div>
            {i < textReviews.length - 1 && <div className="tg-tour-about-border mb-40"></div>}
          </li>
        ))}
      </ul>

      {videoReviews.length > 0 && (
        <div className="mt-20">
          <h5 className="tg-tour-about-title mb-15">{t('tour.sections.video_reviews')}</h5>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            {videoReviews.map((review, i) => (
              <a
                key={i}
                href={review.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '10px 16px', border: '1px solid #e5e7eb',
                  borderRadius: 8, color: '#333', textDecoration: 'none',
                  fontSize: 14, fontWeight: 500,
                }}
              >
                <i className="fa-brands fa-youtube" style={{ color: '#ef4444', fontSize: 20 }}></i>
                {getLang(review.title, lang)}
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ReviewDetails;

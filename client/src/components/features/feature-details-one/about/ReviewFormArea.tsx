import { useTranslation } from 'react-i18next';
import ReviewForm from '../../../forms/ReviewForm';

const ReviewFormArea = () => {
  const { t } = useTranslation();

  const ratingCategories = [
    { id: 1, key: 'review_form.location' },
    { id: 2, key: 'review_form.price' },
    { id: 3, key: 'review_form.amenities' },
    { id: 4, key: 'review_form.rooms' },
    { id: 5, key: 'review_form.services' },
  ];

  return (
    <div className="tg-tour-about-review-form-wrap mb-45">
      <h4 className="tg-tour-about-title mb-5">{t('tour.sections.leave_review')}</h4>
      <div className="tg-tour-about-rating-category mb-20">
        <ul>
          {ratingCategories.map((item) => (
            <li key={item.id}>
              <label>{t(`tour.${item.key}`)}</label>
              <div className="rating-icon">
                {[...Array(5)].map((_, i) => (
                  <i key={i} className="fa-sharp fa-solid fa-star"></i>
                ))}
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div className="tg-tour-about-review-form">
        <ReviewForm />
      </div>
    </div>
  );
};

export default ReviewFormArea;

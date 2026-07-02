import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay, Pagination } from 'swiper/modules';
import { useTranslation } from 'react-i18next';
import { useTourDetails } from '../../../../hooks/useTourDetails';
import { getLang } from '../../../../utils/getLang';

const swiperConfig = {
  spaceBetween: 24,
  loop: false,
  speed: 500,
  autoplay: { delay: 4000, disableOnInteraction: false },
  pagination: { el: '.tg-popular-related-pagination', clickable: true },
  breakpoints: {
    1200: { slidesPerView: 4 },
    992:  { slidesPerView: 3 },
    768:  { slidesPerView: 2 },
    0:    { slidesPerView: 1 },
  },
};

const StarRating = ({ rating }: { rating: number }) => {
  const full = Math.round(rating);
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(n => (
        <i
          key={n}
          className="fa-sharp fa-solid fa-star"
          style={{ fontSize: 11, color: n <= full ? '#f59e0b' : '#d1d5db' }}
        />
      ))}
    </span>
  );
};

const PopularRelatedToursSection = () => {
  const { tour, lang } = useTourDetails();
  const { t } = useTranslation();

  if (!tour?.relatedTours?.length) return null;

  const prefix = lang === 'ar' ? '/ar' : '/en';

  const formatPrice = (price?: { EGP?: number; USD?: number; SAR?: number }): string | null => {
    if (!price) return null;
    if (price.EGP) return `EGP ${price.EGP.toLocaleString()}`;
    if (price.USD) return `$${price.USD.toLocaleString()}`;
    if (price.SAR) return `SAR ${price.SAR.toLocaleString()}`;
    return null;
  };

  return (
    <div className="tg-listing-area pt-90 pb-115 p-relative z-index-9">
      <div className="container">
        {/* Section heading */}
        <div className="row align-items-end">
          <div className="col-lg-9">
            <div className="tg-location-section-title mb-40">
              <h5
                className="tg-section-subtitle mb-15 wow fadeInUp"
                data-wow-delay=".4s"
                data-wow-duration=".9s"
              >
                {t('tour.popular.subtitle')}
              </h5>
              <h2
                className="mb-15 text-capitalize wow fadeInUp"
                data-wow-delay=".5s"
                data-wow-duration=".9s"
              >
                {t('tour.popular.title')}
              </h2>
            </div>
          </div>
          <div className="col-lg-3">
            <div
              className="tg-location-3-btn text-end wow fadeInUp mb-40"
              data-wow-delay=".6s"
              data-wow-duration=".9s"
            >
              <Link
                to={`${prefix}/tour-grid-1`}
                className="tg-btn tg-btn-gray tg-btn-switch-animation"
              >
                {t('tour.popular.see_all')}
              </Link>
            </div>
          </div>
        </div>

        {/* Carousel */}
        <div className="row">
          <div className="col-12">
            <Swiper
              {...swiperConfig}
              modules={[Autoplay, Pagination]}
              wrapperClass="mb-35"
              className="swiper-container tg-listing-slider p-relative fix"
            >
              {tour.relatedTours.map(rt => {
                const title = getLang(rt.title, lang);
                const location = getLang(rt.tourLocation, lang);
                const duration = getLang(rt.duration, lang);
                const priceStr = formatPrice(rt.priceStartingFrom);
                const coverUrl = rt.images?.[0]?.url;
                const coverAlt = getLang(rt.images?.[0]?.alt, lang) || title;
                const slug = getLang(rt.slug, lang) || rt.id;
                const href = `${prefix}/tour2/${slug}`;

                return (
                  <SwiperSlide key={rt.id} className="swiper-slide">
                    <div className="tg-listing-card-item tg-listing-4-card-item mb-25">
                      {/* Thumbnail */}
                      <div className="tg-listing-card-thumb tg-listing-2-card-thumb mb-15 fix p-relative">
                        <Link to={href}>
                          {coverUrl ? (
                            <img
                              className="tg-card-border w-100"
                              src={coverUrl}
                              alt={coverAlt}
                              style={{ height: 220, objectFit: 'cover' }}
                            />
                          ) : (
                            <div
                              className="tg-card-border w-100"
                              style={{
                                height: 220,
                                background: 'linear-gradient(135deg, var(--tg-color-1) 0%, #0d4d35 100%)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <i className="fa-solid fa-mountain-sun" style={{ color: 'rgba(255,255,255,0.4)', fontSize: 48 }} />
                            </div>
                          )}
                        </Link>

                        {/* Price badge */}
                        {priceStr && (
                          <div className="tg-listing-2-price">
                            <span className="new">
                              {t('tour.popular.from')} {priceStr}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="tg-listing-card-content p-relative">
                        <h4 className="tg-listing-card-title mb-5">
                          <Link to={href}>{title}</Link>
                        </h4>

                        {/* Location */}
                        {location && (
                          <span className="tg-listing-card-duration-map d-inline-block mb-5">
                            <svg width="12" height="15" viewBox="0 0 13 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12.3329 6.7071C12.3329 11.2324 6.55512 15.1111 6.55512 15.1111C6.55512 15.1111 0.777344 11.2324 0.777344 6.7071C0.777344 5.16402 1.38607 3.68414 2.46962 2.59302C3.55316 1.5019 5.02276 0.888916 6.55512 0.888916C8.08748 0.888916 9.55708 1.5019 10.6406 2.59302C11.7242 3.68414 12.3329 5.16402 12.3329 6.7071Z" stroke="currentColor" strokeWidth="1.15556" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M6.55512 8.64649C7.61878 8.64649 8.48105 7.7782 8.48105 6.7071C8.48105 5.636 7.61878 4.7677 6.55512 4.7677C5.49146 4.7677 4.6292 5.636 4.6292 6.7071C4.6292 7.7782 5.49146 8.64649 6.55512 8.64649Z" stroke="currentColor" strokeWidth="1.15556" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                            {location}
                          </span>
                        )}

                        {/* Duration */}
                        {duration && (
                          <span
                            className="d-block mb-5"
                            style={{ fontSize: 12, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 5 }}
                          >
                            <i className="fa-regular fa-clock" style={{ fontSize: 11 }} />
                            {duration}
                          </span>
                        )}

                        {/* Rating */}
                        {rt.averageRating != null && rt.averageRating > 0 && (
                          <div className="tg-listing-card-review mb-10">
                            <StarRating rating={rt.averageRating} />
                            {rt.reviewsCount != null && (
                              <span className="tg-listing-rating-percent ml-5">
                                ({rt.reviewsCount} {t('home4.reviews')})
                              </span>
                            )}
                          </div>
                        )}

                        {/* Footer */}
                        <div className="tg-listing-avai d-flex align-items-center justify-content-between">
                          <Link className="tg-listing-avai-btn" to={href}>
                            {t('tour.popular.check_availability')}
                          </Link>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
              })}

              <div className="tg-popular-related-pagination tg-listing-4-pagination swiper-pagination" />
            </Swiper>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PopularRelatedToursSection;

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import { useTranslation } from "react-i18next";
import { addToWishlist } from "../../../redux/features/wishlistSlice";
import { tourService, type TourListItem, type ILocalizedString } from "../../../services/tourService";
import Button from "../../common/Button";

const Listing = () => {
   const { t, i18n } = useTranslation();
   const lang = i18n.language?.startsWith("ar") ? "ar" : "en";
   const isRtl = lang === "ar";
   const dispatch = useDispatch();

   const [tours, setTours] = useState<TourListItem[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const getText = useCallback(
      (obj: ILocalizedString | undefined): string => obj?.[lang as "en" | "ar"] || obj?.en || "",
      [lang]
   );

   const fetchTours = useCallback(async () => {
      setLoading(true);
      setError(null);
      try {
         const result = await tourService.listPublic({ limit: 8 });
         setTours(result.tours);
      } catch (err: any) {
         setError(err?.response?.data?.message || "Failed to load tours");
      } finally {
         setLoading(false);
      }
   }, []);

   useEffect(() => { fetchTours(); }, [fetchTours]);

   const getPrice = (tour: TourListItem) => {
      const p = tour.priceStartingFrom;
      if (!p) return null;
      if (p.SAR) return `${p.SAR.toLocaleString()} SAR`;
      if (p.USD) return `$${p.USD.toLocaleString()}`;
      if (p.EGP) return `${p.EGP.toLocaleString()} EGP`;
      return null;
   };

   return (
      <div className="tg-listing-area tg-grey-bg pt-140 pb-130 p-relative z-index-9">
         <img className="tg-listing-2-shape d-none d-sm-block" src="/assets/img/listing/listing-2/shape-1.png" alt="" />
         <img className="tg-listing-2-shape-2 d-none d-xl-block" src="/assets/img/listing/listing-2/shape-2.png" alt="" />
         <img className="tg-listing-2-shape-3 d-none d-sm-block" src="/assets/img/listing/listing-2/shape-3.png" alt="" />
         <div className="container">
            <div className="row">
               <div className="col-12">
                  <div className="tg-listing-section-title text-center mb-35">
                     <h5 className="tg-section-subtitle wow fadeInUp" data-wow-delay=".4s" data-wow-duration=".6s">
                        {t('home4.listing_subtitle')}
                     </h5>
                     <h2 className="mb-15 wow fadeInUp" data-wow-delay=".5s" data-wow-duration=".7s">
                        {t('home4.listing_title')}
                     </h2>
                     <p className="text-capitalize wow fadeInUp" data-wow-delay=".6s" data-wow-duration=".8s">
                        {t('home4.listing_desc')}
                     </p>
                  </div>
               </div>
            </div>

            {/* Loading */}
            {loading && (
               <div className="row">
                  {[...Array(8)].map((_, i) => (
                     <div key={i} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                        <div className="tg-listing-card-item tg-listing-2-card-item mb-25">
                           <div className="tg-listing-card-thumb tg-listing-2-card-thumb tg-skeleton" style={{ height: 220 }} />
                           <div className="tg-listing-card-content p-relative">
                              <div className="tg-skeleton mb-10" style={{ height: 20, borderRadius: 4 }} />
                              <div className="tg-skeleton" style={{ height: 16, width: "60%", borderRadius: 4 }} />
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            )}

            {/* Error */}
            {!loading && error && (
               <div className="text-center py-60">
                  <p className="text-danger mb-15">{error}</p>
                  <button className="tg-btn" onClick={fetchTours}>Retry</button>
               </div>
            )}

            {/* Empty */}
            {!loading && !error && tours.length === 0 && (
               <div className="text-center py-60">
                  <p className="text-muted">{t('home4.no_tours')}</p>
               </div>
            )}

            {/* Cards */}
            {!loading && !error && tours.length > 0 && (
               <div className="row">
                  {tours.map((tour) => {
                     const slug = tour.slug?.en || tour._id;
                     const thumb = (tour.images?.[0] as any)?.url || "/assets/img/listing/listing-2/listing-1.jpg";
                     const priceLabel = getPrice(tour);
                     const location = getText((tour as any).tourLocation);
                     const duration = getText(tour.duration);

                     return (
                        <div key={tour._id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6 wow fadeInUp" data-wow-delay=".3s" data-wow-duration=".6s">
                           <div className="tg-listing-card-item tg-listing-2-card-item mb-25">
                              <div className="tg-listing-card-thumb tg-listing-2-card-thumb fix p-relative">
                                 <Link to={`/${lang}/tour2/${slug}`}>
                                    <img className="tg-card-border w-100" src={thumb} alt={getText(tour.heading)} />
                                    {tour.isFeatured && (
                                       <span className="tg-listing-item-price-discount shape-3">
                                          <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                                             <path d="M6.60156 1L0.601562 8.2H6.00156L5.40156 13L11.4016 5.8H6.00156L6.60156 1Z" stroke="white" strokeWidth="0.857143" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                          {t('home4.featured')}
                                       </span>
                                    )}
                                 </Link>
                                 <div className="tg-listing-2-mask">
                                    <img className="w-100" src="/assets/img/listing/listing-2/shape.png" alt="" />
                                 </div>
                                 <div className="tg-listing-item-wishlist">
                                    <a onClick={() => dispatch(addToWishlist(tour))} style={{ cursor: "pointer" }}>
                                       <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M10.5167 16.3416C10.2334 16.4416 9.76675 16.4416 9.48341 16.3416C7.06675 15.5166 1.66675 12.075 1.66675 6.24165C1.66675 3.66665 3.74175 1.58331 6.30008 1.58331C7.81675 1.58331 9.15841 2.31665 10.0001 3.44998C10.8417 2.31665 12.1917 1.58331 13.7001 1.58331C16.2584 1.58331 18.3334 3.66665 18.3334 6.24165C18.3334 12.075 12.9334 15.5166 10.5167 16.3416Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                       </svg>
                                    </a>
                                 </div>
                              </div>
                              <div className="tg-listing-card-content p-relative">
                                 <div className="tg-listing-2-price-wrap text-center">
                                    <div className="tg-listing-2-price" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                                       {priceLabel
                                          ? <><span className="new">{priceLabel}</span><span style={{ fontSize: 11, opacity: 0.8 }}>{t('home4.from')}</span><span className="shift">{t('home4.per_person')}</span></>
                                          : <span className="new" style={{ fontSize: 13, opacity: 0.7 }}>{t('home4.price_on_request')}</span>
                                       }
                                    </div>
                                 </div>
                                 <h4 className="tg-listing-card-title">
                                    <Link to={`/${lang}/tour2/${slug}`}>{getText(tour.heading)}</Link>
                                 </h4>
                                 <div className="tg-listing-card-review mb-5" style={{ display: 'flex', alignItems: 'center', gap: '2px', flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                                    <span className="tg-listing-rating-icon"><i className="fa-sharp fa-solid fa-star"></i></span>
                                    <span className="tg-listing-rating-icon"><i className="fa-sharp fa-solid fa-star"></i></span>
                                    <span className="tg-listing-rating-icon"><i className="fa-sharp fa-solid fa-star"></i></span>
                                    <span className="tg-listing-rating-icon"><i className="fa-sharp fa-solid fa-star"></i></span>
                                    <span className="tg-listing-rating-icon"><i className="fa-sharp fa-solid fa-star"></i></span>
                                    <span className="tg-listing-rating-percent">({tour.viewCount ?? 0} {t('home4.reviews')})</span>
                                 </div>
                                 <div className="tg-listing-card-duration-tour" style={{ display: 'flex', flexDirection: 'column', alignItems: isRtl ? 'flex-end' : 'flex-start' }}>
                                    {location && (
                                       <span className="tg-listing-card-duration-map mb-5" style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                                          <svg width="13" height="16" viewBox="0 0 13 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: isRtl ? 0 : 5, marginLeft: isRtl ? 5 : 0, flexShrink: 0 }}>
                                             <path d="M12.3329 6.7071C12.3329 11.2324 6.55512 15.1111 6.55512 15.1111C6.55512 15.1111 0.777344 11.2324 0.777344 6.7071C0.777344 5.16402 1.38607 3.68414 2.46962 2.59302C3.55316 1.5019 5.02276 0.888916 6.55512 0.888916C8.08748 0.888916 9.55708 1.5019 10.6406 2.59302C11.7242 3.68414 12.3329 5.16402 12.3329 6.7071Z" stroke="currentColor" strokeWidth="1.15556" strokeLinecap="round" strokeLinejoin="round" />
                                             <path d="M6.55512 8.64649C7.61878 8.64649 8.48105 7.7782 8.48105 6.7071C8.48105 5.636 7.61878 4.7677 6.55512 4.7677C5.49146 4.7677 4.6292 5.636 4.6292 6.7071C4.6292 7.7782 5.49146 8.64649 6.55512 8.64649Z" stroke="currentColor" strokeWidth="1.15556" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                          {location}
                                       </span>
                                    )}
                                    {duration && (
                                       <span className="tg-listing-card-duration-time" style={{ flexDirection: isRtl ? 'row-reverse' : 'row' }}>
                                          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ marginRight: isRtl ? 0 : 5, marginLeft: isRtl ? 5 : 0, flexShrink: 0 }}>
                                             <path d="M8.00175 3.73329V7.99996L10.8462 9.42218M15.1128 8.00003C15.1128 11.9274 11.9291 15.1111 8.00174 15.1111C4.07438 15.1111 0.890625 11.9274 0.890625 8.00003C0.890625 4.07267 4.07438 0.888916 8.00174 0.888916C11.9291 0.888916 15.1128 4.07267 15.1128 8.00003Z" stroke="currentColor" strokeWidth="1.06667" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                          {duration}
                                       </span>
                                    )}
                                 </div>
                              </div>
                           </div>
                        </div>
                     );
                  })}
                  <div className="col-12 wow fadeInUp" data-wow-delay=".7s" data-wow-duration=".6s">
                     <div className="tg-listing-2-btn text-center pt-25">
                        <Link to="/tour-grid-2" className="tg-btn tg-btn-switch-animation">
                           <Button text={t('home4.see_all')} />
                        </Link>
                     </div>
                  </div>
               </div>
            )}
         </div>
      </div>
   );
};

export default Listing;

import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface DataType {
   id: number;
   thumb: string;
   countryKey: string;
   slug?: string;
   comingSoon?: boolean;
   seatsRemaining?: number;
}

const destination_data: DataType[] = [
   { id: 1, thumb: "/assets/img/destination/des.jpg",   countryKey: "russia",     slug: "russia", seatsRemaining: 30 },
   { id: 2, thumb: "/assets/img/destination/des-2.jpg", countryKey: "california", comingSoon: true },
   { id: 3, thumb: "/assets/img/destination/des-3.jpg", countryKey: "spain",      comingSoon: true },
   { id: 4, thumb: "/assets/img/destination/des-4.jpg", countryKey: "bali",       comingSoon: true },
];

const Destination = () => {
   const { t, i18n } = useTranslation();
   const isRtl = i18n.language?.startsWith("ar");

   return (
      <div className="tg-destination-area pt-135 pb-90">
         <div className="container">
            <div className="row">
               <div className="col-12">
                  <div className="tg-destination-section-title text-center mb-40">
                     <h5 className="tg-section-subtitle wow fadeInUp" data-wow-delay=".4s" data-wow-duration=".6s">{t('home4.most_popular')}</h5>
                     <h2 className="mb-15 wow fadeInUp" data-wow-delay=".5s" data-wow-duration=".7s">{t('home4.best_destination')}</h2>
                     <p className="text-capitalize wow fadeInUp" data-wow-delay=".6s" data-wow-duration=".8s">{t('home4.destination_desc')}</p>
                  </div>
               </div>

               {destination_data.map((item) => {
                  const countryName = t(`home4.destinations.${item.countryKey}`);
                  const lang = i18n.language?.startsWith("ar") ? "ar" : "en";
                  const destHref = item.slug ? `/${lang}/destination/${item.slug}` : "#";

                  return (
                     <div key={item.id} className="col-lg-3 col-md-6 col-sm-6">
                        <div className="tg-destination-item mb-30 wow fadeInUp" data-wow-delay=".3s" data-wow-duration=".6s">
                           <div className="tg-destination-thumb fix p-relative">
                              {item.comingSoon
                                 ? <img className="w-100" src={item.thumb} alt={countryName} style={{ filter: "brightness(0.55) grayscale(0.3)" }} />
                                 : <Link to={destHref}><img className="w-100" src={item.thumb} alt={countryName} /></Link>
                              }
                              <div className="tg-listing-2-mask">
                                 <img className="w-100" src="/assets/img/listing/listing-2/shape.png" alt="" />
                              </div>
                              {item.comingSoon && (
                                 <div className="tg-dest-coming-soon-badge">
                                    {t('home4.coming_soon')}
                                 </div>
                              )}
                           </div>

                           <div className="tg-destination-content text-center">
                              <div className="tg-destination-meta">
                                 {item.slug
                                    ? <Link to={destHref}>{countryName}</Link>
                                    : <span style={{ color: "#999" }}>{countryName}</span>
                                 }
                              </div>

                              {item.comingSoon ? (
                                 <div className="tg-destination-tag tg-dest-coming-tag">
                                    <span className="tg-dest-coming-label">{t('home4.coming_soon')}</span>
                                 </div>
                              ) : item.seatsRemaining !== undefined ? (
                                 <div className="tg-dest-seats" style={{ direction: isRtl ? "rtl" : "ltr" }}>
                                    <span className="tg-dest-seats-count">{item.seatsRemaining}</span>
                                    <span className="tg-dest-seats-label">{t('home4.seats_remaining')}</span>
                                 </div>
                              ) : null}
                           </div>
                        </div>
                     </div>
                  );
               })}
            </div>
         </div>
      </div>
   );
};

export default Destination;

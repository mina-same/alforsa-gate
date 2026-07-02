import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const t_footer = {
   en: {
      tagline: "Discover amazing destinations around the world with Alforsa Gate.",
      emailPlaceholder: "Enter your email",
      quickLinks: "Quick Links",
      home: "Home",
      about: "About Us",
      services: "Services",
      tourGuide: "Tour Guide",
      contact: "Contact Us",
      information: "Information",
      address: "58 Street Commercial Road, Fratton, Australia",
      phone: "+123 888 9999",
      hours: "Mon – Sat: 8 am – 5 pm,",
      closed: "Sunday: CLOSED",
      utilityPages: "Utility Pages",
      styleGuide: "Style Guide",
      passwordProtected: "Password Protected",
      error404: "404 Error",
      changelog: "Changelog",
      license: "License",
      copyright: "©Alforsa Gate",
      copyrightFull: "Copyright",
      allRights: "| All Right Reserved",
   },
   ar: {
      tagline: "اكتشف وجهات مذهلة حول العالم مع بوابة الفرصة.",
      emailPlaceholder: "أدخل بريدك الإلكتروني",
      quickLinks: "روابط سريعة",
      home: "الرئيسية",
      about: "من نحن",
      services: "الخدمات",
      tourGuide: "دليل الجولات",
      contact: "تواصل معنا",
      information: "معلومات",
      address: "٥٨ شارع كوميرشيال رود، فراتون، أستراليا",
      phone: "٩٩٩٩ ٨٨٨ ١٢٣+",
      hours: "الاثنين – السبت: ٨ ص – ٥ م،",
      closed: "الأحد: مغلق",
      utilityPages: "صفحات أخرى",
      styleGuide: "دليل التصميم",
      passwordProtected: "محمي بكلمة مرور",
      error404: "خطأ ٤٠٤",
      changelog: "سجل التغييرات",
      license: "الترخيص",
      copyright: "©Alforsa Gate",
      copyrightFull: "حقوق النشر",
      allRights: "| جميع الحقوق محفوظة",
   },
};

const FooterThree = () => {
   const ref = useRef<HTMLElement>(null);
   const { i18n } = useTranslation();
   const lang = i18n.language?.startsWith("ar") ? "ar" : "en";
   const isRtl = lang === "ar";
   const tx = t_footer[lang];

   useEffect(() => {
      const el = ref.current;
      if (!el) return;

      const cols = el.querySelectorAll<HTMLElement>(".tg-footer-widget");
      cols.forEach((col, i) => {
         col.style.opacity = "0";
         col.style.transform = "translateY(32px)";
         col.style.transition = `opacity 0.6s ease ${i * 0.12}s, transform 0.6s ease ${i * 0.12}s`;
      });

      const copyright = el.querySelector<HTMLElement>(".tg-footer-copyright");
      if (copyright) {
         copyright.style.opacity = "0";
         copyright.style.transform = "translateY(16px)";
         copyright.style.transition = "opacity 0.5s ease 0.55s, transform 0.5s ease 0.55s";
      }

      const observer = new IntersectionObserver(
         (entries) => {
            if (entries[0].isIntersecting) {
               cols.forEach((col) => {
                  col.style.opacity = "1";
                  col.style.transform = "translateY(0)";
               });
               if (copyright) {
                  copyright.style.opacity = "1";
                  copyright.style.transform = "translateY(0)";
               }
               observer.disconnect();
            }
         },
         { threshold: 0.08 },
      );

      observer.observe(el);
      return () => observer.disconnect();
   }, []);

   return (
      <>
         <style>{`
            .tg-footer-area {
               direction: ${isRtl ? "rtl" : "ltr"};
               text-align: ${isRtl ? "right" : "left"};
            }
            .tg-footer-area a,
            .tg-footer-area .tg-footer-social a {
               transition: color 0.25s ease, opacity 0.25s ease, transform 0.25s ease !important;
            }
            .tg-footer-area ul li a {
               display: inline-block;
               transition: opacity 0.25s ease, padding-left 0.25s ease, padding-right 0.25s ease !important;
            }
            .tg-footer-area ul li a:hover {
               opacity: 0.75;
               ${isRtl ? "padding-right: 6px;" : "padding-left: 6px;"}
            }
            .tg-footer-area .tg-footer-social {
               ${isRtl ? "justify-content: flex-end;" : ""}
            }
            .tg-footer-area .tg-footer-social a:hover {
               transform: translateY(-3px) scale(1.15) !important;
               opacity: 0.85;
            }
            .tg-footer-area .tg-footer-form {
               direction: ${isRtl ? "rtl" : "ltr"};
            }
            .tg-footer-area .tg-footer-form input {
               text-align: ${isRtl ? "right" : "left"};
            }
            .tg-footer-area .tg-footer-form button {
               transition: background 0.25s ease, transform 0.2s ease;
               ${isRtl ? "left: 0; right: auto; border-radius: 8px 0 0 8px;" : ""}
            }
            .tg-footer-area .tg-footer-form button:hover {
               transform: scale(1.08);
            }
            .tg-footer-info ul li .d-flex {
               ${isRtl ? "gap: 12px;" : ""}
            }
            .tg-footer-copyright {
               direction: ${isRtl ? "rtl" : "ltr"};
            }
            .tg-footer-copyright a {
               transition: opacity 0.2s ease;
            }
            .tg-footer-copyright a:hover {
               opacity: 0.7;
            }
            .tg-footer-link.ml-80 {
               ${isRtl ? "margin-left: 0 !important; margin-right: 80px;" : ""}
            }
         `}</style>
         <footer ref={ref}>
            <div className="tg-footer-area tg-footer-space include-bg" style={{ backgroundImage: `url(/assets/img/footer/footer.jpg)` }}>
               <div className="container">
                  <div className="tg-footer-top mb-40">
                     <div className="row">
                        {/* Logo + newsletter */}
                        <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                           <div className="tg-footer-widget mb-40">
                              <div className="tg-footer-logo mb-20">
                                 <Link to="/"><img src="/assets/img/logo/logo-white.png" alt="" /></Link>
                              </div>
                              <p className="mb-20">{tx.tagline}</p>
                              <div className="tg-footer-form mb-30">
                                 <form onSubmit={(e) => e.preventDefault()}>
                                    <input type="email" placeholder={tx.emailPlaceholder} />
                                    <button className="tg-footer-form-btn" type="submit">
                                       <svg width="22" height="17" viewBox="0 0 22 17" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M1.52514 8.47486H20.4749M20.4749 8.47486L13.5 1.5M20.4749 8.47486L13.5 15.4497" stroke="white" strokeWidth="1.77778" strokeLinecap="round" strokeLinejoin="round" />
                                       </svg>
                                    </button>
                                 </form>
                              </div>
                              <div className="tg-footer-social">
                                 <Link to="#"><i className="fa-brands fa-facebook-f"></i></Link>
                                 <Link to="#"><i className="fa-brands fa-twitter"></i></Link>
                                 <Link to="#"><i className="fa-brands fa-instagram"></i></Link>
                                 <Link to="#"><i className="fa-brands fa-pinterest-p"></i></Link>
                                 <Link to="#"><i className="fa-brands fa-youtube"></i></Link>
                              </div>
                           </div>
                        </div>

                        {/* Quick Links */}
                        <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                           <div className="tg-footer-widget tg-footer-link ml-80 mb-40">
                              <h3 className="tg-footer-widget-title mb-25">{tx.quickLinks}</h3>
                              <ul>
                                 <li><Link to="/">{tx.home}</Link></li>
                                 <li><Link to="/about">{tx.about}</Link></li>
                                 <li><Link to="#">{tx.services}</Link></li>
                                 <li><Link to="#">{tx.tourGuide}</Link></li>
                                 <li><Link to="/contact">{tx.contact}</Link></li>
                              </ul>
                           </div>
                        </div>

                        {/* Information */}
                        <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                           <div className="tg-footer-widget tg-footer-info mb-40">
                              <h3 className="tg-footer-widget-title mb-25">{tx.information}</h3>
                              <ul>
                                 <li>
                                    <Link className="d-flex" to="https://www.google.com/maps/@41.6758525,-86.2531698,18.17z">
                                       <span className={isRtl ? "ml-15" : "mr-15"}>
                                          <svg width="20" height="24" viewBox="0 0 20 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                             <path d="M19.0013 10.0608C19.0013 16.8486 10.3346 22.6668 10.3346 22.6668C10.3346 22.6668 1.66797 16.8486 1.66797 10.0608C1.66797 7.74615 2.58106 5.52634 4.20638 3.88965C5.83169 2.25297 8.03609 1.3335 10.3346 1.3335C12.6332 1.3335 14.8376 2.25297 16.4629 3.88965C18.0882 5.52634 19.0013 7.74615 19.0013 10.0608Z" stroke="white" strokeWidth="1.73333" strokeLinecap="round" strokeLinejoin="round" />
                                             <path d="M10.3346 12.9699C11.9301 12.9699 13.2235 11.6674 13.2235 10.0608C13.2235 8.45412 11.9301 7.15168 10.3346 7.15168C8.73915 7.15168 7.44575 8.45412 7.44575 10.0608C7.44575 11.6674 8.73915 12.9699 10.3346 12.9699Z" stroke="white" strokeWidth="1.73333" strokeLinecap="round" strokeLinejoin="round" />
                                          </svg>
                                       </span>
                                       <span>{tx.address}</span>
                                    </Link>
                                 </li>
                                 <li>
                                    <Link className="d-flex" to="tel:+1238889999">
                                       <span className={isRtl ? "ml-15" : "mr-15"}>
                                          <i className="fa-sharp text-white fa-solid fa-phone"></i>
                                       </span>
                                       <span>{tx.phone}</span>
                                    </Link>
                                 </li>
                                 <li className="d-flex">
                                    <span className={isRtl ? "ml-15" : "mr-15"}>
                                       <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                          <path d="M11.9987 5.60006V12.0001L16.2654 14.1334M22.6654 12.0002C22.6654 17.8912 17.8897 22.6668 11.9987 22.6668C6.10766 22.6668 1.33203 17.8912 1.33203 12.0002C1.33203 6.10912 6.10766 1.3335 11.9987 1.3335C17.8897 1.3335 22.6654 6.10912 22.6654 12.0002Z" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                                       </svg>
                                    </span>
                                    <p className="mb-0">
                                       {tx.hours}<br />
                                       <span className="text-white d-inline-block">{tx.closed}</span>
                                    </p>
                                 </li>
                              </ul>
                           </div>
                        </div>

                        {/* Utility Pages */}
                        <div className="col-xl-3 col-lg-3 col-md-6 col-sm-6">
                           <div className="tg-footer-widget tg-footer-link mb-40">
                              <h3 className="tg-footer-widget-title mb-25">{tx.utilityPages}</h3>
                              <ul>
                                 <li><Link to="#">{tx.styleGuide}</Link></li>
                                 <li><Link to="#">{tx.passwordProtected}</Link></li>
                                 <li><Link to="#">{tx.error404}</Link></li>
                                 <li><Link to="#">{tx.changelog}</Link></li>
                                 <li><Link to="#">{tx.license}</Link></li>
                              </ul>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="tg-footer-copyright text-center">
                  <span>
                     {tx.copyrightFull} <Link to="#">{tx.copyright}</Link> {tx.allRights}
                  </span>
               </div>
            </div>
         </footer>
      </>
   );
};

export default FooterThree;

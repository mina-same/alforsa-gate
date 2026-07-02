import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import ContactForm from "../forms/ContactForm";

const TX = {
   en: {
      infoTitle: "Information:",
      infoBio: "Our team is ready to help you plan your perfect journey. Reach out and let's craft an unforgettable travel experience together.",
      phone: "Phone :",
      whatsapp: "WhatsApp :",
      website: "Website :",
      email: "E-mail :",
      address: "Address :",
      connectTitle: "Let's connect and get to know\neach other",
      connectBio: "We're here to answer your questions and help you plan the trip of a lifetime. Drop us a message and we'll get back to you shortly.",
   },
   ar: {
      infoTitle: "معلومات التواصل:",
      infoBio: "فريقنا مستعد لمساعدتك في التخطيط لرحلتك المثالية. تواصل معنا ولنصنع معاً تجربة سفر لا تُنسى.",
      phone: "الهاتف :",
      whatsapp: "واتساب :",
      website: "الموقع :",
      email: "البريد الإلكتروني :",
      address: "العنوان :",
      connectTitle: "لنتواصل ونتعرف\nعلى بعض",
      connectBio: "نحن هنا للإجابة على أسئلتك ومساعدتك في التخطيط لرحلة العمر. أرسل لنا رسالة وسنعود إليك في أقرب وقت.",
   },
};

const ContactArea = () => {
   const { i18n } = useTranslation();
   const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
   const isRtl = lang === "ar";
   const tx = TX[lang];

   return (
      <div className="tg-contact-area pt-130 p-relative z-index-1 pb-130" style={{ direction: isRtl ? "rtl" : "ltr" }}>
         <img className="tg-team-shape-2 d-none d-md-block" src="/assets/img/banner/banner-2/shape.png" alt="" />
         <div className="container">
            <div className="row align-items-center">
               <div className="col-lg-5">
                  <div className="tg-team-details-contant tg-contact-info-wrap mb-30">
                     <h6 className="mb-15">{tx.infoTitle}</h6>
                     <p className="mb-25">{tx.infoBio}</p>
                     <div className="tg-team-details-contact-info mb-35">
                        <div className="tg-team-details-contact">
                           <div className="item">
                              <span className="contact-label">{tx.phone}</span>
                              <Link to="tel:+966569191977" dir="ltr">+966 56 919 1977</Link>
                           </div>
                           <div className="item">
                              <span className="contact-label">{tx.whatsapp}</span>
                              <Link to="https://wa.me/966569191977" target="_blank" rel="noopener noreferrer" dir="ltr" style={{ color: "#25D366", display: "inline-flex", alignItems: "center", gap: 6 }}>
                                 <svg width="16" height="16" viewBox="0 0 24 24" fill="#25D366" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                                 </svg>
                                 +966 56 919 1977
                              </Link>
                           </div>
                           <div className="item">
                              <span className="contact-label">{tx.website}</span>
                              <Link to="https://alforsa-gate.com" target="_blank" rel="noopener noreferrer" dir="ltr">alforsa-gate.com</Link>
                           </div>
                           <div className="item">
                              <span className="contact-label">{tx.email}</span>
                              <Link to="mailto:info@alforsa-gate.com" dir="ltr">info@alforsa-gate.com</Link>
                           </div>
                           <div className="item">
                              <span className="contact-label">{tx.address}</span>
                              <span>{lang === "ar" ? "الرياض، السعودية" : "Riyadh, Saudi Arabia"}</span>
                           </div>
                        </div>
                     </div>
                     <div className="tg-contact-map h-100">
                        <iframe
                           src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3624.6!2d46.6753!3d24.7136!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3e2f03890d489399%3A0xba974d1c98e79fd5!2sRiyadh%2C%20Saudi%20Arabia!5e0!3m2!1sen!2ssa!4v1700000000000"
                           width="600" height="450"
                           style={{ border: "0" }}
                           loading="lazy"
                        />
                     </div>
                  </div>
               </div>
               <div className="col-lg-7">
                  <div className="tg-contact-content-wrap ml-40 mb-30" style={{ textAlign: isRtl ? "right" : "left" }}>
                     <h3 className="tg-contact-title mb-15" style={{ whiteSpace: "pre-line" }}>{tx.connectTitle}</h3>
                     <p className="mb-30">{tx.connectBio}</p>
                     <div className="tg-contact-form tg-tour-about-review-form">
                        <ContactForm />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   );
};

export default ContactArea;

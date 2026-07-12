import { Link } from "react-router-dom"
import { useEffect, useState } from "react"
import Button from "../../common/Button"

const FEATURED_TOUR_URL = "/en/tour2/sochi-russia-black-sea-mountain-escape";
const TOTAL_SEATS = 24;

const Cta = () => {
   // Fake urgency widget — purely cosmetic, not tied to real bookings
   const [seatsLeft, setSeatsLeft] = useState(() => 12 + Math.floor(Math.random() * 6));
   const [seconds,   setSeconds]   = useState(() => (30 + Math.floor(Math.random() * 31)) * 60);

   useEffect(() => {
      const id = setInterval(() => {
         setSeconds(prev => (prev <= 1 ? (30 + Math.floor(Math.random() * 31)) * 60 : prev - 1));
      }, 1000);
      return () => clearInterval(id);
   }, []);

   useEffect(() => {
      const id = setInterval(() => {
         setSeatsLeft(prev => Math.max(4, prev - (Math.random() < 0.3 ? 1 : 0)));
      }, 20000);
      return () => clearInterval(id);
   }, []);

   const hh = String(Math.floor(seconds / 3600)).padStart(2, '0');
   const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, '0');
   const ss = String(seconds % 60).padStart(2, '0');
   const bookedPct = Math.round(((TOTAL_SEATS - seatsLeft) / TOTAL_SEATS) * 100);

   return (
      <>
         <style>{`
            @keyframes tg-urgency-pulse {
               0%, 100% { opacity: 1; transform: scale(1); }
               50% { opacity: .45; transform: scale(.8); }
            }
            .tg-urgency-dot { animation: tg-urgency-pulse 1.6s ease-in-out infinite; }
            @media (prefers-reduced-motion: reduce) {
               .tg-urgency-dot { animation: none; }
            }
         `}</style>
         <div className="tg-banner-area tg-banner-space p-relative z-index-9">
            <img className="tg-banner-3-shape d-none d-xl-block" src="/assets/img/banner/banner-2/shape.png" alt="" />
            <div className="container">
               <div className="row gx-0">
                  <div className="col-lg-4">
                     <div className="tg-banner-content tg-banner-3-content p-relative z-index-1 text-center">
                        <img className="tg-banner-shape" src="/assets/img/banner/banner-2/shape-2.png" alt="shape" />
                        <h4 className="tg-banner-subtitle mb-10">Limited-Time Departure</h4>
                        <h2 className="tg-banner-title mb-20">Seats Are Filling Fast!</h2>

                        <div
                           className="mb-25"
                           style={{
                              background: 'rgba(255,255,255,0.07)',
                              border: '1px solid rgba(255,255,255,0.16)',
                              borderRadius: 12,
                              padding: '14px 16px',
                              textAlign: 'left',
                           }}
                        >
                           <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
                              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 13, fontWeight: 600, color: '#fff' }}>
                                 <span
                                    className="tg-urgency-dot"
                                    aria-hidden="true"
                                    style={{ width: 8, height: 8, borderRadius: '50%', background: '#4ade80', flexShrink: 0 }}
                                 />
                                 Only {seatsLeft} of {TOTAL_SEATS} seats left
                              </span>
                              <span style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'rgba(255,255,255,0.65)' }}>
                                 {bookedPct}% booked
                              </span>
                           </div>

                           <div
                              role="progressbar"
                              aria-valuenow={bookedPct}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-label="Seats booked"
                              style={{ height: 6, borderRadius: 999, background: 'rgba(255,255,255,0.15)', overflow: 'hidden', marginBottom: 12 }}
                           >
                              <div style={{
                                 width: `${bookedPct}%`,
                                 height: '100%',
                                 borderRadius: 999,
                                 background: 'linear-gradient(90deg, #FFC24B, #FF9F1C)',
                                 transition: 'width .6s ease-out',
                              }} />
                           </div>

                           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
                                 <circle cx="12" cy="12" r="9.25" stroke="#FFC24B" strokeWidth="1.5" />
                                 <path d="M12 7v5l3.2 1.9" stroke="#FFC24B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                              </svg>
                              <span style={{ fontSize: 12.5, color: 'rgba(255,255,255,0.75)' }}>Booking closes in</span>
                              <span style={{
                                 fontSize: 14,
                                 fontWeight: 700,
                                 color: '#FFC24B',
                                 fontVariantNumeric: 'tabular-nums',
                                 letterSpacing: '0.03em',
                              }}>
                                 {hh}:{mm}:{ss}
                              </span>
                           </div>
                        </div>

                        <div className="tg-banner-btn">
                           <Link to={FEATURED_TOUR_URL} className="tg-btn tg-btn-switch-animation">
                              <Button text='Book Your Seat' />
                           </Link>
                        </div>
                     </div>
                  </div>
                  <div className="col-lg-8">
                     <div className="tg-banner-3-big-content text-center include-bg" style={{ backgroundImage: `url(/assets/img/banner/banner-2/thumb.jpg)` }}>
                        <h2>Let’s Discover</h2>
                        <span className="d-none d-sm-block">
                           <svg width="322" height="23" viewBox="0 0 322 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M2.5 15C25.5 12.6667 84.9106 17 108 17C186 17 266 32 320 2" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                           </svg>
                        </span>
                        <h2>The Whole World !</h2>
                     </div>
                  </div>
               </div>
            </div>
         </div>
         <span className="tg-banner-transparent-bg"></span>
      </>
   )
}

export default Cta

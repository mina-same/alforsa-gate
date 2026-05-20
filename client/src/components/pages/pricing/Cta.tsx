import { Link } from "react-router-dom";

const Cta = () => {
   return (
      <div className="tg-cta-area-area tg-cta-space pt-125 z-index-9 p-relative">
         <img className="tg-cta-price-shape d-none d-lg-block" src="/assets/img/about/details/shape.png" alt="" />
         <div className="container">
            <div className="row">
               <div className="col-12">
                  <div className="tg-cta-wrap include-bg" style={{ backgroundImage: `url(/assets/img/cta/banner.jpg)` }}>
                     <div className="row align-items-end">
                        <div className="col-lg-3 d-none d-lg-block">
                           <div className="tg-cta-thumb pt-50 ml-60">
                              <img src="/assets/img/cta/phone.png" alt="" />
                           </div>
                        </div>
                        <div className="col-lg-5 col-md-6">
                           <div className="tg-cta-content">
                              <h5 className="tg-section-subtitle text-white mb-10">Explore Tour</h5>
                              <h2 className="mb-15 tg-cta-title text-white text-capitalize">Download Our App <br /> Form Google & App Store!</h2>
                           </div>
                        </div>
                        <div className="col-lg-4 col-md-6">
                           <div className="tg-cta-apps">
                              <Link className="mb-20 d-inline-block mr-5" to="#"><img src="/assets/img/cta/google.png" alt="" /></Link>
                              <Link className="mb-20 d-inline-block" to="#"><img src="/assets/img/cta/app.png" alt="" /></Link>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default Cta

import { Link } from "react-router-dom";

const Cta = () => {
   return (
      <div className="tg-cta-area-area">
         <div className="container">
            <div className="row align-items-center">
               <div className="col-12">
                  <div className="tg-cta-4-spacing tg-primary-bg p-relative z-index-1">
                     <img className="tg-cta-3-shape-2 d-none d-md-block" src="/assets/img/cta/cta-3/shape-2.png" alt="" />
                     <div className="row align-items-center">
                        <div className="col-lg-6 col-md-6">
                           <div className="tg-cta-4-thumb mr-25 p-relative z-index-1  pt-85 ">
                              <img className="w-100" src="/assets/img/cta/cta-4/thumb.png" alt="" />
                              <img className="tg-cta-3-shape rotate-infinite" src="/assets/img/cta/cta-3/shape.png" alt="shape" />
                           </div>
                        </div>
                        <div className="col-lg-6 col-md-6">
                           <div className="tg-cta-4-content mb-20 pt-15">
                              <h2 className="mb-15 tg-cta-title text-white text-capitalize mb-15">Get 5% off on your First app<br /> booking Travel with us</h2>
                              <p className="text-white">Are you tired of the typical tourist destinations and looking
                                 comfort zonetravelAre you tired of the typical tourist destin
                                 to step out of your comfort zonetravel</p>
                              <div className="tg-cta-3-apps pt-15 d-flex align-items-center">
                                 <Link className="mb-10 d-inline-block mr-10" to="#"><img src="/assets/img/cta/google.png" alt="" /></Link>
                                 <Link className="mb-10 d-inline-block" to="#"><img src="/assets/img/cta/app.png" alt="" /></Link>
                              </div>
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

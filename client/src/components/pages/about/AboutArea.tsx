import { Link } from "react-router-dom";
import Button from "../../common/Button";

const AboutArea = () => {
   return (
      <div className="tg-about-area p-relative z-index-1 pt-140 pb-105">
         <img className="tg-about-details-shape p-absolute d-none d-lg-block" src="/assets/img/about/details/shape.png" alt="shape" />
         <div className="container">
            <div className="row align-items-center">
               <div className="col-lg-6">
                  <div className="tg-about-details-left p-relative mb-15">
                     <img className="tg-about-details-map p-absolute" src="/assets/img/about/details/shape-2.png" alt="map" />
                     <div className="row">
                        <div className="col-lg-6 col-md-6 col-sm-6">
                           <div className="tg-about-details-thumb p-relative z-index-9">
                              <img className="main-thumb tg-round-15 w-100 mb-20" src="/assets/img/about/details/thumb-1.jpg" alt="thumb" />
                              <img className="main-thumb tg-round-15 w-100 mb-20" src="/assets/img/about/details/thumb-3.jpg" alt="thumb" />
                           </div>
                        </div>
                        <div className="col-lg-6 col-md-6 col-sm-6">
                           <div className="tg-about-details-thumb-2 p-relative">
                              <div className="tg-chose-3-rounded p-relative mb-30">
                                 <img className="rotate-infinite-2" src="/assets/img/chose/chose-3/circle-text.png" alt="" />
                                 <img className="tg-chose-3-star" src="/assets/img/chose/chose-3/star.png" alt="" />
                              </div>
                              <img className="w-100 tg-round-15" src="/assets/img/about/details/thumb-2.jpg" alt="chose" />
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
               <div className="col-lg-6">
                  <div className="tg-chose-content mb-35 ml-60">
                     <div className="tg-chose-section-title mb-30">
                        <h5 className="tg-section-subtitle mb-15 wow fadeInUp" data-wow-delay=".3s" data-wow-duration=".1s">Explore the world with us</h5>
                        <h2 className="mb-15 text-capitalize wow fadeInUp" data-wow-delay=".4s" data-wow-duration=".9s">The perfect vacation<br /> come true with<br /> our Travel Agency</h2>
                        <p className="text-capitalize wow fadeInUp mb-35" data-wow-delay=".5s" data-wow-duration=".9s">when an unknown printer took a galley of type and scrambled
                           it to make a type specimen book. It has survived not only five
                           centuries but also the leap into electronic typesetting<br />
                           remaining essentially unchanged.</p>
                        <div className="tg-chose-btn wow fadeInUp" data-wow-delay=".8s" data-wow-duration=".9s">
                           <Link to="/tour-details" className="tg-btn tg-btn-switch-animation">
                              <Button text="Book Your Room" />
                           </Link>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default AboutArea

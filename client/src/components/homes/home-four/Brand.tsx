import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { Link } from "react-router-dom";

const brand_logo: string[] = [
   "/assets/img/brand/logo-1.png",
   "/assets/img/brand/logo-2.png",
   "/assets/img/brand/logo-3.png",
   "/assets/img/brand/logo-4.png",
   "/assets/img/brand/logo-5.png",
   "/assets/img/brand/logo-3.png",
   "/assets/img/brand/logo-4.png",
   "/assets/img/brand/logo-5.png",];

const setting = {
   loop: true,
   freeMode: true,
   slidesPerView: 'auto' as const,
   spaceBetween: 25,
   centeredSlides: true,
   allowTouchMove: false,
   speed: 4000,
   autoplay: {
      delay: 1,
      disableOnInteraction: true,
   },
};

const Brand = () => {
   return (
      <div className="tg-brand-area tg-grey-bg pb-80 p-relative z-index-1">
         <img className="tg-brand-shape" src="/assets/img/brand/shape.png" alt="" />
         <img className="tg-brand-shape-2" src="/assets/img/brand/shape-2.png" alt="" />
         <div className="container">
            <div className="row">
               <div className="tg-brand-wrap">
                  <Swiper {...setting} modules={[Autoplay]} className="swiper-container tg-brand-slide fix">
                     {brand_logo.map((logo, i) => (
                        <SwiperSlide key={i} className="swiper-slide">
                           <div className="tg-brand-items">
                              <Link to="#"><img src={logo} alt="logo" /></Link>
                           </div>
                        </SwiperSlide>
                     ))}
                  </Swiper>
               </div>
            </div>
         </div>
      </div>
   )
}

export default Brand

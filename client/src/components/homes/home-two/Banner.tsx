import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import { Link } from "react-router-dom";
import BannerFormTwo from '../../common/banner-form/BannerFormTwo';

const brand_logo: string[] = [
  "/assets/img/brand/su/logo.png",
  "/assets/img/brand/su/logo-2.png",
  "/assets/img/brand/su/logo-3.png",
  "/assets/img/brand/su/logo-4.png",
  "/assets/img/brand/su/logo-5.png",
  "/assets/img/brand/su/logo-3.png",
  "/assets/img/brand/su/logo-4.png",
  "/assets/img/brand/su/logo-5.png",];

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

const Banner = () => {
  return (
    <div className="tg-hero-area tg-hero-tu-2-wrapper include-bg" style={{ backgroundImage: `url(/assets/img/hero/tu-2/bg.jpg)` }}>
      <div className="container">
        <div className="row">
          <div className="col-lg-12">
            <div className="tg-hero-3-content text-center mb-40">
              <h4 className="tg-hero-3-subtitle wow fadeInUp" data-wow-delay=".4s" data-wow-duration=".6s">Discover The World!</h4>
              <h2 className="tg-hero-3-title wow fadeInUp" data-wow-delay=".6s" data-wow-duration=".6s">Find Your Destination Today!</h2>
            </div>
          </div>
          <div className="col-12">
            <div className="tg-booking-form-item tg-booking-form-3 mb-45">
              <BannerFormTwo />
            </div>
          </div>
          <div className="col-12">
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
    </div>
  )
}

export default Banner;

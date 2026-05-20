import BannerFormTwo from "../../common/banner-form/BannerFormTwo"

const BookingForm = () => {
   return (
      <div className="tg-booking-form-area p-relative z-index-1">
         <img className="tg-booking-4-shape d-none d-lg-block" src="/assets/img/booking/shape.png" alt="shape" />
         <img className="tg-booking-4-shape-2 d-none d-lg-block" src="/assets/img/booking/shape-2.png" alt="shape" />
         <div className="container">
            <div className="row">
               <div className="col-12">
                  <div className="tg-booking-form-item pt-20 pb-10">
                     <BannerFormTwo />
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default BookingForm

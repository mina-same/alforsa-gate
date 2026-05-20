import { Link } from "react-router-dom";
import Button from "../../common/Button";

const Ads = () => {
   return (
      <div className="tg-blog-ads p-relative mb-40">
         <img className="w-100" src="/assets/img/blog/sidebar/ads.jpg" alt="ads" />
         <div className="tg-blog-ads-btn">
            <Link to="/tour-details" className="tg-btn tg-btn-transparent tg-btn-switch-animation">
               <Button text="Book Now" />
            </Link>
         </div>
      </div>
   )
}

export default Ads

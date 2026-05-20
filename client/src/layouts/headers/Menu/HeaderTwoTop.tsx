import { Link } from "react-router-dom";
import FacebookIcon from "../../../svg/FacebookIcon";
import TwitterIcon from "../../../svg/TwitterIcon";
import InstagramIcon from "../../../svg/InstagramIcon";
import PintarestIcon from "../../../svg/PintarestIcon";

const HeaderTwoTop = () => {
   return (
      <div className="tg-header-top tg-header-top-space tg-primary-bg d-none d-lg-block">
         <div className="container-fluid container-1790">
            <div className="row">
               <div className="col-lg-6">
                  <div className="tg-header-top-info d-flex align-items-center">
                     <Link to="https://www.google.com/maps/@41.6758525,-86.2531698,18.17z"><i className="mr-5 fa-regular fa-location-dot"></i> 178 makr street, 8007 Australia</Link>
                     <span className="tg-header-dvdr mr-20 ml-20"></span>
                     <Link to="mailto:info@tourex.com"><i className="mr-5 fa-regular fa-envelope"></i> info@tourex.com</Link>
                  </div>
               </div>
               <div className="col-lg-6">
                  <div className="tg-header-top-social d-flex align-items-center justify-content-end">
                     <span>Follow us:</span>
                     <ul>
                        <li>
                           <Link to="#">
                              <FacebookIcon />
                           </Link>
                        </li>
                        <li>
                           <Link to="#">
                              <TwitterIcon />
                           </Link>
                        </li>
                        <li>
                           <Link to="#">
                              <InstagramIcon />
                           </Link>
                        </li>
                        <li>
                           <Link to="#">
                              <PintarestIcon />
                           </Link>
                        </li>
                     </ul>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default HeaderTwoTop

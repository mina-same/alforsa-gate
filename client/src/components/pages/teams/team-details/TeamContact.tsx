import { Link } from "react-router-dom";

const TeamContact = () => {
   return (
      <div className="tg-team-details-contact-info">
         <div className="row row-cols-sm-2 row-cols-1">
            <div className="col">
               <div className="tg-team-details-contact">
                  <span>Phone :</span>
                  <Link to="tel:+1239998000">+123 9998 000</Link>
               </div>
            </div>
            <div className="col">
               <div className="tg-team-details-contact">
                  <span>Website :</span>
                  <Link to="#">www.info.com</Link>
               </div>
            </div>
            <div className="col">
               <div className="tg-team-details-contact">
                  <span>E-mail :</span>
                  <Link to="mailto:info@gmail.com">info@gmail.com</Link>
               </div>
            </div>
            <div className="col">
               <div className="tg-team-details-contact">
                  <span>Address :</span>
                  <Link to="#"> 1426 California, USA</Link>
               </div>
            </div>
         </div>
      </div>
   )
}

export default TeamContact

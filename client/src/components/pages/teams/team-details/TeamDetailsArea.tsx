import TeamProgress from "./TeamProgress"
import TeamContact from "./TeamContact"
import { Link } from "react-router-dom";

const TeamDetailsArea = () => {
   return (
      <div className="tg-team-details-area pt-130 p-relative z-index-1 pb-90">
         <img className="tg-team-shape-2 d-none d-md-block" src="/assets/img/banner/banner-2/shape.png" alt="" />
         <div className="container">
            <div className="row">
               <div className="col-lg-5">
                  <div className="tg-team-details-thumb mb-30">
                     <img className="w-100" src="/assets/img/team/details.jpg" alt="details" />
                  </div>
               </div>
               <div className="col-lg-7">
                  <div className="tg-team-details-contant-wrap ml-40 mr-80 mb-30">
                     <div className="tg-team-content tg-team-details-head mb-30">
                        <h5>Esther Howard</h5>
                        <span>Consulting</span>
                        <div className="tg-team-social">
                           <Link to="#"><i className="fa-brands fa-facebook-f"></i></Link>
                           <Link to="#"><i className="fa-brands fa-twitter"></i></Link>
                           <Link to="#"><i className="fa-brands fa-instagram"></i></Link>
                           <Link to="#"><i className="fa-brands fa-pinterest-p"></i></Link>
                        </div>
                     </div>
                     <div className="tg-team-details-contant">
                        <h6 className="mb-15">About Me:</h6>
                        <p>Brendan Fraser, renowned actor of the silver screen, has taken on a new
                           role as a tour guide, leveraging his passion for adventure and storytell
                           ing to offer travelers an unforgettable experience.</p>
                        <p className="mb-25">Brendan Fraser, renowned actor of the silver screen, has taken on a new
                           role as a tour guide, leveraging his passion for adventure and storytell
                           ing to offer travelers an unforgettable experience.</p>
                        <h6 className="mb-15">Professional Skills:</h6>
                        <p className="mb-30">Wild lifeFraser, renowned actor of the silver screen, has taken on modern
                           role as a tour guide, leveraging his passion for adventu.</p>
                        <TeamProgress />
                        <h6 className="mb-15">Information:</h6>
                        <p className="mb-25">Brendan Fraser, renowned actor of the silver screen, has taken on a new
                           role as a tour guide, leveraging his passion for adventure and storytell
                           ing to offer travelers an unforgettable experience.</p>
                        <TeamContact />
                     </div>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default TeamDetailsArea

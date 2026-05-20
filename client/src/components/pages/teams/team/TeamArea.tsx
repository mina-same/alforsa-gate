import { Link } from "react-router-dom";
import team_data from "../../../../data/TeamData";

const TeamArea = () => {
   return (
      <div className="tg-team-area pt-130 pb-100 p-relative z-index-1">
         <img className="tg-team-shape d-none d-md-block" src="/assets/img/about/details/shape.png" alt="" />
         <img className="tg-team-shape-2 d-none d-md-block" src="/assets/img/banner/banner-2/shape.png" alt="" />
         <div className="container">
            <div className="row">
               {team_data.map((item) => (
                  <div key={item.id} className="col-xl-3 col-lg-4 col-md-6 col-sm-6">
                     <div className="tg-team-wrap text-center mb-30">
                        <div className="tg-team-thumb p-relative">
                           <img className="hover-img" src={item.thum} alt="team" />
                           <div className="tg-listing-2-mask">
                              <img className="w-100" src="/assets/img/listing/listing-2/shape.png" alt="" />
                           </div>
                        </div>
                        <div className="tg-team-content">
                           <h5><Link to="/team-details">{item.title}</Link></h5>
                           <span>Consulting</span>
                           <div className="tg-team-social">
                              <Link to="#"><i className="fa-brands fa-facebook-f"></i></Link>
                              <Link to="#"><i className="fa-brands fa-twitter"></i></Link>
                              <Link to="#"><i className="fa-brands fa-instagram"></i></Link>
                              <Link to="#"><i className="fa-brands fa-pinterest-p"></i></Link>
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </div>
   )
}

export default TeamArea

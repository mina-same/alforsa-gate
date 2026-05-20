import { Link } from "react-router-dom";

const BreadCrumb = () => {
   return (
      <div className="tg-breadcrumb-list-2 mt-15">
         <div className="container">
            <div className="row">
               <div className="col-12">
                  <div className="tg-breadcrumb-list-2 tg-breadcrumb-list-3">
                     <ul>
                        <li><Link to="/">Home</Link></li>
                        <li><i className="fa-sharp fa-solid fa-angle-right"></i></li>
                        <li><Link to="/tour-grid-1">Tour Grid</Link></li>
                        <li><i className="fa-sharp fa-solid fa-angle-right"></i></li>
                        <li><span>Vatican Museums Sistine Chapel Skip the Line</span></li>
                     </ul>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default BreadCrumb

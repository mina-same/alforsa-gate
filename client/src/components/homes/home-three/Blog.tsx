import { Link } from "react-router-dom";

interface DataType {
   id: number;
   thumb: string;
   tag: string;
   title: string;
   date: string;
   time: string;
}

const blog_data: DataType[] = [
   {
      id: 1,
      thumb: "/assets/img/blog/blog-2.jpg",
      tag: "Hiking",
      title: "Wine Country Escapes: Vineyard Tours for Connoisseurs",
      date: "26th Sep, 2024",
      time: "5 mins Read"
   },
   {
      id: 2,
      thumb: "/assets/img/blog/blog-3.jpg",
      tag: "Adventure",
      title: "Thrills & Chills: Extreme Sports Tours for Adrenaline",
      date: "26th Sep, 2024",
      time: "5 mins Read"
   },
];

const Blog = () => {
   return (
      <div className="tg-blog-area tg-blog-space tg-grey-bg pt-135 p-relative z-index-1">
         <img className="tg-blog-shape" src="/assets/img/blog/shape.png" alt="shape" />
         <img className="tg-blog-shape-2" src="/assets/img/blog/shape-2.png" alt="shape" />
         <div className="container">
            <div className="row">
               <div className="col-lg-12">
                  <div className="tg-location-section-title text-center mb-30">
                     <h5 className="tg-section-subtitle mb-15 wow fadeInUp" data-wow-delay=".3s" data-wow-duration=".9s">Blog And Article</h5>
                     <h2 className="mb-15 text-capitalize wow fadeInUp" data-wow-delay=".4s" data-wow-duration=".9s">Latest News & Articles</h2>
                     <p className="text-capitalize wow fadeInUp" data-wow-delay=".5s" data-wow-duration=".9s">Are you tired of the typical tourist destinations and<br /> looking
                        to step out of your comfort zonetravel</p>
                  </div>
               </div>

               <div className="col-lg-5 wow fadeInLeft" data-wow-delay=".4s" data-wow-duration=".9s">
                  <div className="tg-blog-item mb-25">
                     <div className="tg-blog-thumb fix">
                        <Link to="/blog-details"><img className="w-100" src="/assets/img/blog/blog-1.jpg" alt="blog" /></Link>
                     </div>
                     <div className="tg-blog-content  p-relative">
                        <span className="tg-blog-tag p-absolute">Travel River</span>
                        <h3 className="tg-blog-title"><Link to="/blog-details">Spiritual Sojourn: Pilgrimagee Tours
                           for Soul Seekers</Link></h3>
                        <div className="tg-blog-date">
                           <span className="mr-20"><i className="fa-light fa-calendar"></i> 26th Sep, 2024</span>
                           <span><i className="fa-regular fa-clock"></i> 5 mins Read</span>
                        </div>
                     </div>
                  </div>
               </div>

               <div className="col-lg-7">
                  <div className="row">
                     {blog_data.map((item) => (
                        <div key={item.id} className="col-12 wow fadeInRight" data-wow-delay=".4s" data-wow-duration=".9s">
                           <div className="tg-blog-item mb-20">
                              <div className="row align-items-center">
                                 <div className="col-lg-5">
                                    <div className="tg-blog-thumb fix">
                                       <Link to="/blog-details"><img className="w-100" src={item.thumb} alt="blog" /></Link>
                                    </div>
                                 </div>
                                 <div className="col-lg-7">
                                    <div className="tg-blog-contents">
                                       <span className="tg-blog-tag d-inline-block mb-10">{item.tag}</span>
                                       <h3 className="tg-blog-title title-2 mb-0"><Link to="blog-details">{item.title}</Link></h3>
                                       <div className="tg-blog-date">
                                          <span className="mr-20"><i className="fa-light fa-calendar"></i>{item.date}</span>
                                          <span><i className="fa-regular fa-clock"></i> {item.time}</span>
                                       </div>
                                    </div>
                                 </div>
                              </div>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
               <div className="col-12 wow fadeInUp" data-wow-delay=".4s" data-wow-duration=".9s">
                  <div className="tg-blog-bottom text-center pt-25">
                     <p>Want to see our Recent News & Updates. <Link to="/blog-grid">Click here to View More</Link></p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default Blog

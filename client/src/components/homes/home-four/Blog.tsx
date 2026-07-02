import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RUSSIA_BLOGS } from "../../../data/russiaBlogsData";

const Blog = () => {
   const { i18n } = useTranslation();
   const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
   const prefix = lang === "ar" ? "/ar" : "/en";
   const featured = RUSSIA_BLOGS.slice(0, 3);

   return (
      <div className="tg-blog-area tg-blog-space-2 pt-130 p-relative z-index-1">
         <img className="tg-blog-2-shape p-absolute d-none d-xl-block" src="/assets/img/blog/blog-2/shape-2.png" alt="" />
         <img className="tg-blog-2-shape-1 p-absolute d-none d-xl-block" src="/assets/img/blog/blog-2/shape.png" alt="" />
         <div className="container">
            <div className="row">
               <div className="col-lg-12">
                  <div className="tg-location-section-title text-center mb-30">
                     <h5 className="tg-section-subtitle mb-15 wow fadeInUp" data-wow-delay=".3s" data-wow-duration=".9s">Blog And Article</h5>
                     <h2 className="mb-15 text-capitalize wow fadeInUp" data-wow-delay=".4s" data-wow-duration=".9s">Latest News & Articles</h2>
                     <p className="text-capitalize wow fadeInUp" data-wow-delay=".5s" data-wow-duration=".9s">Expert travel stories, tips & destination guides<br />from our team on the ground</p>
                  </div>
               </div>
               {featured.map((blog) => (
                  <div key={blog.slug} className="col-xl-4 col-lg-6 col-md-6 wow fadeInLeft" data-wow-delay=".4s" data-wow-duration=".9s">
                     <div className="tg-blog-item tg-blog-2-item mb-25">
                        <div className="tg-blog-thumb p-relative fix mb-20">
                           <Link to={`${prefix}/russia-blog/${blog.slug}`}>
                              <img className="w-100" src={blog.coverImage} alt={blog.title[lang]}
                                 onError={(e: any) => { e.currentTarget.src = "/assets/img/destination/des.jpg"; }} />
                           </Link>
                           <span className="tg-blog-tag p-absolute">{blog.tags[lang][0]}</span>
                        </div>
                        <div className="tg-blog-content p-relative">
                           <h3 className="tg-blog-title">
                              <Link to={`${prefix}/russia-blog/${blog.slug}`}>{blog.title[lang]}</Link>
                           </h3>
                           <div className="tg-blog-date mb-10">
                              <span className="mr-20">
                                 <i className="fa-light fa-calendar"></i>
                                 {new Date(blog.publishedAt).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", { year: "numeric", month: "short", day: "numeric" })}
                              </span>
                              <span>
                                 <i className="fa-regular fa-clock"></i>
                                 {blog.readTime} {lang === "ar" ? "دق قراءة" : "min read"}
                              </span>
                           </div>
                           <p className="tg-blog-text mb-0">{blog.excerpt[lang]}</p>
                        </div>
                     </div>
                  </div>
               ))}
               <div className="col-12 wow fadeInUp" data-wow-delay=".4s" data-wow-duration=".9s">
                  <div className="tg-blog-bottom text-center pt-15">
                     <p>Want to see our Recent News & Updates. <Link to={`${prefix}/blog-grid`}>Click here to View More</Link></p>
                  </div>
               </div>
            </div>
         </div>
      </div>
   )
}

export default Blog

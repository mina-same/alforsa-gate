import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import ReactPaginate from "react-paginate";
import BlogSidebar from "../blog-sidebar";
import { RUSSIA_BLOGS } from "../../../data/russiaBlogsData";

const BlogArea = () => {
   const { i18n } = useTranslation();
   const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
   const prefix = lang === "ar" ? "/ar" : "/en";

   const itemsPerPage = 6;
   const [itemOffset, setItemOffset] = useState(0);
   const endOffset = itemOffset + itemsPerPage;
   const currentItems = RUSSIA_BLOGS.slice(itemOffset, endOffset);
   const pageCount = Math.ceil(RUSSIA_BLOGS.length / itemsPerPage);

   const handlePageClick = (event: { selected: number }) => {
      const newOffset = (event.selected * itemsPerPage) % RUSSIA_BLOGS.length;
      setItemOffset(newOffset);
   };

   return (
      <div className="tg-blog-grid-area pt-130 pb-100">
         <div className="container">
            <div className="row">
               <div className="col-xl-9 col-lg-8">
                  <div className="tg-blog-grid-wrap tg-blog-lg-spacing mr-50">
                     <div className="row">
                        {currentItems.map((blog) => (
                           <div key={blog.slug} className="col-xl-6 col-lg-12 col-md-6">
                              <div className="tg-blog-item tg-blog-2-item mb-30">
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
                     </div>
                     {pageCount > 1 && (
                        <div className="tg-pagenation-wrap text-center pt-80 mb-30">
                           <nav>
                              <ReactPaginate
                                 breakLabel="..."
                                 nextLabel={<i className="p-btn">{lang === "ar" ? "الصفحة التالية" : "Next Page"}</i>}
                                 onPageChange={handlePageClick}
                                 pageRangeDisplayed={3}
                                 pageCount={pageCount}
                                 previousLabel={<i className="p-btn">{lang === "ar" ? "الصفحة السابقة" : "Previous Page"}</i>}
                                 renderOnZeroPageCount={null}
                              />
                           </nav>
                        </div>
                     )}
                  </div>
               </div>
               <div className="col-xl-3 col-lg-4">
                  <BlogSidebar />
               </div>
            </div>
         </div>
      </div>
   );
};

export default BlogArea;

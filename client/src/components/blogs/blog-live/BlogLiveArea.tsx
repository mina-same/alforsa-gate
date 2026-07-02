import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ReactPaginate from 'react-paginate';
import BlogSidebar from '../blog-sidebar';
import { blogService } from '../../../services/destinationService';
import type { IBlog } from '../../../services/destinationService';

const LIMIT = 6;

const BlogLiveArea = () => {
  const { i18n } = useTranslation();
  const lang   = (i18n.language?.startsWith('ar') ? 'ar' : 'en') as 'en' | 'ar';
  const prefix = lang === 'ar' ? '/ar' : '/en';

  const [blogs, setBlogs]           = useState<IBlog[]>([]);
  const [pageCount, setPageCount]   = useState(0);
  const [page, setPage]             = useState(0);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    setLoading(true);
    blogService
      .list({ isPublished: true, page: page + 1, limit: LIMIT })
      .then(({ blogs: data, pagination }) => {
        setBlogs(data);
        setPageCount(pagination?.pages ?? 0);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page]);

  const handlePageClick = ({ selected }: { selected: number }) => {
    setPage(selected);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const fallback = '/assets/img/destination/des.jpg';

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
    });
  };

  return (
    <div className="tg-blog-grid-area pt-130 pb-100">
      <div className="container">
        <div className="row">
          <div className="col-xl-9 col-lg-8">
            <div className="tg-blog-grid-wrap tg-blog-lg-spacing mr-50">
              {loading ? (
                <div className="tg-blog-loading" style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', fontSize: 15 }}>
                  {lang === 'ar' ? 'جاري التحميل…' : 'Loading articles…'}
                </div>
              ) : blogs.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 0', color: '#9ca3af', fontSize: 15 }}>
                  {lang === 'ar' ? 'لا توجد مقالات بعد.' : 'No articles published yet.'}
                </div>
              ) : (
                <div className="row">
                  {blogs.map((blog) => {
                    const title   = blog.title?.[lang]   || blog.title?.en   || '';
                    const excerpt = blog.excerpt?.[lang] || blog.excerpt?.en || '';
                    const tag     = blog.tags?.[0] ?? '';

                    return (
                      <div key={blog._id} className="col-xl-6 col-lg-12 col-md-6">
                        <div className="tg-blog-item tg-blog-2-item mb-30">
                          <div className="tg-blog-thumb p-relative fix mb-20">
                            <Link to={`${prefix}/blog/${blog.slug}`}>
                              <img
                                className="w-100"
                                src={blog.coverImage || fallback}
                                alt={title}
                                style={{ height: 220, objectFit: 'cover' }}
                                onError={(e: any) => { e.currentTarget.src = fallback; }}
                              />
                            </Link>
                            {tag && <span className="tg-blog-tag p-absolute">{tag}</span>}
                          </div>
                          <div className="tg-blog-content p-relative">
                            <h3 className="tg-blog-title">
                              <Link to={`${prefix}/blog/${blog.slug}`}>{title}</Link>
                            </h3>
                            <div className="tg-blog-date mb-10">
                              {blog.publishedAt && (
                                <span className="mr-20">
                                  <i className="fa-light fa-calendar" />
                                  {formatDate(blog.publishedAt)}
                                </span>
                              )}
                              {blog.readTime && (
                                <span>
                                  <i className="fa-regular fa-clock" />
                                  {blog.readTime} {lang === 'ar' ? 'دق قراءة' : 'min read'}
                                </span>
                              )}
                            </div>
                            {excerpt && <p className="tg-blog-text mb-0">{excerpt}</p>}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {pageCount > 1 && (
                <div className="tg-pagenation-wrap text-center pt-80 mb-30">
                  <nav>
                    <ReactPaginate
                      breakLabel="..."
                      nextLabel={<i className="p-btn">{lang === 'ar' ? 'الصفحة التالية' : 'Next Page'}</i>}
                      onPageChange={handlePageClick}
                      pageRangeDisplayed={3}
                      pageCount={pageCount}
                      previousLabel={<i className="p-btn">{lang === 'ar' ? 'الصفحة السابقة' : 'Previous Page'}</i>}
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

export default BlogLiveArea;

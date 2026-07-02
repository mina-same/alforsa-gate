import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import BlogSidebar from '../blog-sidebar';
import { blogService } from '../../../services/destinationService';
import type { IBlog } from '../../../services/destinationService';

const CalendarIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M9.76501 0.777832V3.26675M4.23413 0.777832V3.26675M0.777344 5.75554H13.2218M2.16006 2.02217H11.8391C12.6027 2.02217 13.2218 2.57933 13.2218 3.26662V11.9778C13.2218 12.6651 12.6027 13.2223 11.8391 13.2223H2.16006C1.39641 13.2223 0.777344 12.6651 0.777344 11.9778V3.26662C0.777344 2.57933 1.39641 2.02217 2.16006 2.02217Z" stroke="#560CE3" strokeWidth="0.977778" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ClockIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M7.99979 3.73329V7.99996L10.8442 9.42218M15.1109 8.00003C15.1109 11.9274 11.9271 15.1111 7.99978 15.1111C4.07242 15.1111 0.888672 11.9274 0.888672 8.00003C0.888672 4.07267 4.07242 0.888916 7.99978 0.888916C11.9271 0.888916 15.1109 4.07267 15.1109 8.00003Z" stroke="#560CE3" strokeWidth="1.06667" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const BlogDetailSlugArea = () => {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const lang     = (i18n.language?.startsWith('ar') ? 'ar' : 'en') as 'en' | 'ar';
  const prefix   = lang === 'ar' ? '/ar' : '/en';
  const navigate = useNavigate();

  const [blog, setBlog]       = useState<IBlog | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    setNotFound(false);
    blogService
      .getBySlug(slug)
      .then(setBlog)
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [slug]);

  const fallback = '/assets/img/destination/des.jpg';

  const formatDate = (iso?: string) => {
    if (!iso) return '';
    return new Date(iso).toLocaleDateString(lang === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="tg-blog-grid-area pt-130 pb-100">
        <div className="container">
          <div style={{ textAlign: 'center', padding: '80px 0', color: '#9ca3af', fontSize: 15 }}>
            {lang === 'ar' ? 'جاري التحميل…' : 'Loading article…'}
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !blog) {
    return (
      <div className="tg-blog-grid-area pt-130 pb-100">
        <div className="container" style={{ textAlign: 'center', padding: '80px 0' }}>
          <h3 style={{ color: '#374151', marginBottom: 16 }}>
            {lang === 'ar' ? 'المقال غير موجود' : 'Article not found'}
          </h3>
          <button className="tg-btn" onClick={() => navigate(`${prefix}/blog`)}>
            {lang === 'ar' ? 'العودة للمدونة' : 'Back to Blog'}
          </button>
        </div>
      </div>
    );
  }

  const title   = blog.title?.[lang]   || blog.title?.en   || '';
  const bodyRaw = blog.body?.[lang]    || blog.body?.en;
  const bodyHtml = typeof bodyRaw === 'string' ? bodyRaw : '';

  return (
    <div className="tg-blog-grid-area pt-130 pb-80" dir={lang === 'ar' ? 'rtl' : 'ltr'}>
      <div className="container">
        <div className="row">
          <div className="col-xl-9 col-lg-8">
            <div className="tg-blog-details-wrap tg-blog-lg-spacing mr-50 mb-50">
              <div className="tg-blog-standard-item mb-35">

                {/* Cover image */}
                {blog.coverImage && (
                  <div className="tg-blog-standard-thumb mb-15">
                    <img
                      className="w-100"
                      src={blog.coverImage}
                      alt={title}
                      style={{ borderRadius: 12, maxHeight: 480, objectFit: 'cover' }}
                      onError={(e: any) => { e.currentTarget.src = fallback; }}
                    />
                  </div>
                )}

                <div className="tg-blog-standard-content">

                  {/* Meta */}
                  <div className="tg-blog-standard-date mb-10" style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'center' }}>
                    {blog.author && (
                      <span>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#560CE3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: 5, verticalAlign: 'middle' }}>
                          <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2M12 11a4 4 0 100-8 4 4 0 000 8z" />
                        </svg>
                        {blog.author}
                      </span>
                    )}
                    {blog.publishedAt && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <CalendarIcon />
                        {formatDate(blog.publishedAt)}
                      </span>
                    )}
                    {blog.readTime && (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                        <ClockIcon />
                        {blog.readTime} {lang === 'ar' ? 'دق قراءة' : 'min read'}
                      </span>
                    )}
                  </div>

                  {/* Title */}
                  <h2 className="tg-blog-standard-title mb-20" style={{ fontSize: 'clamp(22px, 4vw, 32px)', lineHeight: 1.3 }}>
                    {title}
                  </h2>

                  {/* Tags */}
                  {blog.tags && blog.tags.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
                      {blog.tags.map(tag => (
                        <span key={tag} style={{ background: '#f3f0ff', color: '#7c3aed', padding: '4px 12px', borderRadius: 20, fontSize: 13, fontWeight: 500 }}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Body */}
                  {bodyHtml ? (
                    <div
                      className="tg-blog-body"
                      style={{ lineHeight: 1.85, fontSize: 15.5, color: '#374151' }}
                      dangerouslySetInnerHTML={{ __html: bodyHtml }}
                    />
                  ) : (
                    blog.excerpt?.[lang] || blog.excerpt?.en ? (
                      <p style={{ lineHeight: 1.85, fontSize: 15.5, color: '#374151' }}>
                        {blog.excerpt[lang] || blog.excerpt?.en}
                      </p>
                    ) : null
                  )}

                </div>
              </div>

              {/* Back link */}
              <div style={{ marginTop: 40 }}>
                <Link to={`${prefix}/blog`} className="tg-btn tg-btn--secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
                  {lang === 'ar' ? 'العودة للمدونة' : 'Back to Blog'}
                </Link>
              </div>
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

export default BlogDetailSlugArea;

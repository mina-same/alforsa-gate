import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { blogService } from '../../../services/destinationService';
import type { IBlog } from '../../../services/destinationService';

const RecentPost = () => {
  const { i18n } = useTranslation();
  const lang   = (i18n.language?.startsWith('ar') ? 'ar' : 'en') as 'en' | 'ar';
  const prefix = lang === 'ar' ? '/ar' : '/en';

  const [posts, setPosts]     = useState<IBlog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    blogService
      .list({ isPublished: true, limit: 4 })
      .then(({ blogs }) => setPosts(blogs))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const fallback = '/assets/img/destination/des.jpg';

  return (
    <div className="tg-blog-post tg-blog-sidebar-box mb-40">
      <h5 className="tg-blog-sidebar-title mb-25">
        {lang === 'ar' ? 'أحدث المقالات' : 'Recent Posts'}
      </h5>

      {loading && (
        <div style={{ color: '#9ca3af', fontSize: 13, padding: '8px 0' }}>
          {lang === 'ar' ? 'جاري التحميل…' : 'Loading…'}
        </div>
      )}

      {!loading && posts.length === 0 && (
        <div style={{ color: '#9ca3af', fontSize: 13 }}>
          {lang === 'ar' ? 'لا توجد مقالات.' : 'No posts yet.'}
        </div>
      )}

      {posts.map((blog) => {
        const title = blog.title?.[lang] || blog.title?.en || '';
        return (
          <div key={blog._id} className="tg-blog-post-item d-flex align-items-center">
            <div className="tg-blog-post-thumb mr-15">
              <Link to={`${prefix}/blog/${blog.slug}`}>
                <img
                  src={blog.coverImage || fallback}
                  alt={title}
                  style={{ width: 70, height: 60, objectFit: 'cover', borderRadius: 8 }}
                  onError={(e: any) => { e.currentTarget.src = fallback; }}
                />
              </Link>
            </div>
            <div className="tg-blog-post-content w-100">
              <h4 className="tg-blog-post-title mb-5">
                <Link to={`${prefix}/blog/${blog.slug}`}>
                  {title.length > 45 ? title.substring(0, 45) + '…' : title}
                </Link>
              </h4>
              {blog.publishedAt && (
                <span className="tg-blog-post-date">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M9.76501 0.777832V3.26675M4.23413 0.777832V3.26675M0.777344 5.75554H13.2218M2.16006 2.02217H11.8391C12.6027 2.02217 13.2218 2.57933 13.2218 3.26662V11.9778C13.2218 12.6651 12.6027 13.2223 11.8391 13.2223H2.16006C1.39641 13.2223 0.777344 12.6651 0.777344 11.9778V3.26662C0.777344 2.57933 1.39641 2.02217 2.16006 2.02217Z" stroke="#560CE3" strokeWidth="0.977778" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {new Date(blog.publishedAt).toLocaleDateString(
                    lang === 'ar' ? 'ar-SA' : 'en-US',
                    { year: 'numeric', month: 'short', day: 'numeric' }
                  )}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default RecentPost;

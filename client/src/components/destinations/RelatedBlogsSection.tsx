import { Link } from 'react-router-dom';
import { Clock, ArrowRight, ArrowLeft } from 'lucide-react';
import type { IRelatedBlog } from '../../services/destinationService';
import { useLangPrefix } from '../../hooks/useLangPrefix';

interface Props {
  blogs: IRelatedBlog[];
  title?: string;
  subtitle?: string;
  lang: 'en' | 'ar';
  primaryColor: string;
}

const RelatedBlogsSection = ({ blogs, title, subtitle, lang, primaryColor }: Props) => {
  const prefix = useLangPrefix();
  const dir    = lang === 'ar' ? 'rtl' : 'ltr';
  const Arrow  = lang === 'ar' ? ArrowLeft : ArrowRight;

  if (!blogs || blogs.length === 0) return null;

  return (
    <section className="tg-grey-bg pt-80 pb-60">
      <div className="container">
        {(title || subtitle) && (
          <div className="col-12 text-center mb-40" style={{ direction: dir }}>
            {subtitle && <h5 className="tg-section-subtitle mb-15">{subtitle}</h5>}
            {title   && <h2>{title}</h2>}
          </div>
        )}

        <div className="row">
          {blogs.map((blog, idx) => (
            <div key={idx} className="col-lg-4 col-md-6 mb-30">
              <Link
                to={`${prefix}/blog/${blog.slug}`}
                style={{ textDecoration: 'none', display: 'block', height: '100%' }}
              >
                <div style={{
                  background: '#fff', borderRadius: 16, overflow: 'hidden',
                  boxShadow: '0 4px 24px rgba(0,0,0,0.07)', height: '100%',
                  direction: dir, transition: 'transform 0.25s, box-shadow 0.25s',
                }}
                  onMouseOver={(e: any) => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 36px rgba(0,0,0,0.12)'; }}
                  onMouseOut={(e: any)  => { e.currentTarget.style.transform = 'translateY(0)';    e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.07)'; }}
                >
                  {blog.coverImage && (
                    <div style={{ height: 200, overflow: 'hidden' }}>
                      <img
                        src={blog.coverImage}
                        alt={blog.title[lang] || blog.title.en}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={(e: any) => { e.currentTarget.style.display = 'none'; }}
                      />
                    </div>
                  )}
                  <div style={{ padding: '20px 22px' }}>
                    <h4 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10, color: '#1a1a2e', lineHeight: 1.4 }}>
                      {blog.title[lang] || blog.title.en}
                    </h4>
                    {blog.excerpt?.[lang] && (
                      <p style={{ fontSize: 14, color: '#666', lineHeight: 1.7, marginBottom: 16 }}>
                        {blog.excerpt[lang]}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexDirection: lang === 'ar' ? 'row-reverse' : 'row' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#999', fontSize: 12 }}>
                        {blog.readTime && (
                          <>
                            <Clock size={13} />
                            <span>{blog.readTime} {lang === 'ar' ? 'دقائق' : 'min read'}</span>
                          </>
                        )}
                      </div>
                      <span style={{ color: primaryColor, fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', gap: 4 }}>
                        {lang === 'ar' ? 'اقرأ المزيد' : 'Read more'} <Arrow size={14} />
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default RelatedBlogsSection;

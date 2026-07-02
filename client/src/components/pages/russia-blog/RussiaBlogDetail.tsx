/* eslint-disable @typescript-eslint/no-explicit-any */
import { useParams, Link, Navigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { ArrowLeft, ArrowRight } from "lucide-react";
import HeaderFour from "../../../layouts/headers/HeaderFour";
import FooterThree from "../../../layouts/footers/FooterThree";
import { RUSSIA_BLOGS, type BlogSection } from "../../../data/russiaBlogsData";
import AboutArea from "../about/AboutArea";
import Choose from "../about/Choose";
import Location from "../../homes/home-six/Location";
import Cta from "../about/Cta";

const PRIMARY = "var(--tg-theme-primary, #0a5c44)";

function formatDate(iso: string, lang: "en" | "ar") {
  return new Date(iso).toLocaleDateString(lang === "ar" ? "ar-SA" : "en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

// ── SVG icons reused from the existing blog-details design ───────────────────
const IconUser = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M1.51089 15.2889C1.33312 15.2889 1.15534 15.2 1.06645 15.1111C0.977561 14.9334 0.888672 14.8445 0.888672 14.6667C0.888672 13.4222 1.24423 12.1778 1.86645 11.0222C2.48867 9.95558 3.46645 8.9778 4.53312 8.35558C4.08867 7.82225 3.73312 7.11114 3.55534 6.40003C3.46645 5.68892 3.46645 4.88892 3.64423 4.26669C3.82201 3.55558 4.26645 2.84447 4.71089 2.31114C5.24423 1.7778 5.86645 1.33336 6.48867 1.15558C7.02201 0.977805 7.55534 0.888916 8.08867 0.888916C8.26645 0.888916 8.53312 0.888916 8.71089 0.888916C9.42201 0.977805 10.1331 1.24447 10.7553 1.68892C11.3776 2.13336 11.822 2.66669 12.1776 3.28892C12.5331 3.91114 12.7109 4.62225 12.7109 5.42225C12.7109 6.48892 12.3553 7.55558 11.6442 8.35558C12.1776 8.71114 12.7109 9.06669 13.2442 9.51114C13.9553 10.2222 14.3998 10.9334 14.8442 11.8222C15.1998 12.7111 15.3776 13.6 15.3776 14.5778C15.3776 14.7556 15.2887 14.9334 15.1998 15.0222C15.1109 15.1111 14.9331 15.2 14.7553 15.2C14.6665 15.2 14.5776 15.2 14.4887 15.1111C14.3998 15.1111 14.3109 15.0222 14.3109 14.9334C14.222 14.8445 14.222 14.8445 14.1331 14.7556C14.1331 14.6667 14.0442 14.5778 14.0442 14.4889C14.0442 13.6889 13.8664 12.9778 13.5998 12.2667C13.3331 11.5556 12.8887 10.9334 12.2664 10.4C11.7331 9.95558 11.1998 9.51114 10.5776 9.24447C9.86645 9.68892 9.06645 9.95558 8.08867 9.95558C7.19978 9.95558 6.31089 9.68892 5.59978 9.24447C4.62201 9.68892 3.73312 10.4 3.11089 11.3778C2.48867 12.3556 2.13312 13.4222 2.13312 14.5778C2.13312 14.7556 2.04423 14.9334 1.95534 15.0222C1.86645 15.2 1.68867 15.2889 1.51089 15.2889ZM8.08867 2.22225C7.46645 2.22225 6.84423 2.40003 6.31089 2.75558C5.68867 3.11114 5.33312 3.64447 5.06645 4.1778C4.79978 4.80003 4.71089 5.42225 4.88867 6.13336C4.97756 6.75558 5.33312 7.37781 5.77756 7.82225C6.22201 8.26669 6.84423 8.62225 7.46645 8.71114C7.64423 8.71114 7.91089 8.80003 8.08867 8.80003C8.53312 8.80003 8.97756 8.71114 9.33312 8.53336C9.95534 8.26669 10.3998 7.91114 10.8442 7.28892C11.1998 6.75558 11.3776 6.13336 11.3776 5.51114C11.3776 4.62225 11.022 3.82225 10.3998 3.20003C9.77756 2.48892 8.97756 2.22225 8.08867 2.22225Z"
      fill="#560CE3"
    />
  </svg>
);

const IconCalendar = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 14 14"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M9.76501 0.777771V3.26668M4.23413 0.777771V3.26668M0.777344 5.75548H13.2218M2.16006 2.02211H11.8391C12.6027 2.02211 13.2218 2.57927 13.2218 3.26656V11.9778C13.2218 12.6651 12.6027 13.2222 11.8391 13.2222H2.16006C1.39641 13.2222 0.777344 12.6651 0.777344 11.9778V3.26656C0.777344 2.57927 1.39641 2.02211 2.16006 2.02211Z"
      stroke="#560CE3"
      strokeWidth="0.977778"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const IconClock = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M7.99979 3.73329V7.99996L10.8442 9.42218M15.1109 8.00003C15.1109 11.9274 11.9271 15.1111 7.99978 15.1111C4.07242 15.1111 0.888672 11.9274 0.888672 8.00003C0.888672 4.07267 4.07242 0.888916 7.99978 0.888916C11.9271 0.888916 15.1109 4.07267 15.1109 8.00003Z"
      stroke="#560CE3"
      strokeWidth="1.06667"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const QuoteIcon = () => (
  <svg
    width="38"
    height="32"
    viewBox="0 0 38 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M34.7762 27.416C32.1113 30.458 28.0789 32 22.7928 32L20.8934 32L20.8934 26.362L22.4206 26.04C25.0227 25.492 26.8329 24.414 27.8016 22.832C28.307 21.9797 28.5937 21.0039 28.6335 20L22.7928 20C22.2891 20 21.806 19.7893 21.4498 19.4142C21.0935 19.0391 20.8934 18.5304 20.8934 18L20.8934 4C20.8934 1.794 22.5972 0 24.6922 0L36.0887 0C36.5924 0 37.0755 0.210716 37.4317 0.585789C37.7879 0.960861 37.9881 1.46957 37.9881 2L37.9881 12L37.9824 17.838C37.9995 18.06 38.3603 23.32 34.7762 27.416ZM3.7988 0L15.1952 0C15.699 0 16.1821 0.210714 16.5383 0.585787C16.8945 0.960859 17.0946 1.46957 17.0946 2L17.0946 12L17.0889 17.838C17.106 18.06 17.4669 23.32 13.8827 27.416C11.2179 30.458 7.18544 32 1.8994 32L0 32L0 26.362L1.52712 26.04C4.1293 25.492 5.93943 24.414 6.90812 22.832C7.41357 21.9797 7.70024 21.0039 7.74007 20L1.8994 20C1.39565 20 0.912526 19.7893 0.556317 19.4142C0.200112 19.0391 0 18.5304 0 18L0 4C0 1.794 1.70376 0 3.7988 0Z"
      fill="#560CE3"
    />
  </svg>
);

// ── Section renderer using existing blog-details design patterns ──────────────
const renderSection = (
  section: BlogSection,
  i: number,
  coverImage: string,
  isRtl: boolean,
) => {
  switch (section.type) {
    case "paragraph":
      return (
        <p key={i} className="tg-blog-para lh-28 mb-20">
          {section.content}
        </p>
      );

    case "h2":
      return (
        <h3
          key={i}
          style={{
            fontSize: 22,
            fontWeight: 800,
            color: "#1a1a2e",
            margin: "36px 0 14px",
            lineHeight: 1.3,
          }}
        >
          {section.content}
        </h3>
      );

    case "quote":
      // ── Borrowed directly from tg-blog-blockquote design ──
      return (
        <blockquote key={i} className="tg-blog-blockquote p-relative mb-25">
          <p>{section.content}</p>
          <span className="tg-blog-blockquote-icon">
            <QuoteIcon />
          </span>
        </blockquote>
      );

    case "list":
      // ── Borrowed from tg-blog-details-video-list checklist design ──
      return (
        <div key={i} className="tg-blog-details-video-list mb-25">
          <ul>
            {section.items?.map((item, j) => (
              <li key={j}>
                <span>
                  <i className="fa-sharp fa-solid fa-check"></i>
                </span>
                <p>{item}</p>
              </li>
            ))}
          </ul>
        </div>
      );

    case "tips":
      // ── Borrowed from tg-blog-video-list two-column layout ──
      // Image (cover) on one side, title + checklist on the other
      return (
        <div key={i} className="tg-blog-video-list mb-35">
          <div className="row align-items-center">
            <div className="w-full">
              <div className={`tg-blog-details-video-content`}>
                {section.label && (
                  <h3
                    style={{ fontSize: 18, fontWeight: 800, marginBottom: 14 }}
                  >
                    {section.label}
                  </h3>
                )}
                <div className="tg-blog-details-video-list">
                  <ul>
                    {section.items?.map((item, j) => (
                      <li key={j}>
                        <span>
                          <i className="fa-sharp fa-solid fa-check"></i>
                        </span>
                        <p>{item}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      );

    case "image":
      return (
        <div
          key={i}
          className="tg-blog-standard-thumb mb-25"
          style={{ borderRadius: 14, overflow: "hidden" }}
        >
          <img
            className="w-100"
            src={section.image}
            alt={section.caption || ""}
            style={{ borderRadius: 14 }}
            onError={(e: any) => {
              e.currentTarget.style.display = "none";
            }}
          />
          {section.caption && (
            <p
              style={{
                textAlign: "center",
                fontSize: 13,
                color: "#888",
                marginTop: 8,
                fontStyle: "italic",
              }}
            >
              {section.caption}
            </p>
          )}
        </div>
      );

    default:
      return null;
  }
};

// ── Main component ────────────────────────────────────────────────────────────
const RussiaBlogDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const { i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const isRtl = lang === "ar";
  const dir = isRtl ? "rtl" : "ltr";
  const prefix = isRtl ? "/ar" : "/en";
  const BackArrow = isRtl ? ArrowRight : ArrowLeft;

  const blog = RUSSIA_BLOGS.find((b) => b.slug === slug);
  if (!blog) return <Navigate to={`${prefix}/destination/russia`} replace />;

  const sections = blog.sections[lang];
  const related = RUSSIA_BLOGS.filter((b) => b.slug !== slug);

  return (
    <>
      <Helmet>
        <html lang={lang} dir={dir} />
        <title>{blog.title[lang]} | Alforsa Travel</title>
        <meta name="description" content={blog.metaDesc[lang]} />
        <meta name="robots" content="index, follow" />
        <meta property="og:title" content={blog.title[lang]} />
        <meta property="og:description" content={blog.metaDesc[lang]} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={blog.coverImage} />
        <meta property="article:published_time" content={blog.publishedAt} />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: blog.title[lang],
            description: blog.metaDesc[lang],
            image: blog.coverImage,
            author: { "@type": "Organization", name: blog.author[lang] },
            publisher: { "@type": "Organization", name: "Alforsa Travel" },
            datePublished: blog.publishedAt,
            keywords: blog.tags[lang].join(", "),
          })}
        </script>
      </Helmet>

      <HeaderFour isTransparent={true} />

      <main style={{ direction: dir }}>
        {/* ── HERO (cinematic full-width) ── */}
        <section
          style={{
            minHeight: "62vh",
            display: "flex",
            alignItems: "flex-end",
            position: "relative",
            paddingBottom: 52,
            background: `linear-gradient(to bottom, rgba(0,0,0,0.18) 0%, rgba(0,0,0,0.72) 100%), url('${blog.coverImage}') center/cover no-repeat`,
          }}
        >
          <div
            className="container"
            style={{ position: "relative", zIndex: 1 }}
          >
            <div className="row justify-content-center">
              <div className="col-lg-10">
                {/* Tags chips */}
                <div
                  style={{
                    display: "flex",
                    gap: 8,
                    flexWrap: "wrap",
                    marginBottom: 18,
                  }}
                >
                  {blog.tags[lang].slice(0, 4).map((tag, i) => (
                    <span
                      key={i}
                      style={{
                        background: "rgba(255,255,255,0.18)",
                        backdropFilter: "blur(6px)",
                        color: "#fff",
                        fontSize: 11,
                        padding: "4px 14px",
                        borderRadius: 100,
                        letterSpacing: 0.5,
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Title */}
                <h1
                  style={{
                    fontSize: "clamp(26px,4.5vw,54px)",
                    fontWeight: 900,
                    color: "#fff",
                    lineHeight: 1.15,
                    marginBottom: 22,
                    textShadow: "0 2px 16px rgba(0,0,0,0.5)",
                  }}
                >
                  {blog.title[lang]}
                </h1>

                {/* ── tg-blog-standard-date style meta bar ── */}
                <div
                  className="tg-blog-standard-date"
                  style={
                    { "--tg-blog-date-color": "rgba(255,255,255,0.85)" } as any
                  }
                >
                  <span style={{ color: "rgba(255,255,255,0.85)" }}>
                    <IconUser /> {blog.author[lang]}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.85)" }}>
                    <IconCalendar /> {formatDate(blog.publishedAt, lang)}
                  </span>
                  <span style={{ color: "rgba(255,255,255,0.85)" }}>
                    <IconClock /> {blog.readTime}{" "}
                    {lang === "ar" ? "دقائق قراءة" : "min read"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── BREADCRUMB ── */}
        <div
          style={{
            background: "#f8f9ff",
            borderBottom: "1px solid #eee",
            padding: "11px 0",
          }}
        >
          <div className="container">
            <nav
              style={{
                fontSize: 13,
                color: "#888",
                display: "flex",
                gap: 8,
                alignItems: "center",
                flexWrap: "wrap",
              }}
            >
              <Link
                to={prefix}
                style={{ color: "#888", textDecoration: "none" }}
              >
                {lang === "ar" ? "الرئيسية" : "Home"}
              </Link>
              <span>/</span>
              <Link
                to={`${prefix}/destination/russia`}
                style={{ color: "#888", textDecoration: "none" }}
              >
                {lang === "ar" ? "روسيا" : "Russia"}
              </Link>
              <span>/</span>
              <span style={{ color: "#333" }}>
                {blog.title[lang].length > 55
                  ? blog.title[lang].substring(0, 55) + "…"
                  : blog.title[lang]}
              </span>
            </nav>
          </div>
        </div>

        {/* ── MAIN CONTENT + SIDEBAR ── */}
        <div className="tg-blog-grid-area pt-60 pb-80">
          <div className="container">
            <div className="row">
              {/* ── ARTICLE col-xl-9 col-lg-8 ── */}
              <div className="col-xl-9 col-lg-8">
                <div className="tg-blog-details-wrap tg-blog-lg-spacing mr-50 mb-50">
                  {/* Lead excerpt */}
                  <div className="tg-blog-standard-item mb-35">
                    <div className="tg-blog-standard-content">
                      <p
                        className="tg-blog-para lh-28"
                        style={{ fontSize: 17, fontWeight: 500, color: "#333" }}
                      >
                        {blog.excerpt[lang]}
                      </p>
                    </div>
                  </div>

                  {/* Article sections */}
                  {sections.map((section, i) =>
                    renderSection(section, i, blog.coverImage, isRtl),
                  )}

                  {/* ── Tags + Social Share — borrowed from tg-blog-details-tag ── */}
                  <div className="tg-blog-details-tag mb-40 d-flex flex-wrap justify-content-between align-items-center">
                    <div className="tg-blog-sidebar-tag-list d-flex flex-wrap align-items-center">
                      <h5 className="tg-blog-sidebar-title mr-10">
                        {lang === "ar" ? "الوسوم:" : "Tags:"}
                      </h5>
                      <ul>
                        {blog.tags[lang].map((tag, i) => (
                          <li key={i}>
                            <Link to={`${prefix}/destination/russia`}>
                              {tag}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div className="tg-blog-details-social mb-10">
                      <span>{lang === "ar" ? "شارك:" : "Share:"}</span>
                      <Link to="#">
                        <i className="fa-brands fa-facebook-f"></i>
                      </Link>
                      <Link to="#">
                        <i className="fa-brands fa-twitter"></i>
                      </Link>
                      <Link to="#">
                        <i className="fa-brands fa-instagram"></i>
                      </Link>
                      <Link to="#">
                        <i className="fa-brands fa-pinterest-p"></i>
                      </Link>
                      <Link to="#">
                        <i className="fa-brands fa-youtube"></i>
                      </Link>
                    </div>
                  </div>

                  {/* Back link */}
                  <Link
                    to={`${prefix}/destination/russia`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      color: PRIMARY,
                      fontWeight: 700,
                      fontSize: 14,
                      textDecoration: "none",
                    }}
                  >
                    <BackArrow size={16} />
                    {lang === "ar"
                      ? "العودة إلى دليل روسيا"
                      : "Back to Russia Guide"}
                  </Link>
                </div>
              </div>

              {/* ── SIDEBAR col-xl-3 col-lg-4 ── */}
              <div className="col-xl-3 col-lg-4">
                <div className="tg-blog-sidebar top-sticky mb-30">
                  {/* Search box — borrowed from BlogSidebar design */}
                  <div className="tg-blog-sidebar-search tg-blog-sidebar-box mb-40">
                    <h5 className="tg-blog-sidebar-title mb-15">
                      {lang === "ar" ? "بحث" : "Search"}
                    </h5>
                    <div className="tg-blog-sidebar-form">
                      <form onSubmit={(e) => e.preventDefault()}>
                        <input
                          type="text"
                          placeholder={
                            lang === "ar" ? "ابحث هنا..." : "Type here . . ."
                          }
                        />
                        <button type="submit">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 18 18"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <g clipPath="url(#clip0_497_1336)">
                              <path
                                d="M17 17L13.5247 13.5247M15.681 8.3405C15.681 12.3945 12.3945 15.681 8.3405 15.681C4.28645 15.681 1 12.3945 1 8.3405C1 4.28645 4.28645 1 8.3405 1C12.3945 1 15.681 4.28645 15.681 8.3405Z"
                                stroke="#560CE3"
                                strokeWidth="1.6"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                              />
                            </g>
                            <defs>
                              <clipPath id="clip0_497_1336">
                                <rect width="18" height="18" fill="white" />
                              </clipPath>
                            </defs>
                          </svg>
                        </button>
                      </form>
                    </div>
                  </div>

                  {/* CTA box — custom, using sidebar-box style */}
                  <div
                    className="tg-blog-sidebar-box mb-40"
                    style={{
                      background: `linear-gradient(135deg, #0a5c44 0%, #073d2d 100%)`,
                      borderRadius: 12,
                      padding: "28px 22px",
                      textAlign: isRtl ? "right" : "left",
                    }}
                  >
                    <h5
                      style={{
                        color: "#fff",
                        fontSize: 16,
                        fontWeight: 800,
                        marginBottom: 10,
                      }}
                    >
                      {lang === "ar"
                        ? "خطط لرحلة روسيا ✈️"
                        : "Plan Your Russia Trip ✈️"}
                    </h5>
                    <p
                      style={{
                        color: "rgba(255,255,255,0.8)",
                        fontSize: 13,
                        lineHeight: 1.7,
                        marginBottom: 18,
                      }}
                    >
                      {lang === "ar"
                        ? "برامج سياحية مخصصة لروسيا للمسافرين السعوديين والخليجيين."
                        : "Tailor-made Russia itineraries for Saudi & Gulf travelers."}
                    </p>
                    <Link
                      to={`${prefix}/tour-grid-2`}
                      style={{
                        display: "block",
                        textAlign: "center",
                        background: "#fff",
                        color: "#0a5c44",
                        fontWeight: 700,
                        padding: "10px 0",
                        borderRadius: 100,
                        textDecoration: "none",
                        fontSize: 13,
                      }}
                    >
                      {lang === "ar" ? "استكشف الجولات" : "View Tours"}
                    </Link>
                  </div>

                  {/* Recent Russia posts — borrowed from tg-blog-post design */}
                  <div className="tg-blog-post tg-blog-sidebar-box mb-40">
                    <h5 className="tg-blog-sidebar-title mb-25">
                      {lang === "ar" ? "مقالات روسيا" : "More Russia Reads"}
                    </h5>
                    {related.map((rb) => (
                      <div
                        key={rb.slug}
                        className="tg-blog-post-item d-flex align-items-center"
                      >
                        <div className="mr-15" style={{ flexShrink: 0 }}>
                          <Link to={`${prefix}/russia-blog/${rb.slug}`}>
                            <img
                              src={rb.coverImage}
                              alt={rb.title[lang]}
                              style={{
                                width: 70,
                                height: 60,
                                objectFit: "cover",
                                borderRadius: 8,
                              }}
                              onError={(e: any) => {
                                e.currentTarget.style.display = "none";
                              }}
                            />
                          </Link>
                        </div>
                        <div className="tg-blog-post-content w-100">
                          <h4 className="tg-blog-post-title mb-5">
                            <Link to={`${prefix}/russia-blog/${rb.slug}`}>
                              {rb.title[lang].length > 50
                                ? rb.title[lang].substring(0, 50) + "…"
                                : rb.title[lang]}
                            </Link>
                          </h4>
                          <span className="tg-blog-post-date">
                            <IconCalendar />
                            {formatDate(rb.publishedAt, lang)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Tags — borrowed from tg-blog-sidebar-tag design */}
                  <div className="tg-blog-sidebar-tag tg-blog-sidebar-box">
                    <h5 className="tg-blog-sidebar-title mb-25">
                      {lang === "ar" ? "الوسوم" : "Tags"}
                    </h5>
                    <div className="tg-blog-sidebar-tag-list">
                      <ul>
                        {blog.tags[lang].map((tag, i) => (
                          <li key={i}>
                            <Link to={`${prefix}/destination/russia`}>
                              {tag}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* ── BORROWED SECTIONS ── */}
        <Choose />
        <AboutArea />
        <Location />
        <Cta />

        {/* ── RELATED BLOGS (full-width cards section) ── */}
        {related.length > 0 && (
          <section style={{ background: "#f8f9ff", padding: "60px 0 70px" }}>
            <div className="container">
              <div className="col-12 text-center mb-40">
                <h5 className="tg-section-subtitle mb-15">
                  {lang === "ar" ? "استكشف المزيد" : "Keep Reading"}
                </h5>
                <h2>
                  {lang === "ar"
                    ? "مقالات روسيا الأخرى"
                    : "More Russia Travel Stories"}
                </h2>
              </div>
              <div className="row justify-content-center">
                {related.slice(0, 3).map((rb) => (
                  <div
                    key={rb.slug}
                    className="col-xl-4 col-lg-6 col-md-6 mb-30"
                  >
                    <div className="tg-blog-item tg-blog-2-item">
                      <div className="tg-blog-thumb p-relative fix mb-20">
                        <Link to={`${prefix}/russia-blog/${rb.slug}`}>
                          <img
                            className="w-100"
                            src={rb.coverImage}
                            alt={rb.title[lang]}
                            onError={(e: any) => {
                              e.currentTarget.src =
                                "/assets/img/destination/des.jpg";
                            }}
                          />
                        </Link>
                        <span className="tg-blog-tag p-absolute">
                          {rb.tags[lang][0]}
                        </span>
                      </div>
                      <div className="tg-blog-content p-relative">
                        <h3 className="tg-blog-title">
                          <Link to={`${prefix}/russia-blog/${rb.slug}`}>
                            {rb.title[lang]}
                          </Link>
                        </h3>
                        <div className="tg-blog-date mb-10">
                          <span className="mr-20">
                            <i className="fa-light fa-calendar"></i>
                            {formatDate(rb.publishedAt, lang)}
                          </span>
                          <span>
                            <i className="fa-regular fa-clock"></i>
                            {rb.readTime}{" "}
                            {lang === "ar" ? "دق قراءة" : "min read"}
                          </span>
                        </div>
                        <p className="tg-blog-text mb-0">{rb.excerpt[lang]}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        )}
      </main>

      <FooterThree />
    </>
  );
};

export default RussiaBlogDetail;

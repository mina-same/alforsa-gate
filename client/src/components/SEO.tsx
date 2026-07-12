import { Helmet } from "react-helmet-async";
import ErrorBoundary from "../ui/ErrorBoundary";

const SITE_URL = "https://alforsa-gate-client.vercel.app";
const SITE_NAME = "Alforsa Gate";
const DEFAULT_DESCRIPTION =
  "Alforsa Gate — unforgettable tours and travel packages. Russia, Egypt and more: hotels, flights, guided trips and seamless booking.";
const DEFAULT_IMAGE = `${SITE_URL}/uploads/tours/russia/sochi-main-banner.png`;

interface SEOProps {
  pageTitle: string;
  description?: string;
  image?: string;
  url?: string;
  noIndex?: boolean;
}

// Make relative image/url paths absolute so link previews work
const absolute = (path?: string): string | undefined => {
  if (!path) return undefined;
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? "" : "/"}${path}`;
};

const SEO = ({ pageTitle, description, image, url, noIndex }: SEOProps) => {
  const fullTitle = `${pageTitle} | ${SITE_NAME}`;
  const desc = description || DEFAULT_DESCRIPTION;
  const ogImage = absolute(image) || DEFAULT_IMAGE;
  const ogUrl =
    absolute(url) ||
    (typeof window !== "undefined" ? window.location.href : SITE_URL);

  return (
    <ErrorBoundary>
      <Helmet>
        <meta charSet="utf-8" />
        <title>{fullTitle}</title>
        <meta name="description" content={desc} />
        <meta name="robots" content={noIndex ? "noindex, follow" : "index, follow"} />
        <link rel="canonical" href={ogUrl} />

        <meta property="og:type" content="website" />
        <meta property="og:site_name" content={SITE_NAME} />
        <meta property="og:title" content={fullTitle} />
        <meta property="og:description" content={desc} />
        <meta property="og:image" content={ogImage} />
        <meta property="og:url" content={ogUrl} />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={fullTitle} />
        <meta name="twitter:description" content={desc} />
        <meta name="twitter:image" content={ogImage} />
      </Helmet>
    </ErrorBoundary>
  );
};

export default SEO;

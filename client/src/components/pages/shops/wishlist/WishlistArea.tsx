/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router-dom";
import { useDispatch } from "react-redux";
import UseWishlistInfo from "../../../../hooks/UseWishlistInfo";
import { removeFromWishlist } from "../../../../redux/features/wishlistSlice";

/* ── helpers ─────────────────────────────────────────────────── */
const getTitle    = (t: any) => t.heading?.en ?? t.title ?? "Tour";
const getImage    = (t: any) => t.images?.[0]?.url ?? t.gallery?.[0]?.url ?? t.thumb ?? "";
const getPrice    = (t: any): string | null => {
  const p = t.priceStartingFrom;
  if (p?.USD) return `From $${p.USD.toLocaleString()}`;
  if (p?.SAR) return `From ${p.SAR.toLocaleString()} SAR`;
  if (p?.EGP) return `From ${p.EGP.toLocaleString()} EGP`;
  if (t.price) return `From $${t.price}`;
  return null;
};
const getRating   = (t: any): number | null => t.averageRating ?? t.review ?? null;
const getLocation = (t: any) => t.tourLocation?.en ?? t.location ?? "";
const getDuration = (t: any) => t.duration?.en ?? t.time ?? "";
const getSlug     = (t: any) => t.slug?.en ?? t._id ?? t.id ?? "";

/* ── Card ─────────────────────────────────────────────────────── */
const TourCard = ({ item, onRemove }: { item: any; onRemove: () => void }) => {
  const title    = getTitle(item);
  const image    = getImage(item);
  const price    = getPrice(item);
  const rating   = getRating(item);
  const location = getLocation(item);
  const duration = getDuration(item);
  const slug     = getSlug(item);
  const to       = slug ? `/en/tour2/${slug}` : "#";

  return (
    <div style={{
      display: "flex",
      alignItems: "stretch",
      borderRadius: "20px",
      overflow: "hidden",
      background: "#fff",
      boxShadow: "0 2px 16px rgba(0,0,0,0.08)",
      marginBottom: "18px",
      minHeight: "140px",
    }}>
      {/* Image */}
      <div style={{ width: "200px", flexShrink: 0 }}>
        {image ? (
          <img src={image} alt={title} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }} />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#e8edf2", display: "flex", alignItems: "center", justifyContent: "center", minHeight: "140px" }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none"><path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0010 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="#c5cdd6"/></svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "20px 20px 16px", display: "flex", flexDirection: "column", gap: "6px", minWidth: 0 }}>

        {/* Title + rating */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "12px" }}>
          <div style={{ fontSize: "20px", fontWeight: 800, color: "#111", lineHeight: "1.25", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, flex: 1 }}>
            {title}
          </div>
          {rating !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: "5px", flexShrink: 0 }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="#f5a623"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              <span style={{ fontSize: "14px", fontWeight: 700, color: "#555" }}>{rating}/5</span>
            </div>
          )}
        </div>

        {/* Location + duration */}
        <div style={{ fontSize: "13px", color: "#888", lineHeight: "1.5", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
          {[location, duration].filter(Boolean).join(" · ")}
        </div>

        {/* Price + actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto", paddingTop: "8px" }}>
          <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--tg-theme-primary, #1a7c4a)" }}>
            {price}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <button
              onClick={onRemove}
              aria-label="Remove"
              style={{ background: "#f5f5f5", border: "none", borderRadius: "50%", width: "36px", height: "36px", cursor: "pointer", color: "#aaa", fontSize: "20px", display: "flex", alignItems: "center", justifyContent: "center", padding: 0 }}
            >×</button>
            <Link to={to} style={{ background: "#efefef", borderRadius: "50%", width: "40px", height: "40px", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Page ─────────────────────────────────────────────────────── */
const WishlistArea = () => {
  const { wishlistItems } = UseWishlistInfo();
  const dispatch = useDispatch();

  return (
    <div style={{ background: "#f2f4f7", minHeight: "60vh", padding: "80px 0 100px" }}>
      <div className="container">
        <div className="row">
          <div className="col-12">

            {/* Page title */}
            <div style={{ marginBottom: "32px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <span style={{ fontSize: "28px" }}>🧭</span>
                <h1 style={{ fontSize: "28px", fontWeight: 800, color: "#111", margin: 0 }}>Saved Tours</h1>
                {wishlistItems.length > 0 && (
                  <span style={{ background: "var(--tg-theme-primary, #1a7c4a)", color: "#fff", fontSize: "12px", fontWeight: 700, borderRadius: "20px", padding: "3px 12px" }}>
                    {wishlistItems.length}
                  </span>
                )}
              </div>
            </div>

            {/* Empty */}
            {wishlistItems.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 0 50px", background: "#fff", borderRadius: "20px", boxShadow: "0 2px 16px rgba(0,0,0,0.06)" }}>
                <svg width="64" height="64" viewBox="0 0 20 18" fill="none" style={{ display: "block", margin: "0 auto 16px", opacity: 0.18 }}>
                  <path d="M10.5167 16.3416C10.2334 16.4416 9.76675 16.4416 9.48341 16.3416C7.06675 15.5166 1.66675 12.075 1.66675 6.24165C1.66675 3.66665 3.74175 1.58331 6.30008 1.58331C7.81675 1.58331 9.15841 2.31665 10.0001 3.44998C10.8417 2.31665 12.1917 1.58331 13.7001 1.58331C16.2584 1.58331 18.3334 3.66665 18.3334 6.24165C18.3334 12.075 12.9334 15.5166 10.5167 16.3416Z" stroke="#333" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                <p style={{ fontSize: "16px", color: "#aaa", marginBottom: "20px", fontWeight: 500 }}>No saved tours yet</p>
                <Link to="/en/tour-grid-1" style={{ fontSize: "13px", fontWeight: 700, color: "#fff", background: "var(--tg-theme-primary, #1a7c4a)", padding: "10px 24px", borderRadius: "24px", textDecoration: "none" }}>
                  Explore Tours
                </Link>
              </div>
            ) : (
              <div style={{ maxWidth: "720px" }}>
                {wishlistItems.map((item: any) => (
                  <TourCard
                    key={item._id ?? item.id}
                    item={item}
                    onRemove={() => dispatch(removeFromWishlist(item))}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WishlistArea;

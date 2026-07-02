/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { useEffect, useState } from "react";
import { removeFromWishlist } from "../../../redux/features/wishlistSlice";
import type { RootState } from "../../../redux/store";

/* ── helpers: work with both API tours and legacy listing items ── */
const getTitle  = (t: any): string => t.heading?.en ?? t.title ?? "Tour";
const getImage  = (t: any): string => t.images?.[0]?.url ?? t.gallery?.[0]?.url ?? t.thumb ?? "";
const getPrice  = (t: any): string | null => {
  const p = t.priceStartingFrom;
  if (p?.USD)  return `From $${p.USD.toLocaleString()}`;
  if (p?.SAR)  return `From ${p.SAR.toLocaleString()} SAR`;
  if (p?.EGP)  return `From ${p.EGP.toLocaleString()} EGP`;
  if (t.price) return `From $${t.price}`;
  return null;
};
const getRating   = (t: any): number | null => t.averageRating ?? t.review ?? null;
const getLocation = (t: any): string => t.tourLocation?.en ?? t.location ?? "";
const getDuration = (t: any): string => t.duration?.en ?? t.time ?? "";
const getSlug     = (t: any): string => t.slug?.en ?? t._id ?? t.id ?? "";

/* ── SavedCard ─────────────────────────────────────────────────── */
const SavedCard = ({ item, onRemove }: { item: any; onRemove: () => void }) => {
  const title    = getTitle(item);
  const image    = getImage(item);
  const price    = getPrice(item);
  const rating   = getRating(item);
  const location = getLocation(item);
  const duration = getDuration(item);
  const slug     = getSlug(item);
  const to       = slug ? `/en/tour2/${slug}` : "/tour-details";

  return (
    <div style={{
      display: "flex",
      alignItems: "stretch",
      borderRadius: "16px",
      overflow: "hidden",
      background: "#fff",
      boxShadow: "0 2px 12px rgba(0,0,0,0.08)",
      marginBottom: "12px",
      minHeight: "120px",
    }}>

      {/* Image */}
      <div style={{ width: "115px", flexShrink: 0 }}>
        {image ? (
          <img
            src={image}
            alt={title}
            style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
          />
        ) : (
          <div style={{ width: "100%", height: "100%", background: "#e8edf2", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none"><path d="M21 16v-2l-8-5V3.5A1.5 1.5 0 0010 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z" fill="#c5cdd6"/></svg>
          </div>
        )}
      </div>

      {/* Content */}
      <div style={{ flex: 1, padding: "13px 12px 11px", minWidth: 0, display: "flex", flexDirection: "column", gap: "5px" }}>

        {/* Title + star */}
        <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "6px" }}>
          <div style={{
            fontSize: "14px", fontWeight: 800, color: "#111", lineHeight: "1.3",
            overflow: "hidden", display: "-webkit-box",
            WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const, flex: 1,
          }}>{title}</div>
          {rating !== null && (
            <div style={{ display: "flex", alignItems: "center", gap: "3px", flexShrink: 0 }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="#f5a623"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
              <span style={{ fontSize: "12px", fontWeight: 700, color: "#555" }}>{rating}/5</span>
            </div>
          )}
        </div>

        {/* Location / duration */}
        <div style={{ fontSize: "11.5px", color: "#888", lineHeight: "1.45", overflow: "hidden", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical" as const }}>
          {location || duration}
        </div>

        {/* Price + actions */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: "auto" }}>
          <div style={{ fontSize: "13px", fontWeight: 700, color: "var(--tg-theme-primary, #1a7c4a)" }}>
            {price}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
            <button
              onClick={onRemove}
              aria-label="Remove"
              style={{
                background: "#f5f5f5", border: "none", borderRadius: "50%",
                width: "30px", height: "30px", cursor: "pointer",
                color: "#aaa", fontSize: "17px",
                display: "flex", alignItems: "center", justifyContent: "center", padding: 0,
              }}
            >×</button>
            <Link to={to} style={{
              background: "#efefef", borderRadius: "50%",
              width: "34px", height: "34px",
              display: "flex", alignItems: "center", justifyContent: "center",
              textDecoration: "none",
            }}>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M13 6l6 6-6 6" stroke="#222" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

/* ── Dropdown ─────────────────────────────────────────────────── */
const HeaderWishlist = () => {
  const [mounted, setMounted] = useState(false);
  const wishlistItems = useSelector((state: RootState) => state.wishlist.wishlist);
  const dispatch = useDispatch();

  useEffect(() => { setMounted(true); }, []);
  if (!mounted) return null;

  return (
    <div className="minicart" style={{ width: "370px", maxHeight: "540px", overflowY: "auto", padding: "16px 14px 12px", background: "#f2f4f7" }}>

      {wishlistItems.length === 0 ? (
        <div style={{ textAlign: "center", padding: "32px 0 24px", background: "#fff", borderRadius: "16px" }}>
          <svg width="44" height="44" viewBox="0 0 20 18" fill="none" style={{ display: "block", margin: "0 auto 12px", opacity: 0.2 }}>
            <path d="M10.5167 16.3416C10.2334 16.4416 9.76675 16.4416 9.48341 16.3416C7.06675 15.5166 1.66675 12.075 1.66675 6.24165C1.66675 3.66665 3.74175 1.58331 6.30008 1.58331C7.81675 1.58331 9.15841 2.31665 10.0001 3.44998C10.8417 2.31665 12.1917 1.58331 13.7001 1.58331C16.2584 1.58331 18.3334 3.66665 18.3334 6.24165C18.3334 12.075 12.9334 15.5166 10.5167 16.3416Z" stroke="#333" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          <div style={{ fontSize: "13px", color: "#aaa", marginBottom: "14px", fontWeight: 500 }}>No saved tours yet</div>
          <Link to="/tour-grid-1" style={{ fontSize: "11px", fontWeight: 700, color: "#fff", background: "var(--tg-theme-primary, #1a7c4a)", padding: "8px 20px", borderRadius: "24px", textDecoration: "none" }}>
            Explore Tours
          </Link>
        </div>
      ) : (
        <>
          {wishlistItems.map((item: any) => (
            <SavedCard
              key={item._id ?? item.id}
              item={item}
              onRemove={() => dispatch(removeFromWishlist(item))}
            />
          ))}
          <div className="minicart-btn" style={{ marginTop: "6px" }}>
            <Link className="cart-btn" to="/wishlist"><span>View All Saved Tours</span></Link>
          </div>
        </>
      )}
    </div>
  );
};

export default HeaderWishlist;

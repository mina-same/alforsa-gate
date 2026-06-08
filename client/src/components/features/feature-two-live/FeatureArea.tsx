/* eslint-disable @typescript-eslint/no-explicit-any */
import { Link } from "react-router-dom";
import { useState, useEffect, useCallback, useRef } from "react";
import ReactPaginate from "react-paginate";
import FeatureTop from "./FeatureTop";
import FeatureSidebar from "./FeatureSidebar";
import { tourService, type TourListItem } from "../../../services/tourService";
import { useTranslation } from "react-i18next";

const ITEMS_PER_PAGE = 9;

export interface TourFilters {
  search: string;
  sort: "default" | "price_asc" | "price_desc";
  isFeatured?: boolean;
}

const FeatureArea = () => {
  const { i18n } = useTranslation();
  const lang = i18n.language?.startsWith("ar") ? "ar" : "en";

  const [tours, setTours] = useState<TourListItem[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isListView, setIsListView] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);

  const [filters, setFilters] = useState<TourFilters>({
    search: "",
    sort: "default",
    isFeatured: undefined,
  });

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchTours = useCallback(async (page: number, f: TourFilters) => {
    setLoading(true);
    setError(null);
    try {
      const params: any = { page: page + 1, limit: ITEMS_PER_PAGE };
      if (f.search)                   params.search     = f.search;
      if (f.isFeatured !== undefined) params.isFeatured = f.isFeatured;

      const result = await tourService.list(params);
      let sorted = [...result.tours];

      if (f.sort === "price_asc")  sorted.sort((a, b) => (a.priceStartingFrom?.EGP ?? 0) - (b.priceStartingFrom?.EGP ?? 0));
      if (f.sort === "price_desc") sorted.sort((a, b) => (b.priceStartingFrom?.EGP ?? 0) - (a.priceStartingFrom?.EGP ?? 0));

      setTours(sorted);
      setTotal(result.pagination.total);
      setTotalPages(result.pagination.pages);
    } catch (err: any) {
      setError(err?.response?.data?.message || "Failed to load tours");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => fetchTours(currentPage, filters), 300);
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
  }, [filters, currentPage, fetchTours]);

  const handleFiltersChange = (updated: Partial<TourFilters>) => {
    setCurrentPage(0);
    setFilters(prev => ({ ...prev, ...updated }));
  };

  const handlePageClick = ({ selected }: { selected: number }) => {
    setCurrentPage(selected);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const t = (obj: any) => obj?.[lang] || obj?.en || "";
  const startOffset = total === 0 ? 0 : currentPage * ITEMS_PER_PAGE + 1;
  const endOffset   = Math.min((currentPage + 1) * ITEMS_PER_PAGE, total);

  return (
    <div className="tg-listing-grid-area mb-85">
      <div className="container">
        <div className="row">
          <FeatureSidebar filters={filters} onFiltersChange={handleFiltersChange} />

          <div className="col-xl-9 col-lg-8">
            <div className="tg-listing-item-box-wrap ml-10">
              <FeatureTop
                startOffset={startOffset}
                endOffset={endOffset}
                totalItems={total}
                sort={filters.sort}
                onSortChange={(sort) => handleFiltersChange({ sort })}
                isListView={isListView}
                handleListViewClick={() => setIsListView(true)}
                handleGridViewClick={() => setIsListView(false)}
              />

              <div className="tg-listing-grid-item">
                {/* Loading */}
                {loading && (
                  <div className="text-center py-60">
                    <div className="spinner-border text-primary" role="status" />
                    <p className="mt-10 text-muted">Loading tours…</p>
                  </div>
                )}

                {/* Error */}
                {!loading && error && (
                  <div className="text-center py-60">
                    <i className="fas fa-exclamation-circle fa-2x text-danger mb-10" />
                    <p className="text-danger">{error}</p>
                    <button className="tg-btn tg-btn-primary mt-15" onClick={() => fetchTours(currentPage, filters)}>
                      Retry
                    </button>
                  </div>
                )}

                {/* Empty */}
                {!loading && !error && tours.length === 0 && (
                  <div className="text-center py-60">
                    <i className="fas fa-search fa-3x text-muted mb-20" style={{ display: "block" }} />
                    <p className="text-muted">No tours found. Try adjusting your filters.</p>
                    <button className="tg-btn mt-15" onClick={() => handleFiltersChange({ search: "", isFeatured: undefined, sort: "default" })}>
                      Clear Filters
                    </button>
                  </div>
                )}

                {/* Cards */}
                {!loading && !error && tours.length > 0 && (
                  <div className={`row list-card ${isListView ? "list-card-open" : ""}`}>
                    {tours.map((tour) => (
                      <TourCard key={tour._id} tour={tour} isListView={isListView} lang={lang} getText={t} />
                    ))}
                  </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                  <div className="tg-pagenation-wrap text-center mt-50 mb-30">
                    <nav>
                      <ReactPaginate
                        breakLabel="..."
                        nextLabel={<i className="p-btn">Next Page</i>}
                        onPageChange={handlePageClick}
                        pageRangeDisplayed={3}
                        pageCount={totalPages}
                        forcePage={currentPage}
                        previousLabel={<i className="p-btn">Previous Page</i>}
                        renderOnZeroPageCount={null}
                      />
                    </nav>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// ─────────────────────────────────────────────────────
// Tour Card component
// ─────────────────────────────────────────────────────
interface TourCardProps {
  tour: TourListItem;
  isListView: boolean;
  lang: string;
  getText: (obj: any) => string;
}

const TourCard = ({ tour, isListView, getText }: TourCardProps) => {
  const thumb = tour.images?.[0]?.url || "/assets/img/listing/placeholder.jpg";
  const slug  = tour.slug?.en || "";

  const price = tour.priceStartingFrom;
  const priceLabel = price?.EGP
    ? `${price.EGP.toLocaleString()} EGP`
    : price?.USD
    ? `$${price.USD.toLocaleString()}`
    : null;

  // List-view thumb: fixed size so image doesn't stretch
  const thumbStyle: React.CSSProperties = isListView
    ? { width: 260, minWidth: 260, height: 220, overflow: "hidden", borderRadius: 12 }
    : {};

  const imgStyle: React.CSSProperties = isListView
    ? { width: "100%", height: "100%", objectFit: "cover" }
    : {};

  return (
    <div className="col-xxl-4 col-xl-6 col-lg-6 col-md-6 tg-grid-full">
      <div className="tg-listing-card-item mb-30">

        {/* Thumb */}
        <div className="tg-listing-card-thumb fix mb-15 p-relative" style={thumbStyle}>
          <Link to={`/tour/${slug}`}>
            <img
              className="tg-card-border w-100"
              src={thumb}
              alt={getText(tour.heading)}
              style={imgStyle}
            />
            {tour.isFeatured && (
              <span className="tg-listing-item-price-discount shape-3">
                <svg width="12" height="14" viewBox="0 0 12 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6.60156 1L0.601562 8.2H6.00156L5.40156 13L11.4016 5.8H6.00156L6.60156 1Z" stroke="white" strokeWidth="0.857143" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Featured
              </span>
            )}
          </Link>
        </div>

        {/* Content */}
        <div className="tg-listing-main-content">
          <div className="tg-listing-card-content">

            {/* Title */}
            <h4 className="tg-listing-card-title mb-8">
              <Link to={`/tour/${slug}`}>{getText(tour.heading)}</Link>
            </h4>

            {/* Meta row: location + duration */}
            <div className="tg-listing-card-duration-tour mb-8">
              {(tour as any).tourLocation && (
                <span className="tg-listing-card-duration-map mb-5">
                  <svg width="13" height="16" viewBox="0 0 13 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12.3329 6.7071C12.3329 11.2324 6.55512 15.1111 6.55512 15.1111C6.55512 15.1111 0.777344 11.2324 0.777344 6.7071C0.777344 5.16402 1.38607 3.68414 2.46962 2.59302C3.55316 1.5019 5.02276 0.888916 6.55512 0.888916C8.08748 0.888916 9.55708 1.5019 10.6406 2.59302C11.7242 3.68414 12.3329 5.16402 12.3329 6.7071Z" stroke="currentColor" strokeWidth="1.15556" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M6.55512 8.64649C7.61878 8.64649 8.48105 7.7782 8.48105 6.7071C8.48105 5.636 7.61878 4.7677 6.55512 4.7677C5.49146 4.7677 4.6292 5.636 4.6292 6.7071C4.6292 7.7782 5.49146 8.64649 6.55512 8.64649Z" stroke="currentColor" strokeWidth="1.15556" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {getText((tour as any).tourLocation)}
                </span>
              )}
              {tour.duration && (
                <span className="tg-listing-card-duration-time">
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M8.00175 3.73329V7.99996L10.8462 9.42218M15.1128 8.00003C15.1128 11.9274 11.9291 15.1111 8.00174 15.1111C4.07438 15.1111 0.890625 11.9274 0.890625 8.00003C0.890625 4.07267 4.07438 0.888916 8.00174 0.888916C11.9291 0.888916 15.1128 4.07267 15.1128 8.00003Z" stroke="currentColor" strokeWidth="1.06667" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  {getText(tour.duration)}
                </span>
              )}
            </div>

            {/* Tags: tour type + availability */}
            {((tour as any).tourType || (tour as any).tourAvailability) && (
              <div className="d-flex flex-wrap gap-1 mb-8" style={{ gap: 6 }}>
                {(tour as any).tourType && (
                  <span style={{ fontSize: 11, background: "#f0f4ff", color: "#3a5bd9", borderRadius: 20, padding: "2px 10px", fontWeight: 500 }}>
                    {getText((tour as any).tourType)}
                  </span>
                )}
                {(tour as any).tourAvailability && (
                  <span style={{ fontSize: 11, background: "#f0fff4", color: "#2d7a4f", borderRadius: 20, padding: "2px 10px", fontWeight: 500 }}>
                    {getText((tour as any).tourAvailability)}
                  </span>
                )}
              </div>
            )}

            {/* List-view extra: description snippet */}
            {isListView && (tour as any).Description?.text && (
              <p style={{ fontSize: 13, color: "#666", marginBottom: 8, lineHeight: 1.5 }}
                dangerouslySetInnerHTML={{
                  __html: (getText((tour as any).Description.text) || "").replace(/<[^>]*>/g, "").slice(0, 140) + "…"
                }}
              />
            )}
          </div>

          {/* Price + view count */}
          <div className="tg-listing-card-price d-flex align-items-end justify-content-between">
            <div className="tg-listing-card-price-wrap price-bg d-flex align-items-center">
              {priceLabel ? (
                <span className="tg-listing-card-currency-amount mr-5">
                  <span style={{ fontSize: 11, fontWeight: 400, opacity: 0.7 }}>From </span>
                  <span className="currency-symbol">{priceLabel}</span>
                </span>
              ) : (
                <span className="tg-listing-card-currency-amount mr-5" style={{ opacity: 0.5 }}>Price on request</span>
              )}
              <span className="tg-listing-card-activity-person">/Person</span>
            </div>
            <div className="tg-listing-card-review space">
              <span className="tg-listing-rating-icon">
                <i className="fa-sharp fa-solid fa-eye" style={{ fontSize: 13 }}></i>
              </span>
              <span className="tg-listing-rating-percent">
                {(tour as any).viewCount ?? 0} views
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureArea;

import { useState } from "react";
import { type TourFilters } from "./FeatureArea";

interface Props {
  filters: TourFilters;
  onFiltersChange: (updated: Partial<TourFilters>) => void;
}

const FeatureSidebar = ({ filters, onFiltersChange }: Props) => {
  const [searchInput, setSearchInput] = useState(filters.search);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    onFiltersChange({ search: searchInput });
  };

  return (
    <div className="col-xl-3 col-lg-4 order-last order-lg-first">
      <div className="tg-filter-sidebar mb-40 top-sticky">
        <div className="tg-filter-item">

          {/* ── Search ── */}
          <h4 className="tg-filter-title mb-15">Search Tours</h4>
          <form onSubmit={handleSearch}>
            <div style={{ display: "flex", gap: 6 }}>
              <input
                type="text"
                className="form-control"
                placeholder="Search tours…"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                style={{ flex: 1, borderRadius: 6, padding: "8px 12px", border: "1px solid #e0e0e0", fontSize: 14 }}
              />
              <button type="submit" className="tg-btn" style={{ padding: "8px 14px", borderRadius: 6 }}>
                <i className="fas fa-search" />
              </button>
            </div>
            {filters.search && (
              <button
                type="button"
                onClick={() => { setSearchInput(""); onFiltersChange({ search: "" }); }}
                style={{ background: "none", border: "none", color: "#888", fontSize: 12, cursor: "pointer", marginTop: 5 }}
              >
                ✕ Clear search
              </button>
            )}
          </form>

          <span className="tg-filter-border mt-25 mb-25" />

          {/* ── Filter By ── */}
          <h4 className="tg-filter-title mb-15">Filter By</h4>
          <div className="tg-filter-list">
            <ul>
              <li>
                <div className="checkbox d-flex">
                  <input
                    className="tg-checkbox"
                    type="checkbox"
                    id="filter-featured"
                    checked={filters.isFeatured === true}
                    onChange={(e) => onFiltersChange({ isFeatured: e.target.checked ? true : undefined })}
                  />
                  <label className="tg-label" htmlFor="filter-featured">
                    ⚡ Featured Tours Only
                  </label>
                </div>
              </li>
            </ul>
          </div>

          <span className="tg-filter-border mt-25 mb-25" />

          {/* ── Reset ── */}
          <button
            type="button"
            onClick={() => { setSearchInput(""); onFiltersChange({ search: "", sort: "default", isFeatured: undefined }); }}
            className="tg-btn w-100"
            style={{ padding: "10px", borderRadius: 6, width: "100%" }}
          >
            Reset All Filters
          </button>

        </div>
      </div>
    </div>
  );
};

export default FeatureSidebar;

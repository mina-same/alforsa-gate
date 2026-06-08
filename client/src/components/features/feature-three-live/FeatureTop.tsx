import NiceSelect from "../../../ui/NiceSelect";
import { type TourFilters } from "./FeatureArea";

interface Props {
  startOffset: number;
  endOffset: number;
  totalItems: number;
  sort: TourFilters["sort"];
  onSortChange: (sort: TourFilters["sort"]) => void;
  isListView: boolean;
  handleListViewClick: () => void;
  handleGridViewClick: () => void;
}

const sortOptions = [
  { value: "default",    text: "Default (Newest)" },
  { value: "price_asc",  text: "Price: Low → High" },
  { value: "price_desc", text: "Price: High → Low" },
];

const FeatureTop = ({
  startOffset, endOffset, totalItems,
  sort, onSortChange,
  isListView, handleListViewClick, handleGridViewClick,
}: Props) => {
  const currentIndex = sortOptions.findIndex(o => o.value === sort);

  return (
    <div className="tg-listing-box-filter mb-15">
      <div className="row align-items-center">
        <div className="col-lg-5 col-md-5 mb-15">
          <div className="tg-listing-box-number-found">
            <span>
              {totalItems === 0
                ? "No tours found"
                : `Showing ${startOffset}–${endOffset} of ${totalItems} tours`}
            </span>
          </div>
        </div>

        <div className="col-lg-7 col-md-7 mb-15">
          <div className="tg-listing-box-view-type d-flex justify-content-end align-items-center">
            <div className="tg-listing-sort"><span>Sort by:</span></div>
            <div className="tg-listing-select-price ml-10">
              <NiceSelect
                className="select"
                options={sortOptions}
                defaultCurrent={currentIndex >= 0 ? currentIndex : 0}
                onChange={(item) => onSortChange(item.value as TourFilters["sort"])}
                name=""
                placeholder=""
              />
            </div>
            <div className="d-none d-sm-block">
              <div className="tg-listing-box-view ml-10 d-flex">
                <div className="list-switch-item">
                  <button className={`grid-view ${!isListView ? "active" : ""}`} onClick={handleGridViewClick}>
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <path d="M8 1H1V8H8V1Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19 1H12V8H19V1Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M19 12H12V19H19V12Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                      <path d="M8 12H1V19H8V12Z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
                <div className="list-switch-item ml-5">
                  <button className={`list-view ${isListView ? "active" : ""}`} onClick={handleListViewClick}>
                    <svg width="20" height="14" viewBox="0 0 20 14" fill="none">
                      <path d="M6 1H19M6 7H19M6 13H19M1 1H1.01M1 7H1.01M1 13H1.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeatureTop;

import Review from '../feature-details-one/about/Review';
import ReviewDetails from '../feature-details-one/about/ReviewDetails';
import ReviewFormArea from '../feature-details-one/about/ReviewFormArea';
import FeatureList from '../feature-details-one/FeatureList';
import FeatureSidebar from '../feature-details-one/FeatureSidebar';
import AboutSlider from './about/AboutSlider';
import AboutText from './about/AboutText';
import Amenities from './about/Amenities';
import ItinerarySection from './about/ItinerarySection';
import WhatToPackSection from './about/WhatToPackSection';
import PricingPlansSection from './about/PricingPlansSection';
import NotesSection from './about/NotesSection';
import FAQSection from './about/FAQSection';
import TourDocumentsSection from './about/TourDocumentsSection';
import TagsSection from './about/TagsSection';
import CancellationPolicySection from './about/CancellationPolicySection';
import RelatedToursSection from './about/RelatedToursSection';
import { useTranslation } from 'react-i18next';
import { useTourDetails } from '../../../hooks/useTourDetails';
import { getLang } from '../../../utils/getLang';

const TourAboutDetails = () => {
  const { tour, lang } = useTourDetails();
  const { t } = useTranslation();

  return (
    <div className="tg-tour-about-area">
      <div className="container">
        <div className="row">
          {/* ── Left column ── */}
          <div className="col-xl-9 col-lg-8">
            <div className="tg-tour-about-wrap mr-55">

              {/* 1. Image gallery */}
              <AboutSlider />

              {/* 2. Quick feature list (duration, type, group, etc.) */}
              <div className="tg-tour-details-feature-list-wrap mb-30">
                <div className="row align-items-center">
                  <div className="col-lg-12">
                    <div className="tg-tour-details-video-feature-list tg-tour-details-video-feature-2-list">
                      <FeatureList />
                    </div>
                  </div>
                </div>
              </div>

              {/* 3. Description + Highlights + What You'll Love */}
              <div className="tg-tour-about-content tg-tour-about-2-content">
                <AboutText />

                {/* 4. Day-by-day itinerary accordion */}
                <ItinerarySection />

                {/* 5. Included / Not Included */}
                <div className="tg-tour-about-border mb-40"></div>
                <Amenities />

                {/* 6. What to Pack */}
                <div className="tg-tour-about-border mb-40"></div>
                <WhatToPackSection />

                {/* 7. Pricing plans table */}
                <PricingPlansSection />

                {/* 8. Important notes */}
                <NotesSection />

                {/* 9. Cancellation policy */}
                <CancellationPolicySection />

                {/* 10. Map */}
                <div className="tg-tour-about-map tg-tour-about-2-inner mb-40">
                  <h4 className="tg-tour-about-title mb-15">
                    <i className="fa-solid fa-location-dot mr-10 tg-tour-section-title-icon"></i>
                    {t('tour.sections.location')}
                  </h4>
                  {tour?.meetingPoint && (
                    <p className="lh-28 mb-15">{getLang(tour.meetingPoint, lang)}</p>
                  )}
                  {tour?.tourMapIframe && (
                    <div className="tg-tour-about-map h-100">
                      <iframe
                        src={tour.tourMapIframe}
                        width="600"
                        height="450"
                        style={{ border: 0 }}
                        loading="lazy"
                        title="Tour map"
                      />
                    </div>
                  )}
                </div>

                {/* 10. Documents */}
                <TourDocumentsSection />

                {/* 11. Tags */}
                <TagsSection />

                {/* 12. Rating overview */}
                <Review />
                <div className="tg-tour-about-border mb-35"></div>

                {/* 13. Customer review cards */}
                <ReviewDetails />
                <div className="tg-tour-about-border mb-35"></div>

                {/* 14. FAQ accordion */}
                <FAQSection />
                <div className="tg-tour-about-border mb-45"></div>

                {/* 15. Leave a review form */}
                <ReviewFormArea />

                {/* 16. Related tours */}
                <div className="tg-tour-about-border mb-45"></div>
                <RelatedToursSection />
              </div>
            </div>
          </div>

          {/* ── Right sticky sidebar ── */}
          <div className="col-xl-3 col-lg-4">
            <div className="tg-tour-about-sidebar top-sticky mb-50">
              <FeatureSidebar />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourAboutDetails;

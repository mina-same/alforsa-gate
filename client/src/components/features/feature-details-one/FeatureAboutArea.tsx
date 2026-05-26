import AboutText from './about/AboutText';
import Faq from './about/Faq';
import Included from './about/Included';
import Review from './about/Review';
import ReviewDetails from './about/ReviewDetails';
import ReviewFormArea from './about/ReviewFormArea';
import FeatureSidebar from './FeatureSidebar';
import WhatToPackSection from '../feature-details-two/about/WhatToPackSection';
import PricingPlansSection from '../feature-details-two/about/PricingPlansSection';
import NotesSection from '../feature-details-two/about/NotesSection';
import FAQSection from '../feature-details-two/about/FAQSection';
import TourDocumentsSection from '../feature-details-two/about/TourDocumentsSection';
import TagsSection from '../feature-details-two/about/TagsSection';
import CancellationPolicySection from '../feature-details-two/about/CancellationPolicySection';
import RelatedToursSection from '../feature-details-two/about/RelatedToursSection';
import { useTranslation } from 'react-i18next';
import { useTourDetails } from '../../../hooks/useTourDetails';
import { getLang } from '../../../utils/getLang';

const FeatureAboutArea = () => {
  const { tour, lang } = useTourDetails();
  const { t } = useTranslation();

  return (
    <div className="tg-tour-about-area tg-tour-about-border pt-40 pb-70">
      <div className="container">
        <div className="row">
          <div className="col-xl-9 col-lg-8">
            <div className="tg-tour-about-wrap mr-55">
              <div className="tg-tour-about-content">

                {/* 1. Description + Highlights + What You'll Love */}
                <AboutText />
                <div className="tg-tour-about-border mb-40"></div>

                {/* 2. Included / Excluded */}
                <Included />
                <div className="tg-tour-about-border mb-40"></div>

                {/* 3. Day-by-day itinerary */}
                <Faq />
                <div className="tg-tour-about-border mb-40"></div>

                {/* 4. What to Pack */}
                <WhatToPackSection />

                {/* 5. Pricing plans */}
                <PricingPlansSection />

                {/* 6. Important notes */}
                <NotesSection />

                {/* 7. Cancellation policy */}
                <CancellationPolicySection />
                <div className="tg-tour-about-border mb-40"></div>

                {/* 8. Map */}
                <div className="tg-tour-about-map mb-40">
                  <h4 className="tg-tour-about-title mb-15">{t('tour.sections.location')}</h4>
                  {tour?.meetingPoint && (
                    <p className="text-capitalize lh-28">
                      {getLang(tour.meetingPoint, lang)}
                    </p>
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
                <div className="tg-tour-about-border mb-40"></div>

                {/* 9. Documents */}
                <TourDocumentsSection />

                {/* 10. Tags */}
                <TagsSection />

                {/* 11. Rating overview */}
                <Review />
                <div className="tg-tour-about-border mb-35"></div>

                {/* 12. Customer review cards */}
                <ReviewDetails />
                <div className="tg-tour-about-border mb-35"></div>

                {/* 13. FAQ accordion */}
                <FAQSection />
                <div className="tg-tour-about-border mb-45"></div>

                {/* 14. Leave a review form */}
                <ReviewFormArea />

                {/* 15. Related tours */}
                <div className="tg-tour-about-border mb-45"></div>
                <RelatedToursSection />

              </div>
            </div>
          </div>
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

export default FeatureAboutArea;

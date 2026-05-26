import FeatureDetailsTwo from '../components/features/feature-details-two';
import SEO from '../components/SEO';
import Wrapper from '../layouts/Wrapper';
import { TourDetailsProvider, useTourDetailsCtx } from '../context/TourDetailsContext';
import { getLang } from '../utils/getLang';

const TourSEO = () => {
  const { tour, lang } = useTourDetailsCtx();
  const title = tour ? getLang(tour.heading, lang) : 'Tour Details';
  return <SEO pageTitle={title} />;
};

const TourDetailsTwoMain = () => {
  return (
    <TourDetailsProvider>
      <Wrapper>
        <TourSEO />
        <FeatureDetailsTwo />
      </Wrapper>
    </TourDetailsProvider>
  );
};

export default TourDetailsTwoMain;

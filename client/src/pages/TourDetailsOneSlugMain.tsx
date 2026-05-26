import FeatureDetailsOne from '../components/features/feature-details-one';
import SEO from '../components/SEO';
import Wrapper from '../layouts/Wrapper';
import { TourDetailsProvider, useTourDetailsCtx } from '../context/TourDetailsContext';
import { getLang } from '../utils/getLang';

const TourSEO = () => {
  const { tour, lang } = useTourDetailsCtx();
  const title = tour ? getLang(tour.heading, lang) : 'Tour Details';
  return <SEO pageTitle={title} />;
};

const TourDetailsOneSlugMain = () => {
  return (
    <TourDetailsProvider>
      <Wrapper>
        <TourSEO />
        <FeatureDetailsOne />
      </Wrapper>
    </TourDetailsProvider>
  );
};

export default TourDetailsOneSlugMain;

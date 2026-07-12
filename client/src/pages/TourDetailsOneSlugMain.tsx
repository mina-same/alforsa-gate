import FeatureDetailsOne from '../components/features/feature-details-one';
import SEO from '../components/SEO';
import Wrapper from '../layouts/Wrapper';
import { TourDetailsProvider, useTourDetailsCtx } from '../context/TourDetailsContext';
import { getLang } from '../utils/getLang';

const TourSEO = () => {
  const { tour, lang } = useTourDetailsCtx();
  const title = tour ? getLang(tour.heading, lang) : 'Tour Details';
  const description = tour ? getLang(tour.headingDescription, lang) || undefined : undefined;
  const image = tour?.images?.[0]?.url;
  return <SEO pageTitle={title} description={description} image={image} />;
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

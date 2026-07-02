import BreadCrumb from './BreadCrumb';
import TourDetailsArea from './TourDetailsArea';
import TourAboutDetails from './TourAboutDetails';
import Listing from './Listing';
import HeaderFour from '../../../layouts/headers/HeaderFour';
import TourDetailSkeleton from '../../ui/TourDetailSkeleton';
import { useTourDetails } from '../../../hooks/useTourDetails';
import FooterThree from '@/layouts/footers/FooterThree';

const FeatureDetailsTwo = () => {
  const { loading, error } = useTourDetails();

  return (
    <>
      <HeaderFour />
      <main>
        {loading ? (
          <TourDetailSkeleton />
        ) : error ? (
          <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ textAlign: 'center' }}>
              <h3 style={{ color: '#ef4444' }}>Tour Not Found</h3>
              <p style={{ color: '#666' }}>The tour you are looking for does not exist or is no longer available.</p>
              <a href="/en/tour-grid-1" className="tg-btn tg-btn-switch-animation mt-15">Browse Tours</a>
            </div>
          </div>
        ) : (
          <>
            <BreadCrumb />
            <TourDetailsArea />
            <TourAboutDetails />
            <Listing />
          </>
        )}
      </main>
      <FooterThree />
    </>
  );
};

export default FeatureDetailsTwo;

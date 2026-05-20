import { Route, BrowserRouter as Router, Routes } from 'react-router-dom';
import AdminDashboardMain from '../pages/AdminDashboardMain';
import HomeOneMain from '../pages/HomeOneMain';
import HomeTwoMain from '../pages/HomeTwoMain';
import HomeThreeMain from '../pages/HomeThreeMain';
import HomeFourMain from '../pages/HomeFourMain';
import HomeFiveMain from '../pages/HomeFiveMain';
import HomeSixMain from '../pages/HomeSixMain';
import HomeSevenMain from '../pages/HomeSevenMain';
import HotelGridMain from '../pages/HotelGridMain';
import HotelGridTwoMain from '../pages/HotelGridTwoMain';
import HotelListingMain from '../pages/HotelListingMain';
import TourGridOneMain from '../pages/TourGridOneMain';
import TourDetailsOneMain from '../pages/TourDetailsOneMain';
import TourDetailsTwoMain from '../pages/TourDetailsTwoMain';
import AboutMain from '../pages/AboutMain';
import TeamMain from '../pages/TeamMain';
import TeamDetailsMain from '../pages/TeamDetailsMain';
import ShopMain from '../pages/ShopMain';
import ShopDetailsMain from '../pages/ShopDetailsMain';
import CartMain from '../pages/CartMain';
import WishlistMain from '../pages/WishlistMain';
import CheckoutMain from '../pages/CheckoutMain';
import PricingMain from '../pages/PricingMain';
import FaqMain from '../pages/FaqMain';
import LogInMain from '../pages/LogInMain';
import RegisterMain from '../pages/RegisterMain';
import BlogOneMain from '../pages/BlogOneMain';
import BlogTwoMain from '../pages/BlogTwoMain';
import BlogDetailsMain from '../pages/BlogDetailsMain';
import ContactMain from '../pages/ContactMain';
import ErrorMain from '../pages/ErrorMain';

const localizedRoutes = [
  { path: '/', element: <HomeOneMain /> },
  { path: '/home-two', element: <HomeTwoMain /> },
  { path: '/home-three', element: <HomeThreeMain /> },
  { path: '/home-four', element: <HomeFourMain /> },
  { path: '/home-five', element: <HomeFiveMain /> },
  { path: '/home-six', element: <HomeSixMain /> },
  { path: '/home-seven', element: <HomeSevenMain /> },
  { path: '/hotel-grid', element: <HotelGridMain /> },
  { path: '/tour-grid-1', element: <HotelGridTwoMain /> },
  { path: '/tour-grid-2', element: <TourGridOneMain /> },
  { path: '/map-listing', element: <HotelListingMain /> },
  { path: '/tour-details', element: <TourDetailsOneMain /> },
  { path: '/tour-details-2', element: <TourDetailsTwoMain /> },
  { path: '/about', element: <AboutMain /> },
  { path: '/team', element: <TeamMain /> },
  { path: '/team-details', element: <TeamDetailsMain /> },
  { path: '/shop', element: <ShopMain /> },
  { path: '/shop-details', element: <ShopDetailsMain /> },
  { path: '/cart', element: <CartMain /> },
  { path: '/wishlist', element: <WishlistMain /> },
  { path: '/checkout', element: <CheckoutMain /> },
  { path: '/pricing', element: <PricingMain /> },
  { path: '/faq', element: <FaqMain /> },
  { path: '/login', element: <LogInMain /> },
  { path: '/register', element: <RegisterMain /> },
  { path: '/blog-grid', element: <BlogOneMain /> },
  { path: '/blog-standard', element: <BlogTwoMain /> },
  { path: '/blog-details', element: <BlogDetailsMain /> },
  { path: '/contact', element: <ContactMain /> },
];

const AppNavigation = () => {
  return (
    <Router>
      <Routes>
        <Route path="/admin" element={<AdminDashboardMain />} />
        {localizedRoutes.map(({ path, element }) => (
          <Route key={path} path={path} element={element} />
        ))}
        {localizedRoutes.map(({ path, element }) => (
          <Route key={`/ar${path}`} path={`/ar${path === '/' ? '' : path}`} element={element} />
        ))}
        <Route path="*" element={<ErrorMain />} />
      </Routes>
    </Router>
  );
};

export default AppNavigation;

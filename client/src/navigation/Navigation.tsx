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

const AppNavigation = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomeOneMain />} />
        <Route path="/admin" element={<AdminDashboardMain />} />
        <Route path="/home-two" element={<HomeTwoMain />} />
        <Route path="/home-three" element={<HomeThreeMain />} />
        <Route path="/home-four" element={<HomeFourMain />} />
        <Route path="/home-five" element={<HomeFiveMain />} />
        <Route path="/home-six" element={<HomeSixMain />} />
        <Route path="/home-seven" element={<HomeSevenMain />} />
        <Route path="/hotel-grid" element={<HotelGridMain />} />
        <Route path="/tour-grid-1" element={<HotelGridTwoMain />} />
        <Route path="/tour-grid-2" element={<TourGridOneMain />} />
        <Route path="/map-listing" element={<HotelListingMain />} />
        <Route path="/tour-details" element={<TourDetailsOneMain />} />
        <Route path="/tour-details-2" element={<TourDetailsTwoMain />} />
        <Route path="/about" element={<AboutMain />} />
        <Route path="/team" element={<TeamMain />} />
        <Route path="/team-details" element={<TeamDetailsMain />} />
        <Route path="/shop" element={<ShopMain />} />
        <Route path="/shop-details" element={<ShopDetailsMain />} />
        <Route path="/cart" element={<CartMain />} />
        <Route path="/wishlist" element={<WishlistMain />} />
        <Route path="/checkout" element={<CheckoutMain />} />
        <Route path="/pricing" element={<PricingMain />} />
        <Route path="/faq" element={<FaqMain />} />
        <Route path="/login" element={<LogInMain />} />
        <Route path="/register" element={<RegisterMain />} />
        <Route path="/blog-grid" element={<BlogOneMain />} />
        <Route path="/blog-standard" element={<BlogTwoMain />} />
        <Route path="/blog-details" element={<BlogDetailsMain />} />
        <Route path="/contact" element={<ContactMain />} />
        <Route path="*" element={<ErrorMain />} />
      </Routes>
    </Router>
  );
};

export default AppNavigation;

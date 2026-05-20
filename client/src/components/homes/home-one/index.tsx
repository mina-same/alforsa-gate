import Banner from "./Banner"
import Location from "./Location"
import About from "./About"
import Listing from "./Listing"
import Ads from "./Ads"
import Process from "./Process"
import Testimonial from "./Testimonial"
import Blog from "./Blog"
import Cta from "./Cta"
import HeaderOne from "../../../layouts/headers/HeaderOne"
import FooterOne from "../../../layouts/footers/FooterOne"

const HomeOne = () => {
   return (
      <>
         <HeaderOne />
         <main>
            <Banner />
            <Location />
            <About />
            <Listing />
            <Ads />
            <Process />
            <Testimonial />
            <Blog style={false} />
            <Cta />
         </main>
         <FooterOne />
      </>
   )
}

export default HomeOne

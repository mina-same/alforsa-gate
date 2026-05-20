import Hero from "./Hero"
import Brand from "./Brand"
import Destination from "./Destination"
import Listing from "./Listing"
import Process from "./Process"
import Counter from "../home-two/Counter"
import Testimonial from "./Testimonial"
import Blog from "./Blog"
import Cta from "./Cta"
import CtaTwo from "../home-one/Cta"
import HeaderFour from "../../../layouts/headers/HeaderFour"
import BannerFormFour from "../../common/banner-form/BannerFormFour"
import FooterThree from "../../../layouts/footers/FooterThree"

const HomeFour = () => {
  return (
    <>
      <HeaderFour />
      <main>
        <Hero />
        <BannerFormFour />
        <Brand />
        <Destination />
        <Cta />
        <Listing />
        <Process />
        <Counter />
        <Testimonial style={false} />
        <Blog />
        <CtaTwo />
      </main>
      <FooterThree />
    </>
  )
}

export default HomeFour

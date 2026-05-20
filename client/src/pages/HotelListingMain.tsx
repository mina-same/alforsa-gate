import FeatureFour from "../components/features/feature-four"
import SEO from "../components/SEO"
import Wrapper from "../layouts/Wrapper"

const HotelListingMain = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Hotel Listing'} />
         <FeatureFour />
      </Wrapper>
   )
}

export default HotelListingMain

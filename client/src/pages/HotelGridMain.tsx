import FeatureOne from "../components/features/feature-one"
import SEO from "../components/SEO"
import Wrapper from "../layouts/Wrapper"

const HotelGridMain = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Hotel Grid'} />
         <FeatureOne />
      </Wrapper>
   )
}

export default HotelGridMain

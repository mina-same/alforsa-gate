import Pricing from "../components/pages/pricing"
import SEO from "../components/SEO"
import Wrapper from "../layouts/Wrapper"

const PricingMain = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Pricing'} />
         <Pricing />
      </Wrapper>
   )
}

export default PricingMain

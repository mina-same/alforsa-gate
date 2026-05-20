import HomeSix from "../components/homes/home-six"
import SEO from "../components/SEO"
import Wrapper from "../layouts/Wrapper"

const HomeSixMain = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Home Six'} />
         <HomeSix />
      </Wrapper>
   )
}

export default HomeSixMain

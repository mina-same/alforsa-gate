import HomeOne from "../components/homes/home-one"
import SEO from "../components/SEO"
import Wrapper from "../layouts/Wrapper"

const HomeOneMain = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Home One'} />
         <HomeOne />
      </Wrapper>
   )
}

export default HomeOneMain

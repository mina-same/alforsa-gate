import HomeFive from "../components/homes/home-five"
import SEO from "../components/SEO"
import Wrapper from "../layouts/Wrapper"

const HomeFiveMain = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Home Five'} />
         <HomeFive />
      </Wrapper>
   )
}

export default HomeFiveMain

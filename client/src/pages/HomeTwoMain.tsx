import Wrapper from '../layouts/Wrapper'
import SEO from '../components/SEO'
import HomeTwo from '../components/homes/home-two'

const HomeTwoMain = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Home Two'} />
         <HomeTwo />
      </Wrapper>
   )
}

export default HomeTwoMain

import Faq from "../components/pages/faq"
import SEO from "../components/SEO"
import Wrapper from "../layouts/Wrapper"

const FaqMain = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Faq'} />
         <Faq />
      </Wrapper>
   )
}

export default FaqMain

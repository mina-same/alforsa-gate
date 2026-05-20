import NotFound from "../components/pages/error"
import SEO from "../components/SEO"
import Wrapper from "../layouts/Wrapper"

const ErrorMain = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'404 ||'} />
         <NotFound />
      </Wrapper>
   )
}

export default ErrorMain

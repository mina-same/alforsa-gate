import About from "../components/pages/about"
import SEO from "../components/SEO"
import Wrapper from "../layouts/Wrapper"

const BlogDetailsMain = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Blog Details'} />
         <About />
      </Wrapper>
   )
}

export default BlogDetailsMain

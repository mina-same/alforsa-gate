import Register from "../components/pages/register"
import SEO from "../components/SEO"
import Wrapper from "../layouts/Wrapper"

const RegisterMain = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Register'} />
         <Register />
      </Wrapper>
   )
}

export default RegisterMain

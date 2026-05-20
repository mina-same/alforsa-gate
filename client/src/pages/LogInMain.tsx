import Login from "../components/pages/login"
import SEO from "../components/SEO"
import Wrapper from "../layouts/Wrapper"

const LogInMain = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'LogIn'} />
         <Login />
      </Wrapper>
   )
}

export default LogInMain

import { Navigate } from "react-router-dom"
import Login from "../components/pages/login"
import SEO from "../components/SEO"
import Wrapper from "../layouts/Wrapper"
import { useAuth } from "../context/AuthContext"

const LogInMain = () => {
   const { user, loading } = useAuth()

   if (loading) return null
   if (user) return <Navigate to="/admin" replace />

   return (
      <Wrapper>
         <SEO pageTitle={'LogIn'} />
         <Login />
      </Wrapper>
   )
}

export default LogInMain

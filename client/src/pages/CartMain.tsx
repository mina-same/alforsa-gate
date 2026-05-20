import Cart from "../components/pages/shops/cart"
import SEO from "../components/SEO"
import Wrapper from "../layouts/Wrapper"

const CartMain = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Cart'} />
         <Cart />
      </Wrapper>
   )
}

export default CartMain

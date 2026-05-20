import Wishlist from "../components/pages/shops/wishlist"
import SEO from "../components/SEO"
import Wrapper from "../layouts/Wrapper"

const WishlistMain = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Wishlist'} />
         <Wishlist />
      </Wrapper>
   )
}

export default WishlistMain

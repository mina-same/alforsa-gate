import ShopDetails from "../components/pages/shops/shop-details"
import SEO from "../components/SEO"
import Wrapper from "../layouts/Wrapper"

const ShopDetailsMain = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Shop Details'} />
         <ShopDetails />
      </Wrapper>
   )
}

export default ShopDetailsMain

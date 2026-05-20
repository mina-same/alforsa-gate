import Shop from "../components/pages/shops/shop"
import SEO from "../components/SEO"
import Wrapper from "../layouts/Wrapper"

const ShopMain = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Shop'} />
         <Shop />
      </Wrapper>
   )
}

export default ShopMain

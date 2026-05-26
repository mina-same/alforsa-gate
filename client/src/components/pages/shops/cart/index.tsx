import FooterSix from "../../../../layouts/footers/FooterSix"
import HeaderFour from "../../../../layouts/headers/HeaderFour"
import BreadCrumb from "../../../common/BreadCrumb"
import CartArea from "./CartArea"

const Cart = () => {
   return (
      <>
         <HeaderFour />
         <main>
            <BreadCrumb title="Cart Page" sub_title="Cart" />
            <CartArea />
         </main>
         <FooterSix />
      </>
   )
}

export default Cart

import FooterSix from "../../../../layouts/footers/FooterSix"
import HeaderFour from "../../../../layouts/headers/HeaderFour"
import BreadCrumb from "../../../common/BreadCrumb"
import CheckoutArea from "./CheckoutArea"

const Checkout = () => {
   return (
      <>
         <HeaderFour />
         <main>
            <BreadCrumb title="Checkout Page" sub_title="Checkout Page" />
            <CheckoutArea />
         </main>
         <FooterSix />
      </>
   )
}

export default Checkout

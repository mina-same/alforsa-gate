import FooterSix from "../../../../layouts/footers/FooterSix"
import HeaderFour from "../../../../layouts/headers/HeaderFour"
import BreadCrumb from "../../../common/BreadCrumb"
import ShopDetailsArea from "./ShopDetailsArea"
import ShopDetailsTabArea from "./ShopDetailsTabArea"

const ShopDetails = () => {
   return (
      <>
         <HeaderFour />
         <main>
            <BreadCrumb title="Shop Details" sub_title="Bluetooth Headphone" />
            <ShopDetailsArea />
            <ShopDetailsTabArea />
         </main>
         <FooterSix />
      </>
   )
}

export default ShopDetails

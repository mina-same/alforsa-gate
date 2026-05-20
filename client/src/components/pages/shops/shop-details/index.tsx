import FooterSix from "../../../../layouts/footers/FooterSix"
import HeaderThree from "../../../../layouts/headers/HeaderThree"
import BreadCrumb from "../../../common/BreadCrumb"
import ShopDetailsArea from "./ShopDetailsArea"
import ShopDetailsTabArea from "./ShopDetailsTabArea"

const ShopDetails = () => {
   return (
      <>
         <HeaderThree />
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

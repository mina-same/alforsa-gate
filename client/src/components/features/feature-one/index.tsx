import FeatureArea from "./FeatureArea"
import BreadCrumb from "./BreadCrumb"
import HeaderSix from "../../../layouts/headers/HeaderSix"
import FooterSix from "../../../layouts/footers/FooterSix"
import HeaderFour from "../../../layouts/headers/HeaderFour"

const FeatureOne = () => {
   return (
      <>
         <HeaderFour />
         <main>
            <BreadCrumb />
            <FeatureArea />
         </main>
         <FooterSix />
      </>
   )
}

export default FeatureOne

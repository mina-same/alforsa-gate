import FeatureArea from "./FeatureArea"
import BreadCrumb from "./BreadCrumb"
import HeaderThree from "../../../layouts/headers/HeaderThree"
import FooterSix from "../../../layouts/footers/FooterSix"
import HeaderFour from "../../../layouts/headers/HeaderFour"
import HeaderFive from "../../../layouts/headers/HeaderFive"
import HeaderOne from "../../../layouts/headers/HeaderOne"

const FeatureThree = () => {
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

export default FeatureThree

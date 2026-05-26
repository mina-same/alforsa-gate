import FeatureArea from "./FeatureArea"
import BreadCrumb from "./BreadCrumb"
import HeaderFour from "../../../layouts/headers/HeaderFour"
import FooterSix from "../../../layouts/footers/FooterSix"

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

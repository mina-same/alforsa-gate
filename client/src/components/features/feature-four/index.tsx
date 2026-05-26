import FeatureArea from "./FeatureArea"
import Breadcrumb from "./Breadcrumb"
import HeaderFour from "../../../layouts/headers/HeaderFour"
import FooterSix from "../../../layouts/footers/FooterSix"

const FeatureFour = () => {
   return (
      <>
         <HeaderFour />
         <main>
            <Breadcrumb />
            <FeatureArea />
         </main>
         <FooterSix />
      </>
   )
}

export default FeatureFour

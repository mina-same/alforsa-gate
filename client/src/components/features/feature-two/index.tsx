import FeatureArea from "./FeatureArea"
import BreadCrumb from "./BreadCrumb"
import BannerForm from "./BannerForm"
import HeaderFour from "../../../layouts/headers/HeaderFour"

const FeatureTwo = () => {
   return (
      <>
         <HeaderFour />
         <main>
            <BreadCrumb />
            <BannerForm />
            <FeatureArea />
         </main>
      </>
   )
}

export default FeatureTwo

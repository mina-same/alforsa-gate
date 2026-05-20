import FeatureArea from "./FeatureArea"
import BreadCrumb from "./BreadCrumb"
import BannerForm from "./BannerForm"
import HeaderThree from "../../../layouts/headers/HeaderThree"

const FeatureTwo = () => {
   return (
      <>
         <HeaderThree />
         <main>
            <BreadCrumb />
            <BannerForm />
            <FeatureArea />
         </main>
      </>
   )
}

export default FeatureTwo

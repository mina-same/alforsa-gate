import FeatureArea from "./FeatureArea";
import BreadCrumb from "../feature-three/BreadCrumb";
import HeaderFour from "../../../layouts/headers/HeaderFour";
import FooterSix from "../../../layouts/footers/FooterSix";

const FeatureThreeLive = () => {
   return (
      <>
         <HeaderFour />
         <main>
            <BreadCrumb />
            <FeatureArea />
         </main>
         <FooterSix />
      </>
   );
};

export default FeatureThreeLive;

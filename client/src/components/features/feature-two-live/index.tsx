import FeatureArea from "./FeatureArea";
import BreadCrumb from "../feature-two/BreadCrumb";
import BannerForm from "../feature-two/BannerForm";
import HeaderFour from "../../../layouts/headers/HeaderFour";
import FooterSix from "../../../layouts/footers/FooterSix";

const FeatureTwoLive = () => {
  return (
    <>
      <HeaderFour />
      <main>
        <BreadCrumb />
        <BannerForm />
        <FeatureArea />
      </main>
      <FooterSix />
    </>
  );
};

export default FeatureTwoLive;

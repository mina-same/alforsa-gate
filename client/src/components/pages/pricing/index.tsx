import PricingArea from "./PricingArea"
import Cta from "./Cta"
import HeaderFour from "../../../layouts/headers/HeaderFour"
import BreadCrumb from "../../common/BreadCrumb"
import FooterThree from "../../../layouts/footers/FooterThree"

const Pricing = () => {
  return (
    <>
      <HeaderFour />
      <main>
        <BreadCrumb title="Pricing Plan" sub_title="Pricing Plan" />
        <PricingArea />
        <Cta />
      </main>
      <FooterThree />
    </>
  )
}

export default Pricing

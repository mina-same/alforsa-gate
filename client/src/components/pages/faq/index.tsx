import FaqArea from "./FaqArea"
import Cta from "../pricing/Cta"
import HeaderFour from "../../../layouts/headers/HeaderFour"
import BreadCrumb from "../../common/BreadCrumb"
import FooterThree from "../../../layouts/footers/FooterThree"

const Faq = () => {
   return (
      <>
         <HeaderFour />
         <main>
            <BreadCrumb title="Frequently Asked Question" sub_title="Faq’s" />
            <FaqArea />
            <Cta />
         </main>
         <FooterThree />
      </>
   )
}

export default Faq

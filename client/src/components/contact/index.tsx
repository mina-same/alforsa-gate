import FooterFive from "../../layouts/footers/FooterFive"
import HeaderFour from "../../layouts/headers/HeaderFour"
import BreadCrumb from "../common/BreadCrumb"
import ContactArea from "./ContactArea"

const Contact = () => {
   return (
      <>
         <HeaderFour />
         <main>
            <BreadCrumb title="Contact With Us" sub_title="Contact" />
            <ContactArea />
         </main>
         <FooterFive />
      </>
   )
}

export default Contact

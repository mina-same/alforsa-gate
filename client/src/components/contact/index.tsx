import { useTranslation } from "react-i18next"
import FooterThree from "../../layouts/footers/FooterThree"
import HeaderFour from "../../layouts/headers/HeaderFour"
import BreadCrumb from "../common/BreadCrumb"
import ContactArea from "./ContactArea"

const Contact = () => {
   const { i18n } = useTranslation()
   const isAr = i18n.language?.startsWith("ar")

   return (
      <>
         <HeaderFour />
         <main>
            <BreadCrumb
               title={isAr ? "تواصل معنا" : "Contact With Us"}
               sub_title={isAr ? "تواصل" : "Contact"}
            />
            <ContactArea />
         </main>
         <FooterThree />
      </>
   )
}

export default Contact

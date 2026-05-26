import FooterSix from "../../../../layouts/footers/FooterSix"
import HeaderFour from "../../../../layouts/headers/HeaderFour"
import BreadCrumb from "../../../common/BreadCrumb"
import TeamArea from "./TeamArea"

const Team = () => {
   return (
      <>
         <HeaderFour />
         <main>
            <BreadCrumb title="Our Local Guyeds" sub_title="Guyeds" />
            <TeamArea />
         </main>
         <FooterSix />
      </>
   )
}

export default Team

import FooterSix from "../../../../layouts/footers/FooterSix"
import HeaderThree from "../../../../layouts/headers/HeaderThree"
import BreadCrumb from "../../../common/BreadCrumb"
import TeamArea from "./TeamArea"

const Team = () => {
   return (
      <>
         <HeaderThree />
         <main>
            <BreadCrumb title="Our Local Guyeds" sub_title="Guyeds" />
            <TeamArea />
         </main>
         <FooterSix />
      </>
   )
}

export default Team

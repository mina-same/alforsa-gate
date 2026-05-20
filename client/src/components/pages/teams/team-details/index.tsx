import FooterSix from "../../../../layouts/footers/FooterSix"
import HeaderThree from "../../../../layouts/headers/HeaderThree"
import BreadCrumb from "../../../common/BreadCrumb"
import TeamDetailsArea from "./TeamDetailsArea"

const TeamDetails = () => {
   return (
      <>
         <HeaderThree />
         <main>
            <BreadCrumb title="Esther Howard" sub_title="Esther Howard" />
            <TeamDetailsArea />
         </main>
         <FooterSix />
      </>
   )
}

export default TeamDetails

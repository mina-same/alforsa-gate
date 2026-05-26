import FooterSix from "../../../../layouts/footers/FooterSix"
import HeaderFour from "../../../../layouts/headers/HeaderFour"
import BreadCrumb from "../../../common/BreadCrumb"
import TeamDetailsArea from "./TeamDetailsArea"

const TeamDetails = () => {
   return (
      <>
         <HeaderFour />
         <main>
            <BreadCrumb title="Esther Howard" sub_title="Esther Howard" />
            <TeamDetailsArea />
         </main>
         <FooterSix />
      </>
   )
}

export default TeamDetails

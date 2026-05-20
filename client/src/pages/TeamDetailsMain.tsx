import TeamDetails from "../components/pages/teams/team-details"
import SEO from "../components/SEO"
import Wrapper from "../layouts/Wrapper"

const TeamDetailsMain = () => {
   return (
      <Wrapper>
         <SEO pageTitle={'Team Details'} />
         <TeamDetails />
      </Wrapper>
   )
}

export default TeamDetailsMain

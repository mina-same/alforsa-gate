import FooterFive from "../../../layouts/footers/FooterFive"
import HeaderFour from "../../../layouts/headers/HeaderFour"
import BreadCrumb from "../../common/BreadCrumb"
import ErrorArea from "./ErrorArea"

const NotFound = () => {
  return (
    <>
      <HeaderFour />
      <main>
        <BreadCrumb title="404 Error Page" sub_title="404" />
        <ErrorArea />
      </main>
      <FooterFive />
    </>
  )
}

export default NotFound

import FooterSix from "../../../../layouts/footers/FooterSix"
import HeaderFour from "../../../../layouts/headers/HeaderFour"
import BreadCrumb from "../../../common/BreadCrumb"
import WishlistArea from "./WishlistArea"

const Wishlist = () => {
  return (
    <>
      <HeaderFour />
      <main>
        <BreadCrumb title="Wishlist Page" sub_title="Wishlist" />
        <WishlistArea />
      </main>
      <FooterSix />
    </>
  )
}

export default Wishlist

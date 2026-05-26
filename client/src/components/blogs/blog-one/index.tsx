import FooterSix from "../../../layouts/footers/FooterSix"
import HeaderFour from "../../../layouts/headers/HeaderFour"
import BreadCrumb from "../../common/BreadCrumb"
import BlogArea from "./BlogArea"

const BlogOne = () => {
   return (
      <>
         <HeaderFour />
         <main>
            <BreadCrumb title="Blogs" sub_title="Blog" />
            <BlogArea />
         </main>
         <FooterSix />
      </>
   )
}

export default BlogOne

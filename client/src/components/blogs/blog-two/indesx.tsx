import { useTranslation } from "react-i18next"
import FooterThree from "../../../layouts/footers/FooterThree"
import HeaderFour from "../../../layouts/headers/HeaderFour"
import BreadCrumb from "../../common/BreadCrumb"
import BlogArea from "./BlogArea"

const BlogTwo = () => {
  const { i18n } = useTranslation()
  const isAr = i18n.language?.startsWith("ar")

  return (
    <>
      <HeaderFour />
      <main>
        <BreadCrumb title={isAr ? "المدونة" : "Blogs"} sub_title={isAr ? "المدونة" : "Blog"} />
        <BlogArea />
      </main>
      <FooterThree />
    </>
  )
}

export default BlogTwo

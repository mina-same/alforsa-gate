import FooterSix from '../../../../layouts/footers/FooterSix'
import HeaderThree from '../../../../layouts/headers/HeaderThree'
import BreadCrumb from '../../../common/BreadCrumb'
import ShopArea from './ShopArea'


const Shop = () => {
   return (
      <>
         <HeaderThree />
         <main>
            <BreadCrumb title="Shop Page" sub_title="Shop Archive Page" />
            <ShopArea />
         </main>
         <FooterSix />
      </>
   )
}

export default Shop

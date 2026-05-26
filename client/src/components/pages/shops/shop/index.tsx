import FooterSix from '../../../../layouts/footers/FooterSix'
import HeaderFour from '../../../../layouts/headers/HeaderFour'
import BreadCrumb from '../../../common/BreadCrumb'
import ShopArea from './ShopArea'


const Shop = () => {
   return (
      <>
         <HeaderFour />
         <main>
            <BreadCrumb title="Shop Page" sub_title="Shop Archive Page" />
            <ShopArea />
         </main>
         <FooterSix />
      </>
   )
}

export default Shop

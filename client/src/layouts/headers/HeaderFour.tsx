import NavMenu from "./Menu/NavMenu"
import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Offcanvas from "./Menu/Offcanvas";
import TotalCart from "./Menu/TotalCart";
import HeaderCart from "./Menu/HeaderCart";
import UseSticky from "../../hooks/UseSticky";
import CartIcon from "../../svg/CartIcon";
import PhoneIcon from "../../svg/PhoneIcon";
import UserIcon from "../../svg/UserIcon";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import { useLangPrefix } from "../../hooks/useLangPrefix";

const HeaderFour = () => {
   const { t } = useTranslation();
   const prefix = useLangPrefix();
   const { sticky } = UseSticky();
   const [offCanvas, setOffCanvas] = useState<boolean>(false);

   return (
      <>
         <header className="tg-header-height">
            <div className={`tg-header__area tg-header-lg-space tg-grey-bg ${sticky ? "header-sticky" : ""}`} id="header-sticky">
               <div className="container-fluid container-1545">
                  <div className="row align-items-center">
                     <div className="col-xl-5 d-none d-xl-block">
                        <div className="tgmenu__wrap d-flex align-items-center">
                           <nav className="tgmenu__nav tgmenu-1-space">
                              <div className="tgmenu__navbar-wrap tgmenu__main-menu tgmenu__navbar-wrap-2 d-none d-xl-flex">
                                 <NavMenu />
                              </div>
                           </nav>
                        </div>
                     </div>
                     <div className="col-xl-2 col-4">
                        <div className="logo tg-header-logo text-center p-relative z-index-1">
                           <span className="tg-header-logo-bg d-none d-xl-block"></span>
                           <Link to={prefix}><img src="/assets/img/logo/logo-green.png" alt="Logo" /></Link>
                        </div>
                     </div>
                     <div className="col-xl-5 col-8">
                        <div className="tg-menu-right-action tg-menu-right-action-2 d-flex align-items-center justify-content-end">
                           <div className="tg-header-cart p-relative d-none d-xl-block">
                              <button className="cart-button">
                                 <span>
                                    <CartIcon />
                                 </span>
                                 <span className="tg-header-cart-count"><TotalCart /></span>
                              </button>
                              <HeaderCart />
                           </div>
                           <div className="tg-header-cart p-relative ml-20 d-block d-xl-none">
                              <Link className="cart-button" to={`${prefix}/cart`} aria-label="Shopping cart">
                                 <span>
                                    <CartIcon />
                                 </span>
                                 <span className="tg-header-cart-count"><TotalCart /></span>
                              </Link>
                           </div>
                           <LanguageSwitcher className="tg-header-language-switcher" />
                           <div className="tg-header-contact-info ml-20 d-flex align-items-center">
                              <span className="tg-header-contact-icon mr-5 d-none d-xl-block">
                                 <PhoneIcon />
                              </span>
                              <div className="tg-header-contact-number d-none d-xl-block">
                                 <span>{t("header.call_us")}:</span>
                                 <Link to="tel:+123595966">+123 5959 66</Link>
                              </div>
                           </div>
                           <div className="tg-header-btn ml-20 d-none d-sm-block">
                              <Link className="tg-btn-header" to={`${prefix}/login`}>
                                 <span>
                                    <UserIcon />
                                 </span>
                                 {t("header.login")}
                              </Link>
                           </div>
                           <div className="tg-header-menu-bar lh-1 p-relative pl-20 d-block d-xl-none">
                              <button onClick={() => setOffCanvas(true)} style={{ cursor: "pointer" }} className="tgmenu-offcanvas-open-btn mobile-nav-toggler mobile-nav-black">
                                 <span></span>
                                 <span></span>
                                 <span></span>
                              </button>
                           </div>
                        </div>
                     </div>
                  </div>
               </div>
            </div>
         </header>
         <Offcanvas offCanvas={offCanvas} setOffCanvas={setOffCanvas} />
      </>
   )
}

export default HeaderFour

import NavMenu from "./Menu/NavMenu";
import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import Offcanvas from "./Menu/Offcanvas";
import TotalWishlist from "./Menu/TotalWishlist";
import HeaderWishlist from "./Menu/HeaderWishlist";
import UseSticky from "../../hooks/UseSticky";
import PhoneIcon from "../../svg/PhoneIcon";
import Wishlist from "../../svg/home-one/Wishlist";
import UserIcon from "../../svg/UserIcon";
import LanguageSwitcher from "../../components/common/LanguageSwitcher";
import CurrencySwitcher from "../../components/common/CurrencySwitcher";
import { useLangPrefix } from "../../hooks/useLangPrefix";

interface HeaderFourProps {
  isTransparent?: boolean;
}

const HeaderFour = ({ isTransparent = false }: HeaderFourProps) => {
  const { t } = useTranslation();
  const prefix = useLangPrefix();
  const { sticky } = UseSticky();
  const [offCanvas, setOffCanvas] = useState<boolean>(false);

  return (
    <>
      {isTransparent && (
        <style>{`
               .header-transparent .tgmenu__navbar-wrap-2 > ul > li > a,
               .header-transparent .tgmenu__navbar-wrap > ul > li > a {
                  color: #fff !important;
               }
               .header-transparent .tgmenu__navbar-wrap-2 > ul > li:hover > a,
               .header-transparent .tgmenu__navbar-wrap > ul > li:hover > a {
                  color: rgba(255,255,255,0.75) !important;
               }
               .header-transparent .cart-button {
                  background: transparent !important;
                  border-color: rgba(255,255,255,0.5) !important;
                  color: #fff !important;
               }
               .header-transparent .cart-button svg path,
               .header-transparent .tg-header-cart-count {
                  fill: #fff !important;
                  color: #fff !important;
               }
               .header-transparent .tg-header-contact-icon {
                  background: transparent !important;
                  border-color: rgba(255,255,255,0.5) !important;
                  color: #fff !important;
               }
               .header-transparent .tg-header-contact-icon svg path,
               .header-transparent .tg-header-contact-icon svg {
                  fill: #fff !important;
                  stroke: #fff !important;
               }
               .header-transparent .tg-btn-header {
                  color: #fff !important;
                  border-color: rgba(255,255,255,0.5) !important;
                  background: transparent !important;
               }
               .header-transparent .tg-btn-header:hover {
                  background: #fff !important;
                  color: var(--tg-theme-primary) !important;
               }
               .header-transparent .tg-btn-header svg path {
                  fill: #fff !important;
               }
               .header-transparent .tg-btn-header:hover svg path {
                  fill: var(--tg-theme-primary) !important;
               }
               .header-transparent .minicart {
                  background: #fff !important;
                  color: var(--tg-common-black) !important;
               }
               .header-transparent .tg-header-logo-bg {
                  background: transparent !important;
               }
            `}</style>
      )}
      <header className={isTransparent ? "" : "tg-header-height"}>
        <div
          className={`tg-header__area tg-header-lg-space ${!isTransparent || sticky ? "tg-grey-bg" : ""} ${sticky ? "header-sticky" : ""} ${isTransparent && !sticky ? "header-transparent" : ""}`}
          id="header-sticky"
          style={
            isTransparent && !sticky
              ? {
                  background: "transparent",
                  position: "fixed",
                  top: 0,
                  left: 0,
                  right: 0,
                  zIndex: 999,
                  color: "#fff",
                }
              : undefined
          }
        >
          <div className="container-fluid container-1545">
            <div className="row align-items-center">
              <div
                className="col-xl-5 d-none d-xl-block"
                style={isTransparent && !sticky ? { color: "#fff" } : undefined}
              >
                <div className="tgmenu__wrap d-flex align-items-center">
                  <nav className="tgmenu__nav tgmenu-1-space">
                    <div
                      className="tgmenu__navbar-wrap tgmenu__main-menu tgmenu__navbar-wrap-2 d-none d-xl-flex"
                      style={
                        isTransparent && !sticky
                          ? { ["--nav-link-color" as string]: "#fff" }
                          : undefined
                      }
                    >
                      <NavMenu />
                    </div>
                  </nav>
                </div>
              </div>
              <div className="col-xl-2 col-4">
                <div className="logo tg-header-logo text-center p-relative z-index-1">
                  <span className="tg-header-logo-bg d-none d-xl-block"></span>
                  <Link to={prefix}>
                    <img
                      src={
                        isTransparent && !sticky
                          ? "/assets/img/logo/logo-white.png"
                          : "/assets/img/logo/logo-green.png"
                      }
                      alt="Logo"
                    />
                  </Link>
                </div>
              </div>
              <div
                className="col-xl-5 col-8"
                style={isTransparent && !sticky ? { color: "#fff" } : undefined}
              >
                <div
                  className="tg-menu-right-action tg-menu-right-action-2 d-flex align-items-center justify-content-end"
                  style={
                    isTransparent && !sticky
                      ? { ["--icon-color" as string]: "#fff" }
                      : undefined
                  }
                >
                  <div className="tg-header-cart p-relative d-none d-xl-block">
                    <button className="cart-button">
                      <span>
                        <Wishlist />
                      </span>
                      <span className="tg-header-cart-count">
                        <TotalWishlist />
                      </span>
                    </button>
                    <HeaderWishlist />
                  </div>
                  <div className="tg-header-cart p-relative ml-20 d-block d-xl-none">
                    <Link
                      className="cart-button"
                      to={`${prefix}/wishlist`}
                      aria-label="Saved tours"
                    >
                      <span>
                        <Wishlist />
                      </span>
                      <span className="tg-header-cart-count">
                        <TotalWishlist />
                      </span>
                    </Link>
                  </div>
                  <CurrencySwitcher className="tg-header-currency-switcher" />
                  <LanguageSwitcher className="tg-header-language-switcher" />
                  <div
                    className="tg-header-contact-info ml-20 d-flex align-items-center"
                    style={
                      isTransparent && !sticky ? { color: "#fff" } : undefined
                    }
                  >
                    <span className="tg-header-contact-icon mr-5 d-none d-xl-block">
                      <PhoneIcon />
                    </span>
                    <div
                      className="tg-header-contact-number d-none d-xl-block"
                      style={
                        isTransparent && !sticky ? { color: "#fff" } : undefined
                      }
                    >
                      <span
                        style={
                          isTransparent && !sticky
                            ? { color: "#fff" }
                            : undefined
                        }
                      >
                        {t("header.call_us")}:
                      </span>
                      <Link
                        to="tel:+966569191977"
                        style={
                          isTransparent && !sticky
                            ? { color: "#fff" }
                            : undefined
                        }
                      >
                        +966 56 919 1977
                      </Link>
                    </div>
                  </div>
                  <div className="tg-header-btn ml-20 d-none d-sm-block">
                    <Link
                      className="tg-btn-header"
                      to={`${prefix}/login`}
                      style={
                        isTransparent && !sticky
                          ? { color: "#fff", borderColor: "#fff" }
                          : undefined
                      }
                    >
                      <span>
                        <UserIcon />
                      </span>
                      {t("header.login")}
                    </Link>
                  </div>
                  <div className="tg-header-menu-bar lh-1 p-relative pl-20 d-block d-xl-none">
                    <button
                      onClick={() => setOffCanvas(true)}
                      style={{ cursor: "pointer" }}
                      className="tgmenu-offcanvas-open-btn mobile-nav-toggler mobile-nav-black"
                    >
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
  );
};

export default HeaderFour;

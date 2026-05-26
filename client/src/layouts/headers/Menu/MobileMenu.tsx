/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { Link } from "react-router-dom";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import menu_data from "../../../data/MenuData";
import { useLangPrefix } from "../../../hooks/useLangPrefix";

const MobileMenu = () => {
   const { t } = useTranslation();
   const prefix = useLangPrefix();
   const [navTitle, setNavTitle] = useState("");
   const [, setSubNavTitle] = useState("");

   const openMobileMenu = (menu: any) => {
      setNavTitle((prev: any) => (prev === menu ? "" : menu));
      setSubNavTitle("");
   };

   const localizedHref = (path: string) =>
      path === "#" ? "#" : `${prefix}${path === "/" ? "" : path}`;

   return (
      <ul className="navigation">
         {menu_data.map((menu) => (
            <li key={menu.id} className={menu.has_dropdown ? "menu-item-has-children" : ""}>
               <Link to={localizedHref(menu.link)}>
                  {t(`nav.${menu.titleKey}`)}
               </Link>

               {menu.has_dropdown && (
                  <>
                     {menu.sub_menus && (
                        <>
                           <ul className="sub-menu" style={{ display: navTitle === menu.title ? "block" : "none" }}>
                              {menu.sub_menus.map((sub_m, i) => (
                                 <li key={i}>
                                    <Link to={localizedHref(sub_m.link)}>
                                       {t(`nav.${sub_m.titleKey}`)}
                                    </Link>
                                 </li>
                              ))}
                           </ul>
                           <div className={`dropdown-btn ${navTitle === menu.title ? "open" : ""}`}
                              onClick={() => openMobileMenu(menu.title)}>
                              <span className="plus-line"></span>
                           </div>
                        </>
                     )}
                  </>
               )}
            </li>
         ))}
      </ul>
   );
};

export default MobileMenu;

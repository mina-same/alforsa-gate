import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import menu_data from "../../../data/MenuData";
import { useLangPrefix } from "../../../hooks/useLangPrefix";

const NavMenu = () => {
    const { t } = useTranslation();
    const prefix = useLangPrefix();
    const [navClick, setNavClick] = useState<boolean>(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [navClick]);

    const localizedHref = (path: string) =>
        path === "#" ? "#" : `${prefix}${path === "/" ? "" : path}`;

    return (
        <ul className="navigation">
            {menu_data.map((menu) => (
                <li key={menu.id} className={menu.has_dropdown ? "menu-item-has-children" : ""}>
                    <Link to={localizedHref(menu.link)} onClick={() => setNavClick(!navClick)}>
                        {t(`nav.${menu.titleKey}`)}
                    </Link>

                    {menu.has_dropdown && (
                        <>
                            {menu.sub_menus && (
                                <ul className="sub-menu">
                                    {menu.sub_menus.map((sub_m, i) => (
                                        <li key={i}>
                                            <Link to={localizedHref(sub_m.link)} onClick={() => setNavClick(!navClick)}>
                                                {t(`nav.${sub_m.titleKey}`)}
                                            </Link>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </>
                    )}
                </li>
            ))}
        </ul>
    );
};

export default NavMenu;

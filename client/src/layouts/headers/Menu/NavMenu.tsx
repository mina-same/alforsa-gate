import { Link } from "react-router-dom";
import menu_data from "../../../data/MenuData";
import { useEffect, useState } from "react";

const NavMenu = () => {
    

    const [navClick, setNavClick] = useState<boolean>(false);

    useEffect(() => {
        window.scrollTo(0, 0);
    }, [navClick]);

    return (
        <ul className="navigation">
            {menu_data.map((menu) => (
                <li key={menu.id} className={menu.has_dropdown ? "menu-item-has-children" : ""}>
                    <Link to={menu.link} onClick={() => setNavClick(!navClick)}>
                        {menu.title}
                    </Link>

                    {menu.has_dropdown && (
                        <>
                            {menu.sub_menus && (
                                <ul className="sub-menu">
                                    {menu.sub_menus.map((sub_m, i) => (
                                        <li key={i}>
                                            <Link to={sub_m.link} onClick={() => setNavClick(!navClick)}>
                                                {sub_m.title}
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

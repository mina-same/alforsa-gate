
interface MenuItem {
    id: number;
    title: string;
    titleKey: string;
    link: string;
    has_dropdown: boolean;
    sub_menus?: {
        link: string;
        title: string;
        titleKey: string;
    }[];
}

const menu_data: MenuItem[] = [
    {
        id: 1,
        title: "Home",
        titleKey: "home",
        link: "#",
        has_dropdown: false,
        sub_menus: [
            { link: "/", title: "Home One", titleKey: "home_one" },
            { link: "/home-two", title: "Home Two", titleKey: "home_two" },
            { link: "/home-three", title: "Home Three", titleKey: "home_three" },
            { link: "/home-four", title: "Home Four", titleKey: "home_four" },
            { link: "/home-five", title: "Home Five", titleKey: "home_five" },
            { link: "/home-six", title: "Home Six", titleKey: "home_six" },
            { link: "/home-seven", title: "Home Seven", titleKey: "home_seven" },
        ],
    },
    {
        id: 2,
        title: "Features",
        titleKey: "features",
        link: "#",
        has_dropdown: true,
        sub_menus: [
            { link: "/hotel-grid", title: "Hotel Grid", titleKey: "hotel_grid" },
            { link: "/tour-grid-1", title: "Tour Grid One", titleKey: "tour_grid_1" },
            { link: "/tour-grid-2", title: "Tour Grid Two", titleKey: "tour_grid_2" },
            { link: "/map-listing", title: "Hotel Listing", titleKey: "hotel_listing" },
            { link: "/tour-details", title: "Tour Details One", titleKey: "tour_details_1" },
            { link: "/tour-details-2", title: "Tour Details Two", titleKey: "tour_details_2" },
        ],
    },
    {
        id: 3,
        title: "Pages",
        titleKey: "pages",
        link: "#",
        has_dropdown: true,
        sub_menus: [
            { link: "/about", title: "About", titleKey: "about" },
            { link: "/team", title: "Team", titleKey: "team" },
            { link: "/team-details", title: "Team Details", titleKey: "team_details" },
            { link: "/shop", title: "Shop", titleKey: "shop" },
            { link: "/shop-details", title: "Shop Details", titleKey: "shop_details" },
            { link: "/cart", title: "Cart", titleKey: "cart" },
            { link: "/wishlist", title: "Wishlist", titleKey: "wishlist" },
            { link: "/checkout", title: "Checkout", titleKey: "checkout" },
            { link: "/pricing", title: "Pricing", titleKey: "pricing" },
            { link: "/faq", title: "Faq", titleKey: "faq" },
            { link: "/login", title: "Log In", titleKey: "login" },
            { link: "/register", title: "Register", titleKey: "register" },
            { link: "/no-found", title: "Error", titleKey: "error" },
        ],
    },
    {
        id: 4,
        title: "Blogs",
        titleKey: "blogs",
        link: "#",
        has_dropdown: true,
        sub_menus: [
            { link: "/blog-grid", title: "Blog Grid", titleKey: "blog_grid" },
            { link: "/blog-standard", title: "Blog Standard", titleKey: "blog_standard" },
            { link: "/blog-details", title: "Blog Details", titleKey: "blog_details" },
        ],
    },
    {
        id: 5,
        has_dropdown: false,
        title: "Contact",
        titleKey: "contact",
        link: "/contact",
    },
];

export default menu_data;

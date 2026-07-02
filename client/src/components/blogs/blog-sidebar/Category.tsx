import { useTranslation } from "react-i18next";

const CATEGORIES = {
  en: [
    { title: "Russia", count: 6 },
    { title: "Travel Tips", count: 12 },
    { title: "Destinations", count: 8 },
    { title: "Halal Travel", count: 5 },
    { title: "Adventure", count: 4 },
    { title: "City Guides", count: 7 },
  ],
  ar: [
    { title: "روسيا", count: 6 },
    { title: "نصائح السفر", count: 12 },
    { title: "الوجهات", count: 8 },
    { title: "سياحة حلال", count: 5 },
    { title: "المغامرة", count: 4 },
    { title: "أدلة المدن", count: 7 },
  ],
};

const Category = () => {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";

  return (
    <div className="tg-blog-categories tg-blog-sidebar-box mb-40">
      <h5 className="tg-blog-sidebar-title mb-5">
        {lang === "ar" ? "الأقسام" : "Categories"}
      </h5>
      <div className="tg-blog-categories-list">
        <ul>
          {CATEGORIES[lang].map((item, i) => (
            <li key={i}>
              <span>{item.title}</span>
              <span>({item.count})</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Category;

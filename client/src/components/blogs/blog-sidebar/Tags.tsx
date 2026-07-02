import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { RUSSIA_BLOGS } from "../../../data/russiaBlogsData";

const Tags = () => {
  const { i18n } = useTranslation();
  const lang = (i18n.language?.startsWith("ar") ? "ar" : "en") as "en" | "ar";
  const prefix = lang === "ar" ? "/ar" : "/en";

  const allTags = Array.from(
    new Set(RUSSIA_BLOGS.flatMap((b) => b.tags[lang]))
  ).slice(0, 10);

  return (
    <div className="tg-blog-sidebar-tag tg-blog-sidebar-box">
      <h5 className="tg-blog-sidebar-title mb-25">
        {lang === "ar" ? "الوسوم" : "Tags"}
      </h5>
      <div className="tg-blog-sidebar-tag-list">
        <ul>
          {allTags.map((tag, i) => (
            <li key={i}>
              <Link to={`${prefix}/destination/russia`}>{tag}</Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default Tags;

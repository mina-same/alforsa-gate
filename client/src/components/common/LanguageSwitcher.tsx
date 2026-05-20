import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

type SiteLanguage = "en" | "ar";

const languageOptions: { value: SiteLanguage; label: string; mobileLabel: string; flag: string }[] = [
   { value: "en", label: "English England", mobileLabel: "EN", flag: "🏴" },
   { value: "ar", label: "عربي السعودية", mobileLabel: "AR", flag: "🇸🇦" },
];

const isSiteLanguage = (value: string | null): value is SiteLanguage =>
   value === "en" || value === "ar";

const getPathLanguage = (pathname: string): SiteLanguage | null =>
   pathname === "/ar" || pathname.startsWith("/ar/") ? "ar" : null;

const browserPrefersArabic = (): boolean => {
   if (typeof navigator === "undefined") {
      return false;
   }

   return navigator.languages?.some((lang) => lang.toLowerCase().startsWith("ar"))
      || navigator.language.toLowerCase().startsWith("ar");
};

const getInitialLanguage = (): SiteLanguage => {
   if (typeof window === "undefined") {
      return "en";
   }

   const pathLanguage = getPathLanguage(window.location.pathname);
   if (pathLanguage) {
      return pathLanguage;
   }

   const savedLanguage = localStorage.getItem("language");
   if (isSiteLanguage(savedLanguage)) {
      return savedLanguage;
   }

   return browserPrefersArabic() ? "ar" : "en";
};

const getLocalizedPath = (pathname: string, language: SiteLanguage): string => {
   const withoutLanguage = pathname === "/ar"
      ? "/"
      : pathname.startsWith("/ar/")
         ? pathname.slice(3) || "/"
         : pathname;

   if (language === "ar") {
      return withoutLanguage === "/" ? "/ar" : `/ar${withoutLanguage}`;
   }

   return withoutLanguage;
};

interface LanguageSwitcherProps {
   className?: string;
}

const LanguageSwitcher = ({ className = "" }: LanguageSwitcherProps) => {
   const location = useLocation();
   const navigate = useNavigate();
   const [language, setLanguage] = useState<SiteLanguage>(getInitialLanguage);

   useEffect(() => {
      localStorage.setItem("language", language);
      document.documentElement.lang = language;
      document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
      document.body.classList.toggle("rtl-mode", language === "ar");
   }, [language]);

   useEffect(() => {
      const pathLanguage = getPathLanguage(location.pathname);
      const nextLanguage = pathLanguage || language;

      if (nextLanguage !== language) {
         setLanguage(nextLanguage);
         return;
      }

      const localizedPath = getLocalizedPath(location.pathname, language);
      if (localizedPath !== location.pathname) {
         navigate(`${localizedPath}${location.search}${location.hash}`, { replace: true });
      }
   }, [language, location.hash, location.pathname, location.search, navigate]);

   const handleLanguageChange = (nextLanguage: SiteLanguage) => {
      setLanguage(nextLanguage);
      const localizedPath = getLocalizedPath(location.pathname, nextLanguage);
      navigate(`${localizedPath}${location.search}${location.hash}`);
   };

   return (
      <div className={`site-language-switcher ${className}`.trim()} aria-label="Website language">
         <span className="site-language-switcher__icon" aria-hidden="true">
            <i className="fa-solid fa-language"></i>
         </span>
         <div className="site-language-switcher__options">
            {languageOptions.map((option) => (
               <button
                  key={option.value}
                  type="button"
                  className={`site-language-switcher__option ${language === option.value ? "is-active" : ""}`}
                  onClick={() => handleLanguageChange(option.value)}
                  aria-pressed={language === option.value}
                  title={option.label}
               >
                  <span className="site-language-switcher__flag" aria-hidden="true">{option.flag}</span>
                  <span className="site-language-switcher__label">{option.label}</span>
                  <span className="site-language-switcher__mobile-label">{option.mobileLabel}</span>
               </button>
            ))}
         </div>
      </div>
   );
};

export default LanguageSwitcher;

import { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

type SiteLanguage = "en" | "ar";

const languageOptions: {
  value: SiteLanguage;
  flag: string;
  shortKey: "lang.en_short" | "lang.ar_short";
  labelKey: "lang.en" | "lang.ar";
}[] = [
  { value: "en", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", shortKey: "lang.en_short", labelKey: "lang.en" },
  { value: "ar", flag: "🇸🇦", shortKey: "lang.ar_short", labelKey: "lang.ar" },
];

const getPathLanguage = (pathname: string): SiteLanguage => {
  if (pathname === "/ar" || pathname.startsWith("/ar/")) return "ar";
  return "en";
};

const getLocalizedPath = (pathname: string, language: SiteLanguage): string => {
  // Strip existing /en or /ar prefix
  let base = pathname;
  if (base === "/en" || base === "/ar") {
    base = "/";
  } else if (base.startsWith("/en/")) {
    base = base.slice(3) || "/";
  } else if (base.startsWith("/ar/")) {
    base = base.slice(3) || "/";
  }

  const prefix = language === "ar" ? "/ar" : "/en";
  return base === "/" ? prefix : `${prefix}${base}`;
};

interface LanguageSwitcherProps {
  className?: string;
}

const LanguageSwitcher = ({ className = "" }: LanguageSwitcherProps) => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const language = getPathLanguage(location.pathname);

  // Sync i18next language and document direction with the URL-detected language
  useEffect(() => {
    i18n.changeLanguage(language);
    localStorage.setItem("language", language);
    document.documentElement.lang = language;
    document.documentElement.dir = language === "ar" ? "rtl" : "ltr";
    document.body.classList.toggle("rtl-mode", language === "ar");
  }, [language, i18n]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  const handleSelect = (next: SiteLanguage) => {
    setOpen(false);
    if (next === language) return;
    const localizedPath = getLocalizedPath(location.pathname, next);
    navigate(`${localizedPath}${location.search}${location.hash}`);
  };

  const current = languageOptions.find((o) => o.value === language)!;

  return (
    <div
      ref={containerRef}
      className={`lang-switcher ${className}`.trim()}
      aria-label="Website language"
    >
      <button
        type="button"
        className="lang-switcher__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="lang-switcher__flag" aria-hidden="true">{current.flag}</span>
        <span className="lang-switcher__current">{t(current.shortKey)}</span>
        <span className={`lang-switcher__chevron ${open ? "is-open" : ""}`} aria-hidden="true">
          <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>

      {open && (
        <ul className="lang-switcher__menu" role="listbox" aria-label="Select language">
          {languageOptions.map((opt) => (
            <li
              key={opt.value}
              role="option"
              aria-selected={language === opt.value}
              className={`lang-switcher__option ${language === opt.value ? "is-active" : ""}`}
              onClick={() => handleSelect(opt.value)}
            >
              <span className="lang-switcher__option-flag" aria-hidden="true">{opt.flag}</span>
              <span className="lang-switcher__option-label">{t(opt.labelKey)}</span>
              <span className="lang-switcher__option-code">{t(opt.shortKey)}</span>
              {language === opt.value && (
                <span className="lang-switcher__check" aria-hidden="true">
                  <svg width="12" height="10" viewBox="0 0 12 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M1 5L4.5 8.5L11 1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </span>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default LanguageSwitcher;

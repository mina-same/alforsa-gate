import { useLocation } from "react-router-dom";

/** Returns "/ar" when on an Arabic route, otherwise "/en". */
export const useLangPrefix = (): "/en" | "/ar" => {
  const { pathname } = useLocation();
  return pathname.startsWith("/ar") ? "/ar" : "/en";
};

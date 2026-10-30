import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { SITE_URL } from "../site";

// Keeps the canonical link and og:url pointing at the current page on the main site address.
const CanonicalUrl = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const url = SITE_URL + pathname;
    document.querySelector('link[rel="canonical"]')?.setAttribute("href", url);
    document.querySelector('meta[property="og:url"]')?.setAttribute("content", url);
  }, [pathname]);

  return null;
};

export default CanonicalUrl;

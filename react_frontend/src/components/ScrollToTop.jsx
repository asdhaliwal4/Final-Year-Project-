import { useEffect } from "react";
import { useLocation } from "react-router-dom";

export default function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    // Whenever the URL changes, I'm snapping the scroll back to the top
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const container = document.getElementById("lesson-scroll-container");

    if (container) {
      container.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    } else {
      window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;

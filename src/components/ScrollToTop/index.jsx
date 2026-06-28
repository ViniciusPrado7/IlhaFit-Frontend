import { useEffect } from "react";
import { useLocation } from "react-router-dom";

/**
 * Rola para o topo sempre que a rota muda, garantindo que cada página abra
 * desde o início.
 *
 * O scroll da aplicação acontece no elemento #root (porque o CSS define
 * overflow-x: hidden + height: 100%, o que torna o overflow-y "auto"), então
 * não basta usar window.scrollTo. Resetamos o #root e também window/body/html
 * como fallback, de forma instantânea (scrollTop = 0) para não animar.
 */
const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    const root = document.getElementById("root");
    if (root) root.scrollTop = 0;
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
};

export default ScrollToTop;

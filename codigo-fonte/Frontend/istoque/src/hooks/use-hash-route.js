import { useEffect, useState } from "react";
import { DEFAULT_ROUTE } from "@/config/paths.js";

const currentRoute = () => location.hash.slice(1) || DEFAULT_ROUTE;

export function navigate(route) {
  location.hash = route;
}

// Rota atual lida do hash da URL; volta ao topo da página a cada troca.
export function useHashRoute() {
  const [route, setRoute] = useState(currentRoute);
  useEffect(() => {
    const onChange = () => {
      setRoute(currentRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return route;
}

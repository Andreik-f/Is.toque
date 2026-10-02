import { useEffect, useState } from "react";
import { parseHash } from "@/config/paths.js";

const currentRoute = () => parseHash(location.hash);

// navigate("produto", 12) abre #produto/12; sem id, só a rota.
export function navigate(route, id) {
  location.hash = id == null ? route : route + "/" + encodeURIComponent(id);
}

// Rota atual ({ route, id }) lida do hash da URL; volta ao topo da página a
// cada troca.
export function useHashRoute() {
  const [current, setCurrent] = useState(currentRoute);
  useEffect(() => {
    const onChange = () => {
      setCurrent(currentRoute());
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return current;
}

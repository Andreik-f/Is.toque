import { prefersReducedMotion } from "@/lib/motion.js";

// Rolagem dentro da página inicial sem mexer no hash: "#como-funciona" na URL
// seria lido pelo roteador como uma rota.
const behavior = () => (prefersReducedMotion() ? "auto" : "smooth");

export function scrollToSection(id) {
  document
    .getElementById(id)
    ?.scrollIntoView({ behavior: behavior(), block: "start" });
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: behavior() });
}

import React from "react";
import { LandingPage } from "@/features/landing/components/landing-page.jsx";

// #inicio, e a URL sem hash quando não há sessão, abrem a apresentação do
// produto fora do layout principal.
export function LandingRoute() {
  return <LandingPage />;
}

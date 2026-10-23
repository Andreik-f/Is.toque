import React from "react";
import { FaqSection } from "./faq-section.jsx";
import { FinalCta } from "./final-cta.jsx";
import { LandingFooter } from "./landing-footer.jsx";
import { LandingHeader } from "./landing-header.jsx";
import { LandingHero } from "./landing-hero.jsx";
import { MobileSection } from "./mobile-section.jsx";
import { ProblemSection } from "./problem-section.jsx";
import { TrailSection } from "./trail-section.jsx";

// Página inicial de apresentação do Is.toque. Todo o estilo fica sob
// .landing (styles/features/landing.css).
export function LandingPage() {
  return (
    <div className="landing">
      <LandingHeader />
      <main>
        <LandingHero />
        <ProblemSection />
        <TrailSection />
        <MobileSection />
        <FaqSection />
        <FinalCta />
      </main>
      <LandingFooter />
    </div>
  );
}

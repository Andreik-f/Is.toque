import React from "react";
import { Icon } from "@/components/ui/icon.jsx";
import { MOBILE_NAV, NAV_ITEMS, isNavActive } from "@/config/paths.js";

const mobileItems = MOBILE_NAV.map((id) => NAV_ITEMS.find((n) => n[0] === id));

// Menu inferior do celular.
export function MobileNav({ route }) {
  return (
    <nav className="mobile-nav">
      {mobileItems.map(([id, icon, label]) => (
        <a
          key={id}
          href={"#" + id}
          className={isNavActive(id, route) ? "active" : ""}
        >
          <Icon name={icon} />
          <span>{label}</span>
        </a>
      ))}
    </nav>
  );
}

import React from "react";

export function Badge({ children, tone = "neutral" }) {
  return (
    <span className={`badge ${tone}`}>
      <i />
      {children}
    </span>
  );
}

import React from "react";
import { Icon } from "./icon.jsx";

export function Button({
  children,
  variant = "primary",
  icon,
  className = "",
  ...props
}) {
  return (
    <button className={`button ${variant} ${className}`} {...props}>
      {icon && <Icon name={icon} size={18} />}
      <span>{children}</span>
    </button>
  );
}

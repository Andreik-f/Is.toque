import React from "react";
import { Icon } from "./icon.jsx";

export function Stat({ icon, value, label, detail, tone = "", onClick }) {
  return (
    <button className={"stat " + tone} disabled={!onClick} onClick={onClick}>
      <span className="stat-icon">
        <Icon name={icon} />
      </span>
      <strong>{value}</strong>
      <h3>{label}</h3>
      <p>{detail}</p>
      {onClick && <Icon className="stat-arrow" name="arrow" size={17} />}
    </button>
  );
}

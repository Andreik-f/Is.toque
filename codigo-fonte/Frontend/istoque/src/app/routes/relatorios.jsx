import React from "react";
import { PageHeading } from "@/components/ui/page-heading.jsx";
import { DEMO_TODAY_LABEL } from "@/config/demo.js";
import { routeSubtitle, routeTitle } from "@/config/paths.js";
import { Reports } from "@/features/reports/components/reports.jsx";
import { useDemoStore } from "@/stores/demo-store.jsx";

export function RelatoriosRoute() {
  const { demo, today, history, products } = useDemoStore();
  return (
    <>
      <PageHeading
        title={routeTitle("relatorios")}
        subtitle={routeSubtitle("relatorios")}
      />
      <Reports
        history={history}
        products={products}
        today={today}
        demoDate={demo ? DEMO_TODAY_LABEL : null}
      />
    </>
  );
}

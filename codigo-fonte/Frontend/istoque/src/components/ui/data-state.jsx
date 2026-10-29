import React from "react";
import { Button } from "@/components/ui/button.jsx";
import { Empty } from "@/components/ui/empty.jsx";
import { Mascot } from "@/components/ui/mascot.jsx";

export function DataState({
  loading,
  error,
  onRetry,
  loadingText,
  errorTitle = "Não foi possível carregar os dados",
  extraActions,
  children,
}) {
  if (error) {
    return (
      <main className="status-page">
        <Empty
          title={errorTitle}
          text={error}
          action={
            <div className="status-actions">
              <Button onClick={onRetry}>Tentar de novo</Button>
              {extraActions}
            </div>
          }
        />
      </main>
    );
  }

  if (loading) {
    return (
      <main className="status-page">
        <div className="status-loading">
          <Mascot variant="duas" mode="espera" />
          <p role="status">{loadingText}</p>
        </div>
      </main>
    );
  }

  return children;
}

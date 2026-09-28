import React, { useState } from "react";
import { Badge } from "@/components/ui/badge.jsx";
import { Button } from "@/components/ui/button.jsx";
import { Icon } from "@/components/ui/icon.jsx";

// Importação simulada de uma nota: nenhum documento real é enviado.
export function InvoiceImport({ products, onApply }) {
  const [step, setStep] = useState(0),
    [mapped, setMapped] = useState("");
  const rows = [
    { id: "pao", qty: 24 },
    { id: "arroz", qty: 5 },
    { id: mapped, qty: 2 },
  ];
  return (
    <>
      <div className="notice">
        <Icon name="upload" />
        <span>
          Extensão proposta • Simulação de uma nota. Nenhum documento real será
          enviado ou interpretado.
        </span>
      </div>
      <div className="stepper">
        <span className="done">1. Documento</span>
        <i />
        <span className={step ? "done" : ""}>2. Revisão dos itens</span>
        <i />
        <span>3. Entrada no estoque</span>
      </div>
      {step === 0 ? (
        <section className="panel upload-panel">
          <span className="upload-icon">
            <Icon name="upload" size={32} />
          </span>
          <h2>Da nota para o estoque</h2>
          <p>
            Relacione os itens da nota aos produtos já cadastrados.
            <br />
            Revise as quantidades antes de confirmar a entrada.
          </p>
          <Button icon="upload" onClick={() => setStep(1)}>
            Usar nota de exemplo
          </Button>
          <small>Nota fictícia 00124 • 3 itens</small>
        </section>
      ) : (
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Revise os itens recebidos</h2>
              <p>Nota de exemplo 00124 • Fornecedor fictício</p>
            </div>
            <Badge tone={mapped ? "success" : "warning"}>
              {mapped ? "Todos vinculados" : "1 item sem vínculo"}
            </Badge>
          </div>
          <div className="table-scroll">
            <table>
              <thead>
                <tr>
                  <th>Descrição na nota</th>
                  <th>Produto do estoque</th>
                  <th>Quantidade</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>PÃO BURGER 24UN</td>
                  <td>Pão de hambúrguer</td>
                  <td>24 un</td>
                </tr>
                <tr>
                  <td>ARROZ TIPO 1</td>
                  <td>Arroz branco</td>
                  <td>5 kg</td>
                </tr>
                <tr>
                  <td>TOMATE ITAL. KG</td>
                  <td>
                    <select
                      aria-label="Vincular item da nota"
                      value={mapped}
                      onChange={(e) => setMapped(e.target.value)}
                    >
                      <option value="">Selecione um produto...</option>
                      {products
                        .filter((p) => p.unit === "kg")
                        .map((p) => (
                          <option key={p.id} value={p.id}>
                            {p.name}
                          </option>
                        ))}
                    </select>
                  </td>
                  <td>2 kg</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="notice">
            <Icon name="shield" />
            <span>
              Todos os itens precisam de vínculo e unidade compatível. A
              confirmação gera três entradas rastreáveis.
            </span>
          </div>
          <div className="panel-actions">
            <Button variant="secondary" onClick={() => setStep(0)}>
              Voltar
            </Button>
            <Button
              icon="check"
              disabled={!mapped}
              onClick={() => onApply(rows)}
            >
              Confirmar entrada
            </Button>
          </div>
        </section>
      )}
    </>
  );
}

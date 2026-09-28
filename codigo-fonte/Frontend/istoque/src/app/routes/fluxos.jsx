import React from "react";
import { Button } from "@/components/ui/button.jsx";
import { Icon } from "@/components/ui/icon.jsx";
import { PageHeading } from "@/components/ui/page-heading.jsx";
import { routeSubtitle, routeTitle } from "@/config/paths.js";
import { navigate } from "@/hooks/use-hash-route.js";

const flows = [
  {
    n: "01",
    title: "Acesso e empresa",
    text: "Entrar → validar credenciais e usuário ativo → carregar apenas os dados da empresa.",
    routes: [
      ["login", "Acesso"],
      ["cadastro", "Cadastro da empresa"],
      ["recuperar", "Recuperação"],
    ],
    rule: "Falha de login mantém a pessoa na tela com mensagem clara; permissões são verificadas no servidor.",
  },
  {
    n: "02",
    title: "Estoque e movimentação",
    text: "Consultar → localizar ingrediente → registrar entrada, saída, perda ou ajuste → revisar saldo → confirmar.",
    routes: [
      ["estoque", "Estoque"],
      ["movimentacoes", "Histórico"],
      ["reposicao", "Reposição"],
    ],
    rule: "Saídas e perdas não podem ultrapassar o saldo. Ajustes exigem motivo. Estoque ≤ mínimo gera alerta.",
  },
  {
    n: "03",
    title: "Receita e produção",
    text: "Abrir ficha → calcular capacidade → informar porções → revisar consumo → confirmar produção → atualizar estoque e histórico.",
    routes: [
      ["receitas", "Receitas"],
      ["receita", "Ficha técnica"],
    ],
    rule: "Salvar receita não baixa estoque. Produção acima da capacidade é bloqueada; todos os ingredientes são baixados juntos.",
  },
  {
    n: "04",
    title: "Gestão e extensões",
    text: "Administrar pessoas e acessos; analisar movimentações; revisar itens de notas antes de registrar a entrada.",
    routes: [
      ["equipe", "Equipe"],
      ["relatorios", "Relatórios"],
      ["importacao", "Importação simulada"],
    ],
    rule: "Perfis são uma proposta. Importação de notas e relatórios por período são extensões para validar.",
  },
];

// Mapa dos fluxos do protótipo, com atalhos para cada tela.
export function FluxosRoute() {
  return (
    <>
      <PageHeading
        title={routeTitle("fluxos")}
        subtitle={routeSubtitle("fluxos")}
      />
      <div className="flow-grid">
        {flows.map((f) => (
          <section className="panel flow-card" key={f.n}>
            <span className="flow-number">{f.n}</span>
            <h2>{f.title}</h2>
            <p>{f.text}</p>
            <div className="flow-routes">
              {f.routes.map(([r, t]) => (
                <Button key={r} variant="secondary" onClick={() => navigate(r)}>
                  {t}
                  <Icon name="arrow" size={16} />
                </Button>
              ))}
            </div>
            <div className="flow-rule">
              <Icon name="shield" size={18} />
              <span>{f.rule}</span>
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

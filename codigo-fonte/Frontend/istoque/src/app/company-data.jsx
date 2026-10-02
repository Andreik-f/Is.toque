import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button.jsx";
import { Empty } from "@/components/ui/empty.jsx";
import {
  createCategory,
  createProduct,
  getCategories,
  getProducts,
  getUnits,
  updateProduct,
} from "@/features/products/api/products.js";
import {
  productFromApi,
  productToApi,
} from "@/features/products/utils/product-api.js";
import { navigate } from "@/hooks/use-hash-route.js";
import { errorMessage } from "@/lib/api-client.js";
import { DemoStoreProvider } from "@/stores/demo-store.jsx";
import { useSession } from "@/stores/session-store.jsx";

// Sem login, as telas usam os dados fictícios da demonstração. Com login,
// produtos, categorias e unidades de medida vêm da API e são gravados nela.
// O que ainda não tem rota na API (receitas, movimentações, equipe) começa
// vazio e fica só na página. Trocar de usuário monta tudo de novo, do zero.
export function CompanyDataProvider({ children }) {
  const { session } = useSession();
  if (!session)
    return <DemoStoreProvider key="demo">{children}</DemoStoreProvider>;
  return (
    <CompanyData key={`${session.empresaId}:${session.id}`} session={session}>
      {children}
    </CompanyData>
  );
}

function CompanyData({ session, children }) {
  const { signOut } = useSession();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    let current = true;
    setError("");
    Promise.all([
      getProducts(session.empresaId),
      getCategories(session.empresaId),
      getUnits(),
    ])
      .then(([products, categories, units]) => {
        if (!current) return;
        setData({
          products: products.map(productFromApi),
          categories,
          units,
          recipes: [],
          history: [],
          users: [
            {
              id: session.id,
              name: session.nome,
              email: session.email,
              role: session.perfil,
              active: true,
            },
          ],
          userName: session.nome,
        });
      })
      .catch((e) => current && setError(errorMessage(e)));
    return () => {
      current = false;
    };
  }, [session, attempt]);

  const persist = {
    saveProduct: async (product) => {
      const body = productToApi(product, session.empresaId);
      const saved = productFromApi(
        product.id
          ? await updateProduct(product.id, body)
          : await createProduct(body),
      );
      // saldo, validade do lote, foto e ilustração ainda não têm rota na API:
      // continuam os da tela
      return {
        ...saved,
        stock: product.stock ?? saved.stock,
        expiry: product.expiry ?? "",
        photo: product.photo ?? "",
        art: product.art ?? saved.art,
      };
    },
    createCategory: (nome) =>
      createCategory({ empresaId: session.empresaId, nome }),
  };

  if (!data)
    return (
      <main className="status-page">
        {error ? (
          <Empty
            title="Não foi possível carregar os dados"
            text={error}
            action={
              <div className="status-actions">
                <Button onClick={() => setAttempt((n) => n + 1)}>
                  Tentar de novo
                </Button>
                <Button
                  variant="secondary"
                  onClick={() => {
                    signOut();
                    navigate("login");
                  }}
                >
                  Sair
                </Button>
              </div>
            }
          />
        ) : (
          <p role="status">Carregando os dados de {session.nomeEmpresa}...</p>
        )}
      </main>
    );

  return (
    <DemoStoreProvider initial={data} persist={persist}>
      {children}
    </DemoStoreProvider>
  );
}

import React, { useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button.jsx";
import { DataState } from "@/components/ui/data-state.jsx";
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
import { useApiData } from "@/hooks/use-api-data.js";
import { navigate } from "@/hooks/use-hash-route.js";
import { DemoStoreProvider } from "@/stores/demo-store.jsx";
import { useSession } from "@/stores/session-store.jsx";
import { useUiStore } from "@/stores/ui-store.jsx";

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
  const { notify } = useUiStore();

  const { data, loading, error, reload } = useApiData(
    () =>
      Promise.all([getProducts(), getCategories(), getUnits()]).then(
        ([products, categories, units]) => ({
          products: products.map(productFromApi),
          categories,
          units,
        }),
      ),
    { deps: [session] },
  );

  useEffect(() => {
    if (data && error)
      notify(`Não foi possível atualizar os dados da API: ${error}`);
  }, [data, error, notify]);

  const initial = useMemo(() => {
    if (!data) return null;
    return {
      products: data.products,
      categories: data.categories,
      units: data.units,
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
    };
  }, [data, session]);

  const persist = {
    saveProduct: async (product) => {
      const body = productToApi(product);
      const saved = productFromApi(
        product.id
          ? await updateProduct(product.id, body)
          : await createProduct(body),
      );
      reload();
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
    createCategory: async (nome) => {
      const created = await createCategory({ nome });
      reload();
      return created;
    },
  };

  return (
    <DataState
      loading={loading && !data}
      error={data ? "" : error}
      onRetry={reload}
      loadingText={`Carregando os dados de ${session.nomeEmpresa}...`}
      extraActions={
        <Button
          variant="secondary"
          onClick={() => {
            signOut();
            navigate("login");
          }}
        >
          Sair
        </Button>
      }
    >
      {data && (
        <DemoStoreProvider initial={initial} persist={persist}>
          {children}
        </DemoStoreProvider>
      )}
    </DataState>
  );
}

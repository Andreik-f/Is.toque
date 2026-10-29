import {
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import {
  createApiDataSource,
  ESTADO_CARREGANDO,
  ESTADO_SEM_DADOS,
} from "@/lib/api-data-controller.js";

const semInscricao = () => () => {};
const getCarregando = () => ESTADO_CARREGANDO;
const getSemDados = () => ESTADO_SEM_DADOS;

function mesmasDeps(a, b) {
  return a.length === b.length && a.every((valor, i) => Object.is(valor, b[i]));
}

export function useApiData(fetcher, { enabled = true, deps = [] } = {}) {
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const [atual, setAtual] = useState(null);

  useEffect(() => {
    const source = createApiDataSource(() => fetcherRef.current(), { enabled });
    setAtual({ source, enabled, deps });
    source.load();
    return () => source.dispose();
  }, [enabled, ...deps]);

  const source =
    atual && atual.enabled === enabled && mesmasDeps(atual.deps, deps)
      ? atual.source
      : null;

  const getSnapshot = source
    ? source.getState
    : enabled
      ? getCarregando
      : getSemDados;

  const state = useSyncExternalStore(
    source ? source.subscribe : semInscricao,
    getSnapshot,
    getSnapshot,
  );

  const reload = useCallback(
    () => (source ? source.reload() : Promise.resolve()),
    [source],
  );

  return {
    data: state.data,
    loading: state.loading,
    error: state.error,
    reload,
  };
}

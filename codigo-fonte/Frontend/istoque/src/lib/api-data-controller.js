import { errorMessage } from "./api-client.js";

export const ESTADO_SEM_DADOS = Object.freeze({
  data: null,
  loading: false,
  error: "",
});

export const ESTADO_CARREGANDO = Object.freeze({
  data: null,
  loading: true,
  error: "",
});

const semInscricao = () => () => {};
const semEfeito = () => Promise.resolve();
const getEstadoSemDados = () => ESTADO_SEM_DADOS;

export function createApiDataSource(fetcher, { enabled = true } = {}) {
  if (!enabled)
    return {
      getState: getEstadoSemDados,
      subscribe: semInscricao,
      load: semEfeito,
      reload: semEfeito,
      dispose() {},
    };
  return createApiDataController(fetcher);
}

export function createApiDataController(fetcher) {
  let state = { data: null, loading: true, error: "" };
  let lastRequest = 0;
  let disposed = false;
  const listeners = new Set();

  function setState(next) {
    state = next;
    listeners.forEach((listener) => listener());
  }

  async function load() {
    if (disposed) return;
    const request = ++lastRequest;
    setState({ data: state.data, loading: true, error: "" });
    try {
      const data = await fetcher();
      if (disposed || request !== lastRequest) return;
      setState({ data, loading: false, error: "" });
    } catch (error) {
      if (disposed || request !== lastRequest) return;
      setState({
        data: state.data,
        loading: false,
        error: errorMessage(error),
      });
    }
  }

  return {
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    load,
    reload: load,
    dispose() {
      disposed = true;
      listeners.clear();
    },
  };
}

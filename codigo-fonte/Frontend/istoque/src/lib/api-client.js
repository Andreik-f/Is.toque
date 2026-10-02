// Cliente HTTP da API. Em desenvolvimento, "/api" passa pelo proxy do Vite
// (vite.config.js); no build de produção, VITE_API_URL aponta para a API
// publicada (ex.: https://minha-api.onrender.com/api).
export const API_URL = (import.meta.env?.VITE_API_URL || "/api").replace(
  /\/+$/,
  "",
);

// Erro devolvido pela API. `fields` traz a mensagem de cada campo inválido
// (o "campos" do ApiErrorResponse), quando houver.
export class ApiError extends Error {
  constructor(message, { status = 0, fields = null } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.fields = fields;
  }
}

export function createApiClient({
  baseUrl = API_URL,
  fetchFn = (...args) => fetch(...args),
} = {}) {
  async function request(method, path, body) {
    let response;
    try {
      response = await fetchFn(baseUrl + path, {
        method,
        headers:
          body === undefined ? undefined : { "Content-Type": "application/json" },
        body: body === undefined ? undefined : JSON.stringify(body),
      });
    } catch {
      throw new ApiError(
        "Não foi possível conectar ao servidor. Verifique se a API está no ar.",
      );
    }
    const text = await response.text();
    let data = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      // resposta sem JSON (ex.: erro do proxy): fica só o status
    }
    if (!response.ok) {
      throw new ApiError(
        data?.message ||
          (response.status >= 500
            ? "A API não respondeu. Verifique se ela está no ar e tente de novo."
            : `A API recusou a requisição (erro ${response.status}).`),
        { status: response.status, fields: data?.campos ?? null },
      );
    }
    return data;
  }
  return {
    get: (path) => request("GET", path),
    post: (path, body) => request("POST", path, body),
    put: (path, body) => request("PUT", path, body),
  };
}

export const api = createApiClient();

// Texto para mostrar na tela: as mensagens dos campos, se houver, ou a geral.
export function errorMessage(error) {
  const fields = error?.fields ? Object.values(error.fields) : [];
  return fields.length
    ? fields.join(" ")
    : error?.message || "Algo deu errado. Tente de novo.";
}

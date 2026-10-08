import { api } from "@/lib/api-client.js";
import { sessionFromSignup, signupToApi } from "../utils/api-fields.js";

// As duas funções devolvem os dados da sessão (usuário e empresa).

export const login = ({ email, senha }) =>
  api.post("/auth/login", { email: email.trim(), senha });

// Cadastra a empresa e o administrador juntos e já entra com ele.
export const signup = async (values) =>
  sessionFromSignup(await api.post("/auth/cadastro", signupToApi(values)));

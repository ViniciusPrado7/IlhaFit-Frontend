import { api } from "./Api";

const LOGIN_ENDPOINT = "/auth/login";

export const profissionalService = {
  cadastrarProfissional(payload) {
    return api.post("/profissionais/cadastrar", payload);
  },

  listarProfissionais() {
    return api.get("/profissionais/profissionais");
  },

  loginProfissional(payload) {
    return api.post(LOGIN_ENDPOINT, payload);
  },
};

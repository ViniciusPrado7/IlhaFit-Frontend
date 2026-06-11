import { api } from "./Api";

const LOGIN_ENDPOINT = "/auth/login";

export const profissionalService = {
  cadastrarProfissional(payload) {
    return api.post("/profissionais/cadastrar", payload);
  },

  listarProfissionais() {
    return api.get("/profissionais/profissionais");
  },

  buscarProfissionalPorId(id) {
    return api.get(`/profissionais/profissionais/${id}`);
  },

  atualizarProfissional(id, payload) {
    return api.put(`/profissionais/atualizar/${id}`, payload);
  },

  excluirProfissional(id) {
    return api.delete(`/profissionais/deletar/${id}`);
  },

  loginProfissional(payload) {
    return api.post(LOGIN_ENDPOINT, payload);
  },
};

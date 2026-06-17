import { api } from "./Api";

export const avaliacaoService = {
  listarPorEstabelecimento(id) {
    return api.get(`/avaliacoes/estabelecimento/${id}`);
  },

  listarPorProfissional(id) {
    return api.get(`/avaliacoes/profissional/${id}`);
  },

  criarAvaliacao(payload) {
    return api.post("/avaliacoes", payload);
  },

  deletarAvaliacao(id) {
    return api.delete(`/avaliacoes/${id}`);
  },
};

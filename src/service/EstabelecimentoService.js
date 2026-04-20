import { api } from "./Api";

const LOGIN_ENDPOINT = "/auth/login";

export const estabelecimentoService = {
  cadastrarEstabelecimento(payload) {
    return api.post("/estabelecimentos/cadastrar", payload);
  },

  listarEstabelecimentos() {
    return api.get("/estabelecimentos/estabelecimentos");
  },

  buscarEstabelecimentoPorId(id) {
    return api.get(`/estabelecimentos/estabelecimentos/${id}`);
  },

  atualizarEstabelecimento(id, payload) {
    return api.put(`/estabelecimentos/atualizar/${id}`, payload);
  },

  excluirEstabelecimento(id) {
    return api.delete(`/estabelecimentos/deletar/${id}`);
  },

  cadastrarGradeEstabelecimento(estabelecimentoId, payload) {
    return api.post(`/grade-atividades/cadastrar/estabelecimento/${estabelecimentoId}`, payload);
  },

  atualizarGradeAtividade(id, payload) {
    return api.put(`/grade-atividades/atualizar/${id}`, payload);
  },

  excluirGradeAtividade(id) {
    return api.delete(`/grade-atividades/deletar/${id}`);
  },

  loginEstabelecimento(payload) {
    return api.post(LOGIN_ENDPOINT, payload);
  },
};

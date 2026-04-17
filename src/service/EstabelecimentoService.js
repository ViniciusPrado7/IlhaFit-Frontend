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

  loginEstabelecimento(payload) {
    return api.post(LOGIN_ENDPOINT, payload);
  },
};

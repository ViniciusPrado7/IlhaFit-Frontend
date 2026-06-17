import { api } from "./Api";

export const denunciaService = {
  criarDenuncia(payload) {
    return api.post("/denuncias", payload);
  },
};

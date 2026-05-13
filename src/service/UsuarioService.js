import { api } from "./Api";

export const usuarioService = {
  atualizarUsuario(id, payload) {
    return api.put(`/usuarios/atualizar/${id}`, payload);
  },

  excluirUsuario(id) {
    return api.delete(`/usuarios/deletar/${id}`);
  },
};

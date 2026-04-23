import { api } from "./Api";

export const categoriaService = {
  listarCategorias() {
    return api.get("/categorias");
  },

  buscarPorId(id) {
    return api.get(`/categorias/${id}`);
  },

  cadastrarCategoria(payload) {
    return api.post("/categorias", payload);
  },

  atualizar(id, payload) {
    return api.put(`/categorias/${id}`, payload);
  },

  deletar(id) {
    return api.delete(`/categorias/${id}`);
  },
};

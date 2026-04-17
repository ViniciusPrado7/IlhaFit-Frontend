import { api } from "./Api";

export const categoriaService = {
  listarCategorias() {
    return api.get("/categorias/categorias");
  },

  cadastrarCategoria(payload) {
    return api.post("/categorias/cadastrar", payload);
  },
};


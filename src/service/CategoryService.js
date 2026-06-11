import { api } from "./Api";

export const categoriaService = {
  listarCategorias() {
    return api.get("/categorias/categorias");
  },

  listarCategoriasPaginadas(page = 0, size = 10, search = "") {
    const params = { page, size };
    if (search?.trim()) params.search = search.trim();
    return api.get("/categorias/categorias/paginadas", { params });
  },

  listarTodas() {
    return api.get("/categorias/categorias");
  },

  criar(payload) {
    return api.post("/categorias/cadastrar", payload);
  },

  atualizar(id, payload) {
    return api.put(`/categorias/atualizar/${id}`, payload);
  },

  excluir(id) {
    return api.delete(`/categorias/deletar/${id}`);
  },
};

export const categoriaPendenteService = {
  solicitar(payload) {
    return api.post("/categorias/pendentes/solicitar", payload);
  },

  listarMinhas(status) {
    const params = status ? { status } : {};
    return api.get("/categorias/pendentes/minhas", { params });
  },

  listarTodas(status) {
    const params = status ? { status } : {};
    return api.get("/categorias/pendentes", { params });
  },

  aprovar(id, payload = {}) {
    return api.put(`/categorias/pendentes/atualizar/${id}/aprovar`, payload);
  },

  rejeitar(id, payload = {}) {
    return api.put(`/categorias/pendentes/atualizar/${id}/rejeitar`, payload);
  },
};

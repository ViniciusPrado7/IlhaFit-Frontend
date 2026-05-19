import { api } from "../service/Api";
import {
  categoriaPendenteService as categoriaPendenteApi,
  categoriaService as categoriaApi,
} from "../service/CategoriaService";

export const adminService = {
  async getAllUsers() {
    const res = await api.get("/admin/users");
    return res.data;
  },

  async deleteUser(id, tipo) {
    await api.delete(`/admin/users/${id}`, { params: { tipo } });
  },
};

const mapEstabelecimento = (estabelecimento) => ({
  ...estabelecimento,
  categorias: (estabelecimento.gradeAtividades || []).map((item) => ({
    id: item.id,
    nome: item.atividade,
  })),
  exclusivoMulheres: (estabelecimento.gradeAtividades || []).some((item) => item.exclusivoMulheres),
});

export const estabelecimentoService = {
  async getAll() {
    const res = await api.get("/estabelecimentos/estabelecimentos");
    return (res.data || []).map(mapEstabelecimento);
  },

  async getById(id) {
    const res = await api.get(`/estabelecimentos/estabelecimentos/${id}`);
    return res.data;
  },

  async delete(id) {
    await api.delete(`/admin/users/${id}`, { params: { tipo: "estabelecimento" } });
  },
};

export const denunciaService = {
  async getAll(status) {
    const params = status ? { status } : {};
    const res = await api.get("/denuncias", { params });
    return res.data;
  },

  async atualizarStatus(id, status) {
    const res = await api.put(`/denuncias/${id}/status`, { status });
    return res.data;
  },

  async excluirAvaliacao(id) {
    await api.delete(`/denuncias/${id}/avaliacao`);
  },
};

export const categoriaService = {
  async listarTodas() {
    const res = await categoriaApi.listarTodas();
    return res.data;
  },

  async criar(data) {
    const res = await categoriaApi.criar(data);
    return res.data;
  },

  async atualizar(id, data) {
    const res = await categoriaApi.atualizar(id, data);
    return res.data;
  },

  async excluir(id) {
    await categoriaApi.excluir(id);
  },
};

export const profissionalService = {
  async listarProfissionais() {
    const res = await api.get("/profissionais/profissionais");
    return res.data;
  },

  async buscarProfissionalPorId(id) {
    const res = await api.get(`/profissionais/profissionais/${id}`);
    return res.data;
  },

  async excluirProfissional(id) {
    await api.delete(`/profissionais/deletar/${id}`);
  },
};

export const solicitacaoCategoriaService = {
  async getAll(status) {
    const res = await categoriaPendenteApi.listarTodas(status);
    return res.data;
  },

  async aprovar(id, payload) {
    const res = await categoriaPendenteApi.aprovar(id, payload);
    return res.data;
  },

  async rejeitar(id, payload) {
    const res = await categoriaPendenteApi.rejeitar(id, payload);
    return res.data;
  },
};

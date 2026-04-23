import { api } from "./Api";

export const adminService = {
  async getAllUsers() {
    const [alunosRes, profissionaisRes, estabelecimentosRes] = await Promise.allSettled([
      api.get("/alunos/alunos"),
      api.get("/profissionais/profissionais"),
      api.get("/estabelecimentos/estabelecimentos"),
    ]);

    const alunos = alunosRes.status === "fulfilled"
      ? (alunosRes.value.data || []).map((u) => ({ ...u, tipo: "aluno" }))
      : [];

    const profissionais = profissionaisRes.status === "fulfilled"
      ? (profissionaisRes.value.data || []).map((u) => ({ ...u, tipo: "profissional" }))
      : [];

    const estabelecimentos = estabelecimentosRes.status === "fulfilled"
      ? (estabelecimentosRes.value.data || []).map((u) => ({ ...u, tipo: "estabelecimento" }))
      : [];

    return [...alunos, ...profissionais, ...estabelecimentos];
  },

  deleteUser(id, tipo) {
    switch (tipo) {
      case "aluno":
        return api.delete(`/alunos/deletar/${id}`);
      case "profissional":
        return api.delete(`/profissionais/deletar/${id}`);
      case "estabelecimento":
        return api.delete(`/estabelecimentos/deletar/${id}`);
      default:
        return Promise.reject(new Error(`Tipo desconhecido: ${tipo}`));
    }
  },

  getAllDenuncias(status) {
    const params = status ? { status } : {};
    return api.get("/denuncias", { params });
  },

  updateDenunciaStatus(id, status) {
    return api.put(`/denuncias/${id}/status`, { status });
  },

  deleteAvaliacaoDenuncia(id) {
    return api.delete(`/denuncias/${id}/avaliacao`);
  },
};

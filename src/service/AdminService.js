import { api } from "./Api";

export const adminService = {
  async getAllUsers() {
    const response = await api.get("/admin/users");
    return response.data || [];
  },

  deleteUser(id, tipo) {
    return api.delete(`/admin/users/${id}`, { params: { tipo } });
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

import { api } from './Api';








// ==================== DENUNCIAS ====================
export const createDenuncia = (data) => {
    return api.post('/denuncias', data);
};

export const getAllDenuncias = (status) => {
    const params = status ? { status } : {};
    return api.get('/denuncias', { params });
};

export const updateDenunciaStatus = (id, status) => {
    return api.put(`/denuncias/${id}/status`, { status });
};

export const deleteAvaliacaoDenuncia = (id) => {
    return api.delete(`/denuncias/${id}/avaliacao`);
};





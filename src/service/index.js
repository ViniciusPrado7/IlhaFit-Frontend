import { api } from './Api';

// ==================== AVALIAÇÕES ====================
export const getAvaliacoesByEstabelecimento = (id) => {
    return api.get(`/avaliacoes/estabelecimento/${id}`);
};

export const getAvaliacoesByProfissional = (id) => {
    return api.get(`/avaliacoes/profissional/${id}`);
};

export const createAvaliacao = (data) => {
    return api.post('/avaliacoes', data);
};

export const deleteAvaliacao = (id) => {
    return api.delete(`/avaliacoes/${id}`);
};



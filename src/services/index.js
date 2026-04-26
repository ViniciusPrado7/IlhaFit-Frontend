import { api } from '../service/Api';

// ==================== ADMIN ====================
export const adminService = {
    async getAllUsers() {
        const res = await api.get('/admin/users');
        return res.data;
    },
    async deleteUser(id, tipo) {
        await api.delete(`/admin/users/${id}`, { params: { tipo } });
    },
};

// ==================== ESTABELECIMENTOS ====================
export const estabelecimentoService = {
    async getAll() {
        const res = await api.get('/estabelecimentos/estabelecimentos');
        return res.data.map(e => ({
            ...e,
            categorias: (e.gradeAtividades || []).map(g => ({ id: g.id, nome: g.atividade })),
            exclusivoMulheres: (e.gradeAtividades || []).some(g => g.exclusivoMulheres),
        }));
    },
    async delete(id) {
        await api.delete(`/admin/users/${id}`, { params: { tipo: 'estabelecimento' } });
    },
};

// ==================== DENUNCIAS ====================
export const denunciaService = {
    async getAll(status) {
        const params = status ? { status } : {};
        const res = await api.get('/denuncias', { params });
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

// ==================== CATEGORIAS ====================
export const categoriaService = {
    async listarTodas() {
        const res = await api.get('/categorias/categorias');
        return res.data;
    },
    async criar(data) {
        const res = await api.post('/categorias/cadastrar', data);
        return res.data;
    },
    async atualizar(id, data) {
        const res = await api.put(`/categorias/atualizar/${id}`, data);
        return res.data;
    },
    async excluir(id) {
        await api.delete(`/categorias/deletar/${id}`);
    },
};

// ==================== SOLICITACOES DE CATEGORIAS ====================
export const solicitacaoCategoriaService = {
    async getAll(status) {
        const params = status ? { status } : {};
        const res = await api.get('/categorias/pendentes', { params });
        return res.data;
    },
    async aprovar(id) {
        const res = await api.put(`/categorias/pendentes/atualizar/${id}/aprovar`);
        return res.data;
    },
    async rejeitar(id) {
        const res = await api.put(`/categorias/pendentes/atualizar/${id}/rejeitar`);
        return res.data;
    },
};

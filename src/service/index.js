import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

const ro otElement = document.getElementById('root');
const root = ReactDOM.createRoot(rootElement);




//==================== AVALIAÇÕES ====================
export const avaliacaoService = {
    getByEstabelecimento: async (id) => {
        const response = await api.get(`/avaliacoes/estabelecimento/${id}`);
        return response.data;
    },
    getByProfissional: async (id) => {
        const response = await api.get(`/avaliacoes/profissional/${id}`);
        return response.data;
    },
    avaliar: async (data) => {
        const response = await api.post('/avaliacoes', data);
        return response.data;
    },
    delete: async (id) => {
        const response = await api.delete(`/avaliacoes/${id}`);
        return response.data;
    },
};






// ==================== DENUNCIAS ====================
export const denunciaService = {
    // Criar denúncia (qualquer usuário autenticado)
    criar: async (data) => {
        const response = await api.post('/denuncias', data);
        return response.data;
    },

    // Listar todas as denúncias (admin)
    getAll: async (status) => {
        const params = status ? { status } : {};
        const response = await api.get('/denuncias', { params });
        return response.data;
    },

    // Atualizar status da denúncia (admin)
    atualizarStatus: async (id, status) => {
        const response = await api.put(`/denuncias/${id}/status`, { status });
        return response.data;
    },

    // Excluir avaliação denunciada (admin)
    excluirAvaliacao: async (id) => {
        const response = await api.delete(`/denuncias/${id}/avaliacao`);
        return response.data;
    },
};






root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

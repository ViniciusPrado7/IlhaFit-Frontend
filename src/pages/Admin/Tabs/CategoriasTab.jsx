import React, { useState, useEffect } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField,
  CircularProgress, Tooltip, Avatar
} from '@mui/material';
import { FaEdit, FaTrash, FaPlus, FaTags } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { categoriaService } from '../../../services';

const CategoriasTab = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  
  const [formData, setFormData] = useState({
    id: null,
    nome: '',
    descricao: '',
    iconeUrl: ''
  });

  const carregarCategorias = async () => {
    try {
      setLoading(true);
      const data = await categoriaService.listarTodas();
      setCategorias(data);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCategorias();
  }, []);

  const handleOpenNew = () => {
    setFormData({ id: null, nome: '', descricao: '', iconeUrl: '' });
    setEditMode(false);
    setOpenModal(true);
  };

  const handleOpenEdit = (categoria) => {
    setFormData({ ...categoria });
    setEditMode(true);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nome.trim()) {
      toast.error("O nome da categoria é obrigatório.");
      return;
    }

    try {
      if (editMode) {
        await categoriaService.atualizar(formData.id, formData);
        toast.success("Categoria atualizada com sucesso!");
      } else {
        await categoriaService.criar(formData);
        toast.success("Categoria criada com sucesso!");
      }
      handleCloseModal();
      carregarCategorias();
    } catch (error) {
      console.error("Erro ao salvar categoria:", error);
      toast.error(error.response?.data?.erro || "Erro ao salvar categoria.");
    }
  };

  const handleDelete = async (id, nome) => {
    if (window.confirm(`Tem certeza que deseja excluir a categoria "${nome}"?`)) {
      try {
        await categoriaService.excluir(id);
        toast.success("Categoria excluída com sucesso!");
        carregarCategorias();
      } catch (error) {
        toast.error("Erro ao excluir categoria. Ela pode estar em uso.");
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Gerenciamento de Categorias
        </Typography>
        <Button
          variant="contained"
          startIcon={<FaPlus />}
          onClick={handleOpenNew}
          sx={{ borderRadius: 2 }}
        >
          Nova Categoria
        </Button>
      </Box>

      <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: 'action.hover' }}>
                <TableCell>Ícone</TableCell>
                <TableCell>Nome</TableCell>
                <TableCell>Descrição</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categorias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center" sx={{ py: 3 }}>
                    Nenhuma categoria encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                categorias.map((cat) => (
                  <TableRow key={cat.id} hover>
                    <TableCell>
                      {cat.iconeUrl ? (
                        <Avatar src={cat.iconeUrl} alt={cat.nome} variant="rounded" sx={{ width: 32, height: 32 }} />
                      ) : (
                        <Avatar variant="rounded" sx={{ width: 32, height: 32, bgcolor: 'primary.light' }}>
                          <FaTags size={14} />
                        </Avatar>
                      )}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{cat.nome}</TableCell>
                    <TableCell>{cat.descricao || '-'}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton size="small" color="primary" onClick={() => handleOpenEdit(cat)}>
                          <FaEdit size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" color="error" onClick={() => handleDelete(cat.id, cat.nome)}>
                          <FaTrash size={16} />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}
      </TableContainer>

      {/* Modal Formulário */}
      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editMode ? 'Editar Categoria' : 'Nova Categoria'}
        </DialogTitle>
        <form onSubmit={handleSubmit}>
          <DialogContent dividers>
            <TextField
              fullWidth
              label="Nome da Categoria"
              name="nome"
              value={formData.nome}
              onChange={handleInputChange}
              required
              margin="normal"
            />
            <TextField
              fullWidth
              label="Descrição (opcional)"
              name="descricao"
              value={formData.descricao}
              onChange={handleInputChange}
              margin="normal"
              multiline
              rows={2}
            />
            <TextField
              fullWidth
              label="URL do Ícone (opcional)"
              name="iconeUrl"
              value={formData.iconeUrl}
              onChange={handleInputChange}
              margin="normal"
              placeholder="https://..."
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseModal} color="inherit">Cancelar</Button>
            <Button type="submit" variant="contained">Salvar</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
};

export default CategoriasTab;

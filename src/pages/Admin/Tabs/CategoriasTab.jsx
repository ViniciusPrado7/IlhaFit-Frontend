import React, { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Button, Paper, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, TablePagination, IconButton, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, InputAdornment,
  CircularProgress, Tooltip, Avatar
} from '@mui/material';
import { FaEdit, FaTrash, FaPlus, FaTags, FaSearch } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { categoriaService } from '../../../services';

const CategoriasTab = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0);
    }, 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filteredCategorias = useMemo(() => {
    if (!debouncedSearchTerm) return categorias;
    const term = debouncedSearchTerm.toLowerCase();
    return categorias.filter(c =>
      c.nome?.toLowerCase().includes(term) ||
      c.descricao?.toLowerCase().includes(term)
    );
  }, [categorias, debouncedSearchTerm]);

  const paginatedCategorias = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredCategorias.slice(start, start + rowsPerPage);
  }, [filteredCategorias, page, rowsPerPage]);
  
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

      <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
          <TextField
            placeholder="Buscar por nome ou descrição..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 250 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaSearch size={16} />
                </InputAdornment>
              ),
            }}
          />
          {debouncedSearchTerm && (
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: 'nowrap' }}>
              {filteredCategorias.length} resultado{filteredCategorias.length !== 1 ? 's' : ''}
            </Typography>
          )}
        </Box>
      </Paper>

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
                paginatedCategorias.map((cat) => (
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

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredCategorias.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
        labelRowsPerPage="Linhas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`}
      />

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

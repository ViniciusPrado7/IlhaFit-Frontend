import React, { useEffect, useMemo, useState } from "react";
import { usePersistedRowsPerPage } from "../../../hooks/usePersistedRowsPerPage";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { FaEdit, FaPlus, FaSearch, FaTrash } from "react-icons/fa";
import { toast } from "react-toastify";
import { categoriaService } from "../../../services";
import { toTitleCase } from "../../../utils/titleCase";

const CategoriasTab = () => {
  const [categorias, setCategorias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = usePersistedRowsPerPage(10);
  const [formData, setFormData] = useState({
    id: null,
    nome: "",
  });

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
    return categorias.filter((categoria) => categoria.nome?.toLowerCase().includes(term));
  }, [categorias, debouncedSearchTerm]);

  const paginatedCategorias = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredCategorias.slice(start, start + rowsPerPage);
  }, [filteredCategorias, page, rowsPerPage]);

  const carregarCategorias = async () => {
    try {
      setLoading(true);
      const data = await categoriaService.listarTodas();
      setCategorias(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Erro ao carregar categorias:", error);
      toast.error("Erro ao carregar categorias.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregarCategorias();
  }, []);

  const handleOpenNew = () => {
    setFormData({ id: null, nome: "" });
    setEditMode(false);
    setOpenModal(true);
  };

  const handleOpenEdit = (categoria) => {
    setFormData({ id: categoria.id, nome: categoria.nome || "" });
    setEditMode(true);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.nome.trim()) {
      toast.error("O nome da categoria é obrigatório.");
      return;
    }

    try {
      const payload = { nome: formData.nome.trim() };
      if (editMode) {
        await categoriaService.atualizar(formData.id, payload);
        toast.success("Categoria atualizada com sucesso!");
      } else {
        await categoriaService.criar(payload);
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
      } catch {
        toast.error("Erro ao excluir categoria. Ela pode estar em uso.");
      }
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
        <Typography variant="h6" fontWeight="bold">
          Gerenciamento de Categorias
        </Typography>
        <Button variant="contained" startIcon={<FaPlus />} onClick={handleOpenNew} sx={{ borderRadius: 2 }}>
          Nova Categoria
        </Button>
      </Box>

      <Paper elevation={0} sx={{ p: 3, mb: 3, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            placeholder="Buscar por nome..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
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
          {debouncedSearchTerm ? (
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
              {filteredCategorias.length} resultado{filteredCategorias.length !== 1 ? "s" : ""}
            </Typography>
          ) : null}
        </Box>
      </Paper>

      <TableContainer component={Paper} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Table>
            <TableHead>
              <TableRow sx={{ bgcolor: "action.hover" }}>
                <TableCell>Nome</TableCell>
                <TableCell align="center">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {categorias.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={2} align="center" sx={{ py: 3 }}>
                    Nenhuma categoria encontrada.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCategorias.map((categoria) => (
                  <TableRow key={categoria.id} hover>
                    <TableCell sx={{ fontWeight: 500 }}>{toTitleCase(categoria.nome)}</TableCell>
                    <TableCell align="center">
                      <Tooltip title="Editar">
                        <IconButton size="small" color="primary" onClick={() => handleOpenEdit(categoria)}>
                          <FaEdit size={16} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Excluir">
                        <IconButton size="small" color="error" onClick={() => handleDelete(categoria.id, categoria.nome)}>
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
        onRowsPerPageChange={(event) => {
          setRowsPerPage(parseInt(event.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Linhas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`}
      />

      <Dialog open={openModal} onClose={handleCloseModal} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? "Editar Categoria" : "Nova Categoria"}</DialogTitle>
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
              helperText="Categorias agora usam apenas nome."
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

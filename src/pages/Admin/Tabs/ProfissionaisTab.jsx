import React, { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Chip,
    Button,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Tooltip,
    useTheme,
    alpha,
} from "@mui/material";
import {
    FaTrash,
    FaSearch,
    FaExclamationTriangle,
    FaEye,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { profissionalService } from "../../../services";
import ModalProfissional from "../../../components/ModalProfissional";

const ProfissionaisTab = () => {
    const theme = useTheme();
    const [profissionais, setProfissionais] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, profissional: null });
    const [profissionalModal, setProfissionalModal] = useState({ open: false, profissional: null });

    useEffect(() => {
        loadProfissionais();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [searchTerm, profissionais]);

    useEffect(() => {
        setPage(0);
    }, [searchTerm]);

    const loadProfissionais = async () => {
        try {
            setLoading(true);
            const data = await profissionalService.listarProfissionais();
            setProfissionais(Array.isArray(data) ? data : data.data || []);
        } catch (error) {
            console.error("Erro ao carregar profissionais:", error);
            toast.error("Erro ao carregar profissionais");
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = () => {
        if (!searchTerm) {
            setFiltered(profissionais);
            return;
        }
        const term = searchTerm.toLowerCase();
        setFiltered(
            profissionais.filter(
                (p) =>
                    p.nome?.toLowerCase().includes(term) ||
                    p.email?.toLowerCase().includes(term) ||
                    p.especialidade?.toLowerCase().includes(term) ||
                    p.regiao?.toLowerCase().includes(term)
            )
        );
    };

    const handleDelete = async () => {
        if (!deleteDialog.profissional) return;
        try {
            await profissionalService.excluirProfissional(deleteDialog.profissional.id);
            toast.success("Profissional excluído com sucesso!");
            loadProfissionais();
            setDeleteDialog({ open: false, profissional: null });
        } catch (error) {
            console.error("Erro ao excluir profissional:", error);
            toast.error("Erro ao excluir profissional");
        }
    };

    const handleOpenModal = (prof) => {
        setProfissionalModal({ open: true, profissional: prof });
    };

    const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    return (
        <Box>
            {/* Stats */}
            <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
                <Paper elevation={0} sx={{ flex: 1, p: 2, minWidth: 150, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <Typography variant="body2" color="text.secondary">Total de Profissionais</Typography>
                    <Typography variant="h4" fontWeight={700} color="secondary.main">{profissionais.length}</Typography>
                </Paper>
                <Paper elevation={0} sx={{ flex: 1, p: 2, minWidth: 150, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <Typography variant="body2" color="text.secondary">Filtrados</Typography>
                    <Typography variant="h4" fontWeight={700}>{filtered.length}</Typography>
                </Paper>
            </Box>

            {/* Busca */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <TextField
                    placeholder="Buscar por nome, email, especialidade ou região..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    size="small"
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <FaSearch size={16} />
                            </InputAdornment>
                        ),
                    }}
                />
            </Paper>

            {/* Tabela */}
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Nome</strong></TableCell>
                                <TableCell><strong>Email</strong></TableCell>
                                <TableCell><strong>Especialidade</strong></TableCell>
                                <TableCell><strong>Região</strong></TableCell>
                                <TableCell><strong>Telefone</strong></TableCell>
                                <TableCell align="right"><strong>Ações</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                        <CircularProgress size={32} />
                                    </TableCell>
                                </TableRow>
                            ) : paginated.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        Nenhum profissional encontrado
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginated.map((prof) => (
                                    <TableRow
                                        key={prof.id}
                                        hover
                                        onClick={() => handleOpenModal(prof)}
                                        sx={{ cursor: 'pointer' }}
                                    >
                                        <TableCell>{prof.nome || "N/A"}</TableCell>
                                        <TableCell>{prof.email || "N/A"}</TableCell>
                                        <TableCell>
                                            {prof.especialidade ? (
                                                <Chip label={prof.especialidade} color="secondary" size="small" />
                                            ) : "—"}
                                        </TableCell>
                                        <TableCell>{prof.regiao || "—"}</TableCell>
                                        <TableCell>{prof.telefone || "—"}</TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                                <Tooltip title="Ver perfil">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => { e.stopPropagation(); handleOpenModal(prof); }}
                                                        sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}
                                                    >
                                                        <FaEye size={14} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Excluir">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, profissional: prof }); }}
                                                        sx={{ bgcolor: alpha(theme.palette.error.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) } }}
                                                    >
                                                        <FaTrash size={14} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
                <TablePagination
                    component="div"
                    count={filtered.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    rowsPerPageOptions={[10, 25, 50]}
                    labelRowsPerPage="Linhas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
                />
            </Paper>

            {/* Dialog de Exclusão */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, profissional: null })}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FaExclamationTriangle color={theme.palette.error.main} />
                    Confirmar Exclusão
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Tem certeza que deseja excluir o profissional{" "}
                        <strong>{deleteDialog.profissional?.nome}</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Esta ação não pode ser desfeita.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, profissional: null })}>Cancelar</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Excluir</Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Perfil do Profissional */}
            <ModalProfissional
                open={profissionalModal.open}
                onClose={() => setProfissionalModal({ open: false, profissional: null })}
                profissional={profissionalModal.profissional}
            />
        </Box>
    );
};

export default ProfissionaisTab;

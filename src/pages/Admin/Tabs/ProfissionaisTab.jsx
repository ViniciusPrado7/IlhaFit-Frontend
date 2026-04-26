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
    Drawer,
    Divider,
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
    FaUser,
    FaEnvelope,
    FaPhone,
    FaMapMarkerAlt,
    FaIdCard,
    FaBriefcase,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { profissionalService } from "../../../services";

const InfoRow = ({ icon, label, value }) => {
    if (!value) return null;
    return (
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", py: 1 }}>
            <Box sx={{ color: "text.secondary", mt: 0.3, flexShrink: 0 }}>{icon}</Box>
            <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
                <Typography variant="body2">{value}</Typography>
            </Box>
        </Box>
    );
};

const ProfissionaisTab = () => {
    const theme = useTheme();
    const [profissionais, setProfissionais] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, profissional: null });
    const [detailsDrawer, setDetailsDrawer] = useState({ open: false, profissional: null });

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
            const res = await profissionalService.listarProfissionais();
            setProfissionais(res.data || res);
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

    const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const selected = detailsDrawer.profissional;

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
                                        onClick={() => setDetailsDrawer({ open: true, profissional: prof })}
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
                                                <Tooltip title="Ver detalhes">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => { e.stopPropagation(); setDetailsDrawer({ open: true, profissional: prof }); }}
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

            {/* Drawer de Detalhes */}
            <Drawer
                anchor="right"
                open={detailsDrawer.open}
                onClose={() => setDetailsDrawer({ open: false, profissional: null })}
                PaperProps={{ sx: { width: { xs: '100%', sm: 380 }, p: 3 } }}
            >
                {selected && (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight={800}>Detalhes do Profissional</Typography>
                            {selected.especialidade && (
                                <Chip label={selected.especialidade} color="secondary" size="small" />
                            )}
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        <InfoRow icon={<FaIdCard size={14} />} label="ID" value={String(selected.id)} />
                        <InfoRow icon={<FaUser size={14} />} label="Nome" value={selected.nome} />
                        <InfoRow icon={<FaEnvelope size={14} />} label="Email" value={selected.email} />
                        <InfoRow icon={<FaPhone size={14} />} label="Telefone" value={selected.telefone} />
                        <InfoRow icon={<FaBriefcase size={14} />} label="Especialidade" value={selected.especialidade} />
                        <InfoRow icon={<FaMapMarkerAlt size={14} />} label="Região" value={selected.regiao} />

                        {selected.descricao && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>Descrição</Typography>
                                <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.7 }}>
                                    {selected.descricao}
                                </Typography>
                            </>
                        )}

                        <Box sx={{ mt: 4 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="error"
                                startIcon={<FaTrash size={13} />}
                                onClick={() => {
                                    setDetailsDrawer({ open: false, profissional: null });
                                    setDeleteDialog({ open: true, profissional: selected });
                                }}
                                sx={{ textTransform: 'none' }}
                            >
                                Excluir profissional
                            </Button>
                        </Box>
                    </Box>
                )}
            </Drawer>
        </Box>
    );
};

export default ProfissionaisTab;

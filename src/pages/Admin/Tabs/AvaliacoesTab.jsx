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
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Rating,
    useTheme,
    alpha,
} from "@mui/material";
import {
    FaTrash,
    FaSearch,
    FaExclamationTriangle,
    FaCheck,
    FaTimes,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { adminService } from "../../../services";

const STATUS_OPTIONS = [
    { value: "todos", label: "Todos" },
    { value: "PENDENTE", label: "Pendente" },
    { value: "RESOLVIDA", label: "Resolvida" },
    { value: "REJEITADA", label: "Rejeitada" },
];

const getStatusColor = (status) => {
    switch (status) {
        case "PENDENTE": return "warning";
        case "RESOLVIDA": return "success";
        case "REJEITADA": return "error";
        default: return "default";
    }
};

const getMotivoLabel = (motivo) => {
    const map = {
        PRECONCEITO: "Preconceito",
        LINGUAGEM_OFENSIVA: "Linguagem ofensiva",
        SPAM: "Spam",
        INFORMACAO_FALSA: "Informação falsa",
        OUTROS: "Outros",
    };
    return map[motivo] || motivo;
};

const formatDate = (date) => {
    if (!date) return "—";
    const parsed = new Date(date);
    if (Number.isNaN(parsed.getTime())) return "—";
    return parsed.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
};

const AvaliacoesTab = () => {
    const theme = useTheme();
    const [denuncias, setDenuncias] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("PENDENTE");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, denuncia: null });
    const [statusDialog, setStatusDialog] = useState({ open: false, denuncia: null, novoStatus: null });

    useEffect(() => {
        loadDenuncias();
    }, []);

    useEffect(() => {
        applyFilter();
    }, [searchTerm, filterStatus, denuncias]);

    useEffect(() => {
        setPage(0);
    }, [searchTerm, filterStatus]);

    const loadDenuncias = async () => {
        try {
            setLoading(true);
            const res = await adminService.getAllDenuncias();
            setDenuncias(res.data || res);
        } catch (error) {
            console.error("Erro ao carregar denúncias:", error);
            toast.error("Erro ao carregar denúncias");
        } finally {
            setLoading(false);
        }
    };

    const applyFilter = () => {
        let result = denuncias;

        if (filterStatus !== "todos") {
            result = result.filter((d) => d.status === filterStatus);
        }

        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            result = result.filter(
                (d) =>
                    d.avaliacao?.comentario?.toLowerCase().includes(term) ||
                    d.avaliacao?.nomeAutor?.toLowerCase().includes(term) ||
                    getMotivoLabel(d.motivo).toLowerCase().includes(term)
            );
        }

        setFiltered(result);
    };

    const handleConfirmStatus = async () => {
        const { denuncia, novoStatus } = statusDialog;
        if (!denuncia || !novoStatus) return;

        try {
            await adminService.updateDenunciaStatus(denuncia.id, novoStatus);
            toast.success(`Denúncia marcada como ${novoStatus.toLowerCase()}`);
            setStatusDialog({ open: false, denuncia: null, novoStatus: null });
            loadDenuncias();
        } catch (error) {
            console.error("Erro ao atualizar status:", error);
            toast.error("Erro ao atualizar status da denúncia");
        }
    };

    const handleDeleteAvaliacao = async () => {
        if (!deleteDialog.denuncia) return;
        try {
            await adminService.deleteAvaliacaoDenuncia(deleteDialog.denuncia.id);
            toast.success("Avaliação excluída com sucesso!");
            setDeleteDialog({ open: false, denuncia: null });
            loadDenuncias();
        } catch (error) {
            console.error("Erro ao excluir avaliação:", error);
            toast.error("Erro ao excluir avaliação");
        }
    };

    const pendentes = denuncias.filter((d) => d.status === "PENDENTE").length;
    const resolvidas = denuncias.filter((d) => d.status === "RESOLVIDA").length;
    const rejeitadas = denuncias.filter((d) => d.status === "REJEITADA").length;

    const paginated = filtered.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

    const statusDialogConfig = statusDialog.novoStatus === "RESOLVIDA"
        ? { color: "success", label: "Resolver", desc: "A denúncia será marcada como resolvida e a avaliação será mantida." }
        : { color: "warning", label: "Rejeitar", desc: "A denúncia será rejeitada. A avaliação continuará visível." };

    return (
        <Box>
            {/* Stats */}
            <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
                <Paper elevation={0} sx={{ flex: 1, p: 2, minWidth: 130, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <Typography variant="body2" color="text.secondary">Total</Typography>
                    <Typography variant="h4" fontWeight={700}>{denuncias.length}</Typography>
                </Paper>
                <Paper elevation={0} sx={{ flex: 1, p: 2, minWidth: 130, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <Typography variant="body2" color="text.secondary">Pendentes</Typography>
                    <Typography variant="h4" fontWeight={700} color="warning.main">{pendentes}</Typography>
                </Paper>
                <Paper elevation={0} sx={{ flex: 1, p: 2, minWidth: 130, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <Typography variant="body2" color="text.secondary">Resolvidas</Typography>
                    <Typography variant="h4" fontWeight={700} color="success.main">{resolvidas}</Typography>
                </Paper>
                <Paper elevation={0} sx={{ flex: 1, p: 2, minWidth: 130, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <Typography variant="body2" color="text.secondary">Rejeitadas</Typography>
                    <Typography variant="h4" fontWeight={700} color="error.main">{rejeitadas}</Typography>
                </Paper>
            </Box>

            {/* Filtros */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                    <TextField
                        placeholder="Buscar por autor, comentário ou motivo..."
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
                    <FormControl sx={{ minWidth: 160 }} size="small">
                        <InputLabel>Status</InputLabel>
                        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} label="Status">
                            {STATUS_OPTIONS.map((opt) => (
                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Box>
            </Paper>

            {/* Tabela */}
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
                    <Table>
                        <TableHead>
                            <TableRow>
                                <TableCell><strong>Status</strong></TableCell>
                                <TableCell><strong>Motivo</strong></TableCell>
                                <TableCell><strong>Autor da Avaliação</strong></TableCell>
                                <TableCell><strong>Nota</strong></TableCell>
                                <TableCell><strong>Comentário</strong></TableCell>
                                <TableCell><strong>Data</strong></TableCell>
                                <TableCell align="right"><strong>Ações</strong></TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 5 }}>
                                        <CircularProgress size={32} />
                                    </TableCell>
                                </TableRow>
                            ) : paginated.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        Nenhuma denúncia encontrada
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginated.map((denuncia) => (
                                    <TableRow key={denuncia.id} hover>
                                        <TableCell>
                                            <Chip
                                                label={denuncia.status}
                                                color={getStatusColor(denuncia.status)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <Typography variant="body2" fontWeight={600}>
                                                {getMotivoLabel(denuncia.motivo)}
                                            </Typography>
                                            {denuncia.descricaoAdicional && (
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                                                    {denuncia.descricaoAdicional}
                                                </Typography>
                                            )}
                                        </TableCell>
                                        <TableCell>{denuncia.avaliacao?.nomeAutor || "—"}</TableCell>
                                        <TableCell>
                                            <Rating value={Number(denuncia.avaliacao?.nota) || 0} readOnly size="small" />
                                        </TableCell>
                                        <TableCell sx={{ maxWidth: 220 }}>
                                            <Typography variant="body2" noWrap title={denuncia.avaliacao?.comentario}>
                                                {denuncia.avaliacao?.comentario || "—"}
                                            </Typography>
                                        </TableCell>
                                        <TableCell>{formatDate(denuncia.dataDenuncia || denuncia.createdAt)}</TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                                {denuncia.status === "PENDENTE" && (
                                                    <>
                                                        <Tooltip title="Resolver (manter avaliação)">
                                                            <IconButton
                                                                size="small"
                                                                color="success"
                                                                onClick={() => setStatusDialog({ open: true, denuncia, novoStatus: "RESOLVIDA" })}
                                                                sx={{ bgcolor: alpha(theme.palette.success.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) } }}
                                                            >
                                                                <FaCheck size={13} />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Rejeitar denúncia">
                                                            <IconButton
                                                                size="small"
                                                                color="warning"
                                                                onClick={() => setStatusDialog({ open: true, denuncia, novoStatus: "REJEITADA" })}
                                                                sx={{ bgcolor: alpha(theme.palette.warning.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.warning.main, 0.2) } }}
                                                            >
                                                                <FaTimes size={13} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </>
                                                )}
                                                <Tooltip title="Excluir avaliação denunciada">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={() => setDeleteDialog({ open: true, denuncia })}
                                                        sx={{ bgcolor: alpha(theme.palette.error.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) } }}
                                                    >
                                                        <FaTrash size={13} />
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

            {/* Dialog: Confirmar resolver/rejeitar */}
            <Dialog
                open={statusDialog.open}
                onClose={() => setStatusDialog({ open: false, denuncia: null, novoStatus: null })}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FaExclamationTriangle color={theme.palette[statusDialogConfig.color]?.main} />
                    {statusDialogConfig.label} denúncia
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Tem certeza que deseja <strong>{statusDialogConfig.label.toLowerCase()}</strong> a denúncia de{" "}
                        <strong>{statusDialog.denuncia?.avaliacao?.nomeAutor || "autor desconhecido"}</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        {statusDialogConfig.desc}
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setStatusDialog({ open: false, denuncia: null, novoStatus: null })}>
                        Cancelar
                    </Button>
                    <Button onClick={handleConfirmStatus} color={statusDialogConfig.color} variant="contained">
                        {statusDialogConfig.label}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog: Confirmar exclusão da avaliação */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, denuncia: null })}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FaExclamationTriangle color={theme.palette.error.main} />
                    Excluir Avaliação
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Tem certeza que deseja excluir a avaliação de{" "}
                        <strong>{deleteDialog.denuncia?.avaliacao?.nomeAutor || "autor desconhecido"}</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Esta ação não pode ser desfeita. A denúncia também será marcada como resolvida.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, denuncia: null })}>Cancelar</Button>
                    <Button onClick={handleDeleteAvaliacao} color="error" variant="contained">Excluir</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AvaliacoesTab;

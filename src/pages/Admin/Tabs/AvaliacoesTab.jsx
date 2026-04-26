import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Button,
    CircularProgress,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    useTheme,
    alpha,
} from "@mui/material";
import {
    FaFlag,
    FaStar,
    FaTrash,
    FaCheck,
    FaTimes,
    FaExclamationTriangle,
    FaEye,
    FaExternalLinkAlt,
} from "react-icons/fa";
import { denunciaService } from "../../../services";
import { toast } from "react-toastify";

const MOTIVO_LABELS = {
    PRECONCEITO: "Preconceito / Discurso de Ódio",
    LINGUAGEM_OFENSIVA: "Linguagem Ofensiva",
    SPAM: "Spam / Propaganda",
    INFORMACAO_FALSA: "Informação Falsa",
    OUTROS: "Outros",
};

const STATUS_CONFIG = {
    PENDENTE: { label: "Pendente", color: "warning" },
    REVISADO: { label: "Revisado", color: "success" },
    IGNORADO: { label: "Ignorado", color: "default" },
};

const AvaliacoesTab = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [denuncias, setDenuncias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("PENDENTE");
    const [detailDialog, setDetailDialog] = useState({ open: false, denuncia: null });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, denuncia: null });

    useEffect(() => {
        loadDenuncias();
    }, [filterStatus]);

    const loadDenuncias = async () => {
        try {
            setLoading(true);
            const data = await denunciaService.getAll(filterStatus);
            setDenuncias(data);
        } catch (error) {
            console.error("Erro ao carregar denúncias:", error);
            toast.error("Erro ao carregar denúncias");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await denunciaService.atualizarStatus(id, status);
            toast.success(`Denúncia marcada como ${STATUS_CONFIG[status].label.toLowerCase()}.`);
            loadDenuncias();
            setDetailDialog({ open: false, denuncia: null });
        } catch (error) {
            toast.error("Erro ao atualizar status");
        }
    };

    const handleDeleteAvaliacao = async () => {
        if (!deleteDialog.denuncia) return;
        try {
            await denunciaService.excluirAvaliacao(deleteDialog.denuncia.id);
            toast.success("Avaliação e denúncias associadas excluídas!");
            setDeleteDialog({ open: false, denuncia: null });
            setDetailDialog({ open: false, denuncia: null });
            loadDenuncias();
        } catch (error) {
            toast.error("Erro ao excluir avaliação");
        }
    };

    const pendentes = denuncias.filter(d => d.status === "PENDENTE").length;

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        const d = new Date(dateStr);
        return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    const getContextLabel = (d) => {
        if (d.estabelecimentoNome) return d.estabelecimentoNome;
        if (d.profissionalNome) return d.profissionalNome;
        return null;
    };

    const getContextUrl = (d) => {
        if (d.estabelecimentoId) return `/estabelecimentos`;
        if (d.profissionalId) return `/profissionais`;
        return null;
    };

    return (
        <Box>
            {/* Header */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} display="flex" alignItems="center" gap={1}>
                        <FaFlag /> Moderação de Denúncias
                    </Typography>
                    <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                        {denuncias.length} denúncia{denuncias.length !== 1 ? "s" : ""}{pendentes > 0 ? ` · ${pendentes} pendente${pendentes !== 1 ? "s" : ""}` : ""}
                    </Typography>
                </Box>
            </Box>

            {/* Filtros por Status */}
            <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
                {[
                    { value: null, label: "Todas" },
                    { value: "PENDENTE", label: "Pendentes" },
                    { value: "REVISADO", label: "Revisadas" },
                    { value: "IGNORADO", label: "Ignoradas" },
                ].map((f) => (
                    <Button
                        key={f.label}
                        variant={filterStatus === f.value ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setFilterStatus(f.value)}
                        sx={{
                            textTransform: "none",
                            fontWeight: 600,
                            borderRadius: 10,
                            px: 2.5,
                        }}
                    >
                        {f.label}
                    </Button>
                ))}
            </Box>

            {/* Tabela */}
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Avaliação</strong></TableCell>
                            <TableCell><strong>Autor</strong></TableCell>
                            <TableCell><strong>Motivo</strong></TableCell>
                            <TableCell><strong>Denunciante</strong></TableCell>
                            <TableCell><strong>Contexto</strong></TableCell>
                            <TableCell><strong>Data</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell align="right"><strong>Ações</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                    <CircularProgress size={32} />
                                </TableCell>
                            </TableRow>
                        ) : denuncias.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={8} align="center" sx={{ py: 5 }}>
                                    <Box sx={{ textAlign: "center" }}>
                                        <FaFlag size={32} color={theme.palette.text.disabled} style={{ marginBottom: 8 }} />
                                        <Typography color="text.secondary">
                                            Nenhuma denúncia {filterStatus ? STATUS_CONFIG[filterStatus]?.label.toLowerCase() : ""} encontrada.
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            denuncias.map((d) => (
                                <TableRow key={d.id} hover>
                                    <TableCell sx={{ maxWidth: 250 }}>
                                        <Typography variant="body2" noWrap title={d.comentarioAvaliacao}>
                                            "{d.comentarioAvaliacao}"
                                        </Typography>
                                        <Box sx={{ display: "flex", gap: 0.3, mt: 0.5 }}>
                                            {[...Array(5)].map((_, i) => (
                                                <FaStar key={i} size={10} color={i < d.notaAvaliacao ? "#FFD700" : "#E2E8F0"} />
                                            ))}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" fontWeight={600}>{d.nomeAutorAvaliacao}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={MOTIVO_LABELS[d.motivo] || d.motivo}
                                            size="small"
                                            sx={{
                                                bgcolor: alpha(theme.palette.error.main, isDark ? 0.15 : 0.08),
                                                color: "error.main",
                                                fontWeight: 600,
                                                fontSize: "0.7rem",
                                            }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">{d.denuncianteEmail}</Typography>
                                    </TableCell>
                                    <TableCell>
                                        {getContextLabel(d) ? (
                                            <Chip
                                                label={getContextLabel(d)}
                                                size="small"
                                                icon={<FaExternalLinkAlt size={10} />}
                                                onClick={() => window.open(getContextUrl(d), '_blank')}
                                                clickable
                                                sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                                            />
                                        ) : (
                                            <Typography variant="caption" color="text.secondary">—</Typography>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDate(d.dataDenuncia)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={STATUS_CONFIG[d.status]?.label || d.status}
                                            color={STATUS_CONFIG[d.status]?.color || "default"}
                                            size="small"
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                                            <Tooltip title="Ver detalhes">
                                                <IconButton
                                                    size="small"
                                                    onClick={() => setDetailDialog({ open: true, denuncia: d })}
                                                    sx={{ color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}
                                                >
                                                    <FaEye size={12} />
                                                </IconButton>
                                            </Tooltip>
                                            {d.status === "PENDENTE" && (
                                                <>
                                                    <Tooltip title="Marcar como revisado">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleUpdateStatus(d.id, "REVISADO")}
                                                            sx={{ color: "success.main", bgcolor: alpha(theme.palette.success.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) } }}
                                                        >
                                                            <FaCheck size={12} />
                                                        </IconButton>
                                                    </Tooltip>
                                                    <Tooltip title="Ignorar denúncia">
                                                        <IconButton
                                                            size="small"
                                                            onClick={() => handleUpdateStatus(d.id, "IGNORADO")}
                                                            sx={{ color: "text.secondary", bgcolor: alpha(theme.palette.divider, 0.3), '&:hover': { bgcolor: alpha(theme.palette.divider, 0.5) } }}
                                                        >
                                                            <FaTimes size={12} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </>
                                            )}
                                            <Tooltip title="Excluir avaliação denunciada">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => setDeleteDialog({ open: true, denuncia: d })}
                                                    sx={{ bgcolor: alpha(theme.palette.error.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2), color: 'white' } }}
                                                >
                                                    <FaTrash size={12} />
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

            {/* Dialog de Detalhes */}
            <Dialog
                open={detailDialog.open}
                onClose={() => setDetailDialog({ open: false, denuncia: null })}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3 } }}
            >
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, fontWeight: 700 }}>
                    <FaFlag color={theme.palette.error.main} />
                    Detalhes da Denúncia
                </DialogTitle>
                <DialogContent>
                    {detailDialog.denuncia && (
                        <Box>
                            <Paper elevation={0} sx={{ p: 2.5, mb: 2, border: '1px solid', borderColor: 'divider', borderRadius: 2, bgcolor: isDark ? alpha(theme.palette.common.white, 0.03) : '#F8FAFC' }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>AVALIAÇÃO DENUNCIADA</Typography>
                                <Box sx={{ display: "flex", gap: 0.5, mt: 1, mb: 1 }}>
                                    {[...Array(5)].map((_, i) => (
                                        <FaStar key={i} size={14} color={i < detailDialog.denuncia.notaAvaliacao ? "#FFD700" : "#E2E8F0"} />
                                    ))}
                                </Box>
                                <Typography variant="body1" sx={{ mb: 1, fontStyle: "italic" }}>
                                    "{detailDialog.denuncia.comentarioAvaliacao}"
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                    — {detailDialog.denuncia.nomeAutorAvaliacao}
                                </Typography>
                            </Paper>

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>MOTIVO</Typography>
                                <Typography variant="body1" fontWeight={600} sx={{ mt: 0.5 }}>
                                    {MOTIVO_LABELS[detailDialog.denuncia.motivo] || detailDialog.denuncia.motivo}
                                </Typography>
                            </Box>

                            {detailDialog.denuncia.descricaoAdicional && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700}>DESCRIÇÃO ADICIONAL</Typography>
                                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                                        {detailDialog.denuncia.descricaoAdicional}
                                    </Typography>
                                </Box>
                            )}

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>DENUNCIANTE</Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    {detailDialog.denuncia.denuncianteEmail}
                                </Typography>
                            </Box>

                            {(detailDialog.denuncia.estabelecimentoNome || detailDialog.denuncia.profissionalNome) && (
                                <Box sx={{ mb: 2 }}>
                                    <Typography variant="caption" color="text.secondary" fontWeight={700}>CONTEXTO</Typography>
                                    <Box sx={{ mt: 0.5, display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" fontWeight={600}>
                                            {detailDialog.denuncia.estabelecimentoNome ? `Estabelecimento: ${detailDialog.denuncia.estabelecimentoNome}` : `Profissional: ${detailDialog.denuncia.profissionalNome}`}
                                        </Typography>
                                        <Tooltip title="Abrir página">
                                            <IconButton
                                                size="small"
                                                onClick={() => window.open(getContextUrl(detailDialog.denuncia), '_blank')}
                                                sx={{ color: 'primary.main' }}
                                            >
                                                <FaExternalLinkAlt size={12} />
                                            </IconButton>
                                        </Tooltip>
                                    </Box>
                                </Box>
                            )}

                            <Box sx={{ mb: 2 }}>
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>DATA DA DENÚNCIA</Typography>
                                <Typography variant="body2" sx={{ mt: 0.5 }}>
                                    {formatDate(detailDialog.denuncia.dataDenuncia)}
                                </Typography>
                            </Box>

                            <Box>
                                <Typography variant="caption" color="text.secondary" fontWeight={700}>STATUS</Typography>
                                <Box sx={{ mt: 0.5 }}>
                                    <Chip
                                        label={STATUS_CONFIG[detailDialog.denuncia.status]?.label}
                                        color={STATUS_CONFIG[detailDialog.denuncia.status]?.color}
                                        size="small"
                                        sx={{ fontWeight: 600 }}
                                    />
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
                    <Button onClick={() => setDetailDialog({ open: false, denuncia: null })} sx={{ textTransform: "none" }}>
                        Fechar
                    </Button>
                    {detailDialog.denuncia?.status === "PENDENTE" && (
                        <>
                            <Button
                                variant="outlined"
                                onClick={() => handleUpdateStatus(detailDialog.denuncia.id, "IGNORADO")}
                                sx={{ textTransform: "none", fontWeight: 600 }}
                            >
                                Ignorar
                            </Button>
                            <Button
                                variant="contained"
                                color="success"
                                onClick={() => handleUpdateStatus(detailDialog.denuncia.id, "REVISADO")}
                                sx={{ textTransform: "none", fontWeight: 600 }}
                            >
                                Marcar Revisado
                            </Button>
                        </>
                    )}
                    <Button
                        variant="contained"
                        color="error"
                        startIcon={<FaTrash size={12} />}
                        onClick={() => setDeleteDialog({ open: true, denuncia: detailDialog.denuncia })}
                        sx={{ textTransform: "none", fontWeight: 600 }}
                    >
                        Excluir Avaliação
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog de Confirmação de Exclusão */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, denuncia: null })}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FaExclamationTriangle color={theme.palette.error.main} />
                    Excluir Avaliação Denunciada
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Tem certeza que deseja excluir a avaliação de <strong>{deleteDialog.denuncia?.nomeAutorAvaliacao}</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        A avaliação e todas as denúncias associadas serão removidas permanentemente.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, denuncia: null })} sx={{ textTransform: "none" }}>Cancelar</Button>
                    <Button onClick={handleDeleteAvaliacao} color="error" variant="contained" sx={{ textTransform: "none" }}>Excluir</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AvaliacoesTab;

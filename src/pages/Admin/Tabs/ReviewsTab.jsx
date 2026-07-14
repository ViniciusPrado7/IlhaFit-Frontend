import React, { useState, useEffect, useMemo } from "react";
import { usePersistedRowsPerPage } from "../../../hooks/usePersistedRowsPerPage";
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
    TablePagination,
    IconButton,
    Chip,
    Button,
    TextField,
    InputAdornment,
    CircularProgress,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Collapse,
    useTheme,
    alpha,
} from "@mui/material";
import {
    FaFlag,
    FaStar,
    FaTrash,
    FaCheck,
    FaExclamationTriangle,
    FaEye,
    FaSearch,
    FaChevronDown,
} from "react-icons/fa";
import { denunciaService } from "../../../service";
import { profissionalService } from "../../../service/ProfessionalService";
import { estabelecimentoService } from "../../../service/EstablishmentService";
import ModalProfissional from "../../../components/ProfessionalModal";
import ModalDetalhesEstabelecimento from "../../../components/EstablishmentDetailsModal";
import { toast } from "react-toastify";
import { toTitleCase } from "../../../utils/titleCase";

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
    EXCLUIDO: { label: "Excluída", color: "error" },
};

const AvaliacoesTab = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [denuncias, setDenuncias] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("PENDENTE");
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [expandedGroups, setExpandedGroups] = useState(new Set());
    const [actionLoading, setActionLoading] = useState(null);
    const [detailDialog, setDetailDialog] = useState({ open: false, denuncia: null });
    const [deleteDialog, setDeleteDialog] = useState({ open: false, group: null });
    const [profissionalModal, setProfissionalModal] = useState({ open: false, profissional: null });
    const [estabelecimentoModal, setEstabelecimentoModal] = useState({ open: false, estabelecimento: null });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = usePersistedRowsPerPage(10);

    useEffect(() => {
        setPage(0);
        loadDenuncias();
    }, [filterStatus]);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(0);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const loadDenuncias = async () => {
        try {
            setLoading(true);
            const data = await denunciaService.getAll(filterStatus);
            setDenuncias(data);
            setExpandedGroups(new Set());
        } catch (error) {
            console.error("Erro ao carregar denúncias:", error);
            toast.error("Erro ao carregar denúncias");
        } finally {
            setLoading(false);
        }
    };

    const toggleGroup = (avaliacaoId) => {
        setExpandedGroups(prev => {
            const next = new Set(prev);
            if (next.has(avaliacaoId)) next.delete(avaliacaoId);
            else next.add(avaliacaoId);
            return next;
        });
    };

    const handleAceitarGrupo = async (e, group) => {
        e.stopPropagation();
        const pendentes = group.denuncias.filter(d => d.status === 'PENDENTE');
        if (pendentes.length === 0) return;
        setActionLoading(group.avaliacaoId);
        try {
            const results = await Promise.allSettled(
                pendentes.map(d => denunciaService.atualizarStatus(d.id, 'REVISADO'))
            );
            const failed = results.filter(r => r.status === 'rejected');
            if (failed.length === 0) {
                toast.success(`${pendentes.length} denúncia${pendentes.length !== 1 ? 's' : ''} marcada${pendentes.length !== 1 ? 's' : ''} como revisada${pendentes.length !== 1 ? 's' : ''}.`);
            } else if (failed.length < pendentes.length) {
                toast.warning(`${pendentes.length - failed.length} de ${pendentes.length} denúncias marcadas. ${failed.length} falharam — recarregue para verificar.`);
            } else {
                toast.error('Não foi possível marcar as denúncias como revisadas.');
            }
            loadDenuncias();
        } finally {
            setActionLoading(null);
        }
    };

    const handleExcluirGrupo = (e, group) => {
        e.stopPropagation();
        setDeleteDialog({ open: true, group });
    };

    const handleDeleteAvaliacao = async () => {
        if (!deleteDialog.group) return;
        const anyDenuncia = deleteDialog.group.denuncias[0];
        try {
            await denunciaService.excluirAvaliacao(anyDenuncia.id);
            toast.success("Avaliação e denúncias associadas excluídas!");
            setDeleteDialog({ open: false, group: null });
            loadDenuncias();
        } catch (error) {
            setDeleteDialog({ open: false, group: null });
            if (error.response?.status === 409) {
                toast.warning("Comentário já foi removido. A lista será atualizada.");
                loadDenuncias();
            } else {
                toast.error("Erro ao excluir avaliação");
            }
        }
    };

    // Agrupa denúncias por avaliacaoId
    const groupedDenuncias = useMemo(() => {
        const map = new Map();
        denuncias.forEach(d => {
            if (!map.has(d.avaliacaoId)) {
                map.set(d.avaliacaoId, {
                    avaliacaoId: d.avaliacaoId,
                    comentarioAvaliacao: d.comentarioAvaliacao,
                    notaAvaliacao: d.notaAvaliacao,
                    nomeAutorAvaliacao: d.nomeAutorAvaliacao,
                    estabelecimentoId: d.estabelecimentoId,
                    estabelecimentoNome: d.estabelecimentoNome,
                    profissionalId: d.profissionalId,
                    profissionalNome: d.profissionalNome,
                    denuncias: [],
                });
            }
            map.get(d.avaliacaoId).denuncias.push(d);
        });
        return Array.from(map.values()).map(g => ({
            ...g,
            count: g.denuncias.length,
            isAlert: g.denuncias.length >= 10,
            status: g.denuncias.some(d => d.status === 'PENDENTE')
                ? 'PENDENTE'
                : g.denuncias.every(d => d.status === 'REVISADO')
                    ? 'REVISADO'
                    : 'EXCLUIDO',
        }));
    }, [denuncias]);

    const alertCount = useMemo(
        () => groupedDenuncias.filter(g => g.isAlert).length,
        [groupedDenuncias]
    );

    const pendentesGrupos = useMemo(
        () => groupedDenuncias.filter(g => g.status === 'PENDENTE').length,
        [groupedDenuncias]
    );

    const filteredGroups = useMemo(() => {
        let list = groupedDenuncias;
        if (debouncedSearchTerm) {
            const term = debouncedSearchTerm.toLowerCase();
            list = list.filter(g =>
                g.comentarioAvaliacao?.toLowerCase().includes(term) ||
                g.nomeAutorAvaliacao?.toLowerCase().includes(term) ||
                g.estabelecimentoNome?.toLowerCase().includes(term) ||
                g.profissionalNome?.toLowerCase().includes(term) ||
                g.denuncias.some(d =>
                    d.denuncianteEmail?.toLowerCase().includes(term) ||
                    MOTIVO_LABELS[d.motivo]?.toLowerCase().includes(term)
                )
            );
        }
        return [...list].sort((a, b) => {
            if (a.isAlert && !b.isAlert) return -1;
            if (!a.isAlert && b.isAlert) return 1;
            if (a.isAlert && b.isAlert) return b.count - a.count;
            return 0;
        });
    }, [groupedDenuncias, debouncedSearchTerm]);

    const paginatedGroups = useMemo(() => {
        const start = page * rowsPerPage;
        return filteredGroups.slice(start, start + rowsPerPage);
    }, [filteredGroups, page, rowsPerPage]);

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        const d = new Date(dateStr);
        return d.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", hour: "2-digit", minute: "2-digit" });
    };

    const contextLabel = (g) => {
        const nome = g.estabelecimentoNome || g.profissionalNome;
        return nome ? toTitleCase(nome) : null;
    };

    const handleOpenContexto = async (d) => {
        if (d.profissionalId) {
            try {
                const res = await profissionalService.buscarProfissionalPorId(d.profissionalId);
                setProfissionalModal({ open: true, profissional: res.data });
            } catch {
                toast.error("Não foi possível carregar o perfil do profissional.");
            }
        } else if (d.estabelecimentoId) {
            try {
                const res = await estabelecimentoService.buscarEstabelecimentoPorId(d.estabelecimentoId);
                const estab = res.data;
                const mapped = {
                    ...estab,
                    nome: estab.nomeFantasia || estab.nome,
                    Imagem: estab.fotosUrl?.length > 0 ? estab.fotosUrl[0] : "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop",
                    Imagens: estab.fotosUrl || [],
                    categorias: (estab.categorias || []).map((c) => c.nome),
                    avaliacao: estab.avaliacao || 0.0,
                    aberto: true,
                    descricao: estab.descricao || "Um ótimo local para treinar e cuidar da sua saúde.",
                };
                setEstabelecimentoModal({ open: true, estabelecimento: mapped });
            } catch {
                toast.error("Não foi possível carregar o perfil do estabelecimento.");
            }
        }
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
                        {denuncias.length} denúncia{denuncias.length !== 1 ? "s" : ""} em {groupedDenuncias.length} avaliação{groupedDenuncias.length !== 1 ? "ões" : ""}
                        {pendentesGrupos > 0 ? ` · ${pendentesGrupos} grupo${pendentesGrupos !== 1 ? "s" : ""} pendente${pendentesGrupos !== 1 ? "s" : ""}` : ""}
                    </Typography>
                </Box>
            </Box>

            {/* Busca */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
                    <TextField
                        placeholder="Buscar por avaliação, autor, motivo, denunciante ou contexto..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                        sx={{ flex: 1, minWidth: 280 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FaSearch size={16} />
                                </InputAdornment>
                            ),
                        }}
                    />
                    {debouncedSearchTerm && (
                        <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
                            {filteredGroups.length} grupo{filteredGroups.length !== 1 ? "s" : ""} encontrado{filteredGroups.length !== 1 ? "s" : ""}
                        </Typography>
                    )}
                </Box>
            </Paper>

            {/* Filtros por Status */}
            <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
                {[
                    { value: null, label: "Todas" },
                    { value: "PENDENTE", label: "Pendentes" },
                    { value: "REVISADO", label: "Revisadas" },
                    { value: "EXCLUIDO", label: "Excluídas" },
                ].map((f) => (
                    <Button
                        key={f.label}
                        variant={filterStatus === f.value ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setFilterStatus(f.value)}
                        sx={{ textTransform: "none", fontWeight: 600, borderRadius: 10, px: 2.5 }}
                    >
                        {f.label}
                    </Button>
                ))}
            </Box>

            {/* Banner de alerta para avaliações com 10+ denúncias */}
            {alertCount > 0 && (
                <Paper elevation={0} sx={{ p: 2, mb: 3, border: '1px solid', borderColor: 'warning.main', borderRadius: 3, bgcolor: alpha(theme.palette.warning.main, isDark ? 0.12 : 0.07), display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <FaExclamationTriangle color={theme.palette.warning.main} size={18} />
                    <Typography variant="body2" fontWeight={700} color="warning.dark">
                        {alertCount} avaliação{alertCount !== 1 ? "ões" : ""} com 10 ou mais denúncias — exibida{alertCount !== 1 ? "s" : ""} em primeiro com destaque de alerta.
                    </Typography>
                </Paper>
            )}

            {/* Tabela agrupada por avaliação */}
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell sx={{ width: 48 }} />
                            <TableCell><strong>Avaliação</strong></TableCell>
                            <TableCell><strong>Denúncias</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell align="right"><strong>Ações</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                    <CircularProgress size={32} />
                                </TableCell>
                            </TableRow>
                        ) : groupedDenuncias.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                    <Box sx={{ textAlign: "center" }}>
                                        <FaFlag size={32} color={theme.palette.text.disabled} style={{ marginBottom: 8 }} />
                                        <Typography color="text.secondary">
                                            Nenhuma denúncia {filterStatus ? STATUS_CONFIG[filterStatus]?.label.toLowerCase() : ""} encontrada.
                                        </Typography>
                                    </Box>
                                </TableCell>
                            </TableRow>
                        ) : (
                            paginatedGroups.map((group) => {
                                const isExpanded = expandedGroups.has(group.avaliacaoId);
                                const isLoadingAction = actionLoading === group.avaliacaoId;
                                return (
                                    <React.Fragment key={group.avaliacaoId}>
                                        {/* Linha do grupo (recolhida) */}
                                        <TableRow
                                            hover
                                            onClick={() => toggleGroup(group.avaliacaoId)}
                                            tabIndex={0}
                                            onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleGroup(group.avaliacaoId); } }}
                                            aria-expanded={isExpanded}
                                            sx={{
                                                cursor: 'pointer',
                                                ...(group.isAlert ? {
                                                    bgcolor: alpha(theme.palette.warning.main, isDark ? 0.12 : 0.07),
                                                    '&:hover': { bgcolor: alpha(theme.palette.warning.main, isDark ? 0.2 : 0.13) },
                                                    borderLeft: `4px solid ${theme.palette.warning.main}`,
                                                } : {}),
                                            }}
                                        >
                                            {/* Ícone de expansão */}
                                            <TableCell sx={{ width: 48, pr: 0 }}>
                                                <Box sx={{
                                                    transition: 'transform 0.2s',
                                                    transform: isExpanded ? 'rotate(0deg)' : 'rotate(-90deg)',
                                                    display: 'flex',
                                                    justifyContent: 'center',
                                                }}>
                                                    <FaChevronDown size={12} color={theme.palette.text.secondary} />
                                                </Box>
                                            </TableCell>

                                            {/* Avaliação */}
                                            <TableCell sx={{ maxWidth: 320 }}>
                                                <Typography variant="body2" noWrap title={group.comentarioAvaliacao} sx={{ fontStyle: 'italic' }}>
                                                    "{group.comentarioAvaliacao}"
                                                </Typography>
                                                <Box sx={{ display: "flex", gap: 0.3, mt: 0.5 }}>
                                                    {[...Array(5)].map((_, i) => (
                                                        <FaStar key={i} size={10} color={i < group.notaAvaliacao ? "#FFD700" : "#E2E8F0"} />
                                                    ))}
                                                </Box>
                                                <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.3 }}>
                                                    {toTitleCase(group.nomeAutorAvaliacao)}
                                                    {contextLabel(group) && ` · ${contextLabel(group)}`}
                                                </Typography>
                                                {group.isAlert && (
                                                    <Chip
                                                        icon={<FaExclamationTriangle size={9} />}
                                                        label={`${group.count} denúncias`}
                                                        size="small"
                                                        color="warning"
                                                        sx={{ mt: 0.5, fontWeight: 700, fontSize: '0.65rem', height: 20 }}
                                                    />
                                                )}
                                            </TableCell>

                                            {/* Contagem de denúncias */}
                                            <TableCell>
                                                <Chip
                                                    label={`${group.count} denúncia${group.count !== 1 ? 's' : ''}`}
                                                    size="small"
                                                    color={group.isAlert ? "warning" : "default"}
                                                    variant={group.isAlert ? "filled" : "outlined"}
                                                    sx={{ fontWeight: group.isAlert ? 700 : 400 }}
                                                />
                                            </TableCell>

                                            {/* Status do grupo */}
                                            <TableCell>
                                                <Chip
                                                    label={STATUS_CONFIG[group.status]?.label || group.status}
                                                    color={STATUS_CONFIG[group.status]?.color || "default"}
                                                    size="small"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            </TableCell>

                                            {/* Ações do grupo */}
                                            <TableCell align="right">
                                                <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                                                    {group.status === 'PENDENTE' && (
                                                        <Tooltip title="Marcar todas as denúncias como revisadas">
                                                            <span>
                                                                <IconButton
                                                                    size="small"
                                                                    disabled={isLoadingAction}
                                                                    onClick={(e) => handleAceitarGrupo(e, group)}
                                                                    sx={{ color: "success.main", bgcolor: alpha(theme.palette.success.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.2) } }}
                                                                >
                                                                    {isLoadingAction
                                                                        ? <CircularProgress size={12} color="inherit" />
                                                                        : <FaCheck size={12} />}
                                                                </IconButton>
                                                            </span>
                                                        </Tooltip>
                                                    )}
                                                    <Tooltip title="Excluir avaliação e todas as denúncias">
                                                        <IconButton
                                                            size="small"
                                                            color="error"
                                                            onClick={(e) => handleExcluirGrupo(e, group)}
                                                            sx={{ bgcolor: alpha(theme.palette.error.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2), color: 'white' } }}
                                                        >
                                                            <FaTrash size={12} />
                                                        </IconButton>
                                                    </Tooltip>
                                                </Box>
                                            </TableCell>
                                        </TableRow>

                                        {/* Linha expandida — detalhes das denúncias individuais */}
                                        <TableRow>
                                            <TableCell colSpan={5} sx={{ p: 0, border: 0 }}>
                                                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                                                    <Box sx={{
                                                        p: 2,
                                                        bgcolor: isDark
                                                            ? alpha(theme.palette.common.white, 0.03)
                                                            : alpha(theme.palette.primary.main, 0.02),
                                                        borderBottom: '1px solid',
                                                        borderColor: 'divider',
                                                    }}>
                                                        <Typography variant="caption" fontWeight={700} color="text.secondary" sx={{ mb: 1.5, display: 'block', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                                                            {group.count} denúncia{group.count !== 1 ? 's' : ''} recebida{group.count !== 1 ? 's' : ''}
                                                        </Typography>
                                                        <Table size="small">
                                                            <TableHead>
                                                                <TableRow>
                                                                    <TableCell><strong>Autor</strong></TableCell>
                                                                    <TableCell><strong>Motivo</strong></TableCell>
                                                                    <TableCell><strong>Denunciante</strong></TableCell>
                                                                    <TableCell><strong>Contexto</strong></TableCell>
                                                                    <TableCell><strong>Data</strong></TableCell>
                                                                    <TableCell><strong>Status</strong></TableCell>
                                                                    <TableCell />
                                                                </TableRow>
                                                            </TableHead>
                                                            <TableBody>
                                                                {group.denuncias.map(d => (
                                                                    <TableRow key={d.id} hover>
                                                                        <TableCell>
                                                                            <Typography variant="body2" fontWeight={600}>{toTitleCase(d.nomeAutorAvaliacao)}</Typography>
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
                                                                            {(d.estabelecimentoNome || d.profissionalNome) ? (
                                                                                <Chip
                                                                                    label={toTitleCase(d.estabelecimentoNome || d.profissionalNome)}
                                                                                    size="small"
                                                                                    icon={<FaEye size={10} />}
                                                                                    onClick={() => handleOpenContexto(d)}
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
                                                                            <Tooltip title="Ver detalhes">
                                                                                <IconButton
                                                                                    size="small"
                                                                                    onClick={() => setDetailDialog({ open: true, denuncia: d })}
                                                                                    sx={{ color: "primary.main", bgcolor: alpha(theme.palette.primary.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}
                                                                                >
                                                                                    <FaEye size={12} />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        </TableCell>
                                                                    </TableRow>
                                                                ))}
                                                            </TableBody>
                                                        </Table>
                                                    </Box>
                                                </Collapse>
                                            </TableCell>
                                        </TableRow>
                                    </React.Fragment>
                                );
                            })
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredGroups.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                labelRowsPerPage="Linhas por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`}
            />

            {/* Dialog de Detalhes da denúncia individual (acessado pelo accordion expandido) */}
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
                                    — {toTitleCase(detailDialog.denuncia.nomeAutorAvaliacao)}
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
                                            {detailDialog.denuncia.estabelecimentoNome
                                                ? `Estabelecimento: ${toTitleCase(detailDialog.denuncia.estabelecimentoNome)}`
                                                : `Profissional: ${toTitleCase(detailDialog.denuncia.profissionalNome)}`}
                                        </Typography>
                                        <Tooltip title="Ver perfil">
                                            <IconButton
                                                size="small"
                                                onClick={() => handleOpenContexto(detailDialog.denuncia)}
                                                sx={{ color: 'primary.main' }}
                                            >
                                                <FaEye size={12} />
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
                <DialogActions sx={{ px: 3, pb: 2.5 }}>
                    <Button onClick={() => setDetailDialog({ open: false, denuncia: null })} sx={{ textTransform: "none" }}>
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>

            <ModalProfissional
                open={profissionalModal.open}
                onClose={() => setProfissionalModal({ open: false, profissional: null })}
                profissional={profissionalModal.profissional}
            />

            <ModalDetalhesEstabelecimento
                open={estabelecimentoModal.open}
                onClose={() => setEstabelecimentoModal({ open: false, estabelecimento: null })}
                estabelecimento={estabelecimentoModal.estabelecimento}
            />

            {/* Dialog de Confirmação de Exclusão */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, group: null })}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FaExclamationTriangle color={theme.palette.error.main} />
                    Excluir Avaliação Denunciada
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Tem certeza que deseja excluir a avaliação de <strong>{toTitleCase(deleteDialog.group?.nomeAutorAvaliacao)}</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        A avaliação e {deleteDialog.group?.count} denúncia{deleteDialog.group?.count !== 1 ? 's' : ''} associada{deleteDialog.group?.count !== 1 ? 's' : ''} serão marcadas como excluídas e não aparecerão mais nas listagens.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, group: null })} sx={{ textTransform: "none" }}>Cancelar</Button>
                    <Button onClick={handleDeleteAvaliacao} color="error" variant="contained" sx={{ textTransform: "none" }}>Excluir</Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default AvaliacoesTab;

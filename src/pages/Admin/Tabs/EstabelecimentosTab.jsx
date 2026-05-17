import React, { useState, useEffect, useMemo } from "react";
import { usePersistedRowsPerPage } from "../../../hooks/usePersistedRowsPerPage";
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
    TablePagination,
    useTheme,
    useMediaQuery,
    alpha,
} from "@mui/material";
import {
    FaTrash,
    FaSearch,
    FaExclamationTriangle,
    FaEye,
    FaDumbbell,
    FaRunning,
    FaSwimmer,
    FaFistRaised,
    FaBiking,
    FaHeartbeat,
    FaFutbol,
    FaVolleyballBall,
    FaChild,
    FaMusic,
    FaBalanceScale,
    FaBuilding,
    FaTimes,
    FaChevronLeft,
    FaChevronRight,
} from "react-icons/fa";
import { GiMeditation, GiBoxingGlove, GiCampingTent } from "react-icons/gi";
import { MdSportsKabaddi, MdSportsMartialArts } from "react-icons/md";
import { toast } from "react-toastify";
import { estabelecimentoService } from "../../../services";
import ModalDetalhesEstabelecimento from "../../../components/ModalDetalhesEstabelecimento";

const CATEGORY_CONFIG = {
    "Academia":     { icon: FaDumbbell,          color: "#6366F1" },
    "CrossFit":     { icon: MdSportsKabaddi,     color: "#EF4444" },
    "Funcional":    { icon: FaRunning,           color: "#F97316" },
    "Pilates":      { icon: FaBalanceScale,      color: "#EC4899" },
    "Yoga":         { icon: GiMeditation,        color: "#8B5CF6" },
    "Dança":        { icon: FaMusic,             color: "#D946EF" },
    "Balé":         { icon: FaChild,             color: "#F43F5E" },
    "Basquete":     { icon: FaFutbol,            color: "#F59E0B" },
    "Futebol":      { icon: FaFutbol,            color: "#22C55E" },
    "Natação":      { icon: FaSwimmer,           color: "#06B6D4" },
    "Vôlei":        { icon: FaVolleyballBall,    color: "#FBBF24" },
    "Jiu-Jitsu":    { icon: MdSportsMartialArts, color: "#1D4ED8" },
    "Boxe":         { icon: GiBoxingGlove,       color: "#DC2626" },
    "Muay Thai":    { icon: FaFistRaised,        color: "#B91C1C" },
    "Kung Fu":      { icon: MdSportsMartialArts, color: "#7C3AED" },
    "Ciclismo":     { icon: FaBiking,            color: "#059669" },
    "Circo":        { icon: GiCampingTent,       color: "#E11D48" },
    "Fisioterapia": { icon: FaHeartbeat,         color: "#14B8A6" },
    "Outros":       { icon: FaBuilding,          color: "#64748B" },
};

const DEFAULT_CONFIG = { icon: FaDumbbell, color: "#64748B" };

const EstabelecimentosTab = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const isLg = useMediaQuery(theme.breakpoints.up('lg'));
    const isMd = useMediaQuery(theme.breakpoints.up('md'));
    const isSm = useMediaQuery(theme.breakpoints.up('sm'));
    const cardsPerPage = isLg ? 6 : isMd ? 4 : isSm ? 3 : 2;

    const [estabelecimentos, setEstabelecimentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, estabelecimento: null });
    const [selectedEstab, setSelectedEstab] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = usePersistedRowsPerPage(10);
    const [carouselPage, setCarouselPage] = useState(0);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(0);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        loadEstabelecimentos();
    }, []);

    useEffect(() => {
        setCarouselPage(0);
    }, [cardsPerPage]);

    const loadEstabelecimentos = async () => {
        try {
            setLoading(true);
            const data = await estabelecimentoService.getAll();
            setEstabelecimentos(data);
        } catch (error) {
            console.error("Erro ao carregar estabelecimentos:", error);
            toast.error("Erro ao carregar estabelecimentos");
        } finally {
            setLoading(false);
        }
    };

    const categoryStats = useMemo(() => {
        const map = {};
        estabelecimentos.forEach((estab) => {
            const cats = estab.categorias || [];
            if (cats.length === 0) {
                map["Sem categoria"] = (map["Sem categoria"] || 0) + 1;
            } else {
                cats.forEach((c) => {
                    const nome = c.nome || "Outros";
                    map[nome] = (map[nome] || 0) + 1;
                });
            }
        });
        return Object.entries(map)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }, [estabelecimentos]);

    const filteredEstabelecimentos = useMemo(() => {
        let filtered = estabelecimentos;

        if (selectedCategory) {
            if (selectedCategory === "Sem categoria") {
                filtered = filtered.filter(
                    (e) => !e.categorias || e.categorias.length === 0
                );
            } else {
                filtered = filtered.filter((e) =>
                    e.categorias?.some((c) => c.nome === selectedCategory)
                );
            }
        }

        if (debouncedSearchTerm) {
            filtered = filtered.filter(
                (e) =>
                    e.nome?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                    e.nomeFantasia?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                    e.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [estabelecimentos, selectedCategory, debouncedSearchTerm]);

    const paginatedEstabelecimentos = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return filteredEstabelecimentos.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredEstabelecimentos, page, rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleCategoryClick = (categoryName) => {
        setSelectedCategory((prev) => (prev === categoryName ? null : categoryName));
        setPage(0);
    };

    const handleOpenModal = (estab) => {
        const atividades = (estab.categorias || []).map((c) => c.nome);
        const mapped = {
            ...estab,
            nome: estab.nomeFantasia || estab.nome,
            Imagem: (estab.fotosUrl && estab.fotosUrl.length > 0) ? estab.fotosUrl[0] : "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop",
            Imagens: estab.fotosUrl || [],
            categorias: atividades,
            avaliacao: estab.avaliacao || 0.0,
            aberto: true,
            descricao: estab.descricao || "Um ótimo local para treinar e cuidar da sua saúde.",
        };
        setSelectedEstab(mapped);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteDialog.estabelecimento) return;

        try {
            await estabelecimentoService.delete(deleteDialog.estabelecimento.id);
            toast.success("Estabelecimento excluído com sucesso!");
            loadEstabelecimentos();
            setDeleteDialog({ open: false, estabelecimento: null });
        } catch (error) {
            console.error("Erro ao excluir estabelecimento:", error);
            toast.error("Erro ao excluir estabelecimento");
        }
    };

    const getCategoryConfig = (name) => CATEGORY_CONFIG[name] || DEFAULT_CONFIG;

    const totalCarouselPages = Math.ceil(categoryStats.length / cardsPerPage);
    const visibleCards = categoryStats.slice(
        carouselPage * cardsPerPage,
        (carouselPage + 1) * cardsPerPage,
    );
    const emptySlots = cardsPerPage - visibleCards.length;
    const cardFlexBasis = `calc((100% - ${(cardsPerPage - 1) * 16}px) / ${cardsPerPage})`;

    return (
        <Box>
            {/* Header com total */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} display="flex" alignItems="center" gap={1}>
                        <FaBuilding /> Dashboard de Categorias
                    </Typography>
                    <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                        {estabelecimentos.length} estabelecimento{estabelecimentos.length !== 1 ? "s" : ""} cadastrado{estabelecimentos.length !== 1 ? "s" : ""} em {categoryStats.length} categoria{categoryStats.length !== 1 ? "s" : ""}
                    </Typography>
                </Box>
                {selectedCategory && (
                    <Button
                        variant="outlined"
                        size="small"
                        startIcon={<FaTimes size={12} />}
                        onClick={() => {
                            setSelectedCategory(null);
                            setPage(0);
                        }}
                        sx={{ borderRadius: 10, textTransform: "none", fontWeight: 600 }}
                    >
                        Limpar filtro: {selectedCategory}
                    </Button>
                )}
            </Box>

            {/* Carrossel de Categorias */}
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : categoryStats.length > 0 ? (
                <Box sx={{ mb: 4 }}>
                    <Box sx={{ position: "relative", mx: 3 }}>
                        {/* Seta esquerda */}
                        {carouselPage > 0 && (
                            <IconButton
                                onClick={() => setCarouselPage((p) => p - 1)}
                                size="small"
                                sx={{
                                    position: "absolute",
                                    left: -28,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    zIndex: 1,
                                    bgcolor: "background.paper",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    boxShadow: 2,
                                    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                                }}
                            >
                                <FaChevronLeft size={13} />
                            </IconButton>
                        )}

                        {/* Trilha de cards */}
                        <Box sx={{ display: "flex", gap: 2, overflow: "hidden" }}>
                            {visibleCards.map(({ name, count }) => {
                                const config = getCategoryConfig(name);
                                const IconComponent = config.icon;
                                const isSelected = selectedCategory === name;
                                return (
                                    <Box key={name} sx={{ flex: `0 0 ${cardFlexBasis}`, minWidth: 0 }}>
                                        <Paper
                                            elevation={0}
                                            onClick={() => handleCategoryClick(name)}
                                            sx={{
                                                p: 2.5,
                                                cursor: "pointer",
                                                border: "2px solid",
                                                borderColor: isSelected ? config.color : "divider",
                                                borderRadius: 3,
                                                transition: "all 0.25s ease",
                                                bgcolor: isSelected
                                                    ? alpha(config.color, isDark ? 0.15 : 0.08)
                                                    : "background.paper",
                                                position: "relative",
                                                overflow: "hidden",
                                                "&:hover": {
                                                    borderColor: config.color,
                                                    transform: "translateY(-2px)",
                                                    boxShadow: `0 4px 20px ${alpha(config.color, 0.25)}`,
                                                },
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    position: "absolute",
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    height: 3,
                                                    bgcolor: config.color,
                                                    opacity: isSelected ? 1 : 0.4,
                                                    transition: "opacity 0.25s",
                                                }}
                                            />
                                            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
                                                <Box
                                                    sx={{
                                                        p: 1,
                                                        borderRadius: 2,
                                                        bgcolor: alpha(config.color, isDark ? 0.2 : 0.1),
                                                        color: config.color,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    <IconComponent size={20} />
                                                </Box>
                                                <Typography variant="h5" fontWeight={800} sx={{ color: config.color }}>
                                                    {count}
                                                </Typography>
                                            </Box>
                                            <Typography variant="body2" fontWeight={600} noWrap title={name} sx={{ color: "text.primary" }}>
                                                {name}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                {count === 1 ? "1 unidade" : `${count} unidades`}
                                            </Typography>
                                        </Paper>
                                    </Box>
                                );
                            })}
                            {/* Slots vazios para manter largura estável na última página */}
                            {Array.from({ length: emptySlots }).map((_, i) => (
                                <Box key={`empty-${i}`} sx={{ flex: `0 0 ${cardFlexBasis}`, minWidth: 0 }} />
                            ))}
                        </Box>

                        {/* Seta direita */}
                        {carouselPage < totalCarouselPages - 1 && (
                            <IconButton
                                onClick={() => setCarouselPage((p) => p + 1)}
                                size="small"
                                sx={{
                                    position: "absolute",
                                    right: -28,
                                    top: "50%",
                                    transform: "translateY(-50%)",
                                    zIndex: 1,
                                    bgcolor: "background.paper",
                                    border: "1px solid",
                                    borderColor: "divider",
                                    boxShadow: 2,
                                    "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                                }}
                            >
                                <FaChevronRight size={13} />
                            </IconButton>
                        )}
                    </Box>

                    {/* Dots */}
                    {totalCarouselPages > 1 && (
                        <Box sx={{ display: "flex", justifyContent: "center", gap: 0.75, mt: 2 }}>
                            {Array.from({ length: totalCarouselPages }).map((_, i) => (
                                <Box
                                    key={i}
                                    onClick={() => setCarouselPage(i)}
                                    sx={{
                                        width: i === carouselPage ? 18 : 6,
                                        height: 6,
                                        borderRadius: 3,
                                        bgcolor: i === carouselPage
                                            ? "primary.main"
                                            : alpha(theme.palette.text.primary, 0.2),
                                        transition: "all 0.25s ease",
                                        cursor: "pointer",
                                    }}
                                />
                            ))}
                        </Box>
                    )}
                </Box>
            ) : null}

            {/* Busca */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                    <TextField
                        placeholder="Buscar por nome, fantasia ou email..."
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
                    <Chip
                        label={`${filteredEstabelecimentos.length} resultado${filteredEstabelecimentos.length !== 1 ? "s" : ""}`}
                        size="small"
                        color={selectedCategory ? "primary" : "default"}
                        sx={{ fontWeight: 600 }}
                    />
                </Box>
            </Paper>

            {/* Tabela */}
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Nome Fantasia</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Categorias</strong></TableCell>
                            <TableCell><strong>Exclusivo Mulheres</strong></TableCell>
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
                        ) : paginatedEstabelecimentos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">Nenhum estabelecimento encontrado</TableCell>
                            </TableRow>
                        ) : (
                            paginatedEstabelecimentos.map((estab) => (
                                <TableRow
                                    key={estab.id}
                                    hover
                                    onClick={() => handleOpenModal(estab)}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <TableCell>{estab.nomeFantasia || estab.nome || "N/A"}</TableCell>
                                    <TableCell>{estab.email || "N/A"}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                                            {(estab.categorias || []).slice(0, 3).map((c) => {
                                                const cfg = getCategoryConfig(c.nome);
                                                return (
                                                    <Chip
                                                        key={c.id}
                                                        label={c.nome}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: alpha(cfg.color, isDark ? 0.2 : 0.1),
                                                            color: cfg.color,
                                                            fontWeight: 600,
                                                            fontSize: "0.7rem",
                                                        }}
                                                    />
                                                );
                                            })}
                                            {(estab.categorias || []).length > 3 && (
                                                <Chip
                                                    label={`+${(estab.categorias || []).length - 3}`}
                                                    size="small"
                                                    sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                                                />
                                            )}
                                            {(!estab.categorias || estab.categorias.length === 0) && (
                                                <Typography variant="caption" color="text.secondary">—</Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={estab.exclusivoMulheres ? "Sim" : "Não"}
                                            color={estab.exclusivoMulheres ? "secondary" : "default"}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                                            <Tooltip title="Ver perfil">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => { e.stopPropagation(); handleOpenModal(estab); }}
                                                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}
                                                >
                                                    <FaEye size={14} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Excluir">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, estabelecimento: estab }); }}
                                                    sx={{ bgcolor: alpha(theme.palette.error.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2), color: 'white' } }}
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
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredEstabelecimentos.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Linhas por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`}
            />

            {/* Dialog de Confirmação */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, estabelecimento: null })}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FaExclamationTriangle color={theme.palette.error.main} />
                    Confirmar Exclusão
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Tem certeza que deseja excluir <strong>{deleteDialog.estabelecimento?.nomeFantasia || deleteDialog.estabelecimento?.nome}</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Esta ação não pode ser desfeita.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, estabelecimento: null })}>Cancelar</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Excluir</Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Detalhes (mesmo do usuário final) */}
            <ModalDetalhesEstabelecimento
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                estabelecimento={selectedEstab}
            />
        </Box>
    );
};

export default EstabelecimentosTab;

import React, { useState, useEffect, useMemo } from "react";
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
    Grid,
    useTheme,
    alpha,
} from "@mui/material";
import {
    FaTrash,
    FaSearch,
    FaExclamationTriangle,
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
    const [estabelecimentos, setEstabelecimentos] = useState([]);
    const [filteredEstabelecimentos, setFilteredEstabelecimentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, estabelecimento: null });
    const [selectedEstab, setSelectedEstab] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadEstabelecimentos();
    }, []);

    useEffect(() => {
        filterEstabelecimentos();
    }, [searchTerm, selectedCategory, estabelecimentos]);

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
            const atividades = estab.gradeAtividades || [];
            if (atividades.length === 0) {
                map["Sem categoria"] = (map["Sem categoria"] || 0) + 1;
            } else {
                atividades.forEach((g) => {
                    const nome = g.atividade || "Outros";
                    map[nome] = (map[nome] || 0) + 1;
                });
            }
        });
        return Object.entries(map)
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count);
    }, [estabelecimentos]);

    const filterEstabelecimentos = () => {
        let filtered = estabelecimentos;

        if (selectedCategory) {
            if (selectedCategory === "Sem categoria") {
                filtered = filtered.filter(
                    (e) => !e.gradeAtividades || e.gradeAtividades.length === 0
                );
            } else {
                filtered = filtered.filter((e) =>
                    e.gradeAtividades?.some((g) => g.atividade === selectedCategory)
                );
            }
        }

        if (searchTerm) {
            filtered = filtered.filter(
                (e) =>
                    e.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    e.nomeFantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    e.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredEstabelecimentos(filtered);
    };

    const handleCategoryClick = (categoryName) => {
        setSelectedCategory((prev) => (prev === categoryName ? null : categoryName));
    };

    const handleOpenModal = (estab) => {
        const atividades = (estab.gradeAtividades || []).map((g) => g.atividade);
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
                        onClick={() => setSelectedCategory(null)}
                        sx={{ borderRadius: 10, textTransform: "none", fontWeight: 600 }}
                    >
                        Limpar filtro: {selectedCategory}
                    </Button>
                )}
            </Box>

            {/* Cards de Categorias */}
            {loading ? (
                <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {categoryStats.map(({ name, count }) => {
                        const config = getCategoryConfig(name);
                        const IconComponent = config.icon;
                        const isSelected = selectedCategory === name;

                        return (
                            <Grid item xs={6} sm={4} md={3} lg={2} key={name}>
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
                                        <Typography
                                            variant="h5"
                                            fontWeight={800}
                                            sx={{ color: config.color }}
                                        >
                                            {count}
                                        </Typography>
                                    </Box>
                                    <Typography
                                        variant="body2"
                                        fontWeight={600}
                                        noWrap
                                        title={name}
                                        sx={{ color: "text.primary" }}
                                    >
                                        {name}
                                    </Typography>
                                    <Typography variant="caption" color="text.secondary">
                                        {count === 1 ? "1 unidade" : `${count} unidades`}
                                    </Typography>
                                </Paper>
                            </Grid>
                        );
                    })}
                </Grid>
            )}

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
                        ) : filteredEstabelecimentos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">Nenhum estabelecimento encontrado</TableCell>
                            </TableRow>
                        ) : (
                            filteredEstabelecimentos.map((estab) => (
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
                                            {(estab.gradeAtividades || []).slice(0, 3).map((g) => {
                                                const cfg = getCategoryConfig(g.atividade);
                                                return (
                                                    <Chip
                                                        key={g.atividade}
                                                        label={g.atividade}
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
                                            {(estab.gradeAtividades || []).length > 3 && (
                                                <Chip
                                                    label={`+${estab.gradeAtividades.length - 3}`}
                                                    size="small"
                                                    sx={{ fontWeight: 600, fontSize: "0.7rem" }}
                                                />
                                            )}
                                            {(!estab.gradeAtividades || estab.gradeAtividades.length === 0) && (
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
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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

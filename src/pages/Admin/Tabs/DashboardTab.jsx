import React, { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Typography,
    Grid,
    LinearProgress,
    CircularProgress,
    useTheme,
    alpha,
    Chip,
    Divider,
    Tooltip,
    IconButton,
} from "@mui/material";
import {
    FaUser,
    FaUserTie,
    FaBuilding,
    FaUsers,
    FaChartPie,
    FaFlag,
    FaBell,
    FaTags,
    FaUserShield,
    FaCheckCircle,
    FaExclamationTriangle,
    FaTimesCircle,
    FaChevronRight,
    FaChevronLeft,
    FaTrophy,
    FaClock,
    FaCalendarAlt,
} from "react-icons/fa";
import {
    adminService,
    denunciaService,
    solicitacaoCategoriaService,
    categoriaService,
    estabelecimentoService,
    profissionalService,
} from "../../../services";
import { toast } from "react-toastify";

const MOTIVO_LABELS = {
    PRECONCEITO: "Preconceito / Ódio",
    LINGUAGEM_OFENSIVA: "Ling. Ofensiva",
    SPAM: "Spam",
    INFORMACAO_FALSA: "Info. Falsa",
    OUTROS: "Outros",
};



const formatOnlyDate = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
    });
};

const formatOnlyTime = (date) => {
    if (!date) return "—";
    return new Date(date).toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
    });
};

const parseCreated = (obj) => {
    if (!obj) return null;
    const fields = ["createdAt", "dataCriacao", "created_at", "created", "dataCadastro", "createdAt"];
    for (const f of fields) {
        const val = obj[f];
        if (val) {
            if (Array.isArray(val)) {
                const [year, month, day, hour = 0, minute = 0, second = 0] = val;
                const d = new Date(year, month - 1, day, hour, minute, second);
                if (!isNaN(d.getTime())) return d;
            }
            const d = new Date(val);
            if (!isNaN(d.getTime())) return d;
        }
    }
    if (obj.endereco) {
        const val = obj.endereco.createdAt || obj.endereco.created;
        if (val) {
            if (Array.isArray(val)) {
                const [year, month, day, hour = 0, minute = 0, second = 0] = val;
                const d = new Date(year, month - 1, day, hour, minute, second);
                if (!isNaN(d.getTime())) return d;
            }
            const d = new Date(val);
            if (!isNaN(d.getTime())) return d;
        }
    }
    return null;
};

const DashboardTab = ({ onTabChange }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        alunos: 0,
        profissionais: 0,
        estabelecimentos: 0,
        admins: 0,
    });
    const [usersList, setUsersList] = useState([]);
    const [estabelecimentosList, setEstabelecimentosList] = useState([]);
    const [cepStateCache, setCepStateCache] = useState({});
    const [recentRegistrationsState, setRecentRegistrationsState] = useState([]);
    const [denunciasPendentes, setDenunciasPendentes] = useState([]);
    const [solicitacoesPendentes, setSolicitacoesPendentes] = useState([]);
    const [totalCategorias, setTotalCategorias] = useState(0);
    const [topCategorias, setTopCategorias] = useState([]);

    useEffect(() => {
        loadAll(false);

        const interval = setInterval(() => {
            loadAll(true);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    const loadAll = async (isSilent = false) => {
        try {
            if (!isSilent) setLoading(true);
            const [users, denuncias, solicitacoes, categorias, estabelecimentos, profissionais] =
                await Promise.all([
                    adminService.getAllUsers(),
                    denunciaService.getAll("PENDENTE"),
                    solicitacaoCategoriaService.getAll("PENDENTE"),
                    categoriaService.listarTodas(),
                    estabelecimentoService.getAll(),
                    profissionalService.listarProfissionais(),
                ]);

            setStats({
                total: users.length,
                alunos: users.filter((u) => u.tipo === "aluno").length,
                profissionais: users.filter((u) => u.tipo === "profissional").length,
                estabelecimentos: users.filter((u) => u.tipo === "estabelecimento").length,
                admins: users.filter((u) => u.tipo === "admin").length,
            });

            const mergedUsers = [...(users || [])];
            const userIds = new Set(mergedUsers.map(u => u.id || u._id));
            (profissionais || []).forEach(p => {
                const pid = p.id || p._id;
                if (!userIds.has(pid)) mergedUsers.push(p);
            });
            setUsersList(mergedUsers);
            setEstabelecimentosList(estabelecimentos || []);

            setDenunciasPendentes(denuncias);
            setSolicitacoesPendentes(solicitacoes);
            setTotalCategorias(categorias.length);

            const catCount = {};
            const getCatName = (cat) => {
                if (!cat) return "";
                if (typeof cat === "string") return cat;
                return cat.nome || cat.nomeCategoria || cat.atividade || "";
            };

            (estabelecimentos || []).forEach((e) => {
                const cats = [];
                if (Array.isArray(e.categorias)) {
                    e.categorias.forEach(c => {
                        const name = getCatName(c);
                        if (name) cats.push(name);
                    });
                }
                if (Array.isArray(e.gradeAtividades)) {
                    e.gradeAtividades.forEach(a => {
                        const name = getCatName(a?.atividade || a);
                        if (name) cats.push(name);
                    });
                }
                const uniqueCats = [...new Set(cats)];
                uniqueCats.forEach(name => {
                    catCount[name] = (catCount[name] || 0) + 1;
                });
            });

            (profissionais || []).forEach((p) => {
                const cats = [];
                if (Array.isArray(p.especialidades)) {
                    p.especialidades.forEach(e => {
                        const name = getCatName(e);
                        if (name) cats.push(name);
                    });
                }
                if (Array.isArray(p.gradeAtividades)) {
                    p.gradeAtividades.forEach(a => {
                        const name = getCatName(a?.atividade || a);
                        if (name) cats.push(name);
                    });
                }
                if (p.especializacao) {
                    const name = getCatName(p.especializacao);
                    if (name) cats.push(name);
                }
                if (Array.isArray(p.categorias)) {
                    p.categorias.forEach(c => {
                        const name = getCatName(c);
                        if (name) cats.push(name);
                    });
                }
                const uniqueCats = [...new Set(cats)];
                uniqueCats.forEach(name => {
                    catCount[name] = (catCount[name] || 0) + 1;
                });
            });

            const sorted = Object.entries(catCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([nome, count]) => ({ nome, count }));
            setTopCategorias(sorted);

            const makeEntry = (item, tipo) => ({
                id: `${tipo || item.tipo || 'usuario'}-${item.id || item._id || Math.random()}`,
                nome: item.nome || item.nomeFantasia || item.email || 'Sem nome',
                tipo: tipo || item.tipo || 'usuario',
                _created: parseCreated(item) || new Date(0),
            });

            const fetchedEntries = (users || [])
                .map(u => makeEntry(u, u.tipo || 'usuario'))
                .filter(r => r._created instanceof Date && !isNaN(r._created));

            const existingMap = {};
            fetchedEntries.forEach(fe => {
                existingMap[fe.id] = fe;
            });
            const merged = Object.values(existingMap).sort((a, b) => b._created - a._created).slice(0, 5);
            setRecentRegistrationsState(merged);
        } catch (error) {
            console.error("Erro ao carregar dados do dashboard:", error);
            if (!isSilent) toast.error("Erro ao carregar dados do dashboard");
        } finally {
            if (!isSilent) setLoading(false);
        }
    };

    const pct = (value) =>
        stats.total === 0 ? 0 : Math.round((value / stats.total) * 100);

    const onlyDigits = (value) => (value ? String(value).replace(/\D/g, '') : '');

    const normalizeState = (value) => {
        const candidate = value ? String(value).trim().toUpperCase() : '';
        return candidate.match(/^[A-Z]{2}$/) ? candidate : null;
    };

    const getStateFromObj = (obj) => {
        const direct = normalizeState(
            obj?.estado?.sigla || obj?.estado || obj?.uf || obj?.endereco?.uf || obj?.endereco?.estado || obj?.endereco?.state || obj?.address?.state
        );
        if (direct) return direct;

        const cep = onlyDigits(obj?.cep || obj?.endereco?.cep || obj?.address?.cep);
        if (cep && cepStateCache[cep]) return cepStateCache[cep];
        return null;
    };

    const getCepFromObj = (obj) => onlyDigits(obj?.cep || obj?.endereco?.cep || obj?.address?.cep);

    const fetchStateByCep = async (cep) => {
        if (!cep || cep.length !== 8) return null;
        if (cepStateCache[cep]) return cepStateCache[cep];
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
            if (!response.ok) return null;
            const data = await response.json();
            const uf = normalizeState(data.uf);
            if (uf) {
                setCepStateCache((prev) => ({ ...prev, [cep]: uf }));
                return uf;
            }
        } catch (error) {
            console.warn('Falha ao resolver estado pelo CEP', cep, error);
        }
        return null;
    };

    const resolveCepStates = async () => {
        const sourceItems = [...(usersList || []), ...(estabelecimentosList || [])];
        const ceps = new Set();
        sourceItems.forEach((item) => {
            const state = getStateFromObj(item);
            if (!state) {
                const cep = getCepFromObj(item);
                if (cep && !cepStateCache[cep]) ceps.add(cep);
            }
        });
        if (ceps.size === 0) return;
        await Promise.all(Array.from(ceps).map(fetchStateByCep));
    };

    useEffect(() => {
        resolveCepStates();
    }, [usersList, estabelecimentosList, cepStateCache]);

    const maxCatCount = topCategorias[0]?.count || 1;

    const locationSources = [...(usersList || []), ...(estabelecimentosList || [])];
    const cityCount = {};
    const stateCount = {};
    locationSources.forEach((it) => {
        const city = (it.cidade && (it.cidade.nome || it.cidade)) || it.cidadeNome || (it.endereco && (it.endereco.cidade || it.endereco.city)) || (it.address && it.address.city) || null;
        const state = getStateFromObj(it);
        if (city) cityCount[city] = (cityCount[city] || 0) + 1;
        if (state) stateCount[state] = (stateCount[state] || 0) + 1;
    });
    const topCities = Object.entries(cityCount).sort((a, b) => b[1] - a[1]).slice(0, 8).map(([nome, count]) => ({ nome, count }));
    const stateTotal = Object.values(stateCount).reduce((sum, value) => sum + value, 0);
    const stateDistribution = Object.entries(stateCount).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([sigla, count]) => ({ sigla, count, pct: stateTotal === 0 ? 0 : Math.round((count / stateTotal) * 100) }));

    const recentRegistrationsDisplay = (recentRegistrationsState || []).slice(0, 5);

    const getRoleConfig = (tipo) => {
        switch (tipo?.toLowerCase()) {
            case "aluno": {
                const baseColor = theme.palette.primary.main;
                return {
                    label: "Aluno",
                    color: "primary",
                    icon: <FaUser size={14} />,
                    bgColor: alpha(baseColor, 0.08),
                    textColor: baseColor,
                    borderColor: alpha(baseColor, 0.15),
                };
            }
            case "profissional": {
                const baseColor = theme.palette.success.main;
                return {
                    label: "Profissional",
                    color: "success",
                    icon: <FaUserTie size={14} />,
                    bgColor: alpha(baseColor, 0.08),
                    textColor: baseColor,
                    borderColor: alpha(baseColor, 0.15),
                };
            }
            case "estabelecimento": {
                const baseColor = theme.palette.warning.main;
                return {
                    label: "Estabelecimento",
                    color: "warning",
                    icon: <FaBuilding size={14} />,
                    bgColor: alpha(baseColor, 0.08),
                    textColor: baseColor,
                    borderColor: alpha(baseColor, 0.15),
                };
            }
            case "admin": {
                const baseColor = theme.palette.secondary.main;
                return {
                    label: "Administrador",
                    color: "secondary",
                    icon: <FaUserShield size={14} />,
                    bgColor: alpha(baseColor, 0.08),
                    textColor: baseColor,
                    borderColor: alpha(baseColor, 0.15),
                };
            }
            default: {
                const baseColor = theme.palette.text.disabled;
                return {
                    label: "Usuário",
                    color: "default",
                    icon: <FaUser size={14} />,
                    bgColor: alpha(baseColor, 0.08),
                    textColor: baseColor,
                    borderColor: alpha(baseColor, 0.15),
                };
            }
        }
    };

    const pendingTotal = denunciasPendentes.length + solicitacoesPendentes.length;
    const systemStatus = 
        pendingTotal === 0
            ? { label: "Sistema operando normalmente", color: "success", Icon: FaCheckCircle }
            : pendingTotal <= 5
            ? { label: "Itens aguardando revisão", color: "warning", Icon: FaExclamationTriangle }
            : { label: "Atenção: múltiplos pendentes", color: "error", Icon: FaTimesCircle };

    const StatCard = ({ title, value, icon, color, percentage, sub }) => {
        const c = color || "primary";
        const baseColor = theme.palette[c]?.main || theme.palette.primary.main;
        const bg = alpha(baseColor, 0.02);
        const bgAccent = alpha(baseColor, 0.08);
        const border = alpha(baseColor, 0.15);
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 2.5,
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    border: "1px solid",
                    borderColor: border,
                    borderRadius: 3,
                    bgcolor: bg,
                    position: "relative",
                    overflow: "hidden",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    '&:hover': {
                        transform: "translateY(-2px)",
                        boxShadow: `0 8px 24px ${bgAccent}`,
                    }
                }}
            >
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        mb: 1.5,
                    }}
                >
                    <Box>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={700}
                            sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                        >
                            {title}
                        </Typography>
                        <Typography variant="h4" fontWeight={850} sx={{ mt: 0.5, color: baseColor }}>
                            {value}
                        </Typography>
                    </Box>
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: "50%",
                            bgcolor: bgAccent,
                            color: baseColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {icon}
                    </Box>
                </Box>

                {percentage !== undefined && (
                    <Box>
                        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                            <Typography variant="caption" color="text.secondary">
                                {sub || "Do total"}
                            </Typography>
                            <Typography variant="caption" fontWeight={700} color={baseColor}>
                                {percentage}%
                            </Typography>
                        </Box>
                        <LinearProgress
                            variant="determinate"
                            value={percentage}
                            sx={{
                                height: 5,
                                borderRadius: 3,
                                bgcolor: bgAccent,
                                "& .MuiLinearProgress-bar": {
                                    bgcolor: baseColor,
                                    borderRadius: 3,
                                },
                            }}
                        />
                    </Box>
                )}
            </Paper>
        );
    };

    const AlertCard = ({ title, value, icon, color, label }) => {
        const c = color || "error";
        const baseColor = theme.palette[c]?.main || theme.palette.error.main;
        const bg = alpha(baseColor, 0.02);
        const bgAccent = alpha(baseColor, 0.08);
        const border = alpha(baseColor, 0.15);
        return (
            <Paper
                elevation={0}
                sx={{
                    p: 2.5,
                    height: "100%",
                    border: "1px solid",
                    borderColor: border,
                    borderLeft: `4px solid ${baseColor}`,
                    borderRadius: 3,
                    bgcolor: bg,
                    cursor: "default",
                    transition: "transform 0.2s, box-shadow 0.2s",
                    '&:hover': {
                        transform: "translateY(-2px)",
                        boxShadow: `0 8px 24px ${bgAccent}`,
                    }
                }}
            >
                <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <Box>
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={700}
                            sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                        >
                            {title}
                        </Typography>
                        <Typography
                            variant="h4"
                            fontWeight={850}
                            color={baseColor}
                            sx={{ mt: 0.5 }}
                        >
                            {value}
                        </Typography>
                        {label && (
                            <Typography variant="caption" color="text.secondary">
                                {label}
                            </Typography>
                        )}
                    </Box>
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: "50%",
                            bgcolor: bgAccent,
                            color: baseColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                        }}
                    >
                        {icon}
                    </Box>
                </Box>
            </Paper>
        );
    };

    const IconButtonCarousel = ({ direction }) => {
        const handle = () => {
            const el = document.getElementById("primary-cards-carousel");
            if (!el) return;
            const amount = direction === "left" ? -360 : 360;
            el.scrollBy({ left: amount, behavior: "smooth" });
        };

        return (
            <IconButton size="small" onClick={handle} sx={{ bgcolor: alpha(theme.palette.background.paper, 0.6) }}>
                {direction === "left" ? <FaChevronLeft /> : <FaChevronRight />}
            </IconButton>
        );
    };

    if (loading) {
        return (
            <Box
                sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}
            >
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            {/* Header */}
            <Box sx={{ mb: 4 }}>
                <Typography
                    variant="h5"
                    fontWeight={700}
                    display="flex"
                    alignItems="center"
                    gap={1}
                >
                    <FaChartPie /> Visão Geral do Sistema
                </Typography>
                <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                    Acompanhe métricas de crescimento, distribuição de usuários e relatórios reais do sistema.
                </Typography>
            </Box>

            {/* Row 1 — Métricas Principais */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Total de Usuários"
                        value={stats.total}
                        icon={<FaUsers size={20} />}
                        color="primary"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Categorias Ativas"
                        value={totalCategorias}
                        icon={<FaTags size={18} />}
                        color="info"
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Denúncias Pendentes"
                        value={denunciasPendentes.length}
                        icon={<FaFlag size={18} />}
                        color={denunciasPendentes.length > 0 ? "error" : "success"}
                    />
                </Grid>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Solicitações Pendentes"
                        value={solicitacoesPendentes.length}
                        icon={<FaBell size={18} />}
                        color={solicitacoesPendentes.length > 0 ? "warning" : "success"}
                    />
                </Grid>
            </Grid>

            {/* Bottom — Two-column layout */}
            <Box
                sx={{
                    display: "flex",
                    gap: 3,
                    alignItems: "flex-start",
                    flexWrap: { xs: "wrap", lg: "nowrap" },
                }}
            >
                {/* Left column (70%) */}
                <Box
                    sx={{
                        flex: "7 1 500px",
                        minWidth: 0,
                        display: "flex",
                        flexDirection: "column",
                        gap: 3,
                    }}
                >
                    {/* User Distribution */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            border: "1px solid",
                            borderColor: alpha(theme.palette.divider, 0.5),
                            borderRadius: 3,
                            bgcolor: alpha(theme.palette.background.paper, 0.5),
                        }}
                    >
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="h6" fontWeight={750} color="text.primary">
                                Distribuição de Usuários
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                                Análise proporcional de perfis cadastrados na plataforma IlhaFit.
                            </Typography>
                        </Box>

                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                            {[
                                {
                                    label: "Alunos",
                                    icon: <FaUser size={14} />,
                                    color: "primary",
                                    count: stats.alunos,
                                },
                                {
                                    label: "Profissionais",
                                    icon: <FaUserTie size={14} />,
                                    color: "success",
                                    count: stats.profissionais,
                                },
                                {
                                    label: "Estabelecimentos",
                                    icon: <FaBuilding size={14} />,
                                    color: "warning",
                                    count: stats.estabelecimentos,
                                },
                                {
                                    label: "Administradores",
                                    icon: <FaUserShield size={14} />,
                                    color: "secondary",
                                    count: stats.admins,
                                },
                            ].map(({ label, icon, color, count }) => {
                                const baseColor = theme.palette[color]?.main || theme.palette.primary.main;
                                const percentage = pct(count);
                                return (
                                    <Box key={label} sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                                        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                                <Box
                                                    sx={{
                                                        width: 28,
                                                        height: 28,
                                                        borderRadius: "50%",
                                                        bgcolor: alpha(baseColor, 0.08),
                                                        color: baseColor,
                                                        display: "flex",
                                                        alignItems: "center",
                                                        justifyContent: "center",
                                                    }}
                                                >
                                                    {icon}
                                                </Box>
                                                <Typography variant="body2" fontWeight={600} color="text.primary">
                                                    {label}
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                                <Typography variant="body2" fontWeight={750} color="text.primary">
                                                    {count}
                                                </Typography>
                                                <Chip
                                                    label={`${percentage}%`}
                                                    size="small"
                                                    sx={{
                                                        height: 20,
                                                        fontSize: "0.7rem",
                                                        fontWeight: 700,
                                                        bgcolor: alpha(baseColor, 0.08),
                                                        color: baseColor,
                                                        border: "none",
                                                    }}
                                                />
                                            </Box>
                                        </Box>
                                        <LinearProgress
                                            variant="determinate"
                                            value={parseFloat(percentage)}
                                            sx={{
                                                height: 8,
                                                borderRadius: 4,
                                                bgcolor: alpha(baseColor, 0.05),
                                                "& .MuiLinearProgress-bar": {
                                                    bgcolor: baseColor,
                                                    borderRadius: 4,
                                                },
                                            }}
                                        />
                                    </Box>
                                );
                            })}
                        </Box>
                    </Paper>

                    {/* Top Categories */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            border: "1px solid",
                            borderColor: alpha(theme.palette.divider, 0.5),
                            borderRadius: 3,
                            bgcolor: alpha(theme.palette.background.paper, 0.5),
                        }}
                    >
                        <Typography
                            variant="h6"
                            fontWeight={750}
                            sx={{ mb: 2.5, display: "flex", alignItems: "center", gap: 1, color: "text.primary" }}
                        >
                            <FaTrophy size={16} color={theme.palette.warning.main} />
                            Top Categorias
                        </Typography>

                        {topCategorias.length === 0 ? (
                            <Typography color="text.secondary" variant="body2">
                                Nenhuma categoria cadastrada.
                            </Typography>
                        ) : (
                            <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                                {topCategorias.map(({ nome, count }, i) => (
                                    <Box key={nome}>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                mb: 1,
                                            }}
                                        >
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    gap: 1.5,
                                                }}
                                            >
                                                <Typography
                                                    variant="caption"
                                                    fontWeight={800}
                                                    sx={{
                                                        width: 24,
                                                        textAlign: "center",
                                                        color:
                                                            i === 0
                                                                ? theme.palette.warning.main
                                                                : "text.disabled",
                                                    }}
                                                >
                                                    #{i + 1}
                                                </Typography>
                                                <Typography variant="body2" fontWeight={600}>
                                                    {nome}
                                                </Typography>
                                            </Box>
                                            <Typography
                                                variant="caption"
                                                fontWeight={700}
                                                color="text.secondary"
                                            >
                                                {count} {count === 1 ? "uso" : "usos"}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ pl: 4.5 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(count / maxCatCount) * 100}
                                                sx={{
                                                    height: 8,
                                                    borderRadius: 4,
                                                    bgcolor: alpha(i === 0 ? theme.palette.warning.main : theme.palette.primary.main, 0.08),
                                                    "& .MuiLinearProgress-bar": {
                                                        bgcolor: i === 0 ? theme.palette.warning.main : theme.palette.primary.main,
                                                        borderRadius: 4,
                                                    },
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Paper>
                    {/* Últimos Cadastros e Distribuição por Estados */}
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            border: "1px solid",
                            borderColor: alpha(theme.palette.divider, 0.5),
                            borderRadius: 3,
                            bgcolor: alpha(theme.palette.background.paper, 0.5),
                        }}
                    >
                        <Typography
                            variant="h6"
                            fontWeight={750}
                            sx={{ mb: 2.5, color: "text.primary" }}
                        >
                            Últimos Cadastros
                        </Typography>
                        {recentRegistrationsDisplay.length === 0 ? (
                            <Typography color="text.secondary" variant="body2">Nenhum cadastro recente.</Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {recentRegistrationsDisplay.map((r, idx) => {
                                    const config = getRoleConfig(r.tipo);
                                    return (
                                        <Box key={r.id}>
                                            <Box
                                                sx={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'space-between',
                                                    py: 1.5,
                                                    px: 1,
                                                    borderRadius: 2,
                                                    transition: "background-color 0.2s",
                                                    '&:hover': {
                                                        bgcolor: alpha(theme.palette.text.primary, 0.02),
                                                    }
                                                }}
                                            >
                                                {/* Left side: Avatar + User Info */}
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, minWidth: 0 }}>
                                                    <Box
                                                        sx={{
                                                            p: 1.2,
                                                            borderRadius: '50%',
                                                            bgcolor: config.bgColor,
                                                            color: config.textColor,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center',
                                                            flexShrink: 0,
                                                        }}
                                                    >
                                                        {config.icon}
                                                    </Box>
                                                    <Box sx={{ minWidth: 0 }}>
                                                        <Typography variant="body2" fontWeight={700} noWrap sx={{ color: 'text.primary', mb: 0.5 }}>
                                                            {r.nome}
                                                        </Typography>
                                                        <Chip
                                                            label={config.label}
                                                            size="small"
                                                            sx={{
                                                                height: 20,
                                                                fontSize: '0.7rem',
                                                                fontWeight: 700,
                                                                textTransform: 'uppercase',
                                                                bgcolor: config.bgColor,
                                                                color: config.textColor,
                                                                border: "none",
                                                                '& .MuiChip-label': { px: 1 }
                                                            }}
                                                        />
                                                    </Box>
                                                </Box>

                                                {/* Right side: Date and Time */}
                                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', flexShrink: 0, gap: 0.5 }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                        <FaCalendarAlt size={11} />
                                                        <Typography variant="caption" fontWeight={600}>
                                                            {formatOnlyDate(r._created)}
                                                        </Typography>
                                                    </Box>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, color: 'text.secondary' }}>
                                                        <FaClock size={11} />
                                                        <Typography variant="caption" fontWeight={600}>
                                                            {formatOnlyTime(r._created)}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            </Box>
                                            {idx < recentRegistrationsDisplay.length - 1 && <Divider sx={{ my: 0.5 }} />}
                                        </Box>
                                    );
                                })}
                            </Box>
                        )}

                        <Divider sx={{ my: 2 }} />

                        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>Distribuição por Estados</Typography>
                        {stateDistribution.length === 0 ? (
                            <Typography color="text.secondary">Sem dados de estado.</Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                                {stateDistribution.map(s => (
                                    <Box key={s.sigla} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                                        <Box sx={{ width: 48 }}><Typography variant="body2">{s.sigla}</Typography></Box>
                                        <Box sx={{ flex: 1 }}>
                                            <LinearProgress variant="determinate" value={s.pct} sx={{ height: 12, borderRadius: 6 }} />
                            {solicitacoesPendentes.length === 0 ? (
                                <Typography variant="caption" color="text.secondary">
                                    Nenhuma solicitação pendente.
                                </Typography>
                            ) : (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                    {solicitacoesPendentes.slice(0, 5).map((s) => (
                                        <Box
                                            key={s.id}
                                            onClick={() => onTabChange?.(5)}
                                            sx={{
                                                p: 1,
                                                borderRadius: 1.5,
                                                cursor: "pointer",
                                                transition: "background 0.15s",
                                                "&:hover": {
                                                    bgcolor: alpha(
                                                        theme.palette.warning.main,
                                                        0.07
                                                    ),
                                                },
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                fontWeight={600}
                                                color="warning.dark"
                                                display="block"
                                            >
                                                {s.nome}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                noWrap
                                                display="block"
                                            >
                                                {s.solicitanteNome || s.solicitanteEmail || s.solicitante || "Solicitante não informado"}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.disabled"
                                                sx={{ fontSize: "0.65rem" }}
                                            >
                                                {formatDate(s.dataSolicitacao)}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ width: 48, textAlign: 'right' }}><Typography variant="caption" color="text.secondary">{s.pct}%</Typography></Box>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default DashboardTab;

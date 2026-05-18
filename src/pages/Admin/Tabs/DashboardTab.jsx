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

const formatDate = (dateStr) => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
    });
};

// tenta extrair data de criação a partir de vários campos possíveis
const parseCreated = (obj) => {
    if (!obj) return null;
    const fields = ["createdAt", "dataCriacao", "created_at", "created", "dataCadastro", "createdAt"];
    for (const f of fields) {
        if (obj[f]) return new Date(obj[f]);
    }
    // campos aninhados
    if (obj.endereco && (obj.endereco.createdAt || obj.endereco.created)) return new Date(obj.endereco.createdAt || obj.endereco.created);
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
        loadAll();
    }, []);

    const loadAll = async () => {
        try {
            setLoading(true);
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

            // include professionals returned from separate endpoint to ensure all user types are present
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
            estabelecimentos.forEach((e) => {
                (e.categorias || []).forEach((c) => {
                    catCount[c.nome] = (catCount[c.nome] || 0) + 1;
                });
            });
            const sorted = Object.entries(catCount)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([nome, count]) => ({ nome, count }));
            setTopCategorias(sorted);

            // Build recent registrations incrementally: keep previous ones and add only new/updated
            const makeEntry = (item, tipo) => ({
                id: item.id || item._id || `${tipo}-${item.email || item.cpf || Math.random()}`,
                nome: item.nome || item.nomeFantasia || item.email || 'Sem nome',
                tipo: tipo || item.tipo || 'usuario',
                _created: parseCreated(item) || new Date(item.createdAt || item.created || Date.now()),
            });

            const fetchedEntries = [
                ...(users || []).map(u => makeEntry(u, u.tipo || 'usuario')),
                ...(profissionais || []).map(p => makeEntry(p, p.tipo || 'profissional')),
                ...(estabelecimentos || []).map(e => makeEntry(e, 'estabelecimento')),
            ].filter(r => r._created instanceof Date && !isNaN(r._created));

            const existingMap = {};
            (recentRegistrationsState || []).forEach(r => { existingMap[r.id] = r; });
            fetchedEntries.forEach(fe => {
                const prev = existingMap[fe.id];
                if (!prev) existingMap[fe.id] = fe;
                else if (fe._created > prev._created) existingMap[fe.id] = fe;
            });
            const merged = Object.values(existingMap).sort((a,b) => b._created - a._created).slice(0, 5);
            setRecentRegistrationsState(merged);
        } catch {
            toast.error("Erro ao carregar dados do dashboard");
        } finally {
            setLoading(false);
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

    // Top cidades / estados
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
    const stateDistribution = Object.entries(stateCount).sort((a, b) => b[1] - a[1]).map(([sigla, count]) => ({ sigla, count, pct: stateTotal === 0 ? 0 : Math.round((count / stateTotal) * 100) }));

    // Últimos cadastros — preservados incrementalmente em state
    const recentRegistrationsDisplay = (recentRegistrationsState || []).slice(0, 5);

    const pendingTotal = denunciasPendentes.length + solicitacoesPendentes.length;
    const systemStatus =
        pendingTotal === 0
            ? { label: "Sistema operando normalmente", color: "success", Icon: FaCheckCircle }
            : pendingTotal <= 5
            ? { label: "Itens aguardando revisão", color: "warning", Icon: FaExclamationTriangle }
            : { label: "Atenção: múltiplos pendentes", color: "error", Icon: FaTimesCircle };

    const StatCard = ({ title, value, icon, color, percentage, sub }) => (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                border: "1px solid",
                borderColor: "divider",
                borderRadius: 3,
                position: "relative",
                overflow: "hidden",
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
                        fontWeight={600}
                        sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                    >
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ mt: 0.5 }}>
                        {value}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha(
                            theme.palette[color]?.main || theme.palette.primary.main,
                            0.12
                        ),
                        color: `${color}.main`,
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
                        <Typography variant="caption" fontWeight={700} color={`${color}.main`}>
                            {percentage}%
                        </Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={percentage}
                        color={color}
                        sx={{
                            height: 5,
                            borderRadius: 3,
                            bgcolor: alpha(
                                theme.palette.text.primary,
                                isDark ? 0.1 : 0.05
                            ),
                        }}
                    />
                </Box>
            )}
        </Paper>
    );

    const AlertCard = ({ title, value, icon, color, tabIndex, label }) => (
        <Paper
            elevation={0}
            sx={{
                p: 2.5,
                height: "100%",
                border: "1px solid",
                borderColor: `${color}.main`,
                borderLeft: "4px solid",
                borderLeftColor: `${color}.main`,
                borderRadius: 3,
                cursor: "default",
                transition: "all 0.2s ease",
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <Box>
                    <Typography
                        variant="caption"
                        color="text.secondary"
                        fontWeight={600}
                        sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                    >
                        {title}
                    </Typography>
                    <Typography
                        variant="h4"
                        fontWeight={800}
                        color={`${color}.main`}
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
                <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
                    <Box
                        sx={{
                            p: 1.5,
                            borderRadius: 2,
                            bgcolor: alpha(theme.palette[color].main, 0.12),
                            color: `${color}.main`,
                        }}
                    >
                        {icon}
                    </Box>
                    {/* removed clickable chevron to keep cards static */}
                </Box>
            </Box>
        </Paper>
    );

    // Carousel control
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

            {/* Row 1 — Usuários */}
            {/* Carousel of primary cards */}
            <Box sx={{ mb: 3 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <IconButtonCarousel direction="left" />
                    <Box
                        id="primary-cards-carousel"
                        sx={{
                            display: 'flex',
                            gap: 2,
                            overflowX: 'auto',
                            scrollSnapType: 'x mandatory',
                            px: 1,
                            py: 0.5,
                            scrollbarWidth: 'none',
                            msOverflowStyle: 'none',
                            '&::-webkit-scrollbar': {
                                display: 'none',
                            },
                        }}
                    >
                        <Box sx={{ scrollSnapAlign: 'start', minWidth: 320 }}>
                            <StatCard title="Total de Usuários" value={stats.total} icon={<FaUsers size={20} />} color="primary" />
                        </Box>
                        <Box sx={{ scrollSnapAlign: 'start', minWidth: 280 }}>
                            <StatCard title="Alunos" value={stats.alunos} icon={<FaUser size={18} />} color="primary" percentage={pct(stats.alunos)} sub="Do total" />
                        </Box>
                        <Box sx={{ scrollSnapAlign: 'start', minWidth: 280 }}>
                            <StatCard title="Profissionais" value={stats.profissionais} icon={<FaUserTie size={18} />} color="secondary" percentage={pct(stats.profissionais)} sub="Do total" />
                        </Box>
                        <Box sx={{ scrollSnapAlign: 'start', minWidth: 280 }}>
                            <StatCard title="Estabelecimentos" value={stats.estabelecimentos} icon={<FaBuilding size={18} />} color="warning" percentage={pct(stats.estabelecimentos)} sub="Do total" />
                        </Box>
                        <Box sx={{ scrollSnapAlign: 'start', minWidth: 260 }}>
                            <StatCard title="Categorias Ativas" value={totalCategorias} icon={<FaTags size={18} />} color="info" />
                        </Box>
                        <Box sx={{ scrollSnapAlign: 'start', minWidth: 260 }}>
                            <StatCard title="Denúncias Pendentes" value={denunciasPendentes.length} icon={<FaFlag size={18} />} color={denunciasPendentes.length > 0 ? 'error' : 'success'} />
                        </Box>
                        <Box sx={{ scrollSnapAlign: 'start', minWidth: 260 }}>
                            <StatCard title="Solicitações Pendentes" value={solicitacoesPendentes.length} icon={<FaBell size={18} />} color={solicitacoesPendentes.length > 0 ? 'warning' : 'success'} />
                        </Box>
                        <Box sx={{ scrollSnapAlign: 'start', minWidth: 260 }}>
                            <StatCard title="Administradores" value={stats.admins} icon={<FaUserShield size={18} />} color="secondary" />
                        </Box>
                    </Box>
                    <IconButtonCarousel direction="right" />
                </Box>
            </Box>

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
                        sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 3 }}
                    >
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 3 }}>
                            Distribuição de Usuários
                        </Typography>

                        {/* Stacked bar */}
                        <Box
                            sx={{
                                display: "flex",
                                height: 20,
                                borderRadius: 10,
                                overflow: "hidden",
                                mb: 3,
                                bgcolor: alpha(theme.palette.text.primary, isDark ? 0.06 : 0.04),
                            }}
                        >
                            {stats.alunos > 0 && (
                                <Tooltip
                                    title={`Alunos: ${stats.alunos} (${pct(stats.alunos)}%)`}
                                    arrow
                                >
                                    <Box
                                        sx={{
                                            width: `${pct(stats.alunos)}%`,
                                            bgcolor: "primary.main",
                                            transition: "width 0.8s ease",
                                            cursor: "default",
                                        }}
                                    />
                                </Tooltip>
                            )}
                            {stats.profissionais > 0 && (
                                <Tooltip
                                    title={`Profissionais: ${stats.profissionais} (${pct(stats.profissionais)}%)`}
                                    arrow
                                >
                                    <Box
                                        sx={{
                                            width: `${pct(stats.profissionais)}%`,
                                            bgcolor: "secondary.main",
                                            transition: "width 0.8s ease",
                                            cursor: "default",
                                        }}
                                    />
                                </Tooltip>
                            )}
                            {stats.estabelecimentos > 0 && (
                                <Tooltip
                                    title={`Estabelecimentos: ${stats.estabelecimentos} (${pct(stats.estabelecimentos)}%)`}
                                    arrow
                                >
                                    <Box
                                        sx={{
                                            width: `${pct(stats.estabelecimentos)}%`,
                                            bgcolor: "warning.main",
                                            transition: "width 0.8s ease",
                                            cursor: "default",
                                        }}
                                    />
                                </Tooltip>
                            )}
                            {stats.admins > 0 && (
                                <Tooltip
                                    title={`Admins: ${stats.admins} (${pct(stats.admins)}%)`}
                                    arrow
                                >
                                    <Box
                                        sx={{
                                            flex: 1,
                                            bgcolor: "secondary.dark",
                                            transition: "width 0.8s ease",
                                            cursor: "default",
                                        }}
                                    />
                                </Tooltip>
                            )}
                        </Box>

                        {/* Legend */}
                        <Box sx={{ display: "flex", gap: 3, flexWrap: "wrap" }}>
                            {[
                                {
                                    label: "Alunos",
                                    color: "primary.main",
                                    count: stats.alunos,
                                },
                                {
                                    label: "Profissionais",
                                    color: "secondary.main",
                                    count: stats.profissionais,
                                },
                                {
                                    label: "Estabelecimentos",
                                    color: "warning.main",
                                    count: stats.estabelecimentos,
                                },
                                {
                                    label: "Admins",
                                    color: "secondary.dark",
                                    count: stats.admins,
                                },
                            ].map(({ label, color, count }) => (
                                <Box
                                    key={label}
                                    sx={{ display: "flex", alignItems: "center", gap: 1 }}
                                >
                                    <Box
                                        sx={{
                                            width: 10,
                                            height: 10,
                                            borderRadius: "50%",
                                            bgcolor: color,
                                            flexShrink: 0,
                                        }}
                                    />
                                    <Typography variant="caption" color="text.secondary">
                                        {label} ·{" "}
                                        <Box
                                            component="span"
                                            sx={{ fontWeight: 700, color: "text.primary" }}
                                        >
                                            {count}
                                        </Box>{" "}
                                        ({pct(count)}%)
                                    </Typography>
                                </Box>
                            ))}
                        </Box>
                    </Paper>

                    {/* Top Categories */}
                    <Paper
                        elevation={0}
                        sx={{ p: 3, border: "1px solid", borderColor: "divider", borderRadius: 3 }}
                    >
                        <Typography
                            variant="h6"
                            fontWeight={700}
                            sx={{ mb: 2.5, display: "flex", alignItems: "center", gap: 1 }}
                        >
                            <FaTrophy size={16} color={theme.palette.warning.main} />
                            Top Categorias de Estabelecimentos
                        </Typography>

                        {topCategorias.length === 0 ? (
                            <Typography color="text.secondary" variant="body2">
                                Nenhum estabelecimento com categorias cadastradas.
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
                                                                ? "warning.main"
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
                                                {count} estabelecimento
                                                {count !== 1 ? "s" : ""}
                                            </Typography>
                                        </Box>
                                        <Box sx={{ pl: 4.5 }}>
                                            <LinearProgress
                                                variant="determinate"
                                                value={(count / maxCatCount) * 100}
                                                color={i === 0 ? "warning" : "primary"}
                                                sx={{
                                                    height: 8,
                                                    borderRadius: 4,
                                                    bgcolor: alpha(
                                                        theme.palette.text.primary,
                                                        isDark ? 0.08 : 0.05
                                                    ),
                                                }}
                                            />
                                        </Box>
                                    </Box>
                                ))}
                            </Box>
                        )}
                    </Paper>
                    {/* Últimos Cadastros e Distribuição por Estados */}
                    <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3, bgcolor: alpha(theme.palette.primary.main, 0.02) }}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 2, color: 'primary.main' }}>Últimos Cadastros</Typography>
                        {recentRegistrationsDisplay.length === 0 ? (
                            <Typography color="text.secondary">Nenhum cadastro recente.</Typography>
                        ) : (
                            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5 }}>
                                {recentRegistrationsDisplay.map((r, idx) => (
                                    <Box key={r.id}>
                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                                            <Box>
                                                <Typography variant="body2" fontWeight={700} noWrap sx={{ color: 'text.primary' }}>{r.nome}</Typography>
                                                <Typography variant="caption" color="text.secondary">{r.tipo} · {formatDate(r._created)}</Typography>
                                            </Box>
                                            <Typography variant="caption" color="text.secondary">{new Date(r._created).toLocaleDateString()}</Typography>
                                        </Box>
                                        {idx < recentRegistrationsDisplay.length - 1 && <Divider sx={{ my: 0.5 }} />}
                                    </Box>
                                ))}
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

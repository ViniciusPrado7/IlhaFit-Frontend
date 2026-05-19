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
    FaTrophy,
} from "react-icons/fa";
import {
    adminService,
    denunciaService,
    solicitacaoCategoriaService,
    categoriaService,
    estabelecimentoService,
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
            const [users, denuncias, solicitacoes, categorias, estabelecimentos] =
                await Promise.all([
                    adminService.getAllUsers(),
                    denunciaService.getAll("PENDENTE"),
                    solicitacaoCategoriaService.getAll("PENDENTE"),
                    categoriaService.listarTodas(),
                    estabelecimentoService.getAll(),
                ]);

            setStats({
                total: users.length,
                alunos: users.filter((u) => u.tipo === "aluno").length,
                profissionais: users.filter((u) => u.tipo === "profissional").length,
                estabelecimentos: users.filter((u) => u.tipo === "estabelecimento").length,
                admins: users.filter((u) => u.tipo === "admin").length,
            });

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
        } catch {
            toast.error("Erro ao carregar dados do dashboard");
        } finally {
            setLoading(false);
        }
    };

    const pct = (value) =>
        stats.total === 0 ? 0 : Math.round((value / stats.total) * 100);

    const maxCatCount = topCategorias[0]?.count || 1;

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
            onClick={() => tabIndex !== undefined && onTabChange?.(tabIndex)}
            sx={{
                p: 2.5,
                height: "100%",
                border: "1px solid",
                borderColor: `${color}.main`,
                borderLeft: "4px solid",
                borderLeftColor: `${color}.main`,
                borderRadius: 3,
                cursor: tabIndex !== undefined ? "pointer" : "default",
                transition: "all 0.2s ease",
                "&:hover":
                    tabIndex !== undefined
                        ? {
                              bgcolor: alpha(theme.palette[color].main, 0.05),
                              transform: "translateY(-2px)",
                              boxShadow: `0 4px 20px ${alpha(theme.palette[color].main, 0.15)}`,
                          }
                        : {},
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
                    {tabIndex !== undefined && (
                        <FaChevronRight size={11} color={theme.palette.text.disabled} />
                    )}
                </Box>
            </Box>
        </Paper>
    );

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
                    Acompanhe métricas de crescimento, distribuição de usuários e saúde da
                    plataforma.
                </Typography>
            </Box>

            {/* Row 1 — Usuários */}
            <Grid container spacing={2.5} sx={{ mb: 2.5 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 2.5,
                            height: "100%",
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 3,
                            position: "relative",
                            overflow: "hidden",
                        }}
                    >
                        <Box
                            sx={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                height: 4,
                                bgcolor: "primary.main",
                            }}
                        />
                        <Typography
                            variant="caption"
                            color="text.secondary"
                            fontWeight={600}
                            sx={{ textTransform: "uppercase", letterSpacing: 0.5 }}
                        >
                            Total de Usuários
                        </Typography>
                        <Typography variant="h3" fontWeight={800} sx={{ my: 1 }}>
                            {stats.total}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Cadastrados na plataforma
                        </Typography>
                        <Box sx={{ mt: 1.5, display: "flex", justifyContent: "flex-end" }}>
                            <FaUsers
                                size={36}
                                style={{ opacity: 0.1 }}
                                color={theme.palette.primary.main}
                            />
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Alunos"
                        value={stats.alunos}
                        icon={<FaUser size={18} />}
                        color="primary"
                        percentage={pct(stats.alunos)}
                        sub="Do total de usuários"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Profissionais"
                        value={stats.profissionais}
                        icon={<FaUserTie size={18} />}
                        color="secondary"
                        percentage={pct(stats.profissionais)}
                        sub="Do total de usuários"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Estabelecimentos"
                        value={stats.estabelecimentos}
                        icon={<FaBuilding size={18} />}
                        color="warning"
                        percentage={pct(stats.estabelecimentos)}
                        sub="Do total de usuários"
                    />
                </Grid>
            </Grid>

            {/* Row 2 — Plataforma */}
            <Grid container spacing={2.5} sx={{ mb: 3.5 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Categorias Ativas"
                        value={totalCategorias}
                        icon={<FaTags size={18} />}
                        color="info"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <AlertCard
                        title="Denúncias Pendentes"
                        value={denunciasPendentes.length}
                        icon={<FaFlag size={18} />}
                        color={denunciasPendentes.length > 0 ? "error" : "success"}
                        tabIndex={3}
                        label="Clique para revisar"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <AlertCard
                        title="Solicitações Pendentes"
                        value={solicitacoesPendentes.length}
                        icon={<FaBell size={18} />}
                        color={solicitacoesPendentes.length > 0 ? "warning" : "success"}
                        tabIndex={5}
                        label="Clique para revisar"
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Administradores"
                        value={stats.admins}
                        icon={<FaUserShield size={18} />}
                        color="secondary"
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
                </Box>

                {/* Right column (30%) — System Health */}
                <Box sx={{ flex: "3 1 280px" }}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            border: "1px solid",
                            borderColor: "divider",
                            borderRadius: 3,
                            bgcolor: isDark
                                ? alpha(theme.palette.background.default, 0.5)
                                : alpha(theme.palette.grey[50], 0.9),
                        }}
                    >
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                            Saúde da Plataforma
                        </Typography>

                        {/* Status indicator */}
                        <Chip
                            icon={
                                <systemStatus.Icon
                                    size={13}
                                    style={{ marginLeft: 8, flexShrink: 0 }}
                                />
                            }
                            label={systemStatus.label}
                            color={systemStatus.color}
                            size="small"
                            sx={{
                                mb: 3,
                                fontWeight: 600,
                                width: "100%",
                                justifyContent: "flex-start",
                                borderRadius: 2,
                            }}
                        />

                        {/* Denúncias pendentes */}
                        <Box sx={{ mb: 2.5 }}>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 1.5,
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={700}
                                    sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                                >
                                    <FaFlag size={12} color={theme.palette.error.main} />
                                    Denúncias Pendentes
                                </Typography>
                                {denunciasPendentes.length > 0 && (
                                    <Chip
                                        label={denunciasPendentes.length}
                                        size="small"
                                        color="error"
                                        sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }}
                                    />
                                )}
                            </Box>

                            {denunciasPendentes.length === 0 ? (
                                <Typography variant="caption" color="text.secondary">
                                    Nenhuma denúncia pendente.
                                </Typography>
                            ) : (
                                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                                    {denunciasPendentes.slice(0, 5).map((d) => (
                                        <Box
                                            key={d.id}
                                            onClick={() => onTabChange?.(3)}
                                            sx={{
                                                p: 1,
                                                borderRadius: 1.5,
                                                cursor: "pointer",
                                                transition: "background 0.15s",
                                                "&:hover": {
                                                    bgcolor: alpha(theme.palette.error.main, 0.07),
                                                },
                                            }}
                                        >
                                            <Typography
                                                variant="caption"
                                                fontWeight={600}
                                                color="error.main"
                                                display="block"
                                            >
                                                {MOTIVO_LABELS[d.motivo] || d.motivo}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                noWrap
                                                display="block"
                                            >
                                                {d.estabelecimentoNome ||
                                                    d.profissionalNome ||
                                                    "Sem contexto"}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.disabled"
                                                sx={{ fontSize: "0.65rem" }}
                                            >
                                                {formatDate(d.dataDenuncia)}
                                            </Typography>
                                        </Box>
                                    ))}
                                    {denunciasPendentes.length > 5 && (
                                        <Typography
                                            variant="caption"
                                            color="text.disabled"
                                            sx={{ pl: 1, fontStyle: "italic" }}
                                        >
                                            +{denunciasPendentes.length - 5} demais pendentes
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </Box>

                        <Divider sx={{ mb: 2.5 }} />

                        {/* Solicitações pendentes */}
                        <Box>
                            <Box
                                sx={{
                                    display: "flex",
                                    justifyContent: "space-between",
                                    alignItems: "center",
                                    mb: 1.5,
                                }}
                            >
                                <Typography
                                    variant="subtitle2"
                                    fontWeight={700}
                                    sx={{ display: "flex", alignItems: "center", gap: 0.75 }}
                                >
                                    <FaBell size={12} color={theme.palette.warning.main} />
                                    Solicitações Pendentes
                                </Typography>
                                {solicitacoesPendentes.length > 0 && (
                                    <Chip
                                        label={solicitacoesPendentes.length}
                                        size="small"
                                        color="warning"
                                        sx={{ height: 20, fontSize: "0.65rem", fontWeight: 700 }}
                                    />
                                )}
                            </Box>

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
                                    ))}
                                    {solicitacoesPendentes.length > 5 && (
                                        <Typography
                                            variant="caption"
                                            color="text.disabled"
                                            sx={{ pl: 1, fontStyle: "italic" }}
                                        >
                                            +{solicitacoesPendentes.length - 5} demais pendentes
                                        </Typography>
                                    )}
                                </Box>
                            )}
                        </Box>
                    </Paper>
                </Box>
            </Box>
        </Box>
    );
};

export default DashboardTab;

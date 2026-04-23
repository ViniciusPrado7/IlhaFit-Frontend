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
} from "@mui/material";
import {
    FaUser,
    FaUserTie,
    FaBuilding,
    FaUsers,
    FaChartPie,
} from "react-icons/fa";
import { adminService } from "../../../services";
import { toast } from "react-toastify";

const DashboardTab = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [stats, setStats] = useState({
        total: 0,
        alunos: 0,
        profissionais: 0,
        estabelecimentos: 0,
        admins: 0,
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            const users = await adminService.getAllUsers();

            const newStats = {
                total: users.length,
                alunos: users.filter((u) => u.tipo === "aluno").length,
                profissionais: users.filter((u) => u.tipo === "profissional").length,
                estabelecimentos: users.filter((u) => u.tipo === "estabelecimento").length,
                admins: users.filter((u) => u.tipo === "admin").length,
            };

            setStats(newStats);
        } catch (error) {
            console.error("Erro ao carregar estatísticas:", error);
            toast.error("Erro ao carregar dados do dashboard");
        } finally {
            setLoading(false);
        }
    };

    const calculatePercentage = (value) => {
        if (stats.total === 0) return 0;
        return Math.round((value / stats.total) * 100);
    };

    const StatCard = ({ title, value, icon, color, percentage }) => (
        <Paper
            elevation={0}
            sx={{
                p: 3,
                height: "100%",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                position: "relative",
                overflow: "hidden",
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 3,
            }}
        >
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", mb: 2 }}>
                <Box>
                    <Typography variant="body2" color="text.secondary" fontWeight={600}>
                        {title}
                    </Typography>
                    <Typography variant="h4" fontWeight={800} sx={{ my: 1 }}>
                        {value}
                    </Typography>
                </Box>
                <Box
                    sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: alpha(theme.palette[color]?.main || theme.palette.primary.main, 0.1),
                        color: `${color}.main`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    {icon}
                </Box>
            </Box>

            <Box>
                <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
                    <Typography variant="caption" color="text.secondary">
                        Do total de usuários
                    </Typography>
                    <Typography variant="caption" fontWeight={700} color={`${color}.main`}>
                        {percentage}%
                    </Typography>
                </Box>
                <LinearProgress
                    variant="determinate"
                    value={percentage}
                    color={color}
                    sx={{ height: 6, borderRadius: 3, bgcolor: isDark ? alpha(theme.palette.text.primary, 0.1) : alpha(theme.palette.text.primary, 0.05) }}
                />
            </Box>
        </Paper>
    );

    if (loading) {
        return (
            <Box sx={{ display: "flex", justifyContent: "center", alignItems: "center", height: 400 }}>
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h5" fontWeight={700} gutterBottom display="flex" alignItems="center" gap={1}>
                    <FaChartPie /> Visão Geral do Sistema
                </Typography>
                <Typography color="text.secondary">
                    Acompanhe as métricas de crescimento e distribuição de usuários.
                </Typography>
            </Box>

            {/* Cards de Resumo */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={6} md={3}>
                    <Paper
                        elevation={0}
                        sx={{
                            p: 3,
                            height: "100%",
                            border: '1px solid',
                            borderColor: 'divider',
                            borderRadius: 3,
                            position: 'relative',
                            overflow: 'hidden',
                        }}
                    >
                        <Box sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            height: 4,
                            bgcolor: 'primary.main',
                        }} />
                        <Typography variant="body2" color="text.secondary" fontWeight={600} sx={{ mb: 1 }}>
                            Total de Usuários
                        </Typography>
                        <Typography variant="h3" fontWeight={800} color="text.primary">
                            {stats.total}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                            Cadastrados na plataforma
                        </Typography>
                        <Box sx={{ mt: 2, display: "flex", justifyContent: "flex-end" }}>
                            <FaUsers size={40} style={{ opacity: 0.15 }} color={theme.palette.primary.main} />
                        </Box>
                    </Paper>
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Alunos"
                        value={stats.alunos}
                        icon={<FaUser size={20} />}
                        color="primary"
                        percentage={calculatePercentage(stats.alunos)}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Profissionais"
                        value={stats.profissionais}
                        icon={<FaUserTie size={20} />}
                        color="secondary"
                        percentage={calculatePercentage(stats.profissionais)}
                    />
                </Grid>

                <Grid item xs={12} sm={6} md={3}>
                    <StatCard
                        title="Estabelecimentos"
                        value={stats.estabelecimentos}
                        icon={<FaBuilding size={20} />}
                        color="warning"
                        percentage={calculatePercentage(stats.estabelecimentos)}
                    />
                </Grid>
            </Grid>

            {/* Seção de Análise Visual (Barras maiores) */}
            <Paper elevation={0} sx={{ p: 4, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Typography variant="h6" fontWeight={700} gutterBottom sx={{ mb: 3 }}>
                    Distribuição de Cadastros
                </Typography>

                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body1" fontWeight={600}>Estabelecimentos</Typography>
                        <Typography variant="body1" fontWeight={700} color="warning.main">{calculatePercentage(stats.estabelecimentos)}%</Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={calculatePercentage(stats.estabelecimentos)}
                        color="warning"
                        sx={{ height: 12, borderRadius: 6 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                        {stats.estabelecimentos} de {stats.total} cadastros
                    </Typography>
                </Box>

                <Box sx={{ mb: 3 }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body1" fontWeight={600}>Profissionais</Typography>
                        <Typography variant="body1" fontWeight={700} color="secondary.main">{calculatePercentage(stats.profissionais)}%</Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={calculatePercentage(stats.profissionais)}
                        color="secondary"
                        sx={{ height: 12, borderRadius: 6 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                        {stats.profissionais} de {stats.total} cadastros
                    </Typography>
                </Box>

                <Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
                        <Typography variant="body1" fontWeight={600}>Alunos</Typography>
                        <Typography variant="body1" fontWeight={700} color="primary.main">{calculatePercentage(stats.alunos)}%</Typography>
                    </Box>
                    <LinearProgress
                        variant="determinate"
                        value={calculatePercentage(stats.alunos)}
                        color="primary"
                        sx={{ height: 12, borderRadius: 6 }}
                    />
                    <Typography variant="caption" color="text.secondary">
                        {stats.alunos} de {stats.total} cadastros
                    </Typography>
                </Box>
            </Paper>
        </Box>
    );
};

export default DashboardTab;

import React, { useState, useEffect } from "react";
import {
    Box,
    Typography,
    Container,
    useTheme,
    alpha,
    Button,
} from "@mui/material";
import {
    FaUsers,
    FaStore,
    FaStar,
    FaChartLine,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { authService } from "../../services";
import { useNavigate } from "react-router-dom";

import UsuariosTab from "./Tabs/UsuariosTab";
import EstabelecimentosTab from "./Tabs/EstabelecimentosTab";
import AvaliacoesTab from "./Tabs/AvaliacoesTab";
import DashboardTab from "./Tabs/DashboardTab";

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`admin-tabpanel-${index}`}
            aria-labelledby={`admin-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ py: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

const Admin = () => {
    const navigate = useNavigate();
    const [tabValue, setTabValue] = useState(0);

    useEffect(() => {
        const userInfo = authService.getUserInfo();
        if (!userInfo || userInfo.role !== "ADMIN") {
            toast.error("Acesso negado! Apenas administradores podem acessar esta página.");
            navigate("/");
            return;
        }
    }, [navigate]);

    const theme = useTheme();

    const tabs = [
        { label: "Visão Geral", icon: <FaChartLine size={14} /> },
        { label: "Usuários", icon: <FaUsers size={14} /> },
        { label: "Estabelecimentos", icon: <FaStore size={14} /> },
        { label: "Avaliações", icon: <FaStar size={14} /> },
    ];

    return (
        <Container maxWidth="xl" sx={{ py: 6, px: { xs: 2, md: 3 } }}>
            {/* Header */}
            <Box sx={{ mb: 5 }}>
                <Typography variant="h4" fontWeight={900} sx={{
                    color: 'text.primary',
                    mb: 1,
                    letterSpacing: '-0.02em',
                }}>
                    Painel de Administração
                </Typography>
                <Typography variant="body1" color="text.secondary" fontWeight={500}>
                    Gerencie usuários, estabelecimentos e avaliações do sistema.
                </Typography>
            </Box>

            {/* Tabs estilizadas como no Perfil */}
            <Box sx={{ mb: 4, display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                {tabs.map((tab, index) => (
                    <Button
                        key={index}
                        onClick={() => setTabValue(index)}
                        startIcon={tab.icon}
                        sx={{
                            borderRadius: 10,
                            textTransform: 'none',
                            px: 3,
                            fontWeight: 700,
                            bgcolor: tabValue === index ? 'primary.main' : 'transparent',
                            color: tabValue === index ? 'white' : 'text.primary',
                            border: '1px solid',
                            borderColor: tabValue === index ? 'primary.main' : 'divider',
                            '&:hover': {
                                bgcolor: tabValue === index ? 'primary.main' : alpha(theme.palette.divider, 0.1),
                            }
                        }}
                    >
                        {tab.label}
                    </Button>
                ))}
            </Box>

            <TabPanel value={tabValue} index={0}>
                <DashboardTab />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
                <UsuariosTab />
            </TabPanel>
            <TabPanel value={tabValue} index={2}>
                <EstabelecimentosTab />
            </TabPanel>
            <TabPanel value={tabValue} index={3}>
                <AvaliacoesTab />
            </TabPanel>
        </Container>
    );
};

export default Admin;

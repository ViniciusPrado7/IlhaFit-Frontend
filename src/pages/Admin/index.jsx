import React, { useState, useEffect } from "react";
import {
    Box,
    Container,
    Tab,
    Tabs,
    Typography,
    Badge,
    useTheme,
    alpha,
} from "@mui/material";
import {
    FaChartPie,
    FaUsers,
    FaBuilding,
    FaFlag,
    FaTags,
    FaBell,
} from "react-icons/fa";
import DashboardTab from "./Tabs/DashboardTab";
import UsuariosTab from "./Tabs/UsuariosTab";
import EstabelecimentosTab from "./Tabs/EstabelecimentosTab";
import AvaliacoesTab from "./Tabs/AvaliacoesTab";
import CategoriasTab from "./Tabs/CategoriasTab";
import SolicitacoesCategoriasTab from "./Tabs/SolicitacoesCategoriasTab";
import { solicitacaoCategoriaService } from "../../services";

const TabPanel = ({ children, value, index }) => (
    <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
        {value === index && children}
    </Box>
);

const TABS = [
    { label: "Dashboard",        icon: FaChartPie  },
    { label: "Usuários",         icon: FaUsers     },
    { label: "Estabelecimentos", icon: FaBuilding  },
    { label: "Denúncias",        icon: FaFlag      },
    { label: "Categorias",       icon: FaTags      },
    { label: "Solicitações",     icon: FaBell      },
];

const AdminPanel = () => {
    const theme = useTheme();
    const [tab, setTab] = useState(0);
    const [pendingCount, setPendingCount] = useState(0);

    useEffect(() => {
        solicitacaoCategoriaService
            .getAll("PENDENTE")
            .then((data) => setPendingCount(data.length))
            .catch(() => {});
    }, []);

    return (
        <Container maxWidth="xl" sx={{ py: 4 }}>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h4" fontWeight={800}>
                    Painel Administrativo
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    Gerencie usuários, categorias e moderação da plataforma IlhaFit.
                </Typography>
            </Box>

            <Box
                sx={{
                    borderBottom: 1,
                    borderColor: "divider",
                    bgcolor: alpha(theme.palette.background.paper, 0.8),
                    borderRadius: "12px 12px 0 0",
                    px: 1,
                }}
            >
                <Tabs
                    value={tab}
                    onChange={(_, v) => setTab(v)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{ "& .MuiTab-root": { minHeight: 56, textTransform: "none", fontWeight: 600 } }}
                >
                    {TABS.map(({ label, icon: Icon }, i) => (
                        <Tab
                            key={label}
                            label={
                                i === 5 ? (
                                    <Badge badgeContent={pendingCount} color="error" max={99}>
                                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, pr: pendingCount > 0 ? 1.5 : 0 }}>
                                            <Icon size={16} />
                                            {label}
                                        </Box>
                                    </Badge>
                                ) : (
                                    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                        <Icon size={16} />
                                        {label}
                                    </Box>
                                )
                            }
                        />
                    ))}
                </Tabs>
            </Box>

            <Box
                sx={{
                    border: 1,
                    borderTop: 0,
                    borderColor: "divider",
                    borderRadius: "0 0 12px 12px",
                    p: 3,
                    bgcolor: "background.paper",
                }}
            >
                <TabPanel value={tab} index={0}><DashboardTab /></TabPanel>
                <TabPanel value={tab} index={1}><UsuariosTab /></TabPanel>
                <TabPanel value={tab} index={2}><EstabelecimentosTab /></TabPanel>
                <TabPanel value={tab} index={3}><AvaliacoesTab /></TabPanel>
                <TabPanel value={tab} index={4}><CategoriasTab /></TabPanel>
                <TabPanel value={tab} index={5}>
                    <SolicitacoesCategoriasTab onCountChange={setPendingCount} />
                </TabPanel>
            </Box>
        </Container>
    );
};

export default AdminPanel;

import {
    Card,
    CardContent,
    Typography,
    Box,
    Avatar,
    Chip,
    Button,
    useTheme,
} from "@mui/material";

import { FaStar, FaPhone, FaEnvelope, FaCalendarAlt } from "react-icons/fa";
import { useState } from "react";
import ModalProfissional from "../ModalProfissional";

const CardProfissional = ({ profissional, onVisualizar }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';
    const [modalOpen, setModalOpen] = useState(false);

    return (
        <Card
            onClick={() => onVisualizar(profissional)}
            sx={{
                width: "100%",
                maxWidth: 400,
                height: 530,
                display: "flex",
                flexDirection: "column",
                borderRadius: 3,
                boxShadow: theme.shadows[3],
                transition: "all 0.3s ease",
                border: "1px solid",
                borderColor: isDark ? "divider" : "#e0e0e0",
                overflow: "hidden",
                bgcolor: "background.paper",
                cursor: "pointer",
                "&:hover": {
                    boxShadow: theme.shadows[6],
                    transform: "translateY(-4px)",
                },
            }}
        >
            <Box
                sx={{
                height: 135,
                    background: isDark
                        ? `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.background.default} 100%)`
                        : "linear-gradient(135deg, #e0f2f1 0%, #b2dfdb 100%)",
                }}
            />

            <CardContent
                sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    flexGrow: 1,
                    pt: 0,
                    px: 4,
                    pb: 3,
                }}
            >
                <Avatar
                    src={profissional.Imagem}
                    alt={profissional.nome}
                    sx={{
                        width: 115,
                        height: 115,
                        border: "4px solid",
                        borderColor: "background.paper",
                        boxShadow: theme.shadows[3],
                        mt: -6,
                        mb: 2,
                    }}
                />

                <Typography
                    variant="h6"
                    fontWeight={700}
                    textAlign="center"
                    sx={{ mb: 0.5, color: "text.primary", fontSize: "1.6rem" }}
                >
                    {profissional.nome}
                </Typography>

                {/* Avaliação */}
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 0.5,
                        mb: 2,
                    }}
                >
                    <FaStar size={20} color="#FBBF24" />
                    <Typography
                        variant="body2"
                        sx={{ color: "#FBBF24", fontWeight: 600, fontSize: "1rem" }}
                    >
                        {profissional.avaliacao}
                    </Typography>
                </Box>

                {/* Especialidades */}
                <Box
                    sx={{
                        display: "flex",
                        gap: 1,
                        flexWrap: "wrap",
                        justifyContent: "center",
                        mb: 2,
                    }}
                >
                    {profissional.especialidades?.map((esp) => (
                        <Chip
                            key={esp}
                            label={esp}
                            size="medium"
                            sx={{
                                bgcolor: "primary.main",
                                color: "white",
                                fontWeight: 500,
                                fontSize: "0.9rem",
                            }}
                        />
                    ))}
                </Box>

                {/* Telefone */}
                {profissional.telefone && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                        }}
                    >
                        <FaPhone size={14} color={theme.palette.primary.main} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem" }}>{profissional.telefone}</Typography>
                    </Box>
                )}

                {/* Email */}
                {profissional.email && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 2.5,
                        }}
                    >
                        <FaEnvelope size={14} color={theme.palette.primary.main} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem" }}>
                            {profissional.email}
                        </Typography>
                    </Box>
                )}

                {/* Botão Visualizar */}
                <Button
                    variant="contained"
                    fullWidth
                    startIcon={<FaCalendarAlt />}
                    onClick={(e) => {
                        e.stopPropagation();
                        setModalOpen(true);
                    }}
                    sx={{
                        mt: "auto",
                        bgcolor: "primary.main",
                        color: "white",
                        textTransform: "none",
                        fontWeight: 600,
                        fontSize: "1rem",
                        py: 1.2,
                        borderRadius: 3,
                        "&:hover": {
                            bgcolor: theme.palette.custom.primaryHover,
                            boxShadow: `0 4px 12px ${isDark ? 'rgba(52, 211, 153, 0.3)' : 'rgba(16, 185, 129, 0.3)'}`,
                        },
                    }}
                >
                    Visualizar
                </Button>
            </CardContent>
            <ModalProfissional open={modalOpen} onClose={() => setModalOpen(false)} profissional={profissional} />
        </Card>
    );
};

export default CardProfissional;

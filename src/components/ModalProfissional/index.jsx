import React from "react";
import {
    Dialog,
    DialogContent,
    Box,
    Typography,
    IconButton,
    Avatar,
    Chip,
    Paper,
    Grid,
    useTheme,
    alpha,
} from "@mui/material";
import {
    FaArrowLeft,
    FaStar,
    FaPhone,
    FaEnvelope,
    FaWhatsapp,
} from "react-icons/fa";
import AvaliacoesPanel from "../AvaliacoesPanel";

const ModalProfissional = ({ open, onClose, profissional }) => {
    const theme = useTheme();

    if (!profissional) return null;

    const nome = profissional.nome;
    const foto = profissional.Imagem;
    const especialidades = profissional.especialidades || [];
    const telefone = profissional.telefone;
    const email = profissional.email;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            fullWidth
            maxWidth="md"
            PaperProps={{
                sx: {
                    borderRadius: 4,
                    overflow: "hidden",
                    bgcolor: "background.paper",
                },
            }}
        >
            {/* HEADER */}
            <Box
                sx={{
                    p: 4,
                    pb: 2,
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                }}
            >
                <Typography variant="h4" fontWeight={800}>
                    Detalhes do Profissional
                </Typography>

                <IconButton
                    onClick={onClose}
                    sx={{
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        border: `2px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                        "&:hover": {
                            bgcolor: alpha(theme.palette.primary.main, 0.18),
                        },
                        width: 46,
                        height: 46,
                    }}
                >
                    <FaArrowLeft size={20} color={theme.palette.primary.main} />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 4, scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" } }}>
                {/* PERFIL */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 3, mb: 4 }}>
                    <Avatar
                        src={foto}
                        sx={{
                            width: 110,
                            height: 110,
                            border: `4px solid ${theme.palette.primary.main}`,
                        }}
                    />

                    <Box sx={{ flex: 1 }}>
                        <Typography variant="h5" fontWeight={800}>
                            {nome}
                        </Typography>

                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                            <FaStar size={18} color="#FBBF24" />
                            <Typography fontWeight={700}>
                                {profissional.avaliacao ?? "—"}
                            </Typography>
                        </Box>
                    </Box>

                    {telefone && (
                        <IconButton
                            component="a"
                            href={`https://wa.me/55${telefone.replace(/\D/g, "")}`}
                            target="_blank"
                            rel="noreferrer"
                            sx={{
                                bgcolor: theme.palette.primary.main,
                                color: "white",
                                "&:hover": { bgcolor: theme.palette.primary.dark },
                                width: 48,
                                height: 48,
                            }}
                        >
                            <FaWhatsapp size={22} />
                        </IconButton>
                    )}
                </Box>

                {/* ESPECIALIDADES */}
                {especialidades.length > 0 && (
                    <Box sx={{ mb: 4 }}>
                        <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                            Especialidades
                        </Typography>
                        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                            {especialidades.map((esp, i) => (
                                <Chip
                                    key={i}
                                    label={esp}
                                    sx={{
                                        fontWeight: 700,
                                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                                        color: theme.palette.primary.main,
                                    }}
                                />
                            ))}
                        </Box>
                    </Box>
                )}

                {/* CONTATOS */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    {email && (
                        <Grid item xs={12} sm={6}>
                            <Paper
                                variant="outlined"
                                sx={{ p: 2, borderRadius: 3, display: "flex", alignItems: "center", gap: 2 }}
                            >
                                <FaEnvelope color={theme.palette.primary.main} />
                                <Box>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                                        Email
                                    </Typography>
                                    <Typography fontWeight={700}>{email}</Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    )}
                    {telefone && (
                        <Grid item xs={12} sm={6}>
                            <Paper
                                variant="outlined"
                                sx={{ p: 2, borderRadius: 3, display: "flex", alignItems: "center", gap: 2 }}
                            >
                                <FaPhone color={theme.palette.primary.main} />
                                <Box>
                                    <Typography variant="caption" fontWeight={700} color="text.secondary">
                                        Telefone
                                    </Typography>
                                    <Typography fontWeight={700}>{telefone}</Typography>
                                </Box>
                            </Paper>
                        </Grid>
                    )}
                </Grid>

                {/* AVALIAÇÕES — lista + criar + denunciar */}
                <Box>
                    <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
                        Avaliações
                    </Typography>
                    <AvaliacoesPanel targetType="profissional" targetId={profissional.id} />
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ModalProfissional;

import React, { useState } from "react";
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
    Button,
    TextField,
    useTheme,
    alpha,
} from "@mui/material";


import {
    FaArrowLeft,
    FaStar,
    FaPhone,
    FaEnvelope,
    FaWhatsapp,
    FaPaperPlane,
} from "react-icons/fa";

const ModalProfissional = ({ open, onClose, profissional }) => {
    const theme = useTheme();
    const [nota, setNota] = useState(5);
    const [comentario, setComentario] = useState("");

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

                {/* SETA */}
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
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                    }}
                >
                    <FaArrowLeft size={20} color={theme.palette.primary.main} />
                </IconButton>
            </Box>

            <DialogContent sx={{ p: 4, scrollbarWidth: 'none', '&::-webkit-scrollbar': { display: 'none' } }}>
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

                        {/* Avaliação */}
                        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 1 }}>
                            <FaStar size={18} color="#FBBF24" />
                            <Typography fontWeight={700}>
                                {profissional.avaliacao}
                            </Typography>
                        </Box>
                    </Box>

                    {/* WhatsApp */}
                    <IconButton
                        sx={{
                            bgcolor: theme.palette.primary.main,
                            color: "white",
                            "&:hover": { bgcolor: theme.palette.custom.primaryHover },
                            width: 48,
                            height: 48,
                        }}
                    >
                     
                        <FaWhatsapp size={22} />
                    </IconButton>
                </Box>

                {/* ESPECIALIDADES */}
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

                {/* CONTATOS */}
                <Grid container spacing={2} sx={{ mb: 4 }}>
                    <Grid item xs={12} sm={6}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <FaEnvelope color={theme.palette.primary.main} />
                            <Box>
                                <Typography
                                    variant="caption"
                                    fontWeight={700}
                                    color="text.secondary"
                                >
                                    Email
                                </Typography>
                                <Typography fontWeight={700}>{email}</Typography>
                            </Box>
                        </Paper>
                    </Grid>

                    <Grid item xs={12} sm={6}>
                        <Paper
                            variant="outlined"
                            sx={{
                                p: 2,
                                borderRadius: 3,
                                display: "flex",
                                alignItems: "center",
                                gap: 2,
                            }}
                        >
                            <FaPhone color={theme.palette.primary.main} />
                            <Box>
                                <Typography
                                    variant="caption"
                                    fontWeight={700}
                                    color="text.secondary"
                                >
                                    Telefone
                                </Typography>
                                <Typography fontWeight={700}>{telefone}</Typography>
                            </Box>
                        </Paper>
                    </Grid>
                </Grid>

                {/* MAPA — APENAS RESERVA VISUAL */}
                <Box sx={{ mb: 5 }}>
                    <Typography variant="h6" fontWeight={800} mb={2}>
                        Localização
                    </Typography>

                    <Box
                        sx={{
                            width: "100%",
                            height: 250,
                            borderRadius: 3,
                            border: "2px dashed #e5e7eb",
                            bgcolor: "#f8fafc",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#94a3b8",
                            fontWeight: 600,
                            fontSize: "1.1rem",
                        }}
                    >
                        Mapa em desenvolvimento
                    </Box>
                </Box>

                {/* AVALIAÇÃO */}
                <Box sx={{ mb: 4 }}>
                    <Typography variant="h6" fontWeight={800} mb={2}>
                        Avaliar profissional
                    </Typography>

                    <Paper sx={{ p: 3, borderRadius: 3 }} elevation={0}>
                        <Box sx={{ display: "flex", gap: 1, mb: 2 }}>
                            {[1, 2, 3, 4, 5].map((star) => (
                                <FaStar
                                    key={star}
                                    size={28}
                                    color={star <= nota ? "#FBBF24" : "#E5E7EB"}
                                    style={{ cursor: "pointer" }}
                                    onClick={() => setNota(star)}
                                />
                            ))}
                        </Box>

                        <TextField
                            fullWidth
                            multiline
                            rows={3}
                            placeholder="Escreva um comentário..."
                            value={comentario}
                            onChange={(e) => setComentario(e.target.value)}
                            sx={{ mb: 2 }}
                        />

                        <Button
                            fullWidth
                            variant="contained"
                            startIcon={<FaPaperPlane />}
                            sx={{
                                borderRadius: 3,
                                textTransform: "none",
                                fontSize: "1.1rem",
                                py: 1.2,
                            }}
                        >
                            Enviar avaliação
                        </Button>
                    </Paper>
                </Box>
            </DialogContent>
        </Dialog>
    );
};

export default ModalProfissional;
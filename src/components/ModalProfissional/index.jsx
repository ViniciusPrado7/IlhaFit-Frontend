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

const formatLabel = (value) => {
  if (!value) return "";

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const tagSx = {
  bgcolor: "rgba(16,185,129,0.10)",
  color: "primary.main",
  fontWeight: 800,
  borderRadius: 1.5,
};

const periodoTagSx = {
  bgcolor: "background.paper",
  color: "primary.main",
  border: "1px solid",
  borderColor: "rgba(16,185,129,0.35)",
  fontWeight: 800,
  borderRadius: 1.5,
};

const ModalProfissional = ({ open, onClose, profissional }) => {
  if (!profissional) return null;

  const categorias = getCategorias(profissional);

  const handleClose = (_, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown" || !reason) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "background.paper",
          width: "100%",
          maxWidth: 980,
        },
      }}
    >
      <DialogContent sx={{ p: 0 }} onClick={(e) => e.stopPropagation()}>
        <Paper
          elevation={0}
          sx={{
            overflow: "hidden",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ position: "relative", height: { xs: 230, md: 330 } }}>
            <Box
              component="img"
              src={getFoto(profissional)}
              alt={getNome(profissional)}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.62), rgba(0,0,0,0.08) 60%)",
              }}
            />
            <Button
              onClick={onClose}
              type="button"
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 2,
                bgcolor: "background.paper",
                color: "text.primary",
                "&:hover": { bgcolor: "background.paper" },
              }}
            >
              Fechar
            </Button>
          </Box>

          <Box sx={{ p: { xs: 2.5, md: 4 } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap", mb: 1 }}>
              <Box>
                <Typography variant="h4" fontWeight={900} sx={{ color: "text.primary", mb: 0.75 }}>
                  {getNome(profissional)}
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
                  WhatsApp
                </Button>
              )}
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
              ))}
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

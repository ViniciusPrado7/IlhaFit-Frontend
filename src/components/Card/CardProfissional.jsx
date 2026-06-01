import {
    Card,
    CardContent,
    Typography,
    Box,
    Avatar,
    Chip,
    Divider,
    useTheme,
} from "@mui/material";
import { FaStar, FaPhone, FaEnvelope, FaArrowRight, FaFemale, FaMapMarkerAlt } from "react-icons/fa";
import { useState } from "react";
import ModalProfissional from "../ModalProfissional";

const getFoto = (profissional) => profissional.fotoUrl || profissional.Imagem;

const formatTelefone = (value) => {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const getEspecialidades = (profissional) => {
    if (Array.isArray(profissional.especialidades) && profissional.especialidades.length > 0) {
        return profissional.especialidades;
    }

    if (Array.isArray(profissional.gradeAtividades) && profissional.gradeAtividades.length > 0) {
        return [...new Set(profissional.gradeAtividades.map((item) => item.categoriaNome).filter(Boolean))];
    }

    if (profissional.especializacao) {
        return [profissional.especializacao];
    }

    return [];
};

const isExclusivoMulheres = (profissional) => {
    if (profissional.exclusivoMulheres) return true;
    if (Array.isArray(profissional.gradeAtividades)) {
        return profissional.gradeAtividades.some((item) => item.exclusivoMulheres);
    }
    return false;
};

const getRegiao = (profissional) => profissional.regiao || profissional.zona || "";

const CardProfissional = ({ profissional, onVisualizar }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const [modalOpen, setModalOpen] = useState(false);
    const especialidades = getEspecialidades(profissional);
    const visibleEspecialidades = especialidades.slice(0, 3);
    const hiddenEspecialidadesCount = Math.max(especialidades.length - visibleEspecialidades.length, 0);
    const exclusivoMulheres = isExclusivoMulheres(profissional);
    const regiao = getRegiao(profissional);
    const abrirModal = () => {
        onVisualizar?.(profissional);
        setModalOpen(true);
    };

    return (
        <Card
            onClick={() => {
                if (!modalOpen) {
                    abrirModal();
                }
            }}
            sx={{
                width: "100%",
                maxWidth: 400,
                height: 560,
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
                    position: "relative",
                }}
            >
                {exclusivoMulheres && (
                    <Chip
                        icon={<FaFemale size={12} />}
                        label="Exclusivo para mulheres"
                        size="small"
                        sx={{
                            position: "absolute",
                            top: 12,
                            left: 12,
                            bgcolor: "rgba(16, 185, 129, 0.12)",
                            color: theme.palette.primary.main,
                            fontWeight: 700,
                            fontSize: "0.75rem",
                            borderRadius: 1.5,
                            border: "1px solid rgba(16, 185, 129, 0.25)",
                            "& .MuiChip-icon": { color: theme.palette.primary.main },
                        }}
                    />
                )}
            </Box>

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
                    src={getFoto(profissional)}
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

                <Box
                    sx={{
                        display: "flex",
                        gap: 1,
                        flexWrap: "wrap",
                        justifyContent: "center",
                        mb: 2,
                    }}
                >
                    {visibleEspecialidades.map((esp) => (
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
                    {hiddenEspecialidadesCount > 0 && (
                        <Chip
                            label={`+${hiddenEspecialidadesCount}`}
                            size="medium"
                            sx={{
                                bgcolor: "rgba(16, 185, 129, 0.10)",
                                color: "primary.main",
                                fontWeight: 700,
                                fontSize: "0.9rem",
                            }}
                        />
                    )}
                </Box>

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
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem" }}>
                            {formatTelefone(profissional.telefone)}
                        </Typography>
                    </Box>
                )}

                {profissional.email && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                        }}
                    >
                        <FaEnvelope size={14} color={theme.palette.primary.main} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem" }}>
                            {profissional.email}
                        </Typography>
                    </Box>
                )}

                {regiao && (
                    <Box
                        sx={{
                            display: "flex",
                            alignItems: "center",
                            gap: 1,
                            mb: 1,
                        }}
                    >
                        <FaMapMarkerAlt size={14} color={theme.palette.primary.main} />
                        <Typography variant="body2" color="text.secondary" sx={{ fontSize: "1rem" }}>
                            {regiao}
                        </Typography>
                    </Box>
                )}

                <Divider sx={{ mt: "auto", mb: 1.5, width: "100%" }} />
                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "flex-end",
                        width: "100%",
                        gap: 0.75,
                        color: "primary.main",
                        fontSize: 14,
                        fontWeight: 800,
                    }}
                >
                    Ver detalhes
                    <FaArrowRight size={13} />
                </Box>
            </CardContent>
            <ModalProfissional open={modalOpen} onClose={() => setModalOpen(false)} profissional={profissional} />
        </Card>
    );
};

export default CardProfissional;

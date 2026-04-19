import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { FaMapMarkerAlt, FaStar, FaWhatsapp } from "react-icons/fa";
import { estabelecimentoService } from "../../service/EstabelecimentoService";

const fallbackImage = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=80";

const getFoto = (estabelecimento) => {
  if (Array.isArray(estabelecimento?.fotosUrl) && estabelecimento.fotosUrl.length > 0) {
    return estabelecimento.fotosUrl[0];
  }

  return fallbackImage;
};

const getNome = (estabelecimento) => estabelecimento?.nomeFantasia || estabelecimento?.nome || "Estabelecimento";

const getEndereco = (estabelecimento) => {
  const endereco = estabelecimento?.endereco;
  if (!endereco) return "Endereco nao informado";

  return [
    endereco.rua,
    endereco.numero,
    endereco.bairro,
    endereco.cidade,
    endereco.estado,
  ].filter(Boolean).join(", ");
};

const getCategorias = (estabelecimento) => {
  if (Array.isArray(estabelecimento?.gradeAtividades) && estabelecimento.gradeAtividades.length > 0) {
    return [...new Set(estabelecimento.gradeAtividades.map((item) => item.atividade).filter(Boolean))];
  }

  return ["Estabelecimento"];
};

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

const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  if (data && typeof data === "object") return Object.values(data).filter(Boolean).join(" ");
  return "Nao foi possivel carregar o estabelecimento.";
};

export const ModalEstabelecimentoContent = ({ estabelecimento, onClose, closeLabel = "Voltar" }) => {
  const categorias = getCategorias(estabelecimento);

  return (
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
            src={getFoto(estabelecimento)}
            alt={getNome(estabelecimento)}
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
            sx={{
              position: "absolute",
              top: 16,
              right: 16,
              bgcolor: "background.paper",
              color: "text.primary",
              "&:hover": { bgcolor: "background.paper" },
            }}
          >
            {closeLabel}
          </Button>
        </Box>

        <Box sx={{ p: { xs: 2.5, md: 4 } }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap", mb: 1 }}>
            <Box>
              <Typography variant="h4" fontWeight={900} sx={{ color: "text.primary", mb: 0.75 }}>
                {getNome(estabelecimento)}
              </Typography>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
                <FaStar color="#FBBF24" />
                <Typography variant="body2" fontWeight={800}>
                  {estabelecimento.avaliacao ?? 0} avaliacao
                </Typography>
              </Box>
            </Box>
            {estabelecimento.telefone && (
              <Button
                variant="contained"
                startIcon={<FaWhatsapp />}
                href={`https://wa.me/55${estabelecimento.telefone}`}
                target="_blank"
                rel="noreferrer"
                sx={{ borderRadius: 2, alignSelf: "flex-start", fontWeight: 800 }}
              >
                WhatsApp
              </Button>
            )}
          </Box>

          <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", my: 2.5 }}>
            {categorias.map((categoria) => (
              <Chip
                key={categoria}
                label={categoria}
                size="small"
                sx={tagSx}
              />
            ))}
          </Box>

          <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
            Sobre
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
            {estabelecimento.nome} oferece atividades de {categorias.join(", ")} para a comunidade IlhaFit.
          </Typography>

          <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
            Localizacao
          </Typography>
          <Box sx={{ display: "flex", gap: 1, color: "text.secondary", mb: 2 }}>
            <FaMapMarkerAlt color="#EF4444" />
            <Typography variant="body2">{getEndereco(estabelecimento)}</Typography>
          </Box>
          <Box
            sx={{
              height: 190,
              borderRadius: 2,
              bgcolor: "action.hover",
              border: "1px solid",
              borderColor: "divider",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "text.secondary",
              mb: 3,
            }}
          >
            <Typography variant="body2" fontWeight={700}>
              Mapa integrado aqui
            </Typography>
          </Box>

          <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
            Atividades oferecidas
          </Typography>
          <Box sx={{ display: "grid", gap: 1.5, mb: 3 }}>
            {estabelecimento.gradeAtividades?.map((grade, index) => (
              <Box
                key={`${grade.atividade}-${index}`}
                sx={{
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  p: 2.25,
                  display: "grid",
                  gap: 2,
                }}
              >
                <Typography variant="subtitle1" fontWeight={900} color="text.primary">
                  {grade.atividade}
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                    gap: 2,
                  }}
                >
                  <Box>
                    <Typography variant="caption" fontWeight={900} color="text.secondary" sx={{ display: "block", mb: 1 }}>
                      Dias oferecidos
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {grade.diasSemana?.map((dia) => (
                        <Chip key={dia} label={formatLabel(dia)} size="small" sx={tagSx} />
                      ))}
                    </Box>
                  </Box>

                  <Box>
                    <Typography variant="caption" fontWeight={900} color="text.secondary" sx={{ display: "block", mb: 1 }}>
                      Periodos oferecidos
                    </Typography>
                    <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                      {grade.periodos?.map((periodo) => (
                        <Chip key={periodo} label={formatLabel(periodo)} size="small" sx={periodoTagSx} />
                      ))}
                    </Box>
                  </Box>
                </Box>
              </Box>
            ))}
          </Box>

          <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
            Avaliacoes
          </Typography>
          <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2, textAlign: "center", color: "text.secondary" }}>
            Faca login para deixar uma avaliacao
          </Box>
        </Box>
      </Paper>
  );
};

const ModalEstabelecimento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [estabelecimento, setEstabelecimento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const carregar = async () => {
      try {
        const response = await estabelecimentoService.buscarEstabelecimentoPorId(id);
        if (mounted) {
          setEstabelecimento(response.data);
          setError("");
        }
      } catch (err) {
        if (mounted) setError(getErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    carregar();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={<Button onClick={() => navigate("/estabelecimento")}>Voltar</Button>}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 980, mx: "auto", pb: 6 }}>
      <ModalEstabelecimentoContent
        estabelecimento={estabelecimento}
        onClose={() => navigate("/estabelecimento")}
      />
    </Box>
  );
};

export default ModalEstabelecimento;

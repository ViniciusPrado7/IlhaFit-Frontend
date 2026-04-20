import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  InputAdornment,
  MenuItem,
  Paper,
  Slider,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaChartLine,
  FaFilter,
  FaMagic,
  FaMapMarkerAlt,
  FaSearch,
} from "react-icons/fa";
import CardEstabelecimento from "../../components/Card/CardEstabelecimento";
import { ModalEstabelecimentoContent } from "../../components/ModalEstabelecimento";
import { estabelecimentoService } from "../../service/EstabelecimentoService";

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (typeof data === "string") return data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return Object.values(data).filter(Boolean).join(" ");
  }

  return error?.message || "Nao foi possivel carregar os estabelecimentos.";
};

const getRecencyValue = (estabelecimento, index) => {
  const dateFields = ["createdAt", "criadoEm", "dataCriacao", "dtCriacao", "updatedAt"];

  for (const field of dateFields) {
    const time = Date.parse(estabelecimento?.[field]);
    if (!Number.isNaN(time)) return time;
  }

  const numericId = Number(estabelecimento?.id);
  if (Number.isFinite(numericId)) return numericId;

  return -index;
};

const withSimulatedRating = (estabelecimento, index) => ({
  ...estabelecimento,
  avaliacao: estabelecimento.avaliacao ?? (4.9 - (index % 3) * 0.1).toFixed(1),
});

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === "dark";
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [distance, setDistance] = useState(10);
  const [selectedEstabelecimento, setSelectedEstabelecimento] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const carregarEstabelecimentos = async () => {
      try {
        const response = await estabelecimentoService.listarEstabelecimentos();

        if (isMounted) {
          setEstabelecimentos(normalizeList(response.data));
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarEstabelecimentos();

    return () => {
      isMounted = false;
    };
  }, []);

  const featuredEstabelecimentos = useMemo(
    () =>
      estabelecimentos
        .map((item, index) => ({ item, index }))
        .sort((a, b) => getRecencyValue(b.item, b.index) - getRecencyValue(a.item, a.index))
        .slice(0, 9)
        .map(({ item }, index) => withSimulatedRating(item, index)),
    [estabelecimentos]
  );

  const goToEstabelecimentos = () => {
    navigate("/estabelecimento");
  };

  return (
    <Box
      sx={{
        width: "100vw",
        ml: "calc(50% - 50vw)",
        mr: "calc(50% - 50vw)",
        mt: -4,
      }}
    >
      <Box
        sx={{
          minHeight: { xs: "auto", md: 680 },
          pt: { xs: 3, md: 8 },
          pb: { xs: 8, md: 11 },
          background: isDark
            ? `linear-gradient(135deg, ${alpha(theme.palette.primary.dark, 0.22)} 0%, ${theme.palette.background.default} 48%, ${alpha("#0891B2", 0.16)} 100%)`
            : `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.14)} 0%, ${theme.palette.background.default} 48%, ${alpha("#06B6D4", 0.16)} 100%)`,
        }}
      >
        <Box
          sx={{
            maxWidth: "1680px",
            mx: "auto",
            px: { xs: 2, sm: 3, md: 4, xl: 8 },
            textAlign: "center",
          }}
        >
          <Box
            sx={{
              display: "inline-flex",
              alignItems: "center",
              gap: 1,
              px: 2.25,
              py: 1,
              borderRadius: 2,
              bgcolor: alpha(theme.palette.primary.main, isDark ? 0.16 : 0.12),
              color: "primary.main",
              fontWeight: 900,
              fontSize: 13,
              mb: { xs: 4, md: 5 },
              boxShadow: isDark ? 0 : `0 12px 28px ${alpha(theme.palette.primary.main, 0.12)}`,
            }}
          >
            <FaChartLine size={12} />
            Mais de 80 locais disponiveis
          </Box>

          <Typography
            component="h1"
            sx={{
              maxWidth: 920,
              mx: "auto",
              color: "text.primary",
              fontSize: { xs: 42, sm: 54, md: 68 },
              lineHeight: 1.05,
              fontWeight: 950,
              letterSpacing: 0,
              mb: 3,
            }}
          >
            Transforme sua{" "}
            <Box
              component="span"
              sx={{
                background: `linear-gradient(90deg, ${theme.palette.primary.main}, #0891B2)`,
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              saude hoje
            </Box>
          </Typography>

          <Typography
            sx={{
              maxWidth: 760,
              mx: "auto",
              color: "text.secondary",
              fontSize: { xs: 17, md: 20 },
              lineHeight: 1.7,
              mb: { xs: 5, md: 7 },
            }}
          >
            Encontre estabelecimentos, aulas e instrutores perfeitos para seus objetivos. Seu bem-estar esta a um clique de distancia.
          </Typography>

          <Paper
            component="form"
            elevation={0}
            onSubmit={(event) => {
              event.preventDefault();
              goToEstabelecimentos();
            }}
            sx={{
              maxWidth: 860,
              mx: "auto",
              p: { xs: 2.25, sm: 3.5 },
              borderRadius: 2,
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, isDark ? 0.24 : 0.18),
              bgcolor: alpha(theme.palette.background.paper, isDark ? 0.72 : 0.78),
              backdropFilter: "blur(10px)",
            }}
          >
            <TextField
              fullWidth
              placeholder="Buscar por nome, tipo ou localizacao..."
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <FaSearch size={18} color={theme.palette.text.secondary} />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />

            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" },
                gap: 1.5,
                mb: 2.5,
              }}
            >
              <TextField
                select
                defaultValue="Todas"
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaFilter size={14} color={theme.palette.primary.main} />
                    </InputAdornment>
                  ),
                }}
              >
                {["Todas", "Academia", "Crossfit", "Natacao", "Pilates"].map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>

              <Button
                type="button"
                variant="outlined"
                startIcon={<FaMapMarkerAlt />}
                onClick={goToEstabelecimentos}
                sx={{ py: 1.55, borderRadius: 2, fontWeight: 900 }}
              >
                Ver no Mapa
              </Button>

              <Button
                type="submit"
                variant="contained"
                startIcon={<FaMagic />}
                sx={{
                  py: 1.55,
                  borderRadius: 2,
                  fontWeight: 900,
                  background: `linear-gradient(90deg, ${theme.palette.primary.main}, #06B6D4)`,
                  boxShadow: `0 14px 28px ${alpha(theme.palette.primary.main, 0.24)}`,
                }}
              >
                Busca com IA
              </Button>
            </Box>

            <Box
              sx={{
                p: { xs: 2, sm: 2.5 },
                borderRadius: 2,
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, isDark ? 0.22 : 0.16),
                bgcolor: alpha(theme.palette.primary.main, isDark ? 0.09 : 0.06),
                textAlign: "left",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, mb: 1 }}>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 2,
                      bgcolor: alpha(theme.palette.primary.main, 0.12),
                      display: "grid",
                      placeItems: "center",
                      color: "primary.main",
                    }}
                  >
                    <FaMapMarkerAlt size={13} />
                  </Box>
                  <Typography variant="body2" fontWeight={900}>
                    Distancia maxima
                  </Typography>
                </Box>
                <Box
                  sx={{
                    px: 1.5,
                    py: 0.5,
                    borderRadius: 1.5,
                    bgcolor: "primary.main",
                    color: "primary.contrastText",
                    fontSize: 12,
                    fontWeight: 900,
                  }}
                >
                  {distance} km
                </Box>
              </Box>

              <Slider
                min={1}
                max={50}
                value={distance}
                onChange={(_, value) => setDistance(value)}
                sx={{
                  color: "primary.main",
                  "& .MuiSlider-thumb": {
                    width: 20,
                    height: 20,
                    border: "3px solid",
                    borderColor: "background.paper",
                  },
                  "& .MuiSlider-rail": {
                    bgcolor: isDark ? alpha("#FFFFFF", 0.35) : alpha("#111827", 0.45),
                  },
                }}
              />

              <Box sx={{ display: "flex", justifyContent: "space-between", color: "text.secondary" }}>
                <Typography variant="caption" fontWeight={700}>
                  1 km
                </Typography>
                <Typography variant="caption" fontWeight={700}>
                  50 km
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Box
        sx={{
          py: { xs: 7, md: 9 },
          bgcolor: alpha(theme.palette.primary.main, isDark ? 0.04 : 0.06),
        }}
      >
        <Box
          sx={{
            maxWidth: "1680px",
            mx: "auto",
            px: { xs: 2, sm: 3, md: 4, xl: 8 },
          }}
        >
          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "flex-start", sm: "flex-end" },
              justifyContent: "space-between",
              gap: 3,
              mb: 4,
              flexDirection: { xs: "column", sm: "row" },
            }}
          >
            <Box>
              <Typography variant="h4" component="h2" fontWeight={950} sx={{ mb: 1, color: "text.primary" }}>
                Melhores Avaliados
              </Typography>
              <Typography color="text.secondary">
                Locais com as melhores notas da comunidade
              </Typography>
            </Box>

            <Button
              endIcon={<FaArrowRight />}
              onClick={goToEstabelecimentos}
              sx={{ fontWeight: 900, color: "primary.main" }}
            >
              Ver mais
            </Button>
          </Box>

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress />
            </Box>
          )}

          {!loading && error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          {!loading && !error && featuredEstabelecimentos.length === 0 && (
            <Alert severity="info">
              Nenhum estabelecimento encontrado.
            </Alert>
          )}

          {!loading && !error && featuredEstabelecimentos.length > 0 && (
            <Box
              sx={{
                display: "grid",
                gap: 4,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, 1fr)",
                  lg: "repeat(3, minmax(0, 1fr))",
                },
              }}
            >
              {featuredEstabelecimentos.map((item) => (
                <CardEstabelecimento
                  key={item.id || item.cnpj || item.email}
                  estabelecimento={item}
                  onClick={() => setSelectedEstabelecimento(item)}
                />
              ))}
            </Box>
          )}
        </Box>
      </Box>

      <Dialog
        open={Boolean(selectedEstabelecimento)}
        onClose={() => setSelectedEstabelecimento(null)}
        fullWidth
        maxWidth="md"
        scroll="body"
        slotProps={{
          backdrop: {
            sx: {
              bgcolor: "rgba(2, 6, 23, 0.72)",
              backdropFilter: "blur(2px)",
            },
          },
          paper: {
            sx: {
              borderRadius: 2,
              bgcolor: "transparent",
              boxShadow: "none",
              overflow: "visible",
            },
          },
        }}
      >
        {selectedEstabelecimento && (
          <ModalEstabelecimentoContent
            estabelecimento={selectedEstabelecimento}
            onClose={() => setSelectedEstabelecimento(null)}
            closeLabel="Fechar"
          />
        )}
      </Dialog>
    </Box>
  );
};

export default Home;

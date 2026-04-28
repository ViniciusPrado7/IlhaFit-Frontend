import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  Divider,
  InputAdornment,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaArrowRight,
  FaBolt,
  FaDumbbell,
  FaLayerGroup,
  FaMapMarkerAlt,
  FaRegCompass,
  FaSearch,
  FaUserFriends,
} from "react-icons/fa";
import CardEstabelecimento from "../../components/Card/CardEstabelecimento";
import CardProfissional from "../../components/Card/CardProfissional";
import { ModalEstabelecimentoContent } from "../../components/ModalEstabelecimento";
import { categoriaService } from "../../service/CategoriaService";
import { estabelecimentoService } from "../../service/EstabelecimentoService";
import { profissionalService } from "../../service/ProfissionalService";

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getErrorMessage = (error, fallback) => {
  const data = error?.response?.data;

  if (typeof data === "string") return data;
  if (data && typeof data === "object" && !Array.isArray(data)) {
    return Object.values(data).filter(Boolean).join(" ");
  }

  return error?.message || fallback;
};

const getRecencyValue = (item, index) => {
  const dateFields = ["createdAt", "criadoEm", "dataCriacao", "dtCriacao", "updatedAt"];

  for (const field of dateFields) {
    const time = Date.parse(item?.[field]);
    if (!Number.isNaN(time)) return time;
  }

  const numericId = Number(item?.id);
  if (Number.isFinite(numericId)) return numericId;

  return -index;
};

const getCategoriaNome = (categoria) => {
  if (typeof categoria === "string") return categoria;
  return categoria?.nome || categoria?.nomeCategoria || categoria?.atividade || categoria?.name || "";
};

const getEstabelecimentoCategorias = (estabelecimento) => {
  if (Array.isArray(estabelecimento?.gradeAtividades) && estabelecimento.gradeAtividades.length > 0) {
    return [...new Set(estabelecimento.gradeAtividades.map((item) => item?.atividade).filter(Boolean))];
  }

  return [];
};

const getProfissionalCategorias = (profissional) => {
  if (Array.isArray(profissional?.especialidades) && profissional.especialidades.length > 0) {
    return profissional.especialidades.filter(Boolean);
  }

  if (Array.isArray(profissional?.gradeAtividades) && profissional.gradeAtividades.length > 0) {
    return [...new Set(profissional.gradeAtividades.map((item) => item?.atividade).filter(Boolean))];
  }

  if (profissional?.especializacao) return [profissional.especializacao];

  return [];
};

const matchesCategoria = (categorias, selectedCategoria) => {
  if (!selectedCategoria || selectedCategoria === "Todas") return true;
  return categorias.some((categoria) => categoria?.toLowerCase() === selectedCategoria.toLowerCase());
};

const normalizeText = (value) => String(value || "").toLowerCase();

const estabelecimentoMatchesSearch = (estabelecimento, searchTerm) => {
  if (!searchTerm) return true;

  const endereco = estabelecimento?.endereco || {};
  const categorias = getEstabelecimentoCategorias(estabelecimento).join(" ");
  const haystack = [
    estabelecimento?.nomeFantasia,
    estabelecimento?.razaoSocial,
    estabelecimento?.email,
    estabelecimento?.telefone,
    endereco?.bairro,
    endereco?.cidade,
    endereco?.rua,
    categorias,
  ]
    .filter(Boolean)
    .join(" ");

  return normalizeText(haystack).includes(normalizeText(searchTerm));
};

const profissionalMatchesSearch = (profissional, searchTerm) => {
  if (!searchTerm) return true;

  const categorias = getProfissionalCategorias(profissional).join(" ");
  const haystack = [
    profissional?.nome,
    profissional?.email,
    profissional?.telefone,
    profissional?.regiao,
    profissional?.especializacao,
    categorias,
  ]
    .filter(Boolean)
    .join(" ");

  return normalizeText(haystack).includes(normalizeText(searchTerm));
};

const withSimulatedRating = (item, index, base = 4.9) => ({
  ...item,
  avaliacao: item?.avaliacao ?? Number((base - (index % 4) * 0.1).toFixed(1)),
});

const infoCards = [
  {
    icon: <FaDumbbell size={18} />,
    title: "Estabelecimentos",
    description: "Academias, studios e espaços esportivos com opções para diferentes perfis e objetivos.",
  },
  {
    icon: <FaUserFriends size={18} />,
    title: "Profissionais",
    description: "Profissionais do meio fitness e da saúde para orientar sua evolução com mais segurança.",
  },
  {
    icon: <FaRegCompass size={18} />,
    title: "Bem-estar",
    description: "Uma jornada mais clara para encontrar o cuidado certo para corpo, saúde e performance.",
  },
];

const Home = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === "dark";
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [profissionais, setProfissionais] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedEstabelecimento, setSelectedEstabelecimento] = useState(null);

  useEffect(() => {
    let isMounted = true;

    const carregarHome = async () => {
      try {
        const [estabelecimentosResponse, profissionaisResponse, categoriasResponse] = await Promise.all([
          estabelecimentoService.listarEstabelecimentos(),
          profissionalService.listarProfissionais(),
          categoriaService.listarCategorias(),
        ]);

        if (!isMounted) return;

        setEstabelecimentos(normalizeList(estabelecimentosResponse.data));
        setProfissionais(normalizeList(profissionaisResponse.data));
        setCategorias(normalizeList(categoriasResponse.data));
        setError("");
      } catch (err) {
        if (!isMounted) return;
        setError(getErrorMessage(err, "Não foi possível carregar a home no momento."));
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarHome();

    return () => {
      isMounted = false;
    };
  }, []);

  const categoryOptions = useMemo(() => {
    const names = categorias.map(getCategoriaNome).filter(Boolean);
    return ["Todas", ...new Set(names)];
  }, [categorias]);

  const featuredEstabelecimentos = useMemo(
    () =>
      estabelecimentos
        .filter((item) => matchesCategoria(getEstabelecimentoCategorias(item), selectedCategoria))
        .filter((item) => estabelecimentoMatchesSearch(item, searchTerm))
        .map((item, index) => ({ item, index }))
        .sort((a, b) => getRecencyValue(b.item, b.index) - getRecencyValue(a.item, a.index))
        .slice(0, 6)
        .map(({ item }, index) => withSimulatedRating(item, index, 4.9)),
    [estabelecimentos, searchTerm, selectedCategoria]
  );

  const featuredProfissionais = useMemo(
    () =>
      profissionais
        .filter((item) => matchesCategoria(getProfissionalCategorias(item), selectedCategoria))
        .filter((item) => profissionalMatchesSearch(item, searchTerm))
        .map((item, index) => ({ item, index }))
        .sort((a, b) => getRecencyValue(b.item, b.index) - getRecencyValue(a.item, a.index))
        .slice(0, 6)
        .map(({ item }, index) => withSimulatedRating(item, index, 5)),
    [profissionais, searchTerm, selectedCategoria]
  );

  return (
    <Box
      sx={{
        width: "100vw",
        ml: "calc(50% - 50vw)",
        mr: "calc(50% - 50vw)",
        mt: -4,
        overflow: "hidden",
      }}
    >
      <Box
        sx={{
          position: "relative",
          pt: { xs: 4, md: 7 },
          pb: { xs: 7, md: 10 },
          background: isDark
            ? `radial-gradient(circle at top left, ${alpha(theme.palette.primary.main, 0.24)} 0%, transparent 32%), linear-gradient(135deg, ${theme.palette.background.default} 0%, ${alpha("#0F172A", 0.94)} 45%, ${alpha("#022C22", 0.9)} 100%)`
            : `radial-gradient(circle at top left, ${alpha(theme.palette.primary.main, 0.2)} 0%, transparent 32%), linear-gradient(135deg, #F0FDF4 0%, #ECFEFF 50%, #F8FAFC 100%)`,
          "&::before": {
            content: '""',
            position: "absolute",
            inset: 0,
            backgroundImage: `linear-gradient(${alpha(theme.palette.primary.main, 0.12)} 1px, transparent 1px), linear-gradient(90deg, ${alpha(theme.palette.primary.main, 0.12)} 1px, transparent 1px)`,
            backgroundSize: { xs: "48px 48px", md: "72px 72px" },
            maskImage: "linear-gradient(to bottom, rgba(0,0,0,0.75), transparent)",
            pointerEvents: "none",
          },
          "@keyframes heroFloat": {
            "0%": { transform: "translate3d(0, 0, 0)" },
            "50%": { transform: "translate3d(0, -14px, 0)" },
            "100%": { transform: "translate3d(0, 0, 0)" },
          },
          "@keyframes heroPulse": {
            "0%": { opacity: 0.5, transform: "scale(0.98)" },
            "50%": { opacity: 1, transform: "scale(1.03)" },
            "100%": { opacity: 0.5, transform: "scale(0.98)" },
          },
        }}
      >
        <Box
          sx={{
            position: "relative",
            zIndex: 1,
            maxWidth: "1680px",
            mx: "auto",
            px: { xs: 2, sm: 3, md: 4, xl: 8 },
          }}
        >
          <Box
            sx={{
              display: "grid",
              gap: { xs: 4, lg: 5 },
              alignItems: "center",
              gridTemplateColumns: { xs: "1fr", lg: "minmax(0, 1.1fr) minmax(420px, 0.9fr)" },
            }}
          >
            <Box sx={{ maxWidth: 760 }}>
              <Chip
                icon={<FaBolt size={14} />}
                label="Nova experiência IlhaFit"
                sx={{
                  mb: 3,
                  px: 1,
                  py: 2.2,
                  borderRadius: 99,
                  fontWeight: 900,
                  bgcolor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.12),
                  color: "primary.main",
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
                }}
              />

              <Typography
                component="h1"
                sx={{
                  color: "text.primary",
                  fontSize: { xs: 42, sm: 56, md: 70 },
                  lineHeight: 1,
                  fontWeight: 950,
                  letterSpacing: -1.4,
                  mb: 2.5,
                }}
              >
                Onde sua rotina fitness encontra o{" "}
                <Box
                  component="span"
                  sx={{
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, #06B6D4)`,
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  próximo nível
                </Box>
              </Typography>

              <Typography
                sx={{
                  maxWidth: 680,
                  color: "text.secondary",
                  fontSize: { xs: 17, md: 20 },
                  lineHeight: 1.7,
                  mb: 4.5,
                }}
              >
                Explore categorias reais do sistema, descubra estabelecimentos bem avaliados e encontre profissionais alinhados ao seu objetivo com mais clareza.
              </Typography>

              <Box
                sx={{
                  display: "flex",
                  gap: 1.5,
                  flexWrap: "wrap",
                  mb: 4,
                }}
              >
                <Button
                  variant="contained"
                  endIcon={<FaArrowRight />}
                  onClick={() => navigate("/estabelecimento")}
                  sx={{
                    px: 3.2,
                    py: 1.45,
                    borderRadius: 99,
                    fontWeight: 900,
                    background: `linear-gradient(90deg, ${theme.palette.primary.main}, #06B6D4)`,
                    boxShadow: `0 16px 30px ${alpha(theme.palette.primary.main, 0.26)}`,
                  }}
                >
                  Explorar estabelecimentos
                </Button>

                <Button
                  variant="outlined"
                  startIcon={<FaUserFriends />}
                  onClick={() => navigate("/profissional")}
                  sx={{
                    px: 3.2,
                    py: 1.45,
                    borderRadius: 99,
                    fontWeight: 900,
                    borderColor: alpha(theme.palette.primary.main, 0.3),
                    bgcolor: alpha(theme.palette.background.paper, isDark ? 0.4 : 0.62),
                  }}
                >
                  Conhecer profissionais
                </Button>
              </Box>
            </Box>

            <Box
              sx={{
                position: "relative",
                minHeight: { xs: 360, md: 560 },
                display: "grid",
                placeItems: "center",
              }}
            >
              <Box
                sx={{
                  position: "absolute",
                  width: { xs: 220, md: 320 },
                  height: { xs: 220, md: 320 },
                  borderRadius: "50%",
                  background: `radial-gradient(circle, ${alpha(theme.palette.primary.main, 0.28)} 0%, transparent 68%)`,
                  filter: "blur(10px)",
                  top: { xs: 12, md: 36 },
                  right: { xs: 20, md: 60 },
                  animation: "heroPulse 8s ease-in-out infinite",
                }}
              />

              <Paper
                elevation={0}
                sx={{
                  position: "relative",
                  zIndex: 2,
                  width: "100%",
                  maxWidth: 520,
                  p: { xs: 2.4, md: 3 },
                  borderRadius: 4,
                  border: "1px solid",
                  borderColor: alpha(theme.palette.primary.main, 0.22),
                  bgcolor: alpha(theme.palette.background.paper, isDark ? 0.56 : 0.74),
                  backdropFilter: "blur(18px)",
                  overflow: "hidden",
                  boxShadow: `0 28px 70px ${alpha("#020617", isDark ? 0.42 : 0.12)}`,
                }}
              >
                <Box
                  sx={{
                    position: "absolute",
                    inset: 0,
                    background: `linear-gradient(135deg, ${alpha(theme.palette.primary.main, 0.1)}, transparent 55%)`,
                    pointerEvents: "none",
                  }}
                />

                <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 900, letterSpacing: 1.1 }}>
                  CURADORIA FITNESS
                </Typography>

                <Typography variant="h4" fontWeight={950} sx={{ mt: 1, mb: 1.5, color: "text.primary" }}>
                  Uma curadoria pensada para facilitar sua escolha
                </Typography>

                <Typography color="text.secondary" sx={{ lineHeight: 1.7, mb: 3 }}>
                  Reunimos estabelecimentos e profissionais para que você encontre, em um só lugar, opções voltadas ao treino, à saúde e ao bem-estar com uma experiência mais clara e atual.
                </Typography>

                <Box
                  sx={{
                    display: "grid",
                    gap: 1.5,
                    mb: 3,
                  }}
                >
                  {infoCards.map((card, index) => (
                    <Box
                      key={card.title}
                      sx={{
                        display: "flex",
                        gap: 1.5,
                        alignItems: "flex-start",
                        p: 1.75,
                        borderRadius: 3,
                        border: "1px solid",
                        borderColor: alpha(theme.palette.primary.main, 0.14),
                        bgcolor: alpha(theme.palette.background.default, isDark ? 0.44 : 0.82),
                        transform: { md: index === 1 ? "translateX(12px)" : "none" },
                        animation: "heroFloat 7s ease-in-out infinite",
                        animationDelay: `${index * 0.8}s`,
                      }}
                    >
                      <Box
                        sx={{
                          width: 42,
                          height: 42,
                          borderRadius: 2.5,
                          display: "grid",
                          placeItems: "center",
                          color: "primary.main",
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          flexShrink: 0,
                        }}
                      >
                        {card.icon}
                      </Box>
                      <Box>
                        <Typography fontWeight={900} sx={{ color: "text.primary", mb: 0.4 }}>
                          {card.title}
                        </Typography>
                        <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.6 }}>
                          {card.description}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>

                <Box
                  sx={{
                    p: 2,
                    borderRadius: 3,
                    border: "1px solid",
                    borderColor: alpha(theme.palette.primary.main, 0.16),
                    bgcolor: alpha(theme.palette.primary.main, isDark ? 0.1 : 0.08),
                  }}
                >
                  <Typography variant="body2" fontWeight={900} sx={{ color: "text.primary", mb: 0.5 }}>
                    Encontre com mais facilidade
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                    Pesquise por nome, categoria, especialidade ou região e navegue com mais rapidez entre as melhores opções da plataforma.
                  </Typography>
                </Box>
              </Paper>
            </Box>
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          py: { xs: 6, md: 7 },
          background: isDark
            ? `linear-gradient(180deg, ${alpha(theme.palette.background.default, 0.96)} 0%, ${alpha(theme.palette.primary.main, 0.05)} 100%)`
            : `linear-gradient(180deg, #ffffff 0%, ${alpha(theme.palette.primary.main, 0.06)} 100%)`,
        }}
      >
        <Box
          sx={{
            maxWidth: "1680px",
            mx: "auto",
            px: { xs: 2, sm: 3, md: 4, xl: 8 },
          }}
        >
          <Paper
            elevation={0}
            sx={{
              p: { xs: 2.25, md: 3 },
              borderRadius: 4,
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, 0.14),
              bgcolor: alpha(theme.palette.background.paper, isDark ? 0.72 : 0.96),
              boxShadow: `0 20px 50px ${alpha("#020617", isDark ? 0.32 : 0.06)}`,
            }}
          >
            <Box
              sx={{
                display: "grid",
                gap: { xs: 2, md: 2.5 },
                alignItems: "center",
                gridTemplateColumns: { xs: "1fr", xl: "minmax(320px, 0.9fr) minmax(0, 1.1fr)" },
              }}
            >
              <Box>
                <Typography variant="h5" fontWeight={950} sx={{ color: "text.primary", mb: 0.6 }}>
                  Busque do seu jeito
                </Typography>
                <Typography color="text.secondary" sx={{ lineHeight: 1.7 }}>
                  Digite o que procura e combine com a categoria para filtrar estabelecimentos e profissionais de forma mais precisa.
                </Typography>
              </Box>

              <Box
                sx={{
                  display: "grid",
                  gap: 1.5,
                }}
              >
                <Box
                  sx={{
                    display: "grid",
                    gap: 1.5,
                    gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 220px auto" },
                    alignItems: "stretch",
                  }}
                >
                  <TextField
                    fullWidth
                    label="Buscar"
                    placeholder="Ex.: academia, pilates, nutricionista, centro..."
                    value={searchTerm}
                    onChange={(event) => setSearchTerm(event.target.value)}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaSearch size={15} color={theme.palette.text.secondary} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.background.default, isDark ? 0.2 : 0.55),
                      },
                    }}
                  />

                  <TextField
                    select
                    fullWidth
                    label="Categoria"
                    value={selectedCategoria}
                    onChange={(event) => setSelectedCategoria(event.target.value)}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 3,
                        bgcolor: alpha(theme.palette.background.default, isDark ? 0.2 : 0.55),
                      },
                    }}
                  >
                    {categoryOptions.map((option) => (
                      <MenuItem key={option} value={option}>
                        {option}
                      </MenuItem>
                    ))}
                  </TextField>

                  <Button
                    variant="outlined"
                    startIcon={<FaMapMarkerAlt />}
                    onClick={() => navigate("/estabelecimento")}
                    sx={{
                      py: 1.8,
                      px: 2.6,
                      borderRadius: 3,
                      fontWeight: 900,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Ver locais
                  </Button>
                </Box>

                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1.5,
                  }}
                >
                  <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
                    {searchTerm
                      ? `Exibindo resultados para "${searchTerm}"${selectedCategoria !== "Todas" ? ` em ${selectedCategoria}` : ""}.`
                      : selectedCategoria !== "Todas"
                        ? `Filtrando resultados da categoria ${selectedCategoria}.`
                        : "Use a busca para encontrar estabelecimentos e profissionais com mais rapidez."}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Paper>
        </Box>
      </Box>

      <Box
        sx={{
          py: { xs: 7, md: 9 },
          bgcolor: alpha(theme.palette.primary.main, isDark ? 0.035 : 0.05),
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
              alignItems: { xs: "flex-start", md: "flex-end" },
              justifyContent: "space-between",
              gap: 3,
              mb: 4,
              flexDirection: { xs: "column", md: "row" },
            }}
          >
            <Box>
              <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 900, letterSpacing: 1.1 }}>
                ESTABELECIMENTOS
              </Typography>
              <Typography variant="h4" component="h2" fontWeight={950} sx={{ color: "text.primary", mb: 1 }}>
                Melhores avaliados
              </Typography>
              <Typography color="text.secondary">
                {selectedCategoria === "Todas"
                  ? "Selecionamos estabelecimentos com forte potencial para a sua próxima escolha."
                  : `Selecionamos os resultados mais aderentes para a categoria ${selectedCategoria}.`}
              </Typography>
            </Box>

            <Button
              endIcon={<FaArrowRight />}
              onClick={() => navigate("/estabelecimento")}
              sx={{ fontWeight: 900, color: "primary.main" }}
            >
              Ver todos os estabelecimentos
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
            <Alert severity="info">Nenhum estabelecimento encontrado para esse filtro.</Alert>
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

          <Box sx={{ my: { xs: 6, md: 7 } }}>
            <Divider
              sx={{
                borderColor: alpha(theme.palette.primary.main, 0.16),
                "&::before, &::after": {
                  borderColor: alpha(theme.palette.primary.main, 0.16),
                },
              }}
            >
              <Chip
                icon={<FaLayerGroup size={13} />}
                label="Profissionais"
                sx={{
                  px: 0.8,
                  fontWeight: 900,
                  bgcolor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.12),
                  color: "primary.main",
                }}
              />
            </Divider>
          </Box>

          <Box
            sx={{
              display: "flex",
              alignItems: { xs: "flex-start", md: "flex-end" },
              justifyContent: "space-between",
              gap: 3,
              mb: 4,
              flexDirection: { xs: "column", md: "row" },
            }}
            >
              <Box>
                <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 900, letterSpacing: 1.1 }}>
                  PROFISSIONAIS
                </Typography>
                <Typography variant="h4" component="h2" fontWeight={950} sx={{ color: "text.primary", mb: 1 }}>
                  Melhores avaliados
                </Typography>
                <Typography color="text.secondary">
                  Especialistas para acompanhamento, performance e constância na sua rotina.
                </Typography>
              </Box>

            <Button
              endIcon={<FaArrowRight />}
              onClick={() => navigate("/profissional")}
              sx={{ fontWeight: 900, color: "primary.main" }}
            >
              Ver todos os profissionais
            </Button>
          </Box>

          {!loading && !error && featuredProfissionais.length === 0 && (
            <Alert severity="info">Nenhum profissional encontrado para esse filtro.</Alert>
          )}

          {!loading && !error && featuredProfissionais.length > 0 && (
            <Box
              sx={{
                display: "grid",
                gap: 4,
                gridTemplateColumns: {
                  xs: "1fr",
                  sm: "repeat(2, minmax(0, 1fr))",
                  lg: "repeat(3, minmax(0, 1fr))",
                },
                "& > *": {
                  justifySelf: "stretch",
                },
                "& .MuiCard-root": {
                  maxWidth: "none",
                  height: "100%",
                },
              }}
            >
              {featuredProfissionais.map((item) => (
                <CardProfissional key={item.id || item.email || item.nome} profissional={item} />
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

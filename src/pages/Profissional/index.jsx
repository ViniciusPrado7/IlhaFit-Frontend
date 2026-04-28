import { Alert, Box, CircularProgress, InputAdornment, MenuItem, Paper, TextField, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { FaSearch } from "react-icons/fa";
import CardProfissional from "../../components/Card/CardProfissional";
import { categoriaService } from "../../service/CategoriaService";
import { profissionalService } from "../../service/ProfissionalService";

const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  if (data && typeof data === "object") return Object.values(data).filter(Boolean).join(" ");
  return error?.message || "Não foi possível carregar os profissionais.";
};

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const getCategoriaNome = (categoria) => {
  if (typeof categoria === "string") return categoria;
  return categoria?.nome || categoria?.nomeCategoria || categoria?.atividade || categoria?.name || "";
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

const normalizeText = (value) => String(value || "").toLowerCase();

const matchesCategoria = (categorias, selectedCategoria) => {
  if (!selectedCategoria || selectedCategoria === "Todas") return true;
  return categorias.some((categoria) => categoria?.toLowerCase() === selectedCategoria.toLowerCase());
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

const Profissional = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [profissionais, setProfissionais] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const carregarProfissionais = async () => {
      try {
        const [profissionaisResponse, categoriasResponse] = await Promise.all([
          profissionalService.listarProfissionais(),
          categoriaService.listarCategorias(),
        ]);
        if (mounted) {
          setProfissionais(normalizeList(profissionaisResponse.data));
          setCategorias(normalizeList(categoriasResponse.data));
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    carregarProfissionais();

    return () => {
      mounted = false;
    };
  }, []);

  const categoryOptions = useMemo(() => {
    const names = categorias.map(getCategoriaNome).filter(Boolean);
    return ["Todas", ...new Set(names)];
  }, [categorias]);

  const filteredProfissionais = useMemo(
    () =>
      profissionais.filter((item) => {
        const categoriasItem = getProfissionalCategorias(item);
        return matchesCategoria(categoriasItem, selectedCategoria) && profissionalMatchesSearch(item, searchTerm);
      }),
    [profissionais, searchTerm, selectedCategoria]
  );

  return (
    <Box>
      <Box sx={{ mb: 3 }}>
        <Paper
          elevation={0}
          sx={{
            p: { xs: 2, md: 2.5 },
            borderRadius: 4,
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, 0.14),
            bgcolor: alpha(theme.palette.background.paper, isDark ? 0.72 : 0.96),
            boxShadow: `0 18px 45px ${alpha("#020617", isDark ? 0.18 : 0.05)}`,
          }}
        >
          <Box sx={{ mb: 1.75 }}>
            <Typography variant="subtitle1" fontWeight={900} sx={{ color: "text.primary", mb: 0.4 }}>
              Busque profissionais
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
              Pesquise por nome, categoria, especialidade ou região para encontrar o profissional ideal com mais rapidez.
            </Typography>
          </Box>

          <Box
            sx={{
              display: "grid",
              gap: 1.5,
              gridTemplateColumns: { xs: "1fr", md: "minmax(0, 1fr) 220px" },
            }}
          >
            <TextField
              fullWidth
              label="Buscar profissional"
              placeholder="Ex.: personal, fisioterapeuta, pilates, norte..."
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
          </Box>
        </Paper>
      </Box>

      <Box sx={{ mb: 3.5 }}>
        <Box>
          <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 900, letterSpacing: 1.1 }}>
            EXPLORAR PROFISSIONAIS
          </Typography>
          <Typography variant="h4" fontWeight={900} sx={{ color: "text.primary", mb: 0.6 }}>
            Profissionais
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
            {searchTerm
              ? `Mostrando resultados para "${searchTerm}"${selectedCategoria !== "Todas" ? ` na categoria ${selectedCategoria}` : ""}.`
              : selectedCategoria !== "Todas"
                ? `Exibindo profissionais da categoria ${selectedCategoria}.`
                : "Encontre especialistas por nome, categoria, especialidade ou região em uma listagem mais clara e organizada."}
          </Typography>
        </Box>
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

      {!loading && !error && filteredProfissionais.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Nenhum profissional encontrado.
        </Alert>
      )}

      {!loading && !error && filteredProfissionais.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gap: 4,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              md: "repeat(3, 1fr)",
              lg: "repeat(4, 1fr)",
            },
          }}
        >
          {filteredProfissionais.map((item) => (
            <CardProfissional key={item.id} profissional={item} />
          ))}
        </Box>
      )}
    </Box>
  );
};

export default Profissional;

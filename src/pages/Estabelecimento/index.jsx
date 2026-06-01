import { Alert, Box, CircularProgress, Dialog, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import CardEstabelecimento from "../../components/Card/CardEstabelecimento";
import CategoriaSelectField from "../../components/CategoriaSelectField";
import { ModalEstabelecimentoContent } from "../../components/ModalEstabelecimento";
import { avaliacaoService } from "../../service/AvaliacaoService";
import { estabelecimentoService } from "../../service/EstabelecimentoService";
import { enriquecerListaEstabelecimentosComAvaliacoes } from "../../utils/avaliacao";

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (typeof data === "string") {
    return data;
  }

  if (data && typeof data === "object" && !Array.isArray(data)) {
    return Object.values(data).filter(Boolean).join(" ");
  }

  return error?.message || "Não foi possível carregar os estabelecimentos.";
};

const normalizeList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

const getEstabelecimentoCategorias = (estabelecimento) => {
  if (Array.isArray(estabelecimento?.gradeAtividades) && estabelecimento.gradeAtividades.length > 0) {
    return [...new Set(estabelecimento.gradeAtividades.map((item) => item?.categoriaNome).filter(Boolean))];
  }

  return [];
};

const normalizeText = (value) => String(value || "").toLowerCase();

const matchesCategoria = (categorias, selectedCategoria) => {
  if (!selectedCategoria || selectedCategoria === "Todas") return true;
  return categorias.some((categoria) => categoria?.toLowerCase() === selectedCategoria.toLowerCase());
};

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

const Estabelecimento = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [selectedCategoria, setSelectedCategoria] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstabelecimento, setSelectedEstabelecimento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const carregarEstabelecimentos = async () => {
      try {
        const estabelecimentosResponse = await estabelecimentoService.listarEstabelecimentos();
        const estabelecimentosNormalizados = normalizeList(estabelecimentosResponse.data);
        const estabelecimentosComMedia = await enriquecerListaEstabelecimentosComAvaliacoes(
          estabelecimentosNormalizados,
          avaliacaoService.listarPorEstabelecimento
        );

        if (isMounted) {
          setEstabelecimentos(estabelecimentosComMedia);
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

  const filteredEstabelecimentos = useMemo(
    () =>
      estabelecimentos.filter((item) => {
        const categoriasItem = getEstabelecimentoCategorias(item);
        return matchesCategoria(categoriasItem, selectedCategoria) && estabelecimentoMatchesSearch(item, searchTerm);
      }),
    [estabelecimentos, searchTerm, selectedCategoria]
  );

  const handleEstabelecimentoChange = (updatedEstabelecimento) => {
    setEstabelecimentos((current) =>
      current.map((item) => (item.id === updatedEstabelecimento.id ? { ...item, ...updatedEstabelecimento } : item))
    );
    setSelectedEstabelecimento(updatedEstabelecimento);
  };

  return (
    <Box>
      <Box
        sx={{
          mb: 3,
        }}
      >
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
              Busque estabelecimentos
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
              Pesquise por nome, categoria ou região para encontrar o espaço ideal com mais rapidez.
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
              label="Buscar estabelecimento"
              placeholder="Ex.: academia, centro, musculação, bairro..."
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

            <CategoriaSelectField
              label="Categoria"
              value={selectedCategoria}
              onChange={(cat) => setSelectedCategoria(cat?.nome ?? "Todas")}
              allOptionLabel="Todas"
              sx={{
                "& .MuiOutlinedInput-root": {
                  borderRadius: 3,
                  bgcolor: alpha(theme.palette.background.default, isDark ? 0.2 : 0.55),
                },
              }}
            />
          </Box>
        </Paper>
      </Box>

      <Box
        sx={{
          mb: 3.5,
        }}
      >
        <Box>
          <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 900, letterSpacing: 1.1 }}>
            EXPLORAR ESTABELECIMENTOS
          </Typography>
          <Typography variant="h4" fontWeight={900} sx={{ color: "text.primary", mb: 0.6 }}>
            Estabelecimentos
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary", lineHeight: 1.7 }}>
            {searchTerm
              ? `Mostrando resultados para "${searchTerm}"${selectedCategoria !== "Todas" ? ` na categoria ${selectedCategoria}` : ""}.`
              : selectedCategoria !== "Todas"
                ? `Exibindo estabelecimentos da categoria ${selectedCategoria}.`
                : "Encontre espaços por nome, categoria ou localização em uma listagem mais clara e organizada."}
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

      {!loading && !error && filteredEstabelecimentos.length === 0 && (
        <Alert severity="info">
          Nenhum estabelecimento encontrado.
        </Alert>
      )}

      {!loading && !error && filteredEstabelecimentos.length > 0 && (
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
          {filteredEstabelecimentos.map((item) => (
            <CardEstabelecimento
              key={item.id || item.cnpj || item.email}
              estabelecimento={item}
              onClick={() => setSelectedEstabelecimento(item)}
            />
          ))}
        </Box>
      )}

      <Dialog
        open={Boolean(selectedEstabelecimento)}
        onClose={() => setSelectedEstabelecimento(null)}
        fullWidth
        maxWidth="md"
        scroll="body"
        disableRestoreFocus
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
            onEstabelecimentoChange={handleEstabelecimentoChange}
          />
        )}
      </Dialog>
    </Box>
  );
};

export default Estabelecimento;

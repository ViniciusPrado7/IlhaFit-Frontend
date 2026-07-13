import { Alert, Box, Button, CircularProgress, Dialog, InputAdornment, Paper, TextField, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useEffect, useMemo, useState } from "react";
import { FaMapMarkerAlt, FaSearch } from "react-icons/fa";
import CardEstabelecimento from "../../components/Card/EstablishmentCard";
import CategoriaSelectField from "../../components/CategoriaSelectField";
import { ModalEstabelecimentoContent } from "../../components/EstablishmentModal";
import { useCatalog } from "../../contexts/CatalogContext";
import { toTitleCase } from "../../utils/titleCase";

const PAGE_SIZE = 15;

const byRating = (a, b) => {
  const diff = (b.item.avaliacao ?? 0) - (a.item.avaliacao ?? 0);
  if (diff !== 0) return diff;
  return (b.item.totalAvaliacoes ?? 0) - (a.item.totalAvaliacoes ?? 0);
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
  const {
    estabelecimentos,
    loadingEstabelecimentos: loading,
    errorEstabelecimentos: error,
    ensureEstabelecimentos,
    updateEstabelecimento,
  } = useCatalog();
  const [selectedCategoria, setSelectedCategoria] = useState("Todas");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEstabelecimento, setSelectedEstabelecimento] = useState(null);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

  useEffect(() => {
    ensureEstabelecimentos();
  }, [ensureEstabelecimentos]);

  const filteredEstabelecimentos = useMemo(
    () =>
      estabelecimentos
        .filter((item) => {
          const categoriasItem = getEstabelecimentoCategorias(item);
          return matchesCategoria(categoriasItem, selectedCategoria) && estabelecimentoMatchesSearch(item, searchTerm);
        })
        .map((item) => ({ item }))
        .sort(byRating)
        .map(({ item }) => item),
    [estabelecimentos, searchTerm, selectedCategoria]
  );

  const handleEstabelecimentoChange = (updatedEstabelecimento) => {
    updateEstabelecimento(updatedEstabelecimento);
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
              onChange={(event) => {
                setSearchTerm(event.target.value);
                setVisibleCount(PAGE_SIZE);
              }}
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
              onChange={(cat) => {
                setSelectedCategoria(cat?.nome ?? "Todas");
                setVisibleCount(PAGE_SIZE);
              }}
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
              ? `Mostrando resultados para "${searchTerm}"${selectedCategoria !== "Todas" ? ` na categoria ${toTitleCase(selectedCategoria)}` : ""}.`
              : selectedCategoria !== "Todas"
                ? `Exibindo estabelecimentos da categoria ${toTitleCase(selectedCategoria)}.`
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
        <>
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
            {filteredEstabelecimentos.slice(0, visibleCount).map((item) => (
              <CardEstabelecimento
                key={item.id || item.cnpj || item.email}
                estabelecimento={item}
                onClick={() => setSelectedEstabelecimento(item)}
              />
            ))}
          </Box>

          {filteredEstabelecimentos.length > visibleCount && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, mt: 4 }}>
              <Typography variant="body2" color="text.secondary">
                Mostrando {Math.min(visibleCount, filteredEstabelecimentos.length)} de {filteredEstabelecimentos.length} estabelecimentos
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setVisibleCount((prev) => prev + PAGE_SIZE)}
                sx={{ borderRadius: 3, px: 4, py: 1.1, fontWeight: 800 }}
              >
                Ver mais
              </Button>
            </Box>
          )}
        </>
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

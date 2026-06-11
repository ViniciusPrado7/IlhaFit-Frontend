import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { FaSearch, FaTimes } from "react-icons/fa";
import { categoriaService } from "../../service/CategoryService";

const PAGE_SIZE = 10;
const VIEW_MORE_VALUE = "__view_more_categories__";

const normalizeCategoriaNome = (categoria) => categoria?.nome?.trim() || "";

const mergeCategorias = (current, incoming) => {
  const names = new Set(current.map((item) => item.nome));
  const next = [...current];

  incoming.forEach((item) => {
    if (!item.nome || names.has(item.nome)) return;
    names.add(item.nome);
    next.push(item);
  });

  return next;
};

const mapResponse = (response) => {
  const data = response?.data || {};
  const content = Array.isArray(data.content)
    ? data.content.map((item) => ({ id: item.id ?? item.nome, nome: normalizeCategoriaNome(item) })).filter((item) => item.nome)
    : [];

  return {
    content,
    page: data.page ?? 0,
    totalPages: data.totalPages ?? 0,
    totalElements: data.totalElements ?? content.length,
    last: Boolean(data.last),
  };
};

const CategoriaSelectField = ({
  label,
  value,
  onChange,
  allOptionLabel = "",
  disabled = false,
  error = false,
  helperText = "",
  sx,
}) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectOptions, setSelectOptions] = useState([]);
  const [modalOptions, setModalOptions] = useState([]);
  const [modalPage, setModalPage] = useState(0);
  const [modalLastPage, setModalLastPage] = useState(false);
  const [selectLoading, setSelectLoading] = useState(true);
  const [modalLoading, setModalLoading] = useState(false);
  const [loadError, setLoadError] = useState("");

  const hasMoreCategorias = useMemo(
    () => modalOptions.length > PAGE_SIZE || (!modalLastPage && modalOptions.length >= PAGE_SIZE),
    [modalLastPage, modalOptions.length]
  );
  const shouldShowSelectedOutsideFirstPage =
    value && value !== allOptionLabel && !selectOptions.some((item) => item.nome === value);

  const fetchPage = async ({ page, search, append }) => {
    const response = await categoriaService.listarCategoriasPaginadas(page, PAGE_SIZE, search);
    const mapped = mapResponse(response);

    setModalPage(mapped.page);
    setModalLastPage(mapped.last);
    setModalOptions((prev) => (append ? mergeCategorias(prev, mapped.content) : mapped.content));

    if (!search && page === 0) {
      setSelectOptions(mapped.content.slice(0, PAGE_SIZE));
    }

    return mapped;
  };

  useEffect(() => {
    let active = true;

    const loadInitial = async () => {
      try {
        setSelectLoading(true);
        setLoadError("");
        const mapped = await fetchPage({ page: 0, search: "", append: false });
        if (!active) return;
        setSelectOptions(mapped.content.slice(0, PAGE_SIZE));
      } catch (error) {
        if (!active) return;
        setLoadError(error?.response?.data?.erro || "Não foi possível carregar as categorias.");
        setSelectOptions([]);
        setModalOptions([]);
      } finally {
        if (active) setSelectLoading(false);
      }
    };

    loadInitial();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!modalOpen) {
      setSearchTerm("");
      return;
    }

    let active = true;

    const loadModal = async () => {
      try {
        setModalLoading(true);
        setLoadError("");
        await fetchPage({ page: 0, search: searchTerm, append: false });
      } catch (error) {
        if (!active) return;
        setLoadError(error?.response?.data?.erro || "Não foi possível carregar as categorias.");
        setModalOptions([]);
      } finally {
        if (active) setModalLoading(false);
      }
    };

    loadModal();

    return () => {
      active = false;
    };
  }, [modalOpen, searchTerm]);

  const handleSelectChange = (event) => {
    const nextValue = event.target.value;

    if (nextValue === VIEW_MORE_VALUE) {
      setModalOpen(true);
      return;
    }

    onChange(nextValue);
  };

  const handleSelectFromModal = (categoria) => {
    onChange(categoria);
    setModalOpen(false);
  };

  const handleLoadMore = async () => {
    try {
      setModalLoading(true);
      setLoadError("");
      await fetchPage({ page: modalPage + 1, search: searchTerm, append: true });
    } catch (error) {
      setLoadError(error?.response?.data?.erro || "Não foi possível carregar mais categorias.");
    } finally {
      setModalLoading(false);
    }
  };

  return (
    <>
      <FormControl fullWidth disabled={disabled || selectLoading} error={error} sx={sx}>
        <InputLabel>{label}</InputLabel>
        <Select value={value} label={label} onChange={handleSelectChange}>
          {allOptionLabel ? <MenuItem value={allOptionLabel}>{allOptionLabel}</MenuItem> : null}

          {shouldShowSelectedOutsideFirstPage ? <MenuItem value={value}>{value}</MenuItem> : null}

          {selectOptions.map((item) => (
            <MenuItem key={item.id || item.nome} value={item.nome}>
              {item.nome}
            </MenuItem>
          ))}

          {hasMoreCategorias ? (
            <MenuItem value={VIEW_MORE_VALUE} sx={{ fontWeight: 700, color: "primary.main" }}>
              Ver mais categorias
            </MenuItem>
          ) : null}
        </Select>
        {helperText || loadError ? (
          <Typography variant="caption" color={error || loadError ? "error" : "text.secondary"} sx={{ mt: 0.75, ml: 1.75 }}>
            {loadError || helperText}
          </Typography>
        ) : null}
      </FormControl>

      <Dialog open={modalOpen} onClose={() => setModalOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          Todas as categorias
          <IconButton onClick={() => setModalOpen(false)} aria-label="Fechar categorias" size="small">
            <FaTimes size={14} />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <TextField
            fullWidth
            autoFocus
            placeholder="Buscar categoria..."
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            sx={{ mb: 2 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaSearch size={14} />
                </InputAdornment>
              ),
            }}
          />

          {modalLoading && !modalOptions.length ? (
            <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
              <CircularProgress size={28} />
            </Box>
          ) : null}

          {!modalLoading || modalOptions.length ? (
            modalOptions.length ? (
              <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                {modalOptions.map((item) => (
                  <Button
                    key={item.id || item.nome}
                    type="button"
                    variant={item.nome === value ? "contained" : "outlined"}
                    onClick={() => handleSelectFromModal(item.nome)}
                    sx={{ justifyContent: "flex-start", textTransform: "none", borderRadius: 2, py: 1.25 }}
                  >
                    {item.nome}
                  </Button>
                ))}
              </Box>
            ) : (
              <Typography color="text.secondary">Nenhuma categoria encontrada.</Typography>
            )
          ) : null}

          {!modalLastPage && modalOptions.length ? (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <Button type="button" variant="text" disabled={modalLoading} onClick={handleLoadMore}>
                {modalLoading ? "Carregando..." : "Ver mais"}
              </Button>
            </Box>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default CategoriaSelectField;

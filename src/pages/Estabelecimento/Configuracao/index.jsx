import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEdit, FaImage, FaPlus, FaSave, FaTimes, FaTrash } from "react-icons/fa";
import { authSession } from "../../../service/AuthSession";
import { categoriaService } from "../../../service/CategoriaService";
import { estabelecimentoService } from "../../../service/EstabelecimentoService";

const DIAS_SEMANA = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO", "DOMINGO"];
const PERIODOS = ["MANHA", "TARDE", "NOITE"];
const NOVA_CATEGORIA_VALUE = "__nova_categoria__";
const MAX_FOTOS = 6;

const formInicial = {
  nome: "",
  nomeFantasia: "",
  email: "",
  telefone: "",
  cnpj: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
};

const gradeInicial = { atividade: "", diasSemana: [], periodos: [] };

const onlyDigits = (value = "") => value.replace(/\D/g, "");

const formatTelefone = (value = "") => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatCnpj = (value = "") => {
  const digits = onlyDigits(value).slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

const formatCep = (value = "") => {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.replace(/^(\d{5})(\d)/, "$1-$2");
};

const getCategoriaNome = (categoria) => {
  if (typeof categoria === "string") return categoria;
  return categoria?.nome || categoria?.nomeCategoria || categoria?.atividade || categoria?.name || "";
};

const getApiError = (error) => {
  const data = error?.response?.data;

  if (data && typeof data === "object" && !Array.isArray(data)) {
    const { erro, ...fieldErrors } = data;
    return { fieldErrors, generalError: erro || Object.values(fieldErrors).filter(Boolean).join(" ") };
  }

  return {
    fieldErrors: {},
    generalError: typeof data === "string" ? data : error?.message || "Não foi possível concluir a operação.",
  };
};

const normalizeForm = (estabelecimento) => ({
  nome: estabelecimento?.nome || "",
  nomeFantasia: estabelecimento?.nomeFantasia || "",
  email: estabelecimento?.email || "",
  telefone: onlyDigits(estabelecimento?.telefone || ""),
  cnpj: onlyDigits(estabelecimento?.cnpj || ""),
  rua: estabelecimento?.endereco?.rua || "",
  numero: estabelecimento?.endereco?.numero || "",
  complemento: estabelecimento?.endereco?.complemento || "",
  bairro: estabelecimento?.endereco?.bairro || "",
  cidade: estabelecimento?.endereco?.cidade || "",
  estado: (estabelecimento?.endereco?.estado || "").toUpperCase().slice(0, 2),
  cep: onlyDigits(estabelecimento?.endereco?.cep || ""),
});

const normalizeGrade = (gradeAtividades) => {
  if (!Array.isArray(gradeAtividades) || gradeAtividades.length === 0) return [gradeInicial];

  return gradeAtividades.map((item) => ({
    atividade: item.atividade || "",
    diasSemana: Array.isArray(item.diasSemana) ? item.diasSemana : [],
    periodos: Array.isArray(item.periodos) ? item.periodos : [],
  }));
};

const label = (text) => (
  <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.75, color: "text.secondary" }}>
    {text}
  </Typography>
);

const ConfiguracaoEstabelecimento = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === "dark";
  const user = authSession.getUser();

  const [activeSection, setActiveSection] = useState(0);
  const [formData, setFormData] = useState(formInicial);
  const [gradeAtividades, setGradeAtividades] = useState([gradeInicial]);
  const [fotosUrl, setFotosUrl] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [isEditingDados, setIsEditingDados] = useState(false);
  const [isEditingAtividades, setIsEditingAtividades] = useState(false);
  const [savedDados, setSavedDados] = useState({ formData: formInicial, gradeAtividades: [gradeInicial] });

  const estabelecimentoId = user?.tipo === "ESTABELECIMENTO" ? user.id : null;

  useEffect(() => {
    if (!estabelecimentoId) {
      navigate("/login", { state: { accountType: "estabelecimento" } });
      return;
    }

    let mounted = true;

    const carregarDados = async () => {
      try {
        const [estabelecimentoResponse, categoriasResponse] = await Promise.all([
          estabelecimentoService.buscarEstabelecimentoPorId(estabelecimentoId),
          categoriaService.listarCategorias(),
        ]);

        if (!mounted) return;

        const estabelecimento = estabelecimentoResponse.data;
        const nextFormData = normalizeForm(estabelecimento);
        const nextGradeAtividades = normalizeGrade(estabelecimento?.gradeAtividades);

        setFormData(nextFormData);
        setGradeAtividades(nextGradeAtividades);
        setSavedDados({ formData: nextFormData, gradeAtividades: nextGradeAtividades });
        setFotosUrl(Array.isArray(estabelecimento?.fotosUrl) ? estabelecimento.fotosUrl.slice(0, MAX_FOTOS) : []);
        setCategorias(Array.isArray(categoriasResponse.data) ? categoriasResponse.data : []);
        setGeneralError("");
      } catch (error) {
        if (mounted) {
          setGeneralError(getApiError(error).generalError || "Não foi possível carregar suas configurações.");
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };

    carregarDados();

    return () => {
      mounted = false;
    };
  }, [estabelecimentoId, navigate]);

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(16, 185, 129, 0.05)",
      borderRadius: 2,
      "& fieldset": { borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(16, 185, 129, 0.2)" },
      "&:hover fieldset": { borderColor: theme.palette.primary.main },
    },
    mb: 2,
  };

  const limparErro = (name) => {
    setFieldErrors((prev) => ({ ...prev, [name]: "", [`endereco.${name}`]: "" }));
    setGeneralError("");
  };

  const startEditarDados = () => {
    setIsEditingDados(true);
    setFieldErrors({});
    setGeneralError("");
  };

  const cancelEditarDados = () => {
    setFormData(savedDados.formData);
    setFieldErrors({});
    setGeneralError("");
    setIsEditingDados(false);
  };

  const startEditarAtividades = () => {
    setIsEditingAtividades(true);
    setFieldErrors({});
    setGeneralError("");
  };

  const cancelEditarAtividades = () => {
    setGradeAtividades(savedDados.gradeAtividades);
    setNovaCategoria("");
    setFieldErrors({});
    setGeneralError("");
    setIsEditingAtividades(false);
  };

  const fieldError = (name) => fieldErrors[name] || fieldErrors[`endereco.${name}`] || "";

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const nextValue = {
      telefone: onlyDigits(value).slice(0, 11),
      cnpj: onlyDigits(value).slice(0, 14),
      cep: onlyDigits(value).slice(0, 8),
      estado: value.toUpperCase().slice(0, 2),
    }[name] ?? value;

    setFormData((prev) => ({ ...prev, [name]: nextValue }));
    limparErro(name);
  };

  const handleGradeChange = (index, name, value) => {
    setGradeAtividades((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [name]: value } : item))
    );
    limparErro("gradeAtividades");
  };

  const toggleGradeItem = (index, field, value) => {
    const selected = gradeAtividades[index][field];
    const nextValue = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];

    handleGradeChange(index, field, nextValue);
  };

  const adicionarCategoriaPendente = (gradeIndex) => {
    const nome = novaCategoria.trim();
    if (!nome) return;

    setCategorias((prev) => {
      const alreadyExists = prev.some((categoria) => getCategoriaNome(categoria).toLowerCase() === nome.toLowerCase());
      return alreadyExists ? prev : [...prev, { nome }];
    });
    setGradeAtividades((prev) =>
      prev.map((item, index) => (index === gradeIndex ? { ...item, atividade: nome } : item))
    );
    setNovaCategoria("");
    toast.info("Categoria adicionada à sua grade e ficará pendente para aprovação.");
  };

  const validarDados = () => {
    const errors = {};

    if (!formData.nome.trim()) errors.nome = "Informe o nome";
    if (!formData.nomeFantasia.trim()) errors.nomeFantasia = "Informe o nome fantasia";
    if (!formData.email.trim()) errors.email = "Informe o email";
    if (!formData.telefone.trim()) errors.telefone = "Informe o telefone";
    if (!formData.cnpj.trim()) errors.cnpj = "Informe o CNPJ";
    if (!formData.rua.trim()) errors.rua = "Informe a rua";
    if (!formData.numero.trim()) errors.numero = "Informe o numero";
    if (!formData.bairro.trim()) errors.bairro = "Informe o bairro";
    if (!formData.cidade.trim()) errors.cidade = "Informe a cidade";
    if (!formData.estado.trim()) errors.estado = "Informe o estado";
    if (!formData.cep.trim()) errors.cep = "Informe o CEP";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildPayload = (overrides = {}) => ({
    nome: formData.nome,
    nomeFantasia: formData.nomeFantasia,
    email: formData.email,
    telefone: formData.telefone,
    cnpj: formData.cnpj,
    endereco: {
      rua: formData.rua,
      numero: formData.numero,
      complemento: formData.complemento,
      bairro: formData.bairro,
      cidade: formData.cidade,
      estado: formData.estado,
      cep: formData.cep,
    },
    gradeAtividades: gradeAtividades
      .filter((item) => item.atividade && item.atividade !== NOVA_CATEGORIA_VALUE)
      .map((item) => ({
        atividade: item.atividade,
        diasSemana: item.diasSemana,
        periodos: item.periodos,
      })),
    fotosUrl,
    ...overrides,
  });

  const validarAtividades = () => {
    const gradeInvalida = gradeAtividades.some((item) => (
      !item.atividade ||
      item.atividade === NOVA_CATEGORIA_VALUE ||
      !item.diasSemana.length ||
      !item.periodos.length
    ));

    if (!gradeInvalida) {
      setFieldErrors((prev) => ({ ...prev, gradeAtividades: "" }));
      return true;
    }

    setFieldErrors((prev) => ({
      ...prev,
      gradeAtividades: "Informe atividade, dias da semana e período em todas as atividades.",
    }));
    return false;
  };

  const handleSalvarDados = async (event) => {
    event.preventDefault();
    if (!isEditingDados) return;
    if (!validarDados()) return;

    setSaving(true);
    try {
      const response = await estabelecimentoService.atualizarEstabelecimento(estabelecimentoId, buildPayload());
      const estabelecimentoAtualizado = response.data;
      authSession.setUser({ ...user, nome: formData.nomeFantasia || formData.nome, email: formData.email });
      setSavedDados((prev) => ({ ...prev, formData }));
      setFotosUrl(Array.isArray(estabelecimentoAtualizado?.fotosUrl) ? estabelecimentoAtualizado.fotosUrl.slice(0, MAX_FOTOS) : fotosUrl);
      setIsEditingDados(false);
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      const { fieldErrors: apiFieldErrors, generalError: apiGeneralError } = getApiError(error);
      setFieldErrors(apiFieldErrors);
      setGeneralError(apiGeneralError);
    } finally {
      setSaving(false);
    }
  };

  const handleSalvarAtividades = async (event) => {
    event.preventDefault();
    if (!isEditingAtividades) return;
    if (!validarAtividades()) return;

    setSaving(true);
    try {
      const response = await estabelecimentoService.atualizarEstabelecimento(estabelecimentoId, buildPayload());
      const estabelecimentoAtualizado = response.data;
      const nextGradeAtividades = normalizeGrade(estabelecimentoAtualizado?.gradeAtividades || gradeAtividades);

      setGradeAtividades(nextGradeAtividades);
      setSavedDados((prev) => ({ ...prev, gradeAtividades: nextGradeAtividades }));
      setIsEditingAtividades(false);
      toast.success("Atividades atualizadas com sucesso!");
    } catch (error) {
      const { fieldErrors: apiFieldErrors, generalError: apiGeneralError } = getApiError(error);
      setFieldErrors(apiFieldErrors);
      setGeneralError(apiGeneralError);
    } finally {
      setSaving(false);
    }
  };

  const handleFotosChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const availableSlots = MAX_FOTOS - fotosUrl.length;
    const selectedFiles = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
      toast.info(`A galeria permite até ${MAX_FOTOS} fotos.`);
    }

    Promise.all(
      selectedFiles.map(
        (file) =>
          new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result || "");
            reader.readAsDataURL(file);
          })
      )
    ).then((images) => {
      setFotosUrl((prev) => [...prev, ...images.filter(Boolean)].slice(0, MAX_FOTOS));
    });

    event.target.value = "";
  };

  const handleSalvarGaleria = async () => {
    setSaving(true);
    try {
      const response = await estabelecimentoService.atualizarEstabelecimento(estabelecimentoId, buildPayload({ fotosUrl }));
      const estabelecimentoAtualizado = response.data;

      setFotosUrl(Array.isArray(estabelecimentoAtualizado?.fotosUrl) ? estabelecimentoAtualizado.fotosUrl.slice(0, MAX_FOTOS) : fotosUrl);
      toast.success("Galeria atualizada com sucesso!");
    } catch (error) {
      setGeneralError(getApiError(error).generalError);
    } finally {
      setSaving(false);
    }
  };

  const handleExcluirConta = async () => {
    if (deleteText !== "EXCLUIR") return;

    setSaving(true);
    try {
      await estabelecimentoService.excluirEstabelecimento(estabelecimentoId);
      authSession.clear();
      toast.success("Conta excluída com sucesso.");
      navigate("/");
    } catch (error) {
      setGeneralError(getApiError(error).generalError);
    } finally {
      setSaving(false);
    }
  };

  const tagSelector = (index, field, options) => (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 2 }}>
      {options.map((option) => {
        const selected = gradeAtividades[index][field].includes(option);

        return (
          <Chip
            key={option}
            label={option}
            clickable
            onClick={() => {
              if (isEditingAtividades) toggleGradeItem(index, field, option);
            }}
            sx={{
              bgcolor: selected ? "primary.main" : isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
              color: selected ? "primary.contrastText" : "text.primary",
              border: "1px solid",
              borderColor: selected ? "primary.main" : "divider",
              fontWeight: 800,
              cursor: isEditingAtividades ? "pointer" : "default",
              opacity: isEditingAtividades || selected ? 1 : 0.72,
              "&:hover": {
                bgcolor: isEditingAtividades
                  ? selected
                    ? theme.palette.custom?.primaryHover || "primary.dark"
                    : "rgba(16, 185, 129, 0.12)"
                  : selected
                    ? "primary.main"
                    : isDark
                      ? "rgba(255,255,255,0.08)"
                      : "rgba(15,23,42,0.08)",
              },
            }}
          />
        );
      })}
    </Box>
  );

  const renderDados = () => (
    <Box component="form" onSubmit={handleSalvarDados}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
            Dados do estabelecimento
          </Typography>
          <Typography color="text.secondary">
            {isEditingDados
              ? "Altere dados principais e endereço."
              : "Clique em editar para liberar alterações nos dados do estabelecimento."}
          </Typography>
        </Box>

        {!isEditingDados && (
          <Button type="button" variant="contained" startIcon={<FaEdit />} onClick={startEditarDados} sx={{ borderRadius: 2, px: 2.5, py: 1.15, fontWeight: 900, flexShrink: 0 }}>
            Editar dados
          </Button>
        )}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        <Box>
          {label("Nome")}
          <TextField fullWidth disabled={!isEditingDados} name="nome" value={formData.nome} onChange={handleInputChange} error={Boolean(fieldErrors.nome)} helperText={fieldErrors.nome} sx={inputStyles} />
        </Box>
        <Box>
          {label("Nome fantasia")}
          <TextField fullWidth disabled={!isEditingDados} name="nomeFantasia" value={formData.nomeFantasia} onChange={handleInputChange} error={Boolean(fieldErrors.nomeFantasia)} helperText={fieldErrors.nomeFantasia} sx={inputStyles} />
        </Box>
      </Box>

      {label("Email")}
      <TextField fullWidth disabled={!isEditingDados} name="email" type="email" value={formData.email} onChange={handleInputChange} error={Boolean(fieldErrors.email)} helperText={fieldErrors.email} sx={inputStyles} />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        <Box>
          {label("Telefone")}
          <TextField fullWidth disabled={!isEditingDados} name="telefone" value={formatTelefone(formData.telefone)} onChange={handleInputChange} error={Boolean(fieldErrors.telefone)} helperText={fieldErrors.telefone} sx={inputStyles} />
        </Box>
        <Box>
          {label("CNPJ")}
          <TextField fullWidth disabled={!isEditingDados} name="cnpj" value={formatCnpj(formData.cnpj)} onChange={handleInputChange} error={Boolean(fieldErrors.cnpj)} helperText={fieldErrors.cnpj} sx={inputStyles} />
        </Box>
      </Box>

      <Typography variant="h6" fontWeight={900} sx={{ mt: 1, mb: 2 }}>
        Endereço
      </Typography>

      {label("Rua")}
      <TextField fullWidth disabled={!isEditingDados} name="rua" value={formData.rua} onChange={handleInputChange} error={Boolean(fieldError("rua"))} helperText={fieldError("rua")} sx={inputStyles} />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        <Box>
          {label("Número")}
          <TextField fullWidth disabled={!isEditingDados} name="numero" value={formData.numero} onChange={handleInputChange} error={Boolean(fieldError("numero"))} helperText={fieldError("numero")} sx={inputStyles} />
        </Box>
        <Box>
          {label("Complemento")}
          <TextField fullWidth disabled={!isEditingDados} name="complemento" value={formData.complemento} onChange={handleInputChange} error={Boolean(fieldError("complemento"))} helperText={fieldError("complemento")} sx={inputStyles} />
        </Box>
      </Box>

      {label("Bairro")}
      <TextField fullWidth disabled={!isEditingDados} name="bairro" value={formData.bairro} onChange={handleInputChange} error={Boolean(fieldError("bairro"))} helperText={fieldError("bairro")} sx={inputStyles} />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr 1fr" }, gap: 2 }}>
        <Box>
          {label("Cidade")}
          <TextField fullWidth disabled={!isEditingDados} name="cidade" value={formData.cidade} onChange={handleInputChange} error={Boolean(fieldError("cidade"))} helperText={fieldError("cidade")} sx={inputStyles} />
        </Box>
        <Box>
          {label("Estado")}
          <TextField fullWidth disabled={!isEditingDados} name="estado" value={formData.estado} onChange={handleInputChange} error={Boolean(fieldError("estado"))} helperText={fieldError("estado")} sx={inputStyles} />
        </Box>
        <Box>
          {label("CEP")}
          <TextField fullWidth disabled={!isEditingDados} name="cep" value={formatCep(formData.cep)} onChange={handleInputChange} error={Boolean(fieldError("cep"))} helperText={fieldError("cep")} sx={inputStyles} />
        </Box>
      </Box>

      {isEditingDados && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, flexWrap: "wrap" }}>
          <Button type="button" variant="outlined" startIcon={<FaTimes />} disabled={saving} onClick={cancelEditarDados} sx={{ borderRadius: 2, px: 3, py: 1.25, fontWeight: 900 }}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" startIcon={<FaSave />} disabled={saving} sx={{ borderRadius: 2, px: 3, py: 1.25, fontWeight: 900 }}>
            {saving ? "Salvando..." : "Salvar dados"}
          </Button>
        </Box>
      )}
    </Box>
  );

  const renderAtividades = () => (
    <Box component="form" onSubmit={handleSalvarAtividades}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
            Atividades oferecidas
          </Typography>
          <Typography color="text.secondary">
            {isEditingAtividades
              ? "Altere categorias, dias da semana e períodos de atendimento."
              : "Clique em editar para alterar a grade de atividades do estabelecimento."}
          </Typography>
        </Box>

        {!isEditingAtividades && (
          <Button type="button" variant="contained" startIcon={<FaEdit />} onClick={startEditarAtividades} sx={{ borderRadius: 2, px: 2.5, py: 1.15, fontWeight: 900, flexShrink: 0 }}>
            Editar atividades
          </Button>
        )}
      </Box>

      {fieldErrors.gradeAtividades && <Alert severity="error" sx={{ mb: 2 }}>{fieldErrors.gradeAtividades}</Alert>}

      {gradeAtividades.map((grade, index) => (
        <Box key={`grade-${index}`} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2, mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={900}>
              Atividade {index + 1}
            </Typography>
            {isEditingAtividades && gradeAtividades.length > 1 && (
              <Button type="button" color="error" size="small" onClick={() => setGradeAtividades((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}>
                Remover
              </Button>
            )}
          </Box>

          <FormControl fullWidth disabled={!isEditingAtividades} sx={inputStyles}>
            <InputLabel>Categoria</InputLabel>
            <Select value={grade.atividade} label="Categoria" onChange={(event) => handleGradeChange(index, "atividade", event.target.value)}>
              {categorias.map((categoria) => {
                const nome = getCategoriaNome(categoria);
                return nome ? <MenuItem key={categoria.id || nome} value={nome}>{nome}</MenuItem> : null;
              })}
              <MenuItem value={NOVA_CATEGORIA_VALUE}>Adicionar nova categoria</MenuItem>
            </Select>
          </FormControl>

          {grade.atividade === NOVA_CATEGORIA_VALUE && (
            <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexDirection: { xs: "column", sm: "row" } }}>
              <TextField fullWidth disabled={!isEditingAtividades} value={novaCategoria} onChange={(event) => setNovaCategoria(event.target.value)} placeholder="Nova categoria" sx={{ ...inputStyles, mb: 0 }} />
              <Button type="button" variant="outlined" disabled={!isEditingAtividades || !novaCategoria.trim()} onClick={() => adicionarCategoriaPendente(index)} sx={{ minWidth: { sm: 170 }, borderRadius: 2, fontWeight: 800 }}>
                Adicionar
              </Button>
            </Box>
          )}

          {label("Dias da semana")}
          {tagSelector(index, "diasSemana", DIAS_SEMANA)}

          {label("Períodos")}
          {tagSelector(index, "periodos", PERIODOS)}
        </Box>
      ))}

      {isEditingAtividades && (
        <Button type="button" variant="outlined" startIcon={<FaPlus />} onClick={() => setGradeAtividades((prev) => [...prev, gradeInicial])} sx={{ borderRadius: 2, fontWeight: 800, mb: 3 }}>
          Adicionar atividade
        </Button>
      )}

      {isEditingAtividades && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, flexWrap: "wrap" }}>
          <Button type="button" variant="outlined" startIcon={<FaTimes />} disabled={saving} onClick={cancelEditarAtividades} sx={{ borderRadius: 2, px: 3, py: 1.25, fontWeight: 900 }}>
            Cancelar
          </Button>
          <Button type="submit" variant="contained" startIcon={<FaSave />} disabled={saving} sx={{ borderRadius: 2, px: 3, py: 1.25, fontWeight: 900 }}>
            {saving ? "Salvando..." : "Salvar atividades"}
          </Button>
        </Box>
      )}
    </Box>
  );

  const renderGaleria = () => (
    <Box>
      <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
        Galeria
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Selecione até {MAX_FOTOS} fotos para mostrar seu espaço.
      </Typography>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2, mb: 3 }}>
        {fotosUrl.map((foto, index) => (
          <Box key={`${foto}-${index}`} sx={{ position: "relative", aspectRatio: "16 / 10", borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
            <Box component="img" src={foto} alt={`Foto ${index + 1}`} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <Button
              type="button"
              color="error"
              onClick={() => setFotosUrl((prev) => prev.filter((_, itemIndex) => itemIndex !== index))}
              sx={{ position: "absolute", top: 8, right: 8, minWidth: 0, width: 36, height: 36, borderRadius: 2, bgcolor: "background.paper" }}
            >
              <FaTrash size={14} />
            </Button>
          </Box>
        ))}

        {fotosUrl.length < MAX_FOTOS && (
          <Button
            component="label"
            variant="outlined"
            sx={{
              aspectRatio: "16 / 10",
              borderRadius: 2,
              borderStyle: "dashed",
              display: "flex",
              flexDirection: "column",
              gap: 1,
              fontWeight: 900,
            }}
          >
            <FaImage size={24} />
            Adicionar fotos
            <input type="file" accept="image/*" multiple hidden onChange={handleFotosChange} />
          </Button>
        )}
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
        <Typography variant="body2" color="text.secondary" fontWeight={700}>
          {fotosUrl.length}/{MAX_FOTOS} fotos selecionadas
        </Typography>
        <Button variant="contained" startIcon={<FaSave />} disabled={saving} onClick={handleSalvarGaleria} sx={{ borderRadius: 2, px: 3, py: 1.25, fontWeight: 900 }}>
          {saving ? "Salvando..." : "Salvar galeria"}
        </Button>
      </Box>
    </Box>
  );

  const renderExcluirConta = () => (
    <Box>
      <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
        Excluir conta
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Esta ação remove o acesso do estabelecimento e deve ser usada apenas quando tiver certeza.
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        Para confirmar a exclusao, digite EXCLUIR no campo abaixo.
      </Alert>

      {label("Confirmação")}
      <TextField fullWidth value={deleteText} onChange={(event) => setDeleteText(event.target.value.toUpperCase())} placeholder="EXCLUIR" sx={inputStyles} />

      <Button color="error" variant="contained" startIcon={<FaTrash />} disabled={saving || deleteText !== "EXCLUIR"} onClick={handleExcluirConta} sx={{ borderRadius: 2, px: 3, py: 1.25, fontWeight: 900 }}>
        {saving ? "Excluindo..." : "Excluir minha conta"}
      </Button>
    </Box>
  );

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ width: "100%", pb: 8 }}>
      <Typography variant="h4" fontWeight={950} sx={{ mb: 1 }}>
        Configurações
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Gerencie as informações do seu estabelecimento no IlhaFit.
      </Typography>

      {generalError && <Alert severity="error" sx={{ mb: 3 }}>{generalError}</Alert>}

      <Paper
        elevation={0}
        sx={{
          borderRadius: 2,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          overflow: "hidden",
        }}
      >
        <Tabs
          value={activeSection}
          onChange={(_, value) => {
            setActiveSection(value);
            setGeneralError("");
          }}
          variant="scrollable"
          scrollButtons="auto"
          sx={{
            px: 2,
            borderBottom: "1px solid",
            borderColor: "divider",
            bgcolor: alpha(theme.palette.primary.main, isDark ? 0.06 : 0.04),
            "& .MuiTab-root": { fontWeight: 900, minHeight: 64 },
          }}
        >
          <Tab label="Dados" />
          <Tab label="Atividades" />
          <Tab label="Galeria" />
          <Tab label="Excluir conta" />
        </Tabs>

        <Box sx={{ p: { xs: 2.5, md: 4 } }}>
          {activeSection === 0 && renderDados()}
          {activeSection === 1 && renderAtividades()}
          {activeSection === 2 && renderGaleria()}
          {activeSection === 3 && renderExcluirConta()}
        </Box>
      </Paper>
    </Box>
  );
};

export default ConfiguracaoEstabelecimento;

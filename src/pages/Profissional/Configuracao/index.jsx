import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Tab,
  Tabs,
  TextField,
  Typography,
  Checkbox,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { FaEdit, FaImage, FaPlus, FaSave, FaTimes, FaTrash } from "react-icons/fa";
import { authSession } from "../../../service/AuthSession";
import { categoriaService } from "../../../service/CategoriaService";
import { profissionalService } from "../../../service/ProfissionalService";

const DIAS_SEMANA = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO", "DOMINGO"];
const PERIODOS = ["MANHA", "TARDE", "NOITE"];
const GENEROS = ["FEMININO", "MASCULINO"];
const NOVA_CATEGORIA_VALUE = "__nova_categoria__";

const formInicial = {
  nome: "",
  email: "",
  telefone: "",
  cpf: "",
  genero: "",
  registroCref: "",
  regiao: "",
  fotoUrl: "",
};

const gradeInicial = { atividade: "", exclusivoMulheres: false, diasSemana: [], periodos: [] };

const onlyDigits = (value = "") => value.replace(/\D/g, "");

const formatTelefone = (value = "") => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatCpf = (value = "") => {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
};

const formatCref = (value = "") => {
  const cleaned = value.toUpperCase().replace(/[^A-Z0-9]/g, "");
  const digits = onlyDigits(cleaned).slice(0, 6);
  const letters = cleaned.replace(/\d/g, "");
  const tipo = letters.slice(0, 1);
  const uf = letters.slice(1, 3);

  let formatted = digits;
  if (tipo) formatted += `-${tipo}`;
  if (uf) formatted += `/${uf}`;
  return formatted;
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

const normalizeForm = (profissional) => ({
  nome: profissional?.nome || "",
  email: profissional?.email || "",
  telefone: onlyDigits(profissional?.telefone || ""),
  cpf: onlyDigits(profissional?.cpf || ""),
  genero: profissional?.sexo || "",
  registroCref: profissional?.registroCref || "",
  regiao: profissional?.regiao || "",
  fotoUrl: profissional?.fotoUrl || "",
});

const normalizeGrade = (gradeAtividades) => {
  if (!Array.isArray(gradeAtividades) || gradeAtividades.length === 0) return [gradeInicial];

  return gradeAtividades.map((item) => ({
    atividade: item.atividade || "",
    exclusivoMulheres: item.exclusivoMulheres || false,
    diasSemana: Array.isArray(item.diasSemana) ? item.diasSemana : [],
    periodos: Array.isArray(item.periodos) ? item.periodos : [],
  }));
};

const label = (text) => (
  <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.75, color: "text.secondary" }}>
    {text}
  </Typography>
);

const ConfiguracaoProfissional = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === "dark";
  const user = authSession.getUser();

  const [activeSection, setActiveSection] = useState(0);
  const [formData, setFormData] = useState(formInicial);
  const [gradeAtividades, setGradeAtividades] = useState([gradeInicial]);
  const [fotoUrl, setFotoUrl] = useState("");
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

  const profissionalId = user?.tipo === "PROFISSIONAL" ? user.id : null;
  const isFeminino = formData.genero === "FEMININO";

  useEffect(() => {
    if (!profissionalId) {
      navigate("/login", { state: { accountType: "profissional" } });
      return;
    }

    let mounted = true;

    const carregarDados = async () => {
      try {
        const [profissionalResponse, categoriasResponse] = await Promise.all([
          profissionalService.buscarProfissionalPorId(profissionalId),
          categoriaService.listarCategorias(),
        ]);

        if (!mounted) return;

        const profissional = profissionalResponse.data;
        const nextFormData = normalizeForm(profissional);
        const nextGradeAtividades = normalizeGrade(profissional?.gradeAtividades);

        setFormData(nextFormData);
        setGradeAtividades(nextGradeAtividades);
        setSavedDados({ formData: nextFormData, gradeAtividades: nextGradeAtividades });
        setFotoUrl(profissional?.fotoUrl || "");
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
  }, [profissionalId, navigate]);

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
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
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

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const nextValue = {
      telefone: onlyDigits(value).slice(0, 11),
      cpf: onlyDigits(value).slice(0, 11),
      registroCref: formatCref(value),
      regiao: value.slice(0, 60),
    }[name] ?? value;

    setFormData((prev) => {
      const nextData = { ...prev, [name]: nextValue };
      // Se mudar gênero para não feminino, remover exclusivo mulheres
      if (name === "genero" && nextValue !== "FEMININO") {
        setGradeAtividades((current) =>
          current.map((item) => ({ ...item, exclusivoMulheres: false }))
        );
      }
      return nextData;
    });
    limparErro(name);
  };

  const handleGradeChange = (index, name, value) => {
    setGradeAtividades((prev) =>
      prev.map((item, itemIndex) => (itemIndex === index ? { ...item, [name]: value } : item))
    );
    limparErro("gradeAtividades");
  };

  const toggleExclusivoMulheres = (index) => {
    if (!isFeminino) return;
    handleGradeChange(index, "exclusivoMulheres", !gradeAtividades[index].exclusivoMulheres);
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
    if (!formData.email.trim()) errors.email = "Informe o email";
    if (!formData.telefone.trim()) errors.telefone = "Informe o telefone";
    if (!formData.cpf.trim()) errors.cpf = "Informe o CPF";
    if (!formData.genero.trim()) errors.genero = "Informe o gênero";
    if (!formData.registroCref.trim()) errors.registroCref = "Informe o CREF";
    if (formData.registroCref && !/^\d{1,6}-[A-Z]\/[A-Z]{2}$/.test(formData.registroCref)) {
      errors.registroCref = "Use o formato 123456-G/SP";
    }
    if (!formData.regiao.trim()) errors.regiao = "Informe a região";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildPayload = (overrides = {}) => ({
    nome: formData.nome,
    email: formData.email,
    telefone: formData.telefone,
    cpf: formData.cpf,
    sexo: formData.genero,
    registroCref: formData.registroCref,
    regiao: formData.regiao,
    gradeAtividades: gradeAtividades
      .filter((item) => item.atividade && item.atividade !== NOVA_CATEGORIA_VALUE)
      .map((item) => ({
        atividade: item.atividade,
        exclusivoMulheres: isFeminino ? item.exclusivoMulheres : false,
        diasSemana: item.diasSemana,
        periodos: item.periodos,
      })),
    fotoUrl,
    exclusivoMulheres: isFeminino && gradeAtividades.some((item) => item.exclusivoMulheres),
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
      const response = await profissionalService.atualizarProfissional(profissionalId, buildPayload());
      const profissionalAtualizado = response.data;
      authSession.setUser({ ...user, nome: formData.nome, email: formData.email });
      setSavedDados((prev) => ({ ...prev, formData }));
      setFotoUrl(profissionalAtualizado?.fotoUrl || fotoUrl);
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
      const response = await profissionalService.atualizarProfissional(profissionalId, buildPayload());
      const profissionalAtualizado = response.data;
      const nextGradeAtividades = normalizeGrade(profissionalAtualizado?.gradeAtividades || gradeAtividades);

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

  const handleFotoChange = (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFotoUrl(reader.result || "");
      setFieldErrors((prev) => ({ ...prev, fotoUrl: "" }));
    };
    reader.readAsDataURL(file);
    event.target.value = "";
  };

  const handleSalvarFoto = async () => {
    setSaving(true);
    try {
      const response = await profissionalService.atualizarProfissional(profissionalId, buildPayload({ fotoUrl }));
      const profissionalAtualizado = response.data;

      setFotoUrl(profissionalAtualizado?.fotoUrl || fotoUrl);
      toast.success("Foto de perfil atualizada com sucesso!");
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
      await profissionalService.excluirProfissional(profissionalId);
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
            Dados pessoais
          </Typography>
          <Typography color="text.secondary">
            {isEditingDados
              ? "Altere seus dados pessoais e profissionais."
              : "Clique em editar para liberar alterações nos seus dados."}
          </Typography>
        </Box>

        {!isEditingDados && (
          <Button
            type="button"
            variant="contained"
            startIcon={<FaEdit />}
            onClick={startEditarDados}
            sx={{ borderRadius: 2, px: 2.5, py: 1.15, fontWeight: 900, flexShrink: 0 }}
          >
            Editar dados
          </Button>
        )}
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        <Box>
          {label("Nome")}
          <TextField
            fullWidth
            disabled={!isEditingDados}
            name="nome"
            value={formData.nome}
            onChange={handleInputChange}
            error={Boolean(fieldErrors.nome)}
            helperText={fieldErrors.nome}
            sx={inputStyles}
          />
        </Box>
        <Box>
          {label("Email")}
          <TextField
            fullWidth
            disabled={!isEditingDados}
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email}
            sx={inputStyles}
          />
        </Box>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        <Box>
          {label("Telefone")}
          <TextField
            fullWidth
            disabled={!isEditingDados}
            name="telefone"
            value={formatTelefone(formData.telefone)}
            onChange={handleInputChange}
            error={Boolean(fieldErrors.telefone)}
            helperText={fieldErrors.telefone}
            sx={inputStyles}
          />
        </Box>
        <Box>
          {label("CPF")}
          <TextField
            fullWidth
            disabled={!isEditingDados}
            name="cpf"
            value={formatCpf(formData.cpf)}
            onChange={handleInputChange}
            error={Boolean(fieldErrors.cpf)}
            helperText={fieldErrors.cpf}
            sx={inputStyles}
          />
        </Box>
      </Box>

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        <Box>
          {label("Gênero")}
          <FormControl fullWidth disabled={!isEditingDados} error={Boolean(fieldErrors.genero)} sx={inputStyles}>
            <Select
              name="genero"
              value={formData.genero}
              onChange={handleInputChange}
            >
              {GENEROS.map((genero) => (
                <MenuItem key={genero} value={genero}>
                  {genero}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
        <Box>
          {label("CREF")}
          <TextField
            fullWidth
            disabled={!isEditingDados}
            name="registroCref"
            value={formData.registroCref}
            onChange={handleInputChange}
            placeholder="123456-G/SP"
            error={Boolean(fieldErrors.registroCref)}
            helperText={fieldErrors.registroCref}
            sx={inputStyles}
          />
        </Box>
      </Box>

      {label("Região")}
      <TextField
        fullWidth
        disabled={!isEditingDados}
        name="regiao"
        value={formData.regiao}
        onChange={handleInputChange}
        error={Boolean(fieldErrors.regiao)}
        helperText={fieldErrors.regiao}
        sx={inputStyles}
      />

      {isEditingDados && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            type="button"
            variant="outlined"
            startIcon={<FaTimes />}
            disabled={saving}
            onClick={cancelEditarDados}
            sx={{ borderRadius: 2, px: 3, py: 1.25, fontWeight: 900 }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<FaSave />}
            disabled={saving}
            sx={{ borderRadius: 2, px: 3, py: 1.25, fontWeight: 900 }}
          >
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
              : "Clique em editar para alterar a grade de atividades."}
          </Typography>
        </Box>

        {!isEditingAtividades && (
          <Button
            type="button"
            variant="contained"
            startIcon={<FaEdit />}
            onClick={startEditarAtividades}
            sx={{ borderRadius: 2, px: 2.5, py: 1.15, fontWeight: 900, flexShrink: 0 }}
          >
            Editar atividades
          </Button>
        )}
      </Box>

      {fieldErrors.gradeAtividades && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {fieldErrors.gradeAtividades}
        </Alert>
      )}

      {gradeAtividades.map((grade, index) => (
        <Box
          key={`grade-${index}`}
          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2, mb: 2 }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={900}>
              Atividade {index + 1}
            </Typography>
            {isEditingAtividades && gradeAtividades.length > 1 && (
              <Button
                type="button"
                color="error"
                size="small"
                onClick={() =>
                  setGradeAtividades((prev) =>
                    prev.filter((_, itemIndex) => itemIndex !== index)
                  )
                }
              >
                Remover
              </Button>
            )}
          </Box>

          <FormControl fullWidth disabled={!isEditingAtividades} sx={inputStyles}>
            <InputLabel>Categoria</InputLabel>
            <Select
              value={grade.atividade}
              label="Categoria"
              onChange={(event) =>
                handleGradeChange(index, "atividade", event.target.value)
              }
            >
              {categorias.map((categoria) => {
                const nome = getCategoriaNome(categoria);
                return nome ? (
                  <MenuItem key={categoria.id || nome} value={nome}>
                    {nome}
                  </MenuItem>
                ) : null;
              })}
              <MenuItem value={NOVA_CATEGORIA_VALUE}>
                Adicionar nova categoria
              </MenuItem>
            </Select>
          </FormControl>

          {grade.atividade === NOVA_CATEGORIA_VALUE && (
            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                mb: 2,
                flexDirection: { xs: "column", sm: "row" },
              }}
            >
              <TextField
                fullWidth
                disabled={!isEditingAtividades}
                value={novaCategoria}
                onChange={(event) => setNovaCategoria(event.target.value)}
                placeholder="Nova categoria"
                sx={{ ...inputStyles, mb: 0 }}
              />
              <Button
                type="button"
                variant="outlined"
                disabled={!isEditingAtividades || !novaCategoria.trim()}
                onClick={() => adicionarCategoriaPendente(index)}
                sx={{ minWidth: { sm: 170 }, borderRadius: 2, fontWeight: 800 }}
              >
                Adicionar
              </Button>
            </Box>
          )}

          {label("Dias da semana")}
          {tagSelector(index, "diasSemana", DIAS_SEMANA)}

          {label("Períodos")}
          {tagSelector(index, "periodos", PERIODOS)}

          {isFeminino && isEditingAtividades && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={grade.exclusivoMulheres}
                  onClick={() => toggleExclusivoMulheres(index)}
                />
              }
              label="Exclusivo para mulheres"
              sx={{ mt: 2 }}
            />
          )}
        </Box>
      ))}

      {isEditingAtividades && (
        <Button
          type="button"
          variant="outlined"
          startIcon={<FaPlus />}
          onClick={() => setGradeAtividades((prev) => [...prev, gradeInicial])}
          sx={{ borderRadius: 2, fontWeight: 800, mb: 3 }}
        >
          Adicionar atividade
        </Button>
      )}

      {isEditingAtividades && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            type="button"
            variant="outlined"
            startIcon={<FaTimes />}
            disabled={saving}
            onClick={cancelEditarAtividades}
            sx={{ borderRadius: 2, px: 3, py: 1.25, fontWeight: 900 }}
          >
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            startIcon={<FaSave />}
            disabled={saving}
            sx={{ borderRadius: 2, px: 3, py: 1.25, fontWeight: 900 }}
          >
            {saving ? "Salvando..." : "Salvar atividades"}
          </Button>
        </Box>
      )}
    </Box>
  );

  const renderFotoPerfil = () => (
    <Box>
      <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
        Foto de perfil
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Selecione uma foto para seu perfil no IlhaFit.
      </Typography>

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 3,
          mb: 3,
        }}
      >
        {fotoUrl ? (
          <Box
            sx={{
              position: "relative",
              width: 200,
              height: 200,
              borderRadius: 2,
              overflow: "hidden",
              border: "2px solid",
              borderColor: "divider",
            }}
          >
            <Box
              component="img"
              src={fotoUrl}
              alt="Foto de perfil"
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
            <Button
              component="label"
              variant="contained"
              sx={{
                position: "absolute",
                top: 8,
                right: 8,
                minWidth: 0,
                width: 40,
                height: 40,
                borderRadius: 1,
                p: 0,
              }}
            >
              <FaImage size={16} />
              <input
                type="file"
                accept="image/*"
                hidden
                onChange={handleFotoChange}
              />
            </Button>
          </Box>
        ) : (
          <Button
            component="label"
            variant="outlined"
            sx={{
              width: 200,
              height: 200,
              borderRadius: 2,
              borderStyle: "dashed",
              display: "flex",
              flexDirection: "column",
              gap: 1,
              fontWeight: 900,
            }}
          >
            <FaImage size={32} />
            Selecionar foto
            <input
              type="file"
              accept="image/*"
              hidden
              onChange={handleFotoChange}
            />
          </Button>
        )}
      </Box>

      <Button
        variant="contained"
        startIcon={<FaSave />}
        disabled={saving || !fotoUrl}
        onClick={handleSalvarFoto}
        sx={{ borderRadius: 2, px: 3, py: 1.25, fontWeight: 900 }}
      >
        {saving ? "Salvando..." : "Salvar foto"}
      </Button>
    </Box>
  );

  const renderExcluirConta = () => (
    <Box>
      <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
        Excluir conta
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Esta ação remove o acesso e deve ser usada apenas quando tiver certeza.
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        Para confirmar a exclusão, digite EXCLUIR no campo abaixo.
      </Alert>

      {label("Confirmação")}
      <TextField
        fullWidth
        value={deleteText}
        onChange={(event) => setDeleteText(event.target.value.toUpperCase())}
        placeholder="EXCLUIR"
        sx={inputStyles}
      />

      <Button
        color="error"
        variant="contained"
        startIcon={<FaTrash />}
        disabled={saving || deleteText !== "EXCLUIR"}
        onClick={handleExcluirConta}
        sx={{ borderRadius: 2, px: 3, py: 1.25, fontWeight: 900 }}
      >
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
        Gerencie as suas informações no IlhaFit.
      </Typography>

      {generalError && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {generalError}
        </Alert>
      )}

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
          <Tab label="Foto de Perfil" />
          <Tab label="Excluir conta" />
        </Tabs>

        <Box sx={{ p: { xs: 2.5, md: 4 } }}>
          {activeSection === 0 && renderDados()}
          {activeSection === 1 && renderAtividades()}
          {activeSection === 2 && renderFotoPerfil()}
          {activeSection === 3 && renderExcluirConta()}
        </Box>
      </Paper>
    </Box>
  );
};

export default ConfiguracaoProfissional;

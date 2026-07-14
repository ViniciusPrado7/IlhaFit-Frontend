import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
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
import CategoriaSelectField from "../../../components/CategoriaSelectField";
import { authSession } from "../../../service/AuthSession";
import { estabelecimentoService } from "../../../service/EstablishmentService";
import { CategoriaSolicitacoesSection } from "../../../components/CategoryRequests";

const DIAS_SEMANA = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO", "DOMINGO"];
const PERIODOS = ["MANHA", "TARDE", "NOITE"];
const MAX_FOTOS = 6;
const ATIVIDADES_POR_PAGINA = 5;
const ESTADOS_BRASIL = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA", "MT", "MS",
  "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN", "RS", "RO", "RR", "SC",
  "SP", "SE", "TO"
];

const formInicial = {
  nomeFantasia: "",
  razaoSocial: "",
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
  latitude: null,
  longitude: null,
};

const gradeInicial = { id: null, categoriaId: null, categoriaNome: "", exclusivoMulheres: false, diasSemana: [], periodos: [] };

const onlyDigits = (value = "") => value.replace(/\D/g, "");
const apenasTexto = (value = "") => value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");
const textoComNumero = (value = "") => value.replace(/[^A-Za-zÀ-ÿ0-9\s]/g, "");
const contemApenasTexto = (value = "") => /^[A-Za-zÀ-ÿ\s]+$/.test(value.trim());
const cnpjValido = (value = "") => /^\d{14}$/.test(value);

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

const hasAddressFields = (address) =>
  Boolean(
    address.rua?.trim() &&
    address.numero?.trim() &&
    address.bairro?.trim() &&
    address.cidade?.trim() &&
    address.estado?.trim()
  );

const buildGeocodeQuery = (address) => {
  const street = [address.rua?.trim(), address.numero?.trim()].filter(Boolean).join(", ");

  return [
    street,
    address.bairro?.trim(),
    address.cidade?.trim(),
    address.estado?.trim(),
    address.cep ? formatCep(address.cep) : "",
    "Brasil",
  ]
    .filter(Boolean)
    .join(", ");
};

const getApiError = (error) => {
  const data = error?.response?.data;
  const status = error?.response?.status;

  if (status === 401 || status === 403) {
    return {
      fieldErrors: {},
      generalError: "Sessão inválida ou sem permissão. Faça login novamente.",
    };
  }

  if (data && typeof data === "object" && !Array.isArray(data)) {
    const { erro, ...fieldErrors } = data;
    return { fieldErrors, generalError: erro || Object.values(fieldErrors).filter(Boolean).join(" ") };
  }

  return {
    fieldErrors: {},
    generalError: typeof data === "string" ? data : error?.message || "Não foi possível concluir a operação.",
  };
};

const isSessionError = (error) => [401, 403].includes(error?.response?.status);

const normalizeForm = (estabelecimento) => ({
  nomeFantasia: estabelecimento?.nomeFantasia || "",
  razaoSocial: estabelecimento?.razaoSocial || "",
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
  latitude: estabelecimento?.endereco?.latitude ?? null,
  longitude: estabelecimento?.endereco?.longitude ?? null,
});

const normalizeGrade = (gradeAtividades) => {
  if (!Array.isArray(gradeAtividades) || gradeAtividades.length === 0) return [];

  return gradeAtividades.map((item) => ({
    id: typeof item === "object" && item !== null ? item.id || null : null,
    categoriaId: item?.categoriaId ?? null,
    categoriaNome: item?.categoriaNome || "",
    exclusivoMulheres: Boolean(item?.exclusivoMulheres),
    diasSemana: Array.isArray(item?.diasSemana) ? item.diasSemana : [],
    periodos: Array.isArray(item?.periodos) ? item.periodos : [],
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
  const [gradeAtividades, setGradeAtividades] = useState([]);
  const [fotosUrl, setFotosUrl] = useState([]);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [isEditingDados, setIsEditingDados] = useState(false);
  const [isEditingAtividades, setIsEditingAtividades] = useState(false);
  const [atividadesVisiveis, setAtividadesVisiveis] = useState(ATIVIDADES_POR_PAGINA);
  const [isEditingGaleria, setIsEditingGaleria] = useState(false);
  const [savedFotosUrl, setSavedFotosUrl] = useState([]);
  const [savedDados, setSavedDados] = useState({ formData: formInicial, gradeAtividades: [] });

  const estabelecimentoId = authSession.isEstabelecimentoAuthenticated() ? user?.id : null;

  useEffect(() => {
    if (!estabelecimentoId) {
      navigate("/login", { state: { accountType: "estabelecimento" } });
      return;
    }

    let mounted = true;

    const carregarDados = async () => {
      try {
        const estabelecimentoResponse = await estabelecimentoService.buscarEstabelecimentoPorId(estabelecimentoId);

        if (!mounted) return;

        const estabelecimento = estabelecimentoResponse.data;
        const nextFormData = normalizeForm(estabelecimento);
        const nextGradeAtividades = normalizeGrade(estabelecimento?.gradeAtividades);

        setFormData(nextFormData);
        setGradeAtividades(nextGradeAtividades);
        setSavedDados({ formData: nextFormData, gradeAtividades: nextGradeAtividades });
        const fotosIniciais = Array.isArray(estabelecimento?.fotosUrl) ? estabelecimento.fotosUrl.slice(0, MAX_FOTOS) : [];
        setFotosUrl(fotosIniciais);
        setSavedFotosUrl(fotosIniciais);
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
    setFieldErrors({});
    setGeneralError("");
    setIsEditingAtividades(false);
  };

  const startEditarGaleria = () => {
    setIsEditingGaleria(true);
    setFieldErrors({});
    setGeneralError("");
  };

  const cancelEditarGaleria = () => {
    setFotosUrl(savedFotosUrl);
    setFieldErrors({});
    setGeneralError("");
    setIsEditingGaleria(false);
  };

  const fieldError = (name) => fieldErrors[name] || fieldErrors[`endereco.${name}`] || "";

  const preencherEnderecoPorCep = async (cep) => {
    const cepLimpo = onlyDigits(cep);

    if (cepLimpo.length !== 8) return;

    setCepLoading(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);

      if (!response.ok) {
        throw new Error("Falha ao consultar o CEP.");
      }

      const data = await response.json();

      if (data.erro) {
        setFormData((prev) => ({ ...prev, rua: "", bairro: "", cidade: "", estado: "", latitude: null, longitude: null }));
        setFieldErrors((prev) => ({ ...prev, cep: "CEP não encontrado.", "endereco.cep": "CEP não encontrado." }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        rua: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: (data.uf || "").toUpperCase(),
        latitude: null,
        longitude: null,
      }));

      setFieldErrors((prev) => ({
        ...prev,
        cep: "", "endereco.cep": "",
        rua: "", "endereco.rua": "",
        bairro: "", "endereco.bairro": "",
        cidade: "", "endereco.cidade": "",
        estado: "", "endereco.estado": "",
      }));
    } catch {
      setFieldErrors((prev) => ({
        ...prev,
        cep: "Não foi possível buscar o CEP.",
        "endereco.cep": "Não foi possível buscar o CEP.",
      }));
    } finally {
      setCepLoading(false);
    }
  };

  const atualizarCoordenadas = async (address) => {
    if (!hasAddressFields(address)) return { latitude: null, longitude: null };

    try {
      const query = buildGeocodeQuery(address);
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&addressdetails=1&q=${encodeURIComponent(query)}`
      );

      if (!geoResponse.ok) throw new Error("Falha ao buscar coordenadas.");

      const geoData = await geoResponse.json();
      if (!geoData || geoData.length === 0) return { latitude: null, longitude: null };

      return { latitude: parseFloat(geoData[0].lat), longitude: parseFloat(geoData[0].lon) };
    } catch (geoError) {
      console.warn("Erro ao buscar coordenadas:", geoError);
      return { latitude: null, longitude: null };
    }
  };

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    const nextValue = {
      telefone: onlyDigits(value).slice(0, 11),
      cnpj: onlyDigits(value).slice(0, 14),
      cep: onlyDigits(value).slice(0, 8),
      estado: value.toUpperCase().slice(0, 2),
      numero: onlyDigits(value).slice(0, 10),
      rua: textoComNumero(value),
      bairro: textoComNumero(value),
      cidade: apenasTexto(value),
    }[name] ?? value;

    const invalidaCoordenadas = ["rua", "numero", "bairro", "cidade", "estado", "cep"].includes(name);

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
      ...(invalidaCoordenadas ? { latitude: null, longitude: null } : {}),
    }));
    limparErro(name);

    if (name === "cep" && nextValue.length === 8) {
      preencherEnderecoPorCep(nextValue);
    }
  };

  const handleCepBlur = () => preencherEnderecoPorCep(formData.cep);

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

  const validarDados = () => {
    const errors = {};

    if (!formData.nomeFantasia.trim()) errors.nomeFantasia = "Informe o nome fantasia";
    if (!formData.razaoSocial.trim()) errors.razaoSocial = "Informe a razão social";
    if (!formData.email.trim()) errors.email = "Informe o email";
    if (!formData.telefone.trim()) errors.telefone = "Informe o telefone";
    if (!formData.cnpj.trim()) errors.cnpj = "Informe o CNPJ";
    else if (!cnpjValido(formData.cnpj)) errors.cnpj = "CNPJ deve conter os 14 números";
    if (!formData.rua.trim()) errors.rua = "Informe a rua";
    if (!formData.numero.trim()) errors.numero = "Informe o número";
    if (!formData.bairro.trim()) errors.bairro = "Informe o bairro";
    if (!formData.cidade.trim()) errors.cidade = "Informe a cidade";
    else if (!contemApenasTexto(formData.cidade)) errors.cidade = "Cidade deve conter apenas letras";
    if (!formData.estado.trim()) errors.estado = "Informe o estado";
    else if (!ESTADOS_BRASIL.includes(formData.estado)) errors.estado = "Selecione um estado válido";
    if (!formData.cep.trim()) errors.cep = "Informe o CEP";

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const buildPayload = ({ endereco: enderecoOverride, ...overrides } = {}) => ({
    nomeFantasia: formData.nomeFantasia,
    razaoSocial: formData.razaoSocial,
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
      latitude: formData.latitude,
      longitude: formData.longitude,
      ...(enderecoOverride || {}),
    },
    gradeAtividades: gradeAtividades
      .filter((item) => item.categoriaId)
      .map((item) => ({
        categoriaId: item.categoriaId,
        exclusivoMulheres: Boolean(item.exclusivoMulheres),
        diasSemana: item.diasSemana,
        periodos: item.periodos,
      })),
    fotosUrl,
    ...overrides,
  });

  const buildGradePayload = () => ({
    gradeAtividades: gradeAtividades
      .filter((item) => item.categoriaId)
      .map((item) => ({
        id: item.id,
        categoriaId: item.categoriaId,
        exclusivoMulheres: Boolean(item.exclusivoMulheres),
        diasSemana: item.diasSemana,
        periodos: item.periodos,
      })),
  });

  const toGradeRequest = (item) => ({
    categoriaId: item.categoriaId,
    exclusivoMulheres: Boolean(item.exclusivoMulheres),
    diasSemana: item.diasSemana,
    periodos: item.periodos,
  });

  const extractGradeResponse = (data, fallback) => {
    if (data?.categoriaId) {
      return {
        ...fallback,
        id: data.id ?? fallback?.id ?? null,
        categoriaId: data.categoriaId,
        categoriaNome: data.categoriaNome || "",
      };
    }

    return fallback;
  };

  const syncGradeFromEstabelecimento = (estabelecimentoAtualizado) => {
    if (!Array.isArray(estabelecimentoAtualizado?.gradeAtividades)) return;

    const nextGradeAtividades = normalizeGrade(estabelecimentoAtualizado.gradeAtividades);
    setGradeAtividades(nextGradeAtividades);
    setSavedDados((prev) => ({ ...prev, gradeAtividades: nextGradeAtividades }));
  };

  const handleProtectedError = (error, setErrors = true) => {
    const { fieldErrors: apiFieldErrors, generalError: apiGeneralError } = getApiError(error);

    if (setErrors) {
      setFieldErrors(apiFieldErrors);
    }

    setGeneralError(apiGeneralError);

    if (isSessionError(error)) {
      authSession.clear();
      toast.error(apiGeneralError);
      navigate("/login", { state: { accountType: "estabelecimento" } });
    }
  };

  const validarAtividades = () => {
    const gradeInvalida = gradeAtividades.some((item) => (
      !item.categoriaId ||
      !item.diasSemana.length ||
      !item.periodos.length
    ));

    const categoriasPreenchidas = gradeAtividades
      .map((item) => item.categoriaId)
      .filter(Boolean);
    const hasDuplicateCategorias = new Set(categoriasPreenchidas).size !== categoriasPreenchidas.length;

    if (!gradeInvalida && !hasDuplicateCategorias) {
      setFieldErrors((prev) => ({ ...prev, gradeAtividades: "" }));
      return true;
    }

    if (hasDuplicateCategorias) {
      toast.error("Existem categorias iguais na grade de atividades.");
      setFieldErrors((prev) => ({
        ...prev,
        gradeAtividades: "Você não pode cadastrar a mesma categoria mais de uma vez na grade de atividades.",
      }));
      return false;
    }

    setFieldErrors((prev) => ({
      ...prev,
      gradeAtividades: "Informe uma categoria válida, dias da semana e período em todas as atividades.",
    }));
    return false;
  };

  const handleSalvarDados = async (event) => {
    event.preventDefault();
    if (!isEditingDados) return;
    if (!validarDados()) return;

    setSaving(true);
    try {
      let coords = { latitude: formData.latitude, longitude: formData.longitude };
      if (coords.latitude == null || coords.longitude == null) {
        coords = await atualizarCoordenadas(formData);
      }

      const formDataComCoords = { ...formData, ...coords };
      const response = await estabelecimentoService.atualizarEstabelecimento(
        estabelecimentoId,
        buildPayload({ endereco: coords })
      );
      const estabelecimentoAtualizado = response.data;
      setFormData(formDataComCoords);
      authSession.setUser({
        ...user,
        nomeFantasia: formData.nomeFantasia,
        razaoSocial: formData.razaoSocial,
        email: formData.email,
      });
      syncGradeFromEstabelecimento(estabelecimentoAtualizado);
      setSavedDados((prev) => ({ ...prev, formData: formDataComCoords }));
      const fotosAtualizadas = Array.isArray(estabelecimentoAtualizado?.fotosUrl) ? estabelecimentoAtualizado.fotosUrl.slice(0, MAX_FOTOS) : fotosUrl;
      setFotosUrl(fotosAtualizadas);
      setSavedFotosUrl(fotosAtualizadas);
      setIsEditingDados(false);
      toast.success("Dados atualizados com sucesso!");
    } catch (error) {
      handleProtectedError(error);
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
      const gradePayload = buildGradePayload();
      const nextIds = new Set(gradePayload.gradeAtividades.map((item) => item.id).filter(Boolean));
      const removedIds = savedDados.gradeAtividades
        .map((item) => item.id)
        .filter((id) => id && !nextIds.has(id));

      await Promise.all(removedIds.map((id) => estabelecimentoService.excluirGradeAtividade(id)));

      const responses = await Promise.all(
        gradePayload.gradeAtividades.map((item) => {
          const request = toGradeRequest(item);
          return item.id
            ? estabelecimentoService.atualizarGradeAtividade(item.id, request)
            : estabelecimentoService.cadastrarGradeEstabelecimento(estabelecimentoId, request);
        })
      );

      const nextGradeAtividades = normalizeGrade(
        responses.map((response, index) => extractGradeResponse(response.data, gradePayload.gradeAtividades[index]))
      );

      setGradeAtividades(nextGradeAtividades);
      setSavedDados((prev) => ({ ...prev, gradeAtividades: nextGradeAtividades }));
      setIsEditingAtividades(false);
      toast.success("Atividades atualizadas com sucesso!");
    } catch (error) {
      handleProtectedError(error);
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
    if (!isEditingGaleria) return;

    setSaving(true);
    try {
      const response = await estabelecimentoService.atualizarEstabelecimento(estabelecimentoId, buildPayload({ fotosUrl }));
      const estabelecimentoAtualizado = response.data;

      syncGradeFromEstabelecimento(estabelecimentoAtualizado);
      const fotosAtualizadas = Array.isArray(estabelecimentoAtualizado?.fotosUrl) ? estabelecimentoAtualizado.fotosUrl.slice(0, MAX_FOTOS) : fotosUrl;
      setFotosUrl(fotosAtualizadas);
      setSavedFotosUrl(fotosAtualizadas);
      setIsEditingGaleria(false);
      toast.success("Galeria atualizada com sucesso!");
    } catch (error) {
      handleProtectedError(error, false);
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
      handleProtectedError(error, false);
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
          {label("Nome fantasia")}
          <TextField fullWidth disabled={!isEditingDados} name="nomeFantasia" value={formData.nomeFantasia} onChange={handleInputChange} error={Boolean(fieldErrors.nomeFantasia)} helperText={fieldErrors.nomeFantasia} sx={inputStyles} />
        </Box>
        <Box>
          {label("Razão social")}
          <TextField fullWidth disabled={!isEditingDados} name="razaoSocial" value={formData.razaoSocial} onChange={handleInputChange} error={Boolean(fieldErrors.razaoSocial)} helperText={fieldErrors.razaoSocial} sx={inputStyles} />
        </Box>
      </Box>

      {label("Email")}
      <TextField
        fullWidth
        disabled
        name="email"
        type="email"
        value={formData.email}
        onChange={handleInputChange}
        error={Boolean(fieldErrors.email)}
        helperText={fieldErrors.email || "Email apenas para visualizacao."}
        sx={{
          ...inputStyles,
          "& .MuiOutlinedInput-root": {
            ...inputStyles["& .MuiOutlinedInput-root"],
            bgcolor: isDark ? "rgba(255, 255, 255, 0.03)" : "rgba(15, 23, 42, 0.05)",
          },
          "& .MuiInputBase-input.Mui-disabled": {
            WebkitTextFillColor: theme.palette.text.secondary,
          },
        }}
      />

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

      {label("CEP")}
      <TextField
        fullWidth
        disabled={!isEditingDados}
        name="cep"
        value={formatCep(formData.cep)}
        onChange={handleInputChange}
        onBlur={handleCepBlur}
        error={Boolean(fieldError("cep"))}
        helperText={fieldError("cep") || (cepLoading ? "Buscando endereço..." : (isEditingDados ? "Preencha o CEP para atualizar o endereço automaticamente." : ""))}
        sx={inputStyles}
      />

      {label("Rua")}
      <TextField fullWidth disabled name="rua" value={formData.rua} onChange={handleInputChange} error={Boolean(fieldError("rua"))} helperText={fieldError("rua") || "Preenchido automaticamente pelo CEP."} sx={inputStyles} />

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
      <TextField fullWidth disabled name="bairro" value={formData.bairro} onChange={handleInputChange} error={Boolean(fieldError("bairro"))} helperText={fieldError("bairro") || "Preenchido automaticamente pelo CEP."} sx={inputStyles} />

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", md: "1fr 1fr" }, gap: 2 }}>
        <Box>
          {label("Cidade")}
          <TextField fullWidth disabled name="cidade" value={formData.cidade} onChange={handleInputChange} error={Boolean(fieldError("cidade"))} helperText={fieldError("cidade") || "Preenchido automaticamente pelo CEP."} sx={inputStyles} />
        </Box>
        <Box>
          {label("Estado")}
          <FormControl fullWidth error={Boolean(fieldError("estado"))} sx={inputStyles}>
            <Select
              displayEmpty
              disabled
              name="estado"
              value={formData.estado}
              onChange={handleInputChange}
              renderValue={(selected) => selected || "Selecione o estado"}
              MenuProps={{ PaperProps: { sx: { maxHeight: 320 } } }}
            >
              <MenuItem value="" disabled>
                Selecione o estado
              </MenuItem>
              {ESTADOS_BRASIL.map((estado) => (
                <MenuItem key={estado} value={estado}>
                  {estado}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          {fieldError("estado") && (
            <Typography variant="caption" color="error" sx={{ display: "block", mt: -1, mb: 2 }}>
              {fieldError("estado")}
            </Typography>
          )}
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

      <Alert severity="info" sx={{ mb: 2 }}>
        Use apenas categorias já aprovadas na grade. Se precisar de uma nova, faça a solicitação na aba "Solicitações de Categoria".
      </Alert>

      {fieldErrors.gradeAtividades && <Alert severity="error" sx={{ mb: 2 }}>{fieldErrors.gradeAtividades}</Alert>}

      {gradeAtividades.length === 0 && !isEditingAtividades && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Você ainda não possui atividades cadastradas no perfil.
        </Alert>
      )}

      {gradeAtividades.slice(0, atividadesVisiveis).map((grade, index) => (
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

          <CategoriaSelectField
            label="Categoria"
            value={grade.categoriaNome}
            onChange={({ id, nome }) =>
              setGradeAtividades((prev) =>
                prev.map((item, i) => i === index ? { ...item, categoriaId: id, categoriaNome: nome } : item)
              )
            }
            disabled={!isEditingAtividades}
            disabledOptions={gradeAtividades.filter((_, i) => i !== index).map((g) => g.categoriaNome).filter(Boolean)}
            error={Boolean(fieldErrors.gradeAtividades) && !grade.categoriaId}
            sx={inputStyles}
          />

          {label("Dias da semana")}
          {tagSelector(index, "diasSemana", DIAS_SEMANA)}

          {label("Períodos")}
          {tagSelector(index, "periodos", PERIODOS)}
        </Box>
      ))}

      {gradeAtividades.length > atividadesVisiveis && (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1, mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Mostrando {Math.min(atividadesVisiveis, gradeAtividades.length)} de {gradeAtividades.length} atividades
          </Typography>
          <Button type="button" variant="outlined" onClick={() => setAtividadesVisiveis((c) => c + ATIVIDADES_POR_PAGINA)} sx={{ borderRadius: 2, px: 4, fontWeight: 800 }}>
            Ver mais
          </Button>
        </Box>
      )}

      {isEditingAtividades && (
        <Button
          type="button"
          variant="outlined"
          startIcon={<FaPlus />}
          onClick={() => {
            setGradeAtividades((prev) => [...prev, gradeInicial]);
            setAtividadesVisiveis((c) => Math.max(c, gradeAtividades.length + 1));
          }}
          sx={{ borderRadius: 2, fontWeight: 800, mb: 3 }}
        >
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
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
            Galeria
          </Typography>
          <Typography color="text.secondary">
            {isEditingGaleria
              ? `Selecione até ${MAX_FOTOS} fotos para mostrar seu espaço.`
              : "Clique em editar para alterar as fotos da galeria."}
          </Typography>
        </Box>

        {!isEditingGaleria && (
          <Button type="button" variant="contained" startIcon={<FaEdit />} onClick={startEditarGaleria} sx={{ borderRadius: 2, px: 2.5, py: 1.15, fontWeight: 900, flexShrink: 0 }}>
            Editar galeria
          </Button>
        )}
      </Box>

      {fotosUrl.length === 0 && !isEditingGaleria && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Você ainda não adicionou fotos à galeria.
        </Alert>
      )}

      <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2, mb: 3 }}>
        {fotosUrl.map((foto, index) => (
          <Box key={`${foto}-${index}`} sx={{ position: "relative", aspectRatio: "16 / 10", borderRadius: 2, overflow: "hidden", border: "1px solid", borderColor: "divider" }}>
            <Box component="img" src={foto} alt={`Foto ${index + 1}`} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {isEditingGaleria && (
              <Button type="button" color="error" onClick={() => setFotosUrl((prev) => prev.filter((_, itemIndex) => itemIndex !== index))} sx={{ position: "absolute", top: 8, right: 8, minWidth: 0, width: 36, height: 36, borderRadius: 2, bgcolor: "background.paper" }}>
                <FaTrash size={14} />
              </Button>
            )}
          </Box>
        ))}

        {isEditingGaleria && fotosUrl.length < MAX_FOTOS && (
          <Button component="label" variant="outlined" sx={{ aspectRatio: "16 / 10", borderRadius: 2, borderStyle: "dashed", display: "flex", flexDirection: "column", gap: 1, fontWeight: 900 }}>
            <FaImage size={24} />
            Adicionar fotos
            <input type="file" accept="image/*" multiple hidden onChange={handleFotosChange} />
          </Button>
        )}
      </Box>

      {isEditingGaleria && (
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, flexWrap: "wrap" }}>
          <Typography variant="body2" color="text.secondary" fontWeight={700}>
            {fotosUrl.length}/{MAX_FOTOS} fotos selecionadas
          </Typography>
          <Box sx={{ display: "flex", gap: 1.5, flexWrap: "wrap" }}>
            <Button type="button" variant="outlined" startIcon={<FaTimes />} disabled={saving} onClick={cancelEditarGaleria} sx={{ borderRadius: 2, px: 3, py: 1.25, fontWeight: 900 }}>
              Cancelar
            </Button>
            <Button variant="contained" startIcon={<FaSave />} disabled={saving} onClick={handleSalvarGaleria} sx={{ borderRadius: 2, px: 3, py: 1.25, fontWeight: 900 }}>
              {saving ? "Salvando..." : "Salvar galeria"}
            </Button>
          </Box>
        </Box>
      )}
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
        Para confirmar a exclusão, digite EXCLUIR no campo abaixo.
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

      <Paper elevation={0} sx={{ borderRadius: 2, border: "1px solid", borderColor: "divider", bgcolor: "background.paper", overflow: "hidden" }}>
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
          <Tab label="Solicitações de Categoria" />
          <Tab label="Galeria" />
          <Tab label="Excluir conta" />
        </Tabs>

        <Box sx={{ p: { xs: 2.5, md: 4 } }}>
          {activeSection === 0 && renderDados()}
          {activeSection === 1 && renderAtividades()}
          {activeSection === 2 && (
            <CategoriaSolicitacoesSection onRefreshCategoriasOficiais={async () => {}} />
          )}
          {activeSection === 3 && renderGaleria()}
          {activeSection === 4 && renderExcluirConta()}
        </Box>
      </Paper>
    </Box>
  );
};

export default ConfiguracaoEstabelecimento;

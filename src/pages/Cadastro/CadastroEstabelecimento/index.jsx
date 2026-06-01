import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { FaEye, FaEyeSlash, FaImage, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CategoriaSelectField from "../../../components/CategoriaSelectField";
import PrivacyPolicyConsent from "../../../components/PrivacyPolicyConsent";
import { estabelecimentoService } from "../../../service/EstabelecimentoService";

const DIAS_SEMANA = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO", "DOMINGO"];
const PERIODOS = ["MANHA", "TARDE", "NOITE"];
const MAX_FOTOS = 6;

const formInicial = {
  nomeFantasia: "",
  razaoSocial: "",
  email: "",
  senha: "",
  confirmarSenha: "",
  telefone: "",
  cnpj: "",
  rua: "",
  numero: "",
  complemento: "",
  bairro: "",
  cidade: "",
  estado: "",
  cep: "",
  fotosUrl: [],
  latitude: null,
  longitude: null,
};

const gradeInicial = { categoriaId: null, categoriaNome: "", exclusivoMulheres: false, diasSemana: [], periodos: [] };

const onlyDigits = (value) => value.replace(/\D/g, "");
const validarSenha = (senha) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(senha);

const formatTelefone = (value) => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatCnpj = (value) => {
  const digits = onlyDigits(value).slice(0, 14);
  return digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

const formatCep = (value) => {
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

  if (data && typeof data === "object" && !Array.isArray(data)) {
    const { erro, ...fieldErrors } = data;
    return { fieldErrors, generalError: erro || "" };
  }

  return {
    fieldErrors: {},
    generalError: typeof data === "string" ? data : error?.message || "Ocorreu um erro ao realizar o cadastro.",
  };
};

const CadastroEstabelecimento = ({ onSuccess }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === "dark";

  const [formData, setFormData] = useState(formInicial);
  const [step, setStep] = useState(0);
  const [gradeAtividades, setGradeAtividades] = useState([gradeInicial]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [privacyAccepted, setPrivacyAccepted] = useState(false);
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [geocodeLoading, setGeocodeLoading] = useState(false);

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(16, 185, 129, 0.05)",
      borderRadius: 2,
      "& fieldset": { borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(16, 185, 129, 0.2)" },
      "&:hover fieldset": { borderColor: theme.palette.primary.main },
    },
    mb: 2,
  };

  const label = (text) => (
    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
      {text}
    </Typography>
  );

  const limparErro = (name) => {
    setFieldErrors((prev) => ({ ...prev, [name]: "", [`endereco.${name}`]: "" }));
    setGeneralError("");
  };

  const fieldError = (name) => fieldErrors[name] || fieldErrors[`endereco.${name}`] || "";

  const atualizarCoordenadas = async (address) => {
    if (!hasAddressFields(address)) return false;

    setGeocodeLoading(true);
    try {
      const query = buildGeocodeQuery(address);
      const geoResponse = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&limit=1&countrycodes=br&addressdetails=1&q=${encodeURIComponent(query)}`
      );

      if (!geoResponse.ok) {
        throw new Error("Falha ao buscar coordenadas.");
      }

      const geoData = await geoResponse.json();
      if (!geoData || geoData.length === 0) {
        setFieldErrors((prev) => ({
          ...prev,
          rua: prev.rua || "Não foi possível localizar esse endereço com precisão.",
        }));
        return false;
      }

      setFormData((prev) => ({
        ...prev,
        latitude: parseFloat(geoData[0].lat),
        longitude: parseFloat(geoData[0].lon),
      }));

      return true;
    } catch (geoError) {
      console.warn("Erro ao buscar coordenadas:", geoError);
      return false;
    } finally {
      setGeocodeLoading(false);
    }
  };

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
        setFieldErrors((prev) => ({
          ...prev,
          cep: "CEP não encontrado.",
          "endereco.cep": "CEP não encontrado.",
        }));
        return;
      }

      setFormData((prev) => ({
        ...prev,
        rua: data.logradouro || "",
        bairro: data.bairro || "",
        cidade: data.localidade || "",
        estado: (data.uf || "").toUpperCase(),
      }));

      setFieldErrors((prev) => ({
        ...prev,
        cep: "",
        "endereco.cep": "",
        rua: "",
        "endereco.rua": "",
        bairro: "",
        "endereco.bairro": "",
        cidade: "",
        "endereco.cidade": "",
        estado: "",
        "endereco.estado": "",
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

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const nextValue = {
      telefone: onlyDigits(value).slice(0, 11),
      cnpj: onlyDigits(value).slice(0, 14),
      cep: onlyDigits(value).slice(0, 8),
      estado: value.toUpperCase().slice(0, 2),
    }[name] ?? value;

    setFormData((prev) => ({
      ...prev,
      [name]: nextValue,
      ...(["rua", "numero", "bairro", "cidade", "estado", "cep", "complemento"].includes(name)
        ? { latitude: null, longitude: null }
        : {}),
    }));
    limparErro(name);
  };

  const handleCepBlur = () => preencherEnderecoPorCep(formData.cep);

  const handleFotosChange = (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;

    const availableSlots = MAX_FOTOS - formData.fotosUrl.length;
    const selectedFiles = files.slice(0, availableSlots);

    if (files.length > availableSlots) {
      toast.info(`A galeria permite até ${MAX_FOTOS} imagens.`);
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
      setFormData((prev) => ({
        ...prev,
        fotosUrl: [...prev.fotosUrl, ...images.filter(Boolean)].slice(0, MAX_FOTOS),
      }));
      setFieldErrors((prev) => ({ ...prev, fotoUrl: "", fotosUrl: "" }));
    });

    event.target.value = "";
  };

  const handleRemoveFoto = (indexToRemove) => {
    setFormData((prev) => ({
      ...prev,
      fotosUrl: prev.fotosUrl.filter((_, index) => index !== indexToRemove),
    }));
    setFieldErrors((prev) => ({ ...prev, fotoUrl: "", fotosUrl: "" }));
  };

  const handleGradeChange = (index, name, value) => {
    setGradeAtividades((prev) => prev.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [name]: value } : item
    )));
    limparErro("gradeAtividades");
  };

  const validarEtapaUm = () => {
    const errors = {};

    if (!formData.nomeFantasia.trim()) errors.nomeFantasia = "Informe o nome fantasia";
    if (!formData.razaoSocial.trim()) errors.razaoSocial = "Informe a razão social";
    if (!formData.email.trim()) errors.email = "Informe o email";
    if (!formData.telefone.trim()) errors.telefone = "Informe o telefone";
    if (!formData.cnpj.trim()) errors.cnpj = "Informe o CNPJ";
    if (!formData.rua.trim()) errors.rua = "Informe a rua";
    if (!formData.numero.trim()) errors.numero = "Informe o número";
    if (!formData.bairro.trim()) errors.bairro = "Informe o bairro";
    if (!formData.cidade.trim()) errors.cidade = "Informe a cidade";
    if (!formData.estado.trim()) errors.estado = "Informe o estado";
    if (!formData.cep.trim()) errors.cep = "Informe o CEP";
    if (!formData.fotosUrl.length) errors.fotosUrl = "Selecione pelo menos uma imagem";
    if (formData.fotosUrl.length > MAX_FOTOS) errors.fotosUrl = `Selecione no máximo ${MAX_FOTOS} imagens`;
    if (formData.senha !== formData.confirmarSenha) errors.confirmarSenha = "As senhas não coincidem";
    if (!validarSenha(formData.senha)) {
      errors.senha = "A senha deve ter no mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial.";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validarGrade = () => {
    if (!privacyAccepted) {
      setFieldErrors((prev) => ({
        ...prev,
        privacyAccepted: "Voce precisa aceitar a Politica de Privacidade para continuar.",
      }));
      return false;
    }

    const invalida = gradeAtividades.some((item) => (
      !item.categoriaId ||
      !item.diasSemana.length ||
      !item.periodos.length
    ));
    if (!invalida) return true;

    setFieldErrors((prev) => ({
      ...prev,
      gradeAtividades: "Informe uma categoria válida, os dias da semana e o período em todas as atividades.",
    }));
    return false;
  };

  const payload = () => ({
    nomeFantasia: formData.nomeFantasia,
    razaoSocial: formData.razaoSocial,
    email: formData.email,
    senha: formData.senha,
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
    },
    gradeAtividades: gradeAtividades
      .filter((item) => item.categoriaId)
      .map((item) => ({
        categoriaId: item.categoriaId,
        exclusivoMulheres: Boolean(item.exclusivoMulheres),
        diasSemana: item.diasSemana,
        periodos: item.periodos,
      })),
    fotosUrl: formData.fotosUrl.slice(0, MAX_FOTOS),
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (step === 0) {
      if (validarEtapaUm()) {
        const coordenadasOk = await atualizarCoordenadas(formData);
        if (!coordenadasOk) {
          setGeneralError("Revise o endereço e o número para encontrarmos a localização correta do estabelecimento.");
          return;
        }
        setStep(1);
        setFieldErrors({});
      }
      return;
    }

    if (!validarGrade()) return;

    setLoading(true);
    try {
      if (!formData.latitude || !formData.longitude) {
        const coordenadasOk = await atualizarCoordenadas(formData);
        if (!coordenadasOk) {
          setGeneralError("Não foi possível confirmar a localização do endereço informado.");
          return;
        }
      }
      await estabelecimentoService.cadastrarEstabelecimento(payload());
      toast.success("Estabelecimento cadastrado com sucesso!");
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/login", { state: { accountType: "estabelecimento", email: formData.email } });
      }
    } catch (error) {
      const { fieldErrors: apiFieldErrors, generalError: apiGeneralError } = getApiError(error);
      setFieldErrors(apiFieldErrors);
      setGeneralError(apiGeneralError);
    } finally {
      setLoading(false);
    }
  };

  const passwordFields = () => (
    <Box sx={{ display: "flex", gap: 2, mb: 2, flexDirection: { xs: "column", sm: "row" } }}>
      <Box sx={{ flex: 1 }}>
        {label("Senha")}
        <TextField
          fullWidth
          name="senha"
          type={showPassword ? "text" : "password"}
          value={formData.senha}
          onChange={handleInputChange}
          placeholder="********"
          required
          error={Boolean(fieldErrors.senha)}
          helperText={fieldErrors.senha}
          sx={inputStyles}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
      <Box sx={{ flex: 1 }}>
        {label("Confirmar Senha")}
        <TextField
          fullWidth
          name="confirmarSenha"
          type={showConfirmPassword ? "text" : "password"}
          value={formData.confirmarSenha}
          onChange={handleInputChange}
          placeholder="********"
          required
          error={Boolean(fieldErrors.confirmarSenha)}
          helperText={fieldErrors.confirmarSenha}
          sx={inputStyles}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                  {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </Box>
    </Box>
  );

  const etapaUm = () => (
    <>
      <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
        <Box sx={{ flex: 1 }}>
          {label("Nome fantasia")}
          <TextField fullWidth name="nomeFantasia" value={formData.nomeFantasia} onChange={handleInputChange} placeholder="IlhaFit Centro" error={Boolean(fieldErrors.nomeFantasia)} helperText={fieldErrors.nomeFantasia} sx={inputStyles} required />
        </Box>
        <Box sx={{ flex: 1 }}>
          {label("Razão social")}
          <TextField fullWidth name="razaoSocial" value={formData.razaoSocial} onChange={handleInputChange} placeholder="IlhaFit Academia LTDA" error={Boolean(fieldErrors.razaoSocial)} helperText={fieldErrors.razaoSocial} sx={inputStyles} required />
        </Box>
      </Box>

      {label("Email")}
      <TextField fullWidth name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="academia@example.com" error={Boolean(fieldErrors.email)} helperText={fieldErrors.email} sx={inputStyles} required />

      <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
        <Box sx={{ flex: 1 }}>
          {label("Telefone")}
          <TextField fullWidth name="telefone" value={formatTelefone(formData.telefone)} onChange={handleInputChange} placeholder="(11) 99999-9999" error={Boolean(fieldErrors.telefone)} helperText={fieldErrors.telefone} sx={inputStyles} required />
        </Box>
        <Box sx={{ flex: 1 }}>
          {label("CNPJ")}
          <TextField fullWidth name="cnpj" value={formatCnpj(formData.cnpj)} onChange={handleInputChange} placeholder="12.345.678/0001-99" error={Boolean(fieldErrors.cnpj)} helperText={fieldErrors.cnpj} sx={inputStyles} required />
        </Box>
      </Box>

      <Typography variant="h6" fontWeight={800} sx={{ mb: 2, color: "text.primary" }}>
        Endereço
      </Typography>

      {label("CEP")}
      <TextField
        fullWidth
        name="cep"
        value={formatCep(formData.cep)}
        onChange={handleInputChange}
        onBlur={handleCepBlur}
        placeholder="01001-000"
        error={Boolean(fieldError("cep"))}
        helperText={fieldError("cep") || (cepLoading ? "Buscando endereço..." : "")}
        sx={inputStyles}
        required
      />

      {geocodeLoading && (
        <Alert severity="info" sx={{ mb: 2 }}>
          Validando a localização exata do endereço informado...
        </Alert>
      )}

      {label("Rua")}
      <TextField fullWidth name="rua" value={formData.rua} onChange={handleInputChange} placeholder="Rua A" error={Boolean(fieldError("rua"))} helperText={fieldError("rua")} sx={inputStyles} required />

      {label("Bairro")}
      <TextField fullWidth name="bairro" value={formData.bairro} onChange={handleInputChange} placeholder="Centro" error={Boolean(fieldError("bairro"))} helperText={fieldError("bairro")} sx={inputStyles} required />

      <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
        <Box sx={{ flex: 1 }}>
          {label("Cidade")}
          <TextField fullWidth name="cidade" value={formData.cidade} onChange={handleInputChange} placeholder="Florianópolis" error={Boolean(fieldError("cidade"))} helperText={fieldError("cidade")} sx={inputStyles} required />
        </Box>
        <Box sx={{ flex: 1 }}>
          {label("Estado")}
          <TextField fullWidth name="estado" value={formData.estado} onChange={handleInputChange} placeholder="SC" error={Boolean(fieldError("estado"))} helperText={fieldError("estado")} sx={inputStyles} required />
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
        <Box sx={{ flex: 1 }}>
          {label("Número")}
          <TextField fullWidth name="numero" value={formData.numero} onChange={handleInputChange} placeholder="100" error={Boolean(fieldError("numero"))} helperText={fieldError("numero")} sx={inputStyles} required />
        </Box>
        <Box sx={{ flex: 1 }}>
          {label("Complemento")}
          <TextField fullWidth name="complemento" value={formData.complemento} onChange={handleInputChange} placeholder="Sala 1" error={Boolean(fieldError("complemento"))} helperText={fieldError("complemento")} sx={inputStyles} />
        </Box>
      </Box>

      {passwordFields()}

      <Box sx={{ mb: 2 }}>
        {label("Galeria de imagens")}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Adicione até {MAX_FOTOS} imagens do estabelecimento.
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2 }}>
          {formData.fotosUrl.map((foto, index) => (
            <Box
              key={`${foto}-${index}`}
              sx={{
                position: "relative",
                aspectRatio: "16 / 10",
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box component="img" src={foto} alt={`Preview ${index + 1}`} sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <Button
                type="button"
                color="error"
                onClick={() => handleRemoveFoto(index)}
                sx={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  minWidth: 0,
                  width: 36,
                  height: 36,
                  borderRadius: 2,
                  bgcolor: "background.paper",
                }}
              >
                <FaTrash size={14} />
              </Button>
            </Box>
          ))}

          {formData.fotosUrl.length < MAX_FOTOS && (
            <Button
              component="label"
              variant="outlined"
              sx={{
                aspectRatio: "16 / 10",
                borderRadius: 2,
                borderStyle: "dashed",
                borderColor: isDark ? "rgba(255, 255, 255, 0.14)" : "rgba(16, 185, 129, 0.25)",
                color: "text.secondary",
                display: "flex",
                flexDirection: "column",
                gap: 1,
                fontWeight: 700,
                textTransform: "none",
              }}
            >
              <FaImage size={22} />
              Adicionar imagens
              <Typography variant="caption" color="inherit">
                {formData.fotosUrl.length}/{MAX_FOTOS}
              </Typography>
              <input type="file" accept="image/*" multiple hidden onChange={handleFotosChange} />
            </Button>
          )}
        </Box>

        {(fieldErrors.fotosUrl || fieldErrors.fotoUrl) && (
          <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.75 }}>
            {fieldErrors.fotosUrl || fieldErrors.fotoUrl}
          </Typography>
        )}
      </Box>
    </>
  );

  const toggleGradeItem = (index, field, value) => {
    const selected = gradeAtividades[index][field];
    const nextValue = selected.includes(value)
      ? selected.filter((item) => item !== value)
      : [...selected, value];

    handleGradeChange(index, field, nextValue);
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
            onClick={() => toggleGradeItem(index, field, option)}
            sx={{
              bgcolor: selected ? "primary.main" : isDark ? "rgba(255,255,255,0.08)" : "rgba(15,23,42,0.08)",
              color: selected ? "primary.contrastText" : "text.primary",
              border: "1px solid",
              borderColor: selected ? "primary.main" : "divider",
              fontWeight: 700,
              "&:hover": {
                bgcolor: selected ? theme.palette.custom?.primaryHover || "primary.dark" : "rgba(16, 185, 129, 0.12)",
              },
            }}
          />
        );
      })}
    </Box>
  );

  const etapaDois = () => (
    <>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2, color: "text.primary" }}>
        Atividades oferecidas
      </Typography>

      <Alert severity="info" sx={{ mb: 2 }}>
        Não encontrou sua categoria? Conclua o cadastro e solicite uma nova na área de configurações.
      </Alert>

      {fieldErrors.gradeAtividades && <Alert severity="error" sx={{ mb: 2 }}>{fieldErrors.gradeAtividades}</Alert>}

      {gradeAtividades.map((grade, index) => (
        <Box key={`grade-${index}`} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2, mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={800} color="text.primary">
              Atividade {index + 1}
            </Typography>
            {gradeAtividades.length > 1 && (
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
            error={Boolean(fieldErrors.gradeAtividades) && !grade.categoriaId}
            sx={inputStyles}
          />

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
            Use apenas categorias já aprovadas. Novas categorias podem ser solicitadas depois nas configurações.
          </Typography>

          {label("Dias da semana")}
          {tagSelector(index, "diasSemana", DIAS_SEMANA)}

          {label("Períodos")}
          {tagSelector(index, "periodos", PERIODOS)}
        </Box>
      ))}

      <Button type="button" variant="outlined" onClick={() => setGradeAtividades((prev) => [...prev, gradeInicial])} sx={{ borderRadius: 2, fontWeight: 700 }}>
        Adicionar atividade
      </Button>

      <PrivacyPolicyConsent
        checked={privacyAccepted}
        onChange={(checked) => {
          setPrivacyAccepted(checked);
          if (checked) limparErro("privacyAccepted");
        }}
        error={fieldErrors.privacyAccepted}
      />
    </>
  );

  return (
    <form onSubmit={handleSubmit}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Etapa {step + 1} de 2
      </Typography>

      {generalError && <Alert severity="error" sx={{ mb: 2 }}>{generalError}</Alert>}
      {step === 0 ? etapaUm() : etapaDois()}

      <Box sx={{ display: "flex", gap: 2, mt: 2, flexDirection: { xs: "column", sm: "row" } }}>
        {step === 1 && (
          <Button type="button" variant="outlined" fullWidth onClick={() => setStep(0)} sx={{ py: 1.5, borderRadius: 3, fontWeight: 700 }}>
            Voltar
          </Button>
        )}
        <Button
          type="submit"
          variant="contained"
          fullWidth
          disabled={loading}
          sx={{
            py: 1.5,
            borderRadius: 3,
            fontWeight: 700,
            fontSize: "1rem",
            textTransform: "none",
            boxShadow: `0 8px 16px ${isDark ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.3)"}`,
            "&:hover": { bgcolor: "primary.dark", transform: "translateY(-2px)", transition: "all 0.2s ease" },
          }}
        >
          {loading ? "Processando..." : step === 0 ? "Continuar" : "Cadastrar"}
        </Button>
      </Box>
    </form>
  );
};

export default CadastroEstabelecimento;

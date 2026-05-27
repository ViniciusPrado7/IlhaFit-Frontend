import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  FormControlLabel,
  IconButton,
  InputAdornment,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import { FaEye, FaEyeSlash, FaImage, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import CategoriaSelectField from "../../../components/CategoriaSelectField";
import PrivacyPolicyConsent from "../../../components/PrivacyPolicyConsent";
import { profissionalService } from "../../../service/ProfissionalService";

const DIAS_SEMANA = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO", "DOMINGO"];
const PERIODOS = ["MANHA", "TARDE", "NOITE"];

const formInicial = {
  nome: "",
  email: "",
  senha: "",
  confirmarSenha: "",
  telefone: "",
  cpf: "",
  genero: "",
  registroCref: "",
  regiao: "",
  fotoUrl: "",
};

const gradeInicial = { atividade: "", exclusivoMulheres: false, diasSemana: [], periodos: [] };

const onlyDigits = (value) => value.replace(/\D/g, "");
const validarSenha = (senha) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(senha);

const formatTelefone = (value) => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatCpf = (value) => {
  const digits = onlyDigits(value).slice(0, 11);
  return digits
    .replace(/^(\d{3})(\d)/, "$1.$2")
    .replace(/^(\d{3})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1-$2");
};

const formatCref = (value) => {
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

const CadastroProfissional = () => {
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
  const generoFeminino = formData.genero === "FEMININO";

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
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    setGeneralError("");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === "checkbox"
      ? checked
      : {
        nome: value.replace(/\d/g, ""),
        telefone: onlyDigits(value).slice(0, 11),
        cpf: onlyDigits(value).slice(0, 11),
        registroCref: formatCref(value),
        regiao: value.slice(0, 60),
      }[name] ?? value;

    setFormData((prev) => {
      const nextData = { ...prev, [name]: nextValue };
      if (name === "genero" && nextValue !== "FEMININO") {
        setGradeAtividades((current) => current.map((item) => ({ ...item, exclusivoMulheres: false })));
      }
      return nextData;
    });
    limparErro(name);
  };

  const handleFotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      setFormData((prev) => ({ ...prev, fotoUrl: reader.result || "" }));
      setFieldErrors((prev) => ({ ...prev, fotoUrl: "" }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removerFoto = () => {
    setFormData((prev) => ({ ...prev, fotoUrl: "" }));
    limparErro("fotoUrl");
  };

  const handleGradeChange = (index, name, value) => {
    setGradeAtividades((prev) => prev.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [name]: value } : item
    )));
    limparErro("gradeAtividades");
  };

  const validarEtapaUm = () => {
    const errors = {};
    const toastMessages = [];

    if (!formData.nome.trim()) {
      errors.nome = "Informe o nome";
      toastMessages.push("Informe o nome");
    } else if (/\d/.test(formData.nome)) {
      errors.nome = "O nome não pode conter números";
      toastMessages.push("O nome não pode conter números");
    }

    if (!formData.email.trim()) {
      errors.email = "Informe o email";
      toastMessages.push("Informe o email");
    }

    if (!formData.telefone.trim()) {
      errors.telefone = "Informe o telefone";
      toastMessages.push("Informe o telefone");
    } else if (onlyDigits(formData.telefone).length !== 11) {
      errors.telefone = "O telefone deve conter todos os 11 dígitos (com DDD)";
      toastMessages.push("O telefone deve conter todos os 11 dígitos (com DDD)");
    }

    if (!formData.cpf.trim()) {
      errors.cpf = "Informe o CPF";
      toastMessages.push("Informe o CPF");
    } else if (onlyDigits(formData.cpf).length !== 11) {
      errors.cpf = "O CPF deve conter 11 dígitos";
      toastMessages.push("O CPF deve conter 11 dígitos");
    }

    if (!formData.regiao.trim()) {
      errors.regiao = "Informe a Região";
      toastMessages.push("Informe a Região");
    }

    if (formData.registroCref && !/^\d{6}-[A-Z]\/[A-Z]{2}$/.test(formData.registroCref)) {
      errors.registroCref = "CREF deve ser completo (ex: 123456-G/SP)";
      toastMessages.push("CREF deve ser completo (ex: 123456-G/SP)");
    }

    if (!formData.senha) {
      errors.senha = "Informe a senha";
      toastMessages.push("Informe a senha");
    } else if (!validarSenha(formData.senha)) {
      errors.senha = "Senha deve ter no mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial";
      toastMessages.push("Senha deve ter no mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 número e 1 caractere especial");
    }

    if (formData.senha !== formData.confirmarSenha) {
      errors.confirmarSenha = "As senhas não coincidem";
      toastMessages.push("As senhas não coincidem");
    }

    if (!formData.fotoUrl) {
      errors.fotoUrl = "Selecione uma foto";
      toastMessages.push("Selecione uma foto");
    }

    if (toastMessages.length > 0) {
      toast.error(toastMessages[0]);
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validarGrade = () => {
    const errors = {};
    const toastMessages = [];

    if (!formData.genero) {
      errors.genero = "Selecione o gênero";
      toastMessages.push("Selecione o gênero");
    }

    if (!privacyAccepted) {
      errors.privacyAccepted = "Você precisa aceitar a Política de Privacidade para continuar.";
      toastMessages.push("Você precisa aceitar a Política de Privacidade para continuar.");
    }

    const invalida = gradeAtividades.some((item) => (
      !item.atividade ||
      !item.diasSemana.length ||
      !item.periodos.length
    ));

    if (invalida) {
      errors.gradeAtividades = "Informe uma categoria válida, dias da semana e período em todas as atividades.";
      toastMessages.push("Informe uma categoria válida, dias da semana e período em todas as atividades.");
    }

    if (toastMessages.length > 0) {
      toast.error(toastMessages[0]);
    }

    setFieldErrors((prev) => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const payload = () => ({
    nome: formData.nome,
    email: formData.email,
    senha: formData.senha,
    telefone: formData.telefone,
    cpf: formData.cpf,
    sexo: formData.genero,
    registroCref: formData.registroCref.trim() || null,
    regiao: formData.regiao.trim(),
    exclusivoMulheres: generoFeminino && gradeAtividades.some((item) => item.exclusivoMulheres),
    gradeAtividades: gradeAtividades
      .filter((item) => item.atividade)
      .map((item) => ({
        atividade: item.atividade,
        exclusivoMulheres: generoFeminino ? item.exclusivoMulheres : false,
        diasSemana: item.diasSemana,
        periodos: item.periodos,
      })),
    fotoUrl: formData.fotoUrl || null,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setGeneralError("");

    if (step === 0) {
      if (validarEtapaUm()) {
        setStep(1);
        setFieldErrors({});
      }
      return;
    }

    if (!validarGrade()) return;

    setLoading(true);
    try {
      await profissionalService.cadastrarProfissional(payload());
      toast.success("Profissional cadastrado com sucesso!");
      navigate("/login", { state: { accountType: "profissional", email: formData.email } });
    } catch (error) {
      const { fieldErrors: apiFieldErrors, generalError: apiGeneralError } = getApiError(error);
      setFieldErrors(apiFieldErrors);
      setGeneralError(apiGeneralError);

      if (apiGeneralError) {
        toast.error(apiGeneralError);
      } else {
        const apiErrorsOrder = [
          "nome",
          "email",
          "telefone",
          "cpf",
          "regiao",
          "registroCref",
          "senha",
          "confirmarSenha",
          "fotoUrl",
          "genero",
          "gradeAtividades",
        ];

        const firstFieldWithError = apiErrorsOrder.find((field) => apiFieldErrors[field]);
        if (firstFieldWithError) {
          toast.error(apiFieldErrors[firstFieldWithError]);
        }
      }
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

  const etapaUm = () => (
    <>
      {label("Nome")}
      <TextField fullWidth name="nome" value={formData.nome} onChange={handleInputChange} placeholder="Maria Personal" error={Boolean(fieldErrors.nome)} helperText={fieldErrors.nome} sx={inputStyles} required />

      {label("Email")}
      <TextField fullWidth name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="maria.personal@example.com" error={Boolean(fieldErrors.email)} helperText={fieldErrors.email} sx={inputStyles} required />

      <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
        <Box sx={{ flex: 1 }}>
          {label("Telefone")}
          <TextField fullWidth name="telefone" value={formatTelefone(formData.telefone)} onChange={handleInputChange} placeholder="(11) 99999-9999" error={Boolean(fieldErrors.telefone)} helperText={fieldErrors.telefone} sx={inputStyles} required />
        </Box>
        <Box sx={{ flex: 1 }}>
          {label("CPF")}
          <TextField fullWidth name="cpf" value={formatCpf(formData.cpf)} onChange={handleInputChange} placeholder="123.456.789-00" error={Boolean(fieldErrors.cpf)} helperText={fieldErrors.cpf} sx={inputStyles} required />
        </Box>
      </Box>

      <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
        <Box sx={{ flex: 1 }}>
          {label("Região")}
          <TextField fullWidth name="regiao" value={formData.regiao} onChange={handleInputChange} placeholder="Zona Sul" error={Boolean(fieldErrors.regiao)} helperText={fieldErrors.regiao} sx={inputStyles} required />
        </Box>
        <Box sx={{ flex: 1 }}>
          {label("CREF")}
          <TextField
            fullWidth
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

      {passwordFields()}

      <Box sx={{ mb: 2 }}>
        {label("Foto de perfil")}
        <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
          Selecione uma foto para seu perfil no IlhaFit.
        </Typography>

        <Box sx={{ display: "grid", gridTemplateColumns: { xs: "1fr", sm: "repeat(2, 1fr)", md: "repeat(3, 1fr)" }, gap: 2 }}>
          {formData.fotoUrl ? (
            <Box
              sx={{
                position: "relative",
                aspectRatio: "16 / 10",
                borderRadius: 2,
                overflow: "hidden",
                border: "1px solid",
                borderColor: "divider",
              }}
            >
              <Box component="img" src={formData.fotoUrl} alt="Preview do profissional" sx={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <Button
                type="button"
                color="error"
                onClick={removerFoto}
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
          ) : (
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
              Adicionar foto
              <input type="file" accept="image/*" hidden onChange={handleFotoChange} />
            </Button>
          )}
        </Box>

        {fieldErrors.fotoUrl && (
          <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.75 }}>
            {fieldErrors.fotoUrl}
          </Typography>
        )}
      </Box>
    </>
  );

  const etapaDois = () => (
    <>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2, color: "text.primary" }}>
        Perfil profissional
      </Typography>

      {label("Gênero")}
      <ToggleButtonGroup
        value={formData.genero}
        exclusive
        onChange={(_, value) => {
          if (value) {
            handleInputChange({ target: { name: "genero", value } });
          }
        }}
        fullWidth
        sx={{
          mb: 2,
          gap: 1,
          "& .MuiToggleButton-root": {
            border: "1px solid !important",
            borderColor: "divider !important",
            borderRadius: "12px !important",
            color: "text.secondary",
            textTransform: "none",
            fontWeight: 700,
            py: 1.25,
            "&.Mui-selected": {
              bgcolor: "primary.main",
              color: "white",
              "&:hover": { bgcolor: "primary.dark" },
            },
          },
        }}
      >
        <ToggleButton value="FEMININO">FEMININO</ToggleButton>
        <ToggleButton value="MASCULINO">MASCULINO</ToggleButton>
      </ToggleButtonGroup>

      {fieldErrors.genero && <Alert severity="error" sx={{ mb: 2 }}>{fieldErrors.genero}</Alert>}

      <Typography variant="h6" fontWeight={800} sx={{ mb: 2, color: "text.primary" }}>
        Grade de atividades
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
            label="Atividade"
            value={grade.atividade}
            onChange={(nextValue) => handleGradeChange(index, "atividade", nextValue)}
            error={Boolean(fieldErrors.gradeAtividades) && !grade.atividade}
            sx={inputStyles}
          />

          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 2 }}>
            Use apenas categorias já aprovadas. Novas categorias podem ser solicitadas depois nas configurações.
          </Typography>

          {generoFeminino && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={grade.exclusivoMulheres}
                  onChange={(e) => handleGradeChange(index, "exclusivoMulheres", e.target.checked)}
                />
              }
              label="Esta atividade é exclusiva para mulheres"
              sx={{ mb: 1, color: "text.secondary" }}
            />
          )}

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

export default CadastroProfissional;

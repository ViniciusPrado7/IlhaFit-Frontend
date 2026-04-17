import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Chip,
  Checkbox,
  FormControl,
  FormControlLabel,
  IconButton,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  useTheme,
} from "@mui/material";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { categoriaService } from "../../../service/CategoriaService";
import { profissionalService } from "../../../service/ProfissionalService";

const DIAS_SEMANA = ["SEGUNDA", "TERCA", "QUARTA", "QUINTA", "SEXTA", "SABADO", "DOMINGO"];
const PERIODOS = ["MANHA", "TARDE", "NOITE"];
const GENEROS = ["FEMININO", "MASCULINO"];
const NOVA_CATEGORIA_VALUE = "__nova_categoria__";

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

const getCategoriaNome = (categoria) => {
  if (typeof categoria === "string") return categoria;
  return categoria?.nome || categoria?.nomeCategoria || categoria?.atividade || categoria?.name || "";
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
  const [categorias, setCategorias] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [loading, setLoading] = useState(false);
  const [categoriaLoading, setCategoriaLoading] = useState(false);
  const generoFeminino = formData.genero === "FEMININO";

  useEffect(() => {
    const carregarCategorias = async () => {
      try {
        const response = await categoriaService.listarCategorias();
        setCategorias(Array.isArray(response.data) ? response.data : []);
      } catch (error) {
        console.warn("Erro ao carregar categorias:", error);
      }
    };

    carregarCategorias();
  }, []);

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
    setFieldErrors(prev => ({ ...prev, [name]: "" }));
    setGeneralError("");
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const nextValue = type === "checkbox"
      ? checked
      : {
        telefone: onlyDigits(value).slice(0, 11),
        cpf: onlyDigits(value).slice(0, 11),
        registroCref: formatCref(value),
        regiao: value.slice(0, 60),
      }[name] ?? value;

    setFormData(prev => {
      const nextData = { ...prev, [name]: nextValue };
      if (name === "genero" && nextValue !== "FEMININO") {
        setGradeAtividades(current => current.map((item) => ({ ...item, exclusivoMulheres: false })));
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
      setFormData(prev => ({ ...prev, fotoUrl: reader.result || "" }));
      setFieldErrors(prev => ({ ...prev, fotoUrl: "" }));
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const removerFoto = () => {
    setFormData(prev => ({ ...prev, fotoUrl: "" }));
    limparErro("fotoUrl");
  };

  const handleGradeChange = (index, name, value) => {
    setGradeAtividades(prev => prev.map((item, itemIndex) => (
      itemIndex === index ? { ...item, [name]: value } : item
    )));
    limparErro("gradeAtividades");
  };

  const cadastrarCategoria = async (gradeIndex) => {
    const nome = novaCategoria.trim();
    if (!nome) return;

    setCategoriaLoading(true);
    try {
      const response = await categoriaService.cadastrarCategoria({ nome });
      const categoriaCriada = response.data?.categoria || response.data || { nome };
      const nomeCriado = getCategoriaNome(categoriaCriada) || nome;

      setCategorias(prev => [...prev, categoriaCriada]);
      setGradeAtividades(prev => prev.map((item, index) => (
        index === gradeIndex ? { ...item, atividade: nomeCriado } : item
      )));
      setNovaCategoria("");
      toast.success("Categoria cadastrada!");
    } catch (error) {
      const { generalError: apiGeneralError } = getApiError(error);
      setGeneralError(apiGeneralError || "Nao foi possivel cadastrar a categoria.");
    } finally {
      setCategoriaLoading(false);
    }
  };

  const validarEtapaUm = () => {
    const errors = {};

    if (!formData.nome.trim()) errors.nome = "Informe o nome";
    if (!formData.email.trim()) errors.email = "Informe o email";
    if (!formData.telefone.trim()) errors.telefone = "Informe o telefone";
    if (!formData.cpf.trim()) errors.cpf = "Informe o CPF";
    if (!formData.registroCref.trim()) errors.registroCref = "Informe o CREF";
    if (formData.registroCref && !/^\d{1,6}-[A-Z]\/[A-Z]{2}$/.test(formData.registroCref)) {
      errors.registroCref = "Use o formato 123456-G/SP";
    }
    if (!formData.regiao.trim()) errors.regiao = "Informe a regiao";
    if (!formData.fotoUrl) errors.fotoUrl = "Selecione uma foto";
    if (formData.senha !== formData.confirmarSenha) errors.confirmarSenha = "As senhas nao coincidem";
    if (!validarSenha(formData.senha)) {
      errors.senha = "Senha deve ter no minimo 8 caracteres, 1 maiuscula, 1 minuscula, 1 numero e 1 caractere especial";
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const validarGrade = () => {
    const errors = {};

    if (!formData.genero) errors.genero = "Selecione o genero";

    const invalida = gradeAtividades.some(item => (
      !item.atividade ||
      item.atividade === NOVA_CATEGORIA_VALUE ||
      !item.diasSemana.length ||
      !item.periodos.length
    ));

    if (invalida) {
      errors.gradeAtividades = "Informe atividade, dias da semana e periodo em todas as atividades.";
    }

    setFieldErrors(prev => ({ ...prev, ...errors }));
    return Object.keys(errors).length === 0;
  };

  const payload = () => ({
    nome: formData.nome,
    email: formData.email,
    senha: formData.senha,
    telefone: formData.telefone,
    cpf: formData.cpf,
    sexo: formData.genero,
    registroCref: formData.registroCref,
    exclusivoMulheres: generoFeminino && gradeAtividades.some((item) => item.exclusivoMulheres),
    gradeAtividades: gradeAtividades
      .filter(item => item.atividade && item.atividade !== NOVA_CATEGORIA_VALUE)
      .map(item => ({
        atividade: item.atividade,
        exclusivoMulheres: generoFeminino ? item.exclusivoMulheres : false,
        diasSemana: item.diasSemana,
        periodos: item.periodos,
      })),
    fotoUrl: formData.fotoUrl,
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
      ? selected.filter(item => item !== value)
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
          {label("Regiao")}
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
            required
          />
        </Box>
      </Box>

      {passwordFields()}

      <Box sx={{ mb: 2 }}>
        {label("Foto")}
        <Button
          component="label"
          variant="outlined"
          fullWidth
          sx={{
            py: 1.5,
            borderRadius: 2,
            borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(16, 185, 129, 0.2)",
            color: "text.secondary",
            justifyContent: "space-between",
          }}
        >
          <span>{formData.fotoUrl ? "Trocar imagem" : "Selecionar imagem"}</span>
          <input type="file" accept="image/*" hidden onChange={handleFotoChange} />
          {formData.fotoUrl && (
            <IconButton type="button" size="small" onClick={(event) => { event.preventDefault(); removerFoto(); }}>
              x
            </IconButton>
          )}
        </Button>
        {fieldErrors.fotoUrl && (
          <Typography variant="caption" color="error" sx={{ display: "block", mt: 0.5 }}>
            {fieldErrors.fotoUrl}
          </Typography>
        )}
        {formData.fotoUrl && (
          <Box component="img" src={formData.fotoUrl} alt="Preview do profissional" sx={{ width: "100%", height: 180, objectFit: "cover", borderRadius: 2, mt: 1.5, border: "1px solid", borderColor: "divider" }} />
        )}
      </Box>
    </>
  );

  const etapaDois = () => (
    <>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 2, color: "text.primary" }}>
        Perfil profissional
      </Typography>

      {label("Genero")}
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

      {fieldErrors.gradeAtividades && <Alert severity="error" sx={{ mb: 2 }}>{fieldErrors.gradeAtividades}</Alert>}

      {gradeAtividades.map((grade, index) => (
        <Box key={`grade-${index}`} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2, mb: 2 }}>
          <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 2 }}>
            <Typography variant="subtitle1" fontWeight={800} color="text.primary">
              Atividade {index + 1}
            </Typography>
            {gradeAtividades.length > 1 && (
              <Button type="button" color="error" size="small" onClick={() => setGradeAtividades(prev => prev.filter((_, itemIndex) => itemIndex !== index))}>
                Remover
              </Button>
            )}
          </Box>

          <FormControl fullWidth sx={inputStyles}>
            <InputLabel>Atividade</InputLabel>
            <Select value={grade.atividade} label="Atividade" onChange={(e) => handleGradeChange(index, "atividade", e.target.value)}>
              {categorias.map((categoria) => {
                const nome = getCategoriaNome(categoria);
                return nome ? <MenuItem key={categoria.id || nome} value={nome}>{nome}</MenuItem> : null;
              })}
              <MenuItem value={NOVA_CATEGORIA_VALUE}>Adicionar nova categoria</MenuItem>
            </Select>
          </FormControl>

          {grade.atividade === NOVA_CATEGORIA_VALUE && (
            <Box sx={{ display: "flex", gap: 1.5, mb: 2, flexDirection: { xs: "column", sm: "row" } }}>
              <TextField
                fullWidth
                value={novaCategoria}
                onChange={(e) => setNovaCategoria(e.target.value)}
                placeholder="Nova categoria"
                sx={{ ...inputStyles, mb: 0 }}
              />
              <Button
                type="button"
                variant="outlined"
                disabled={categoriaLoading || !novaCategoria.trim()}
                onClick={() => cadastrarCategoria(index)}
                sx={{ minWidth: { sm: 170 }, borderRadius: 2, fontWeight: 700 }}
              >
                {categoriaLoading ? "Adicionando..." : "Adicionar"}
              </Button>
            </Box>
          )}

          {generoFeminino && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={grade.exclusivoMulheres}
                  onChange={(e) => handleGradeChange(index, "exclusivoMulheres", e.target.checked)}
                />
              }
              label="Esta atividade e exclusiva para mulheres"
              sx={{ mb: 1, color: "text.secondary" }}
            />
          )}

          {label("Dias da semana")}
          {tagSelector(index, "diasSemana", DIAS_SEMANA)}

          {label("Periodos")}
          {tagSelector(index, "periodos", PERIODOS)}
        </Box>
      ))}

      <Button type="button" variant="outlined" onClick={() => setGradeAtividades(prev => [...prev, gradeInicial])} sx={{ borderRadius: 2, fontWeight: 700 }}>
        Adicionar atividade
      </Button>
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

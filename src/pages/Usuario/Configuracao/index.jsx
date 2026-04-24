import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { useEffect, useState } from "react";
import { FaEdit, FaEye, FaEyeSlash, FaSave, FaTimes, FaTrash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authSession } from "../../../service/AuthSession";
import { usuarioService } from "../../../service/UsuarioService";

const validarSenha = (senha) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(senha);

const getApiError = (error) => {
  const data = error?.response?.data;

  if ([401, 403].includes(error?.response?.status)) {
    return {
      fieldErrors: {},
      generalError: "Sessao invalida ou sem permissao. Faca login novamente.",
    };
  }

  if (data && typeof data === "object" && !Array.isArray(data)) {
    const { erro, ...fieldErrors } = data;
    return { fieldErrors, generalError: erro || Object.values(fieldErrors).filter(Boolean).join(" ") };
  }

  return {
    fieldErrors: {},
    generalError: typeof data === "string" ? data : error?.message || "Nao foi possivel concluir a operacao.",
  };
};

const label = (text) => (
  <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 0.75, color: "text.secondary" }}>
    {text}
  </Typography>
);

const ConfiguracaoUsuario = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === "dark";
  const user = authSession.getUser();
  const usuarioId = user?.tipo === "USUARIO" ? user.id : null;

  const [activeSection, setActiveSection] = useState(0);
  const [nome, setNome] = useState(user?.nome || "");
  const [savedNome, setSavedNome] = useState(user?.nome || "");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [saving, setSaving] = useState(false);
  const [deleteText, setDeleteText] = useState("");
  const [isEditingNome, setIsEditingNome] = useState(false);

  useEffect(() => {
    if (!usuarioId) {
      navigate("/login", { state: { accountType: "aluno" } });
    }
  }, [usuarioId, navigate]);

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

  const handleProtectedError = (error) => {
    const { fieldErrors: apiFieldErrors, generalError: apiGeneralError } = getApiError(error);
    setFieldErrors(apiFieldErrors);
    setGeneralError(apiGeneralError);
    toast.error(apiGeneralError);

    if ([401, 403].includes(error?.response?.status)) {
      authSession.clear();
      navigate("/login", { state: { accountType: "aluno" } });
    }
  };

  const handleSalvarNome = async (event) => {
    event.preventDefault();
    if (!isEditingNome) return;

    if (!nome.trim()) {
      setFieldErrors({ nome: "Informe o nome" });
      return;
    }

    setSaving(true);
    try {
      const response = await usuarioService.atualizarUsuario(usuarioId, { nome: nome.trim() });
      const usuarioAtualizado = response.data;
      const nextNome = usuarioAtualizado?.nome || nome.trim();

      authSession.setUser({ ...user, nome: nextNome });
      setNome(nextNome);
      setSavedNome(nextNome);
      setIsEditingNome(false);
      toast.success("Nome atualizado com sucesso!");
    } catch (error) {
      handleProtectedError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleSalvarSenha = async (event) => {
    event.preventDefault();

    const errors = {};
    if (!senha) errors.senha = "Informe a nova senha";
    if (!confirmarSenha) errors.confirmarSenha = "Confirme a nova senha";
    if (senha && !validarSenha(senha)) {
      errors.senha = "Senha deve ter no minimo 8 caracteres, 1 maiuscula, 1 minuscula, 1 numero e 1 caractere especial";
    }
    if (senha && confirmarSenha && senha !== confirmarSenha) {
      errors.confirmarSenha = "As senhas nao coincidem";
    }

    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) return;

    setSaving(true);
    try {
      await usuarioService.atualizarUsuario(usuarioId, { senha });
      setSenha("");
      setConfirmarSenha("");
      toast.success("Senha atualizada com sucesso!");
    } catch (error) {
      handleProtectedError(error);
    } finally {
      setSaving(false);
    }
  };

  const handleExcluirConta = async () => {
    if (deleteText !== "EXCLUIR") return;

    setSaving(true);
    try {
      await usuarioService.excluirUsuario(usuarioId);
      authSession.clear();
      toast.success("Conta excluida com sucesso.");
      navigate("/");
    } catch (error) {
      handleProtectedError(error);
    } finally {
      setSaving(false);
    }
  };

  const renderNome = () => (
    <Box component="form" onSubmit={handleSalvarNome}>
      <Box sx={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 2, mb: 3 }}>
        <Box>
          <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
            Dados pessoais
          </Typography>
          <Typography color="text.secondary">
            {isEditingNome ? "Altere o nome exibido no seu perfil." : "Clique em editar para alterar seu nome."}
          </Typography>
        </Box>

        {!isEditingNome && (
          <Button
            type="button"
            variant="contained"
            startIcon={<FaEdit />}
            onClick={() => {
              setFieldErrors({});
              setGeneralError("");
              setIsEditingNome(true);
            }}
            sx={{ borderRadius: 2, px: 2.5, py: 1.15, fontWeight: 900, flexShrink: 0 }}
          >
            Editar nome
          </Button>
        )}
      </Box>

      {label("Nome")}
      <TextField
        fullWidth
        disabled={!isEditingNome}
        name="nome"
        value={nome}
        onChange={(event) => {
          setNome(event.target.value);
          limparErro("nome");
        }}
        error={Boolean(fieldErrors.nome)}
        helperText={fieldErrors.nome}
        sx={inputStyles}
      />

      {label("Email")}
      <TextField fullWidth disabled value={user?.email || ""} sx={inputStyles} />

      {isEditingNome && (
        <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1.5, flexWrap: "wrap" }}>
          <Button
            type="button"
            variant="outlined"
            startIcon={<FaTimes />}
            disabled={saving}
            onClick={() => {
              setNome(savedNome);
              setFieldErrors({});
              setGeneralError("");
              setIsEditingNome(false);
            }}
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
            {saving ? "Salvando..." : "Salvar nome"}
          </Button>
        </Box>
      )}
    </Box>
  );

  const renderSenha = () => (
    <Box component="form" onSubmit={handleSalvarSenha}>
      <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
        Alterar senha
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Escolha uma senha forte para manter sua conta protegida.
      </Typography>

      {label("Nova senha")}
      <TextField
        fullWidth
        type={showPassword ? "text" : "password"}
        value={senha}
        onChange={(event) => {
          setSenha(event.target.value);
          limparErro("senha");
        }}
        error={Boolean(fieldErrors.senha)}
        helperText={fieldErrors.senha}
        sx={inputStyles}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowPassword((current) => !current)} edge="end" size="small">
                {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      {label("Confirmar nova senha")}
      <TextField
        fullWidth
        type={showConfirmPassword ? "text" : "password"}
        value={confirmarSenha}
        onChange={(event) => {
          setConfirmarSenha(event.target.value);
          limparErro("confirmarSenha");
        }}
        error={Boolean(fieldErrors.confirmarSenha)}
        helperText={fieldErrors.confirmarSenha}
        sx={inputStyles}
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <IconButton onClick={() => setShowConfirmPassword((current) => !current)} edge="end" size="small">
                {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
              </IconButton>
            </InputAdornment>
          ),
        }}
      />

      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
        <Button
          type="submit"
          variant="contained"
          startIcon={<FaSave />}
          disabled={saving}
          sx={{ borderRadius: 2, px: 3, py: 1.25, fontWeight: 900 }}
        >
          {saving ? "Salvando..." : "Salvar senha"}
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
        Esta acao remove sua conta de aluno e deve ser usada apenas quando tiver certeza.
      </Typography>

      <Alert severity="warning" sx={{ mb: 3 }}>
        Para confirmar a exclusao, digite EXCLUIR no campo abaixo.
      </Alert>

      {label("Confirmacao")}
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

  if (!usuarioId) return null;

  return (
    <Box sx={{ width: "100%", pb: 8 }}>
      <Typography variant="h4" fontWeight={950} sx={{ mb: 1 }}>
        Configuracoes
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 4 }}>
        Gerencie as informacoes da sua conta no IlhaFit.
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
            setFieldErrors({});
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
          <Tab label="Senha" />
          <Tab label="Excluir conta" />
        </Tabs>

        <Box sx={{ p: { xs: 2.5, md: 4 } }}>
          {activeSection === 0 && renderNome()}
          {activeSection === 1 && renderSenha()}
          {activeSection === 2 && renderExcluirConta()}
        </Box>
      </Paper>
    </Box>
  );
};

export default ConfiguracaoUsuario;

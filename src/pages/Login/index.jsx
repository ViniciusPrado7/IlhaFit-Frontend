import React, { useState } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  IconButton,
  useTheme,
  InputAdornment,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
} from "@mui/material";
import { FaTimes, FaEye, FaEyeSlash, FaUser, FaBuilding, FaUserTie } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../../service/AuthService";
import { estabelecimentoService } from "../../service/EstabelecimentoService";
import { profissionalService } from "../../service/ProfissionalService";
import { authSession } from "../../service/AuthSession";

const isFieldErrorObject = (data) => {
  return data && typeof data === "object" && !Array.isArray(data);
};

const getApiError = (error) => {
  const data = error?.response?.data;
  const status = error?.response?.status;

  if (status === 403 && !data) {
    return {
      fieldErrors: {},
      generalError: "Login bloqueado pelo servidor. Verifique se a rota de auth esta liberada no backend."
    };
  }

  if (isFieldErrorObject(data)) {
    return { fieldErrors: data, generalError: "" };
  }

  if (typeof data === "string") {
    return { fieldErrors: {}, generalError: data };
  }

  return {
    fieldErrors: {},
    generalError: error?.message || "Erro ao fazer login"
  };
};

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme.palette.mode === 'dark';

  const [accountType, setAccountType] = useState(location.state?.accountType || "aluno");
  const [email, setEmail] = useState(location.state?.email || "");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

  const handleTypeChange = (_, newType) => {
    if (newType !== null) {
      setAccountType(newType);
      setFieldErrors({});
      setGeneralError("");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFieldErrors({});
    setGeneralError("");

    if (!email.trim() || !senha.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const data = accountType === "estabelecimento"
        ? (await estabelecimentoService.loginEstabelecimento({ email, senha })).data
        : accountType === "profissional"
          ? (await profissionalService.loginProfissional({ email, senha })).data
        : await authService.login(email, senha);

      if (data?.token) {
        localStorage.setItem("token", data.token);
      }

      authSession.setUser({
        id: data?.id,
        nome: data?.nome || email,
        email: data?.email || email,
        tipo: data?.tipo || (accountType === "estabelecimento" ? "ESTABELECIMENTO" : accountType === "profissional" ? "PROFISSIONAL" : "USUARIO"),
        role: data?.role,
      });
      toast.success(`Bem-vindo, ${data?.nome || email}!`);
      navigate("/");
    } catch (error) {
      console.error("Erro no login:", error);
      const { fieldErrors: apiFieldErrors, generalError: apiGeneralError } = getApiError(error);
      setFieldErrors(apiFieldErrors);
      setGeneralError(apiGeneralError);
    } finally {
      setLoading(false);
    }
  };

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(16, 185, 129, 0.05)",
      borderRadius: 2,
      "& fieldset": { borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(16, 185, 129, 0.2)" },
      "&:hover fieldset": { borderColor: theme.palette.primary.main },
    },
    mb: 2
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      bgcolor: "background.default",
      py: 4,
      px: 2
    }}>
      <Paper elevation={0} sx={{
        width: "100%",
        maxWidth: 600,
        p: 4,
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        position: "relative"
      }}>
        <IconButton
          onClick={() => navigate("/")}
          sx={{ position: "absolute", top: 16, right: 16, color: "text.secondary" }}
        >
          <FaTimes size={20} />
        </IconButton>

        <Typography variant="h4" fontWeight={800} sx={{ mb: 3, color: "text.primary" }}>
          Entrar
        </Typography>

        <form onSubmit={handleSubmit}>
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1.5, color: "text.secondary" }}>
              Tipo de conta
            </Typography>
            <ToggleButtonGroup
              value={accountType}
              exclusive
              onChange={handleTypeChange}
              fullWidth
              sx={{
                gap: 1,
                "& .MuiToggleButton-root": {
                  border: "1px solid !important",
                  borderColor: "divider !important",
                  borderRadius: "12px !important",
                  color: "text.secondary",
                  textTransform: "none",
                  fontWeight: 600,
                  py: 1.5,
                  "&.Mui-selected": {
                    bgcolor: "primary.main",
                    color: "white",
                    "&:hover": { bgcolor: "primary.dark" }
                  }
                }
              }}
            >
              <ToggleButton value="aluno">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaUser size={14} /> Aluno
                </Box>
              </ToggleButton>
              <ToggleButton value="estabelecimento">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaBuilding size={14} /> Estabelecimento
                </Box>
              </ToggleButton>
              <ToggleButton value="profissional">
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <FaUserTie size={14} /> Profissional
                </Box>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {generalError && <Alert severity="error" sx={{ mb: 2 }}>{generalError}</Alert>}

          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
            Email
          </Typography>
          <TextField
            fullWidth
            name="email"
            type="email"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              setFieldErrors(prev => ({ ...prev, email: "" }));
              setGeneralError("");
            }}
            placeholder="seu@email.com"
            error={Boolean(fieldErrors.email)}
            helperText={fieldErrors.email}
            sx={inputStyles}
          />

          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
            Senha
          </Typography>
          <TextField
            fullWidth
            name="senha"
            type={showPassword ? "text" : "password"}
            value={senha}
            onChange={(e) => {
              setSenha(e.target.value);
              setFieldErrors(prev => ({ ...prev, senha: "" }));
              setGeneralError("");
            }}
            placeholder="********"
            error={Boolean(fieldErrors.senha)}
            helperText={fieldErrors.senha}
            sx={inputStyles}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    size="small"
                  >
                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />

          <Box sx={{ display: "flex", justifyContent: "center", mt: 1, mb: 2 }}>
            <Typography
              variant="body2"
              color="primary.main"
              fontWeight={600}
              sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
              onClick={() => navigate("/esqueci-senha")}
            >
              Esqueceu a senha?
            </Typography>
          </Box>

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
              boxShadow: `0 8px 16px ${isDark ? 'rgba(16, 185, 129, 0.2)' : 'rgba(16, 185, 129, 0.3)'}`,
              "&:hover": {
                bgcolor: "primary.dark",
                transform: "translateY(-2px)",
                transition: "all 0.2s ease"
              }
            }}
          >
            {loading ? "Entrando..." : "Entrar"}
          </Button>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Nao tem conta?{" "}
              <Typography
                component="span"
                variant="body2"
                fontWeight={700}
                color="primary.main"
                sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                onClick={() => navigate("/cadastro", { state: { accountType } })}
              >
                Cadastre-se
              </Typography>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;

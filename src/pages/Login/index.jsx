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
} from "@mui/material";
import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../../service/AuthService";
import { authSession } from "../../service/AuthSession";

const isFieldErrorObject = (data) => {
  return data && typeof data === "object" && !Array.isArray(data);
};

const getApiError = (error) => {
  const data = error?.response?.data;
  const status = error?.response?.status;

  if (status === 401 || status === 403) {
    return {
      fieldErrors: {},
      generalError: status === 401 ? "Email ou senha invalidos." : "Sessao invalida ou sem permissao. Faca login novamente."
    };
  }

  if (status === 403 && !data) {
    return {
      fieldErrors: {},
      generalError: "Login bloqueado pelo servidor. Verifique se a rota de auth esta liberada no backend."
    };
  }

  if (isFieldErrorObject(data)) {
    const { erro, ...fieldErrors } = data;
    return { fieldErrors, generalError: erro || "" };
  }

  if (typeof data === "string") {
    return { fieldErrors: {}, generalError: data };
  }

  return {
    fieldErrors: {},
    generalError: error?.message || "Erro ao fazer login"
  };
};

const requireEstabelecimentoLogin = (data) => {
  if (!data?.token) {
    throw new Error("Nao foi possivel iniciar a sessao. Tente novamente.");
  }

  return data;
};

const normalizeTipo = (tipo) => {
  if (tipo === "ALUNO") return "USUARIO";
  return tipo || "USUARIO";
};

const getRedirectPath = (from) => from || "/";

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme.palette.mode === 'dark';

  const [email, setEmail] = useState(location.state?.email || "");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");

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
      const data = await authService.login(email, senha);
      const tipo = normalizeTipo(data?.tipo);

      if (tipo === "ESTABELECIMENTO" || tipo === "PROFISSIONAL") {
        authSession.setSession(requireEstabelecimentoLogin(data));
      } else {
        authSession.setUser({
          id: data?.id,
          nome: data?.nome || email,
          email: data?.email || email,
          tipo,
          role: data?.role,
        });
      }

      toast.success(`Bem-vindo, ${data?.nomeFantasia || data?.nome || email}!`);
      navigate(getRedirectPath(location.state?.from));
    } catch (error) {
      console.error("Erro no login:", error);
      const { fieldErrors: apiFieldErrors, generalError: apiGeneralError } = error?.response
        ? getApiError(error)
        : { fieldErrors: {}, generalError: error?.message || "Erro ao fazer login" };
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
    "& .MuiInputBase-input": {
      py: 1.65,
    },
    mb: 2.5
  };

  return (
    <Box sx={{
      minHeight: "calc(100vh - 112px)",
      display: "flex",
      alignItems: "flex-start",
      justifyContent: "center",
      bgcolor: "background.default",
      pt: { xs: 2, sm: 3, md: 4 },
      pb: { xs: 4, md: 6 },
      px: 2
    }}>
      <Paper elevation={0} sx={{
        width: "100%",
        maxWidth: 720,
        minHeight: { md: 560 },
        p: { xs: 3, sm: 5, md: 6 },
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

        <Typography variant="h3" fontWeight={800} sx={{ mb: 4.5, color: "text.primary", fontSize: { xs: "2rem", md: "2.45rem" } }}>
          Entrar
        </Typography>

        <form onSubmit={handleSubmit}>
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

          <Box sx={{ display: "flex", justifyContent: "center", mt: 1.5, mb: 3 }}>
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
              py: 1.75,
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

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography variant="body2" color="text.secondary">
              Nao tem conta?{" "}
              <Typography
                component="span"
                variant="body2"
                fontWeight={700}
                color="primary.main"
                sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                onClick={() => navigate("/cadastro")}
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

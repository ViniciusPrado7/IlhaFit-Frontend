import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { FaEye, FaEyeSlash, FaTimes } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../../service/AuthService";
import { authSession } from "../../service/AuthSession";
import { emailConfirmationSession } from "../../service/EmailConfirmationSession";

const isFieldErrorObject = (data) => data && typeof data === "object" && !Array.isArray(data);

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

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    return data.erro || data.mensagem || data.message || "";
  }

  return error?.message || "";
};

const requireTokenLogin = (data) => {
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

const isEmailConfirmed = (data) => data?.emailConfirmado === true || data?.emailConfirmado === "true";

const isEmailUnconfirmed = (data) => data?.emailConfirmado === false || data?.emailConfirmado === "false";

const shouldOpenEmailConfirmation = (data, email) => {
  if (data?.requerConfirmacaoEmail === true || data?.requerConfirmacaoEmail === "true") return true;
  if (isEmailUnconfirmed(data)) return true;
  return emailConfirmationSession.isPending(data?.email || email) && !isEmailConfirmed(data);
};

const onlyDigits = (value) => value.replace(/\D/g, "").slice(0, 6);

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme.palette.mode === "dark";

  const [email, setEmail] = useState(location.state?.email || "");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [generalError, setGeneralError] = useState("");
  const [modalAberta, setModalAberta] = useState(false);
  const [codigoConfirmacao, setCodigoConfirmacao] = useState("");
  const [emailConfirmacao, setEmailConfirmacao] = useState("");
  const [erroConfirmacao, setErroConfirmacao] = useState("");
  const [confirmandoCodigo, setConfirmandoCodigo] = useState(false);
  const [reenviandoCodigo, setReenviandoCodigo] = useState(false);

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

  const abrirModalConfirmacao = (loginEmail) => {
    setEmailConfirmacao(loginEmail);
    setCodigoConfirmacao("");
    setErroConfirmacao("");
    setModalAberta(true);
    emailConfirmationSession.markPending(loginEmail);
    authSession.clear();
  };

  const finalizarLogin = (data, fallbackEmail) => {
    const tipo = normalizeTipo(data?.tipo);
    const loginEmail = data?.email || fallbackEmail;

    if (isEmailConfirmed(data)) {
      emailConfirmationSession.clear(loginEmail);
    }

    if (data?.token) {
      authSession.setSession(requireTokenLogin({ ...data, tipo }));
    } else {
      authSession.setSession({ ...data, tipo });
    }

    toast.success(`Bem-vindo, ${data?.nomeFantasia || data?.nome || loginEmail}!`);
    navigate(getRedirectPath(location.state?.from));
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
      const data = await authService.login(email, senha);
      const loginEmail = data?.email || email;

      if (shouldOpenEmailConfirmation(data, loginEmail)) {
        abrirModalConfirmacao(loginEmail);
        return;
      }

      finalizarLogin(data, email);
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

  const handleConfirmarCodigo = async () => {
    setErroConfirmacao("");

    if (!/^\d{6}$/.test(codigoConfirmacao)) {
      setErroConfirmacao("O codigo deve conter exatamente 6 digitos.");
      return;
    }

    setConfirmandoCodigo(true);
    try {
      const data = await authService.confirmEmail(emailConfirmacao, codigoConfirmacao);
      setModalAberta(false);
      finalizarLogin(data, emailConfirmacao);
    } catch (error) {
      setErroConfirmacao(getErrorMessage(error) || "Codigo invalido ou expirado.");
    } finally {
      setConfirmandoCodigo(false);
    }
  };

  const handleReenviarCodigo = async () => {
    setErroConfirmacao("");
    setReenviandoCodigo(true);
    try {
      const data = await authService.resendEmailConfirmation(emailConfirmacao);
      toast.success(data?.mensagem || "Novo codigo enviado com sucesso.");
    } catch (error) {
      setErroConfirmacao(getErrorMessage(error) || "Nao foi possivel reenviar o codigo.");
    } finally {
      setReenviandoCodigo(false);
    }
  };

  const handleCancelarConfirmacao = () => {
    setModalAberta(false);
    setCodigoConfirmacao("");
    setErroConfirmacao("");
  };

  return (
    <>
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
                setFieldErrors((prev) => ({ ...prev, email: "" }));
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
                setFieldErrors((prev) => ({ ...prev, senha: "" }));
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
                boxShadow: `0 8px 16px ${isDark ? "rgba(16, 185, 129, 0.2)" : "rgba(16, 185, 129, 0.3)"}`,
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

      <Dialog
        open={modalAberta}
        onClose={handleCancelarConfirmacao}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            width: "100%",
            maxWidth: 620,
            borderRadius: 4,
            border: "1px solid",
            borderColor: alpha(theme.palette.primary.main, isDark ? 0.3 : 0.18),
            bgcolor: "background.paper",
            backgroundImage: isDark
              ? `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.14)} 0%, ${alpha(theme.palette.background.paper, 0.96)} 32%)`
              : `linear-gradient(180deg, ${alpha(theme.palette.primary.main, 0.08)} 0%, ${theme.palette.background.paper} 30%)`,
            boxShadow: isDark
              ? `0 24px 60px ${alpha("#000000", 0.42)}`
              : `0 24px 60px ${alpha(theme.palette.primary.main, 0.16)}`,
          }
        }}
      >
        <DialogTitle sx={{ px: 3.5, pt: 3.5, pb: 1.5 }}>
          <Typography component="span" variant="h5" fontWeight={800} color="text.primary">
            Confirmar primeiro login
          </Typography>
        </DialogTitle>
        <DialogContent sx={{ px: 3.5, pt: 0.5, pb: 2 }}>
          <Box
            sx={{
              mb: 2.5,
              p: 2,
              borderRadius: 3,
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, isDark ? 0.24 : 0.16),
              bgcolor: isDark
                ? alpha(theme.palette.primary.main, 0.1)
                : alpha(theme.palette.primary.main, 0.06),
            }}
          >
            <Typography variant="body1" color="text.primary" fontWeight={600} sx={{ mb: 0.75 }}>
              Codigo enviado para o seu email
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ overflowWrap: "anywhere" }}>
              Enviamos um codigo de 6 digitos para <strong>{emailConfirmacao}</strong>
            </Typography>
          </Box>

          <TextField
            fullWidth
            value={codigoConfirmacao}
            onChange={(event) => {
              setCodigoConfirmacao(onlyDigits(event.target.value));
              setErroConfirmacao("");
            }}
            placeholder="000000"
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
              maxLength: 6,
              "aria-label": "Codigo de confirmacao de 6 digitos",
            }}
            sx={{
              "& .MuiOutlinedInput-root": {
                bgcolor: isDark ? alpha("#FFFFFF", 0.04) : alpha(theme.palette.primary.main, 0.04),
                borderRadius: 3,
                "& fieldset": {
                  borderColor: alpha(theme.palette.primary.main, isDark ? 0.22 : 0.18),
                },
                "&:hover fieldset": {
                  borderColor: theme.palette.primary.main,
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                },
              },
              "& .MuiInputBase-input": {
                py: 2,
                textAlign: "center",
                fontSize: { xs: "1.6rem", sm: "2rem" },
                fontWeight: 800,
                letterSpacing: "0.2em",
              },
            }}
          />

          {erroConfirmacao && <Alert severity="error" sx={{ mt: 2 }}>{erroConfirmacao}</Alert>}
        </DialogContent>
        <DialogActions sx={{ px: 3.5, pb: 3.5, pt: 0.5, gap: 1.5, justifyContent: "space-between" }}>
          <Button
            onClick={handleCancelarConfirmacao}
            color="inherit"
            sx={{
              px: 2.25,
              borderRadius: 2.5,
              color: "text.secondary",
            }}
          >
            Cancelar
          </Button>
          <Box sx={{ display: "flex", gap: 1.25, flexWrap: "wrap", justifyContent: "flex-end" }}>
            <Button
              onClick={handleReenviarCodigo}
              disabled={reenviandoCodigo || confirmandoCodigo}
              variant="outlined"
              sx={{
                px: 2.25,
                py: 1.1,
                borderRadius: 2.5,
                borderColor: alpha(theme.palette.primary.main, 0.35),
                color: "primary.main",
                "&:hover": {
                  borderColor: theme.palette.primary.main,
                  bgcolor: alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              {reenviandoCodigo ? "Reenviando..." : "Reenviar email"}
            </Button>
            <Button
              onClick={handleConfirmarCodigo}
              disabled={confirmandoCodigo || codigoConfirmacao.length !== 6}
              variant="contained"
              sx={{
                px: 2.75,
                py: 1.1,
                borderRadius: 2.5,
                boxShadow: `0 10px 20px ${alpha(theme.palette.primary.main, isDark ? 0.22 : 0.28)}`,
              }}
            >
              {confirmandoCodigo ? "Confirmando..." : "Confirmar"}
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Login;

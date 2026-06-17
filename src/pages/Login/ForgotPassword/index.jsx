import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  InputAdornment,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { FaArrowLeft, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { authService } from "../../../service/AuthService";

const RECOVERY_MESSAGE = "Enviamos um codigo de 6 digitos para seu email.";
const RESET_SUCCESS_MESSAGE = "Senha alterada com sucesso. Você já pode efetuar o login.";

const passwordRules = [
  {
    test: (value) => value.length >= 8,
    message: "A senha deve ter no mínimo 8 caracteres.",
  },
  {
    test: (value) => /[A-Z]/.test(value),
    message: "A senha deve ter pelo menos 1 letra maiúscula.",
  },
  {
    test: (value) => /[a-z]/.test(value),
    message: "A senha deve ter pelo menos 1 letra minúscula.",
  },
  {
    test: (value) => /\d/.test(value),
    message: "A senha deve ter pelo menos 1 número.",
  },
  {
    test: (value) => /[^A-Za-z0-9]/.test(value),
    message: "A senha deve ter pelo menos 1 caractere especial.",
  },
];

const onlyDigits = (value) => value.replace(/\D/g, "").slice(0, 6);

const getApiError = (error) => {
  const data = error?.response?.data;

  if (typeof data === "string") return data;
  if (data?.erro) return data.erro;
  if (data?.message) return data.message;
  if (data?.mensagem) return data.mensagem;

  return "Erro ao processar solicitação.";
};

const validatePassword = (senha, confirmacaoSenha) => {
  if (!senha) return "Senha obrigatória.";
  if (!confirmacaoSenha) return "Confirmação obrigatória.";
  if (senha !== confirmacaoSenha) return "As senhas precisam ser iguais.";

  const failedRule = passwordRules.find((rule) => !rule.test(senha));
  return failedRule?.message || "";
};

const EsqueciSenha = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === "dark";

  const [step, setStep] = useState("email");
  const [email, setEmail] = useState("");
  const [codigo, setCodigo] = useState("");
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmacaoSenha, setConfirmacaoSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(16, 185, 129, 0.05)",
      borderRadius: 2,
      "& fieldset": {
        borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(16, 185, 129, 0.2)",
      },
      "&:hover fieldset": { borderColor: theme.palette.primary.main },
    },
    "& .MuiInputBase-input": {
      py: 1.65,
    },
    mb: 2.5,
  };

  const clearMessages = () => {
    setErrorMessage("");
    setSuccessMessage("");
  };

  const handleForgotPassword = async (event) => {
    event.preventDefault();
    clearMessages();

    const emailLimpo = email.trim();
    if (!emailLimpo) {
      setErrorMessage("Email obrigatório.");
      return;
    }

    setLoading(true);
    try {
      await authService.esqueciSenha(emailLimpo);
      setEmail(emailLimpo);
      setStep("code");
      setSuccessMessage(RECOVERY_MESSAGE);
    } catch (error) {
      console.error("Erro ao solicitar recuperação:", error);
      setErrorMessage(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const handleCodeSubmit = (event) => {
    event.preventDefault();
    clearMessages();

    if (!/^\d{6}$/.test(codigo)) {
      setErrorMessage("O código deve conter exatamente 6 dígitos numéricos.");
      return;
    }

    setStep("password");
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!/^\d{6}$/.test(codigo)) {
      setErrorMessage("O código deve conter exatamente 6 dígitos numéricos.");
      return;
    }

    const validationError = validatePassword(novaSenha, confirmacaoSenha);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);
    try {
      await authService.redefinirSenha(email.trim(), codigo, novaSenha, confirmacaoSenha);
      setSuccessMessage(RESET_SUCCESS_MESSAGE);
      setTimeout(() => navigate("/login", { state: { email: email.trim() } }), 1800);
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      setErrorMessage(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const voltarParaEmail = () => {
    setStep("email");
    setCodigo("");
    setNovaSenha("");
    setConfirmacaoSenha("");
    clearMessages();
  };

  const voltarParaCodigo = () => {
    setStep("code");
    setNovaSenha("");
    setConfirmacaoSenha("");
    clearMessages();
  };

  const codeMode = step === "code";
  const passwordMode = step === "password";
  const recoveryMode = codeMode || passwordMode;
  const formSubmitHandler = step === "email"
    ? handleForgotPassword
    : codeMode
      ? handleCodeSubmit
      : handleResetPassword;

  return (
    <Box
      sx={{
        minHeight: "calc(100vh - 112px)",
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        bgcolor: "background.default",
        pt: { xs: 2, sm: 3, md: 4 },
        pb: { xs: 4, md: 6 },
        px: 2,
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 620,
          p: { xs: 3, sm: 5, md: 6 },
          borderRadius: 4,
          border: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
          position: "relative",
        }}
      >
        <IconButton
          onClick={() => (passwordMode ? voltarParaCodigo() : recoveryMode ? voltarParaEmail() : navigate("/login"))}
          aria-label={recoveryMode ? "Voltar" : "Voltar para login"}
          sx={{ position: "absolute", top: 16, left: 16, color: "text.secondary" }}
        >
          <FaArrowLeft size={20} />
        </IconButton>

        <Typography
          variant="h3"
          fontWeight={800}
          sx={{
            mb: 1.5,
            color: "text.primary",
            textAlign: "center",
            fontSize: { xs: "2rem", md: "2.35rem" },
            mt: 1,
          }}
        >
          {passwordMode ? "Nova senha" : recoveryMode ? "Confirmar código" : "Recuperar senha"}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: "center" }}>
          {passwordMode
            ? "Agora escolha e confirme sua nova senha."
            : recoveryMode
              ? "Digite o código de 6 dígitos enviado para seu e-mail."
              : "Digite seu email para receber um código de recuperação."}
        </Typography>

        <form onSubmit={formSubmitHandler}>
          {successMessage && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {successMessage}
            </Alert>
          )}

          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}

          {recoveryMode ? (
            <>
              <Box
                sx={{
                  mb: 3,
                  py: 1.5,
                  px: 2,
                  border: "1px solid",
                  borderColor: "divider",
                  borderRadius: 2,
                  bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(15, 23, 42, 0.03)",
                }}
              >
                <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontWeight: 700, mb: 0.5 }}>
                  E-mail
                </Typography>
                <Typography variant="body1" color="text.primary" sx={{ overflowWrap: "anywhere" }}>
                  {email}
                </Typography>
              </Box>

              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                Código
              </Typography>
              <TextField
                fullWidth
                name="codigo"
                value={codigo}
                onChange={(event) => {
                  setCodigo(onlyDigits(event.target.value));
                  clearMessages();
                }}
                placeholder="000000"
                inputProps={{
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  maxLength: 6,
                  "aria-label": "Código de recuperação de 6 dígitos",
                }}
                error={Boolean(errorMessage)}
                sx={{
                  ...inputStyles,
                  "& .MuiInputBase-input": {
                    py: 1.8,
                    textAlign: "center",
                    fontSize: { xs: "1.5rem", sm: "1.9rem" },
                    fontWeight: 800,
                    letterSpacing: "0.18em",
                  },
                }}
              />

              {passwordMode && (
                <>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                    Nova senha
                  </Typography>
                  <TextField
                    fullWidth
                    name="novaSenha"
                    type={showPassword ? "text" : "password"}
                    value={novaSenha}
                    onChange={(event) => {
                      setNovaSenha(event.target.value);
                      clearMessages();
                    }}
                    placeholder="NovaSenha@123"
                    error={Boolean(errorMessage)}
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

                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                    Confirmar nova senha
                  </Typography>
                  <TextField
                    fullWidth
                    name="confirmacaoSenha"
                    type={showConfirmation ? "text" : "password"}
                    value={confirmacaoSenha}
                    onChange={(event) => {
                      setConfirmacaoSenha(event.target.value);
                      clearMessages();
                    }}
                    placeholder="NovaSenha@123"
                    error={Boolean(errorMessage)}
                    sx={inputStyles}
                    InputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          <IconButton onClick={() => setShowConfirmation((current) => !current)} edge="end" size="small">
                            {showConfirmation ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </>
              )}
            </>
          ) : (
            <>
              <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                Email
              </Typography>
              <TextField
                fullWidth
                name="email"
                type="email"
                value={email}
                onChange={(event) => {
                  setEmail(event.target.value);
                  clearMessages();
                }}
                placeholder="seu@email.com"
                error={Boolean(errorMessage)}
                sx={inputStyles}
              />
            </>
          )}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || (codeMode && codigo.length !== 6) || (passwordMode && (!novaSenha || !confirmacaoSenha))}
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
                transition: "all 0.2s ease",
              },
            }}
          >
            {loading
              ? "Enviando..."
              : passwordMode
                ? "Alterar senha"
                : codeMode
                  ? "Continuar"
                : "Enviar código"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default EsqueciSenha;

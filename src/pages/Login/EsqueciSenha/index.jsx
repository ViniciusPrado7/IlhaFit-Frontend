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
import { useNavigate, useSearchParams } from "react-router-dom";
import { authService } from "../../../service/AuthService";

const RECOVERY_MESSAGE = "Se o email estiver cadastrado, enviaremos as instruções de recuperação.";
const RESET_SUCCESS_MESSAGE = "Senha alterada com sucesso.";

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
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") || "";
  const isResetMode = Boolean(token);
  const isDark = theme.palette.mode === "dark";

  const [email, setEmail] = useState("");
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

    if (!email.trim()) {
      setErrorMessage("Email obrigatório.");
      return;
    }

    setLoading(true);
    try {
      await authService.esqueciSenha(email.trim());
      setSuccessMessage(RECOVERY_MESSAGE);
    } catch (error) {
      console.error("Erro ao solicitar recuperação:", error);
      const apiMessage = getApiError(error);
      const isEmailNotFound = /email.*(nao|não).*existe|email.*(nao|não).*cadastrado/i.test(apiMessage);

      if (error?.response?.status === 404 || isEmailNotFound) {
        setSuccessMessage(RECOVERY_MESSAGE);
        return;
      }

      setErrorMessage(apiMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (event) => {
    event.preventDefault();
    clearMessages();

    const validationError = validatePassword(novaSenha, confirmacaoSenha);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);
    try {
      await authService.redefinirSenha(token, novaSenha, confirmacaoSenha);
      setSuccessMessage(RESET_SUCCESS_MESSAGE);
      setTimeout(() => navigate("/login"), 1800);
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      setErrorMessage(getApiError(error));
    } finally {
      setLoading(false);
    }
  };

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
          onClick={() => navigate("/login")}
          aria-label="Voltar para login"
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
          {isResetMode ? "Redefinir senha" : "Recuperar senha"}
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: "center" }}>
          {isResetMode
            ? "Informe e confirme sua nova senha."
            : "Digite seu email para receber as instruções de recuperação."}
        </Typography>

        <form onSubmit={isResetMode ? handleResetPassword : handleForgotPassword}>
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

          {isResetMode ? (
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
                transition: "all 0.2s ease",
              },
            }}
          >
            {loading
              ? "Enviando..."
              : isResetMode
                ? "Alterar senha"
                : "Enviar link de recuperação"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default EsqueciSenha;

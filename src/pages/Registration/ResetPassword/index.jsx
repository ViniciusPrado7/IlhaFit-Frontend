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
import { useLocation, useNavigate } from "react-router-dom";
import { authService } from "../../../service/AuthService";

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

const ResetPassword = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme.palette.mode === "dark";
  const email = location.state?.email || "";
  const codigo = location.state?.codigo || "";

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

  const handleSubmit = async (event) => {
    event.preventDefault();
    clearMessages();

    if (!email || !/^\d{6}$/.test(codigo)) {
      navigate("/esqueci-senha");
      return;
    }

    const validationError = validatePassword(novaSenha, confirmacaoSenha);
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }

    setLoading(true);
    try {
      await authService.redefinirSenha(email, codigo, novaSenha, confirmacaoSenha);
      setSuccessMessage(RESET_SUCCESS_MESSAGE);
      setTimeout(() => navigate("/login", { state: { email } }), 1800);
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
          onClick={() => navigate("/esqueci-senha", { state: { email } })}
          aria-label="Voltar para recuperação"
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
          Nova senha
        </Typography>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 4, textAlign: "center" }}>
          Agora escolha e confirme sua nova senha.
        </Typography>

        <form onSubmit={handleSubmit}>
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
              {email || "Informe novamente seu e-mail"}
            </Typography>
          </Box>

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

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || !novaSenha || !confirmacaoSenha}
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
            {loading ? "Alterando..." : "Alterar senha"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ResetPassword;

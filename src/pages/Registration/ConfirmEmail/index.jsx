import React, { useState } from "react";
import {
  Alert,
  Box,
  Button,
  IconButton,
  Paper,
  TextField,
  Typography,
  useTheme,
} from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../../../service/AuthService";
import { authSession } from "../../../service/AuthSession";
import { emailConfirmationSession } from "../../../service/EmailConfirmationSession";

const onlyDigits = (value) => value.replace(/\D/g, "").slice(0, 6);

const getApiErrorMessage = (error) => {
  const data = error?.response?.data;

  if (typeof data === "string") return data;
  if (data && typeof data === "object") {
    return data.erro || data.mensagem || data.message || "Código inválido ou expirado.";
  }

  return error?.message || "Não foi possível confirmar o e-mail.";
};

const normalizeTipo = (tipo) => {
  if (tipo === "ALUNO") return "USUARIO";
  return tipo || "USUARIO";
};

const requireTokenLogin = (data) => {
  if (!data?.token) {
    throw new Error("Não foi possível iniciar a sessão automaticamente.");
  }

  return data;
};

const getRedirectPath = (from) => from || "/";

const ConfirmEmail = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme.palette.mode === "dark";

  const initialEmail = location.state?.email || "";
  const [email, setEmail] = useState(initialEmail);
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(location.state?.loginError || "");
  const [success, setSuccess] = useState("");

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(16, 185, 129, 0.05)",
      borderRadius: 2,
      "& fieldset": { borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(16, 185, 129, 0.2)" },
      "&:hover fieldset": { borderColor: theme.palette.primary.main },
    },
    mb: 2.5,
  };

  const handleCodigoChange = (event) => {
    setCodigo(onlyDigits(event.target.value));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setSuccess("");

    const emailLimpo = email.trim();
    if (!emailLimpo) {
      setError("Informe o e-mail usado no cadastro.");
      return;
    }

    if (!/^\d{6}$/.test(codigo)) {
      setError("O código deve conter exatamente 6 dígitos numéricos.");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.confirmEmail(emailLimpo, codigo);
      const successMessage = data?.mensagem || "Email confirmado com sucesso.";
      emailConfirmationSession.clear(emailLimpo);

      const tipo = normalizeTipo(data?.tipo);

      if (data?.token) {
        authSession.setSession(requireTokenLogin({ ...data, tipo }));
      } else {
        authSession.setSession({ ...data, tipo });
      }

      setSuccess(successMessage);
      toast.success(`Bem-vindo, ${data?.nomeFantasia || data?.nome || emailLimpo}!`);
      window.setTimeout(() => {
        navigate(getRedirectPath(location.state?.from));
      }, 900);
    } catch (apiError) {
      setSuccess("");
      setError(getApiErrorMessage(apiError));
    } finally {
      setLoading(false);
    }
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
      px: 2,
    }}>
      <Paper elevation={0} sx={{
        width: "100%",
        maxWidth: 640,
        p: { xs: 3, sm: 5, md: 6 },
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
        position: "relative",
      }}>
        <IconButton
          onClick={() => navigate("/")}
          sx={{ position: "absolute", top: 16, right: 16, color: "text.secondary" }}
          aria-label="Fechar"
        >
          <FaTimes size={20} />
        </IconButton>

        <Typography variant="h3" fontWeight={800} sx={{ mb: 2, color: "text.primary", fontSize: { xs: "2rem", md: "2.45rem" } }}>
          Confirmar e-mail
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          Enviamos um código de 6 dígitos para seu e-mail.
        </Typography>

        {initialEmail && (
          <Box sx={{
            mb: 3,
            py: 1.5,
            px: 2,
            border: "1px solid",
            borderColor: "divider",
            borderRadius: 2,
            bgcolor: isDark ? "rgba(255, 255, 255, 0.04)" : "rgba(15, 23, 42, 0.03)",
          }}>
            <Typography variant="caption" color="text.secondary" sx={{ display: "block", fontWeight: 700, mb: 0.5 }}>
              E-mail cadastrado
            </Typography>
            <Typography variant="body1" color="text.primary" sx={{ overflowWrap: "anywhere" }}>
              {initialEmail}
            </Typography>
          </Box>
        )}

        <form onSubmit={handleSubmit}>
          {!initialEmail && (
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
                  setError("");
                }}
                placeholder="seu@email.com"
                sx={inputStyles}
                required
              />
            </>
          )}

          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
            Código
          </Typography>
          <TextField
            fullWidth
            name="codigo"
            value={codigo}
            onChange={handleCodigoChange}
            placeholder="000000"
            inputProps={{
              inputMode: "numeric",
              pattern: "[0-9]*",
              maxLength: 6,
              "aria-label": "Código de confirmação de 6 dígitos",
            }}
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
            error={Boolean(error) && !success}
          />

          {error && !success && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || Boolean(success) || !email.trim() || codigo.length !== 6}
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
            {loading ? "Confirmando..." : "Confirmar e-mail"}
          </Button>
        </form>
      </Paper>
    </Box>
  );
};

export default ConfirmEmail;

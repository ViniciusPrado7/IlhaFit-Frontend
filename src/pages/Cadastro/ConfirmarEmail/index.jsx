import { useState } from "react";
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

const getApiMessage = (error) => {
  const data = error?.response?.data;

  if (data && typeof data === "object" && !Array.isArray(data)) {
    return data.erro || data.mensagem || data.message || "Nao foi possivel confirmar o email.";
  }

  return typeof data === "string" ? data : error?.message || "Nao foi possivel confirmar o email.";
};

const ConfirmarEmail = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const isDark = theme.palette.mode === "dark";

  const email = location.state?.email || "";
  const accountType = location.state?.accountType || "aluno";
  const [codigo, setCodigo] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const inputStyles = {
    "& .MuiOutlinedInput-root": {
      bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(16, 185, 129, 0.05)",
      borderRadius: 2,
      "& fieldset": { borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(16, 185, 129, 0.2)" },
      "&:hover fieldset": { borderColor: theme.palette.primary.main },
    },
    "& .MuiInputBase-input": {
      py: 1.65,
      textAlign: "center",
      fontSize: "1.35rem",
      fontWeight: 800,
      letterSpacing: 4,
    },
    mb: 2.5,
  };

  const handleCodigoChange = (event) => {
    setCodigo(event.target.value.replace(/\D/g, "").slice(0, 6));
    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!email || codigo.length !== 6) return;

    setLoading(true);
    setError("");
    try {
      const data = await authService.confirmarEmail(email, codigo);
      toast.success(data?.mensagem || "Email confirmado com sucesso.");
      navigate("/login", { state: { accountType, email } });
    } catch (confirmError) {
      setError(getApiMessage(confirmError));
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
        maxWidth: 720,
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
        >
          <FaTimes size={20} />
        </IconButton>

        <Typography variant="h3" fontWeight={800} sx={{ mb: 2, color: "text.primary", fontSize: { xs: "2rem", md: "2.45rem" } }}>
          Confirmar email
        </Typography>

        <Typography variant="body1" color="text.secondary" sx={{ mb: 3, lineHeight: 1.8 }}>
          Digite o codigo de 6 digitos enviado para {email || "seu email"}.
        </Typography>

        {!email && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Nao encontramos o email do cadastro. Volte ao login e tente novamente.
          </Alert>
        )}

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <form onSubmit={handleSubmit}>
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
            Codigo de confirmacao
          </Typography>
          <TextField
            fullWidth
            name="codigo"
            value={codigo}
            onChange={handleCodigoChange}
            placeholder="123456"
            inputProps={{
              inputMode: "numeric",
              maxLength: 6,
              pattern: "[0-9]*",
            }}
            sx={inputStyles}
            autoFocus
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            disabled={loading || !email || codigo.length !== 6}
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
            {loading ? "Confirmando..." : "Confirmar email"}
          </Button>

          <Box sx={{ mt: 4, textAlign: "center" }}>
            <Typography
              variant="body2"
              color="primary.main"
              fontWeight={700}
              sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
              onClick={() => navigate("/login", { state: { accountType, email } })}
            >
              Voltar para o login
            </Typography>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default ConfirmarEmail;

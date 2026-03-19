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
} from "@mui/material";
import { FaTimes, FaEye, FaEyeSlash } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { authService } from "../../services";
import { toast } from "react-toastify";

const Login = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isDark = theme.palette.mode === 'dark';

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email.trim() || !senha.trim()) {
      toast.error("Preencha todos os campos");
      return;
    }

    setLoading(true);
    try {
      const data = await authService.login(email, senha);
      toast.success(`Bem-vindo, ${data.nome}!`);
      window.dispatchEvent(new Event('storage'));
      navigate("/");
    } catch (error) {
      console.error("Erro no login:", error);
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
          <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
            Email
          </Typography>
          <TextField
            fullWidth
            name="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="seu@email.com"
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
            onChange={(e) => setSenha(e.target.value)}
            placeholder="••••••••"
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
              Não tem conta?{" "}
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

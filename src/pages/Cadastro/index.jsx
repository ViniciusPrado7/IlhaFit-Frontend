import React, { useState } from "react";
import {
    Box,
    Button,
    IconButton,
    InputAdornment,
    Paper,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    useTheme,
} from "@mui/material";
import { FaBuilding, FaEye, FaEyeSlash, FaTimes, FaUser, FaUserTie } from "react-icons/fa";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../../service/AuthService";
import CadastroEstabelecimento from "./CadastroEstabelecimento";
import CadastroProfissional from "./CadastroProfissional";

const alunoInicial = { nome: "", email: "", senha: "", confirmarSenha: "" };
const validarSenha = (senha) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(senha);

const Cadastro = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const isDark = theme.palette.mode === "dark";
    const tiposValidos = ["aluno", "estabelecimento", "profissional"];
    const tipoInicial = tiposValidos.includes(location.state?.accountType) ? location.state.accountType : "aluno";

    const [accountType, setAccountType] = useState(tipoInicial);
    const [formData, setFormData] = useState(alunoInicial);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [loading, setLoading] = useState(false);

    const inputStyles = {
        "& .MuiOutlinedInput-root": {
            bgcolor: isDark ? "rgba(255, 255, 255, 0.05)" : "rgba(16, 185, 129, 0.05)",
            borderRadius: 2,
            "& fieldset": { borderColor: isDark ? "rgba(255, 255, 255, 0.1)" : "rgba(16, 185, 129, 0.2)" },
            "&:hover fieldset": { borderColor: theme.palette.primary.main },
        },
        mb: 2
    };

    const handleTypeChange = (_, newType) => {
        if (newType !== null && newType !== accountType) {
            setAccountType(newType);
            setFormData(alunoInicial);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleAlunoSubmit = async (e) => {
        e.preventDefault();

        if (formData.senha !== formData.confirmarSenha) {
            toast.error("As senhas não coincidem!");
            return;
        }

        if (!validarSenha(formData.senha)) {
            toast.error("Senha deve ter no mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 caractere especial e 1 número.");
            return;
        }

        setLoading(true);
        try {
            await authService.register(formData);
            toast.success("Usuário cadastrado com sucesso!");
            navigate("/login", { state: { accountType: "aluno", email: formData.email } });
        } catch (error) {
            console.error("Erro no cadastro:", error);
            const data = error?.response?.data;
            const message =
                data?.erro ||
                data?.email ||
                data?.senha ||
                data?.confirmacaoSenha ||
                (typeof data === "string" ? data : null) ||
                "Ocorreu um erro ao realizar o cadastro.";

            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    const label = (text) => (
        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
            {text}
        </Typography>
    );

    const passwordFields = () => (
        <Box sx={{ display: "flex", gap: 2, mb: 2, flexDirection: { xs: "column", sm: "row" } }}>
            <Box sx={{ flex: 1 }}>
                {label("Senha")}
                <TextField
                    fullWidth
                    name="senha"
                    type={showPassword ? "text" : "password"}
                    value={formData.senha}
                    onChange={handleInputChange}
                    placeholder="********"
                    required
                    sx={inputStyles}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                    {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>
            <Box sx={{ flex: 1 }}>
                {label("Confirmar Senha")}
                <TextField
                    fullWidth
                    name="confirmarSenha"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmarSenha}
                    onChange={handleInputChange}
                    placeholder="********"
                    required
                    sx={inputStyles}
                    InputProps={{
                        endAdornment: (
                            <InputAdornment position="end">
                                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                                    {showConfirmPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                                </IconButton>
                            </InputAdornment>
                        ),
                    }}
                />
            </Box>
        </Box>
    );

    const alunoForm = () => (
        <form onSubmit={handleAlunoSubmit}>
            {label("Nome Completo")}
            <TextField fullWidth name="nome" value={formData.nome} onChange={handleInputChange} placeholder="Seu nome completo" sx={inputStyles} required />

            {label("Email")}
            <TextField fullWidth name="email" type="email" value={formData.email} onChange={handleInputChange} placeholder="seu@email.com" sx={inputStyles} required />

            {passwordFields()}

            <Button
                type="submit"
                variant="contained"
                fullWidth
                disabled={loading}
                sx={{
                    mt: 2,
                    py: 1.5,
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
                {loading ? "Cadastrando..." : "Cadastrar"}
            </Button>
        </form>
    );

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
                maxWidth: 760,
                p: { xs: 3, sm: 4 },
                borderRadius: 4,
                border: "1px solid",
                borderColor: "divider",
                bgcolor: "background.paper",
                position: "relative"
            }}>
                <IconButton onClick={() => navigate("/")} sx={{ position: "absolute", top: 16, right: 16, color: "text.secondary" }}>
                    <FaTimes size={20} />
                </IconButton>

                <Typography variant="h4" fontWeight={800} sx={{ mb: 3, color: "text.primary" }}>
                    Criar Conta
                </Typography>

                <Box sx={{ mb: 4 }}>
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
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <FaUser size={14} /> Aluno
                            </Box>
                        </ToggleButton>
                        <ToggleButton value="estabelecimento">
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <FaBuilding size={14} /> Estabelecimento
                            </Box>
                        </ToggleButton>
                        <ToggleButton value="profissional">
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <FaUserTie size={14} /> Profissional
                            </Box>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {accountType === "aluno" && alunoForm()}
                {accountType === "estabelecimento" && <CadastroEstabelecimento />}
                {accountType === "profissional" && <CadastroProfissional />}

                {(accountType === "aluno" || accountType === "estabelecimento" || accountType === "profissional") && (
                    <Box sx={{ mt: 3, textAlign: "center" }}>
                        <Typography variant="body2" color="text.secondary">
                            Já tem conta?{" "}
                            <Typography
                                component="span"
                                variant="body2"
                                fontWeight={700}
                                color="primary.main"
                                sx={{ cursor: "pointer", "&:hover": { textDecoration: "underline" } }}
                                onClick={() => navigate("/login", { state: { accountType } })}
                            >
                                Entre
                            </Typography>
                        </Typography>
                    </Box>
                )}
            </Paper>
        </Box>
    );
};

export default Cadastro;


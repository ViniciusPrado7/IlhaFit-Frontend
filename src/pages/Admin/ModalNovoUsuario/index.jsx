import React, { useState } from "react";
import {
    Box,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    InputAdornment,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    useTheme,
} from "@mui/material";
import { FaBuilding, FaEye, FaEyeSlash, FaTimes, FaUser, FaUserTie } from "react-icons/fa";
import { toast } from "react-toastify";
import PrivacyPolicyConsent from "../../../components/PrivacyPolicyConsent";
import { authService } from "../../../service/AuthService";
import CadastroEstabelecimento from "../../Cadastro/CadastroEstabelecimento";
import CadastroProfissional from "../../Cadastro/CadastroProfissional";

const alunoInicial = { nome: "", email: "", senha: "", confirmarSenha: "" };
const validarSenha = (s) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,}$/.test(s);

const ModalNovoUsuario = ({ open, onClose, onSuccess }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";
    const [accountType, setAccountType] = useState("aluno");
    const [alunoData, setAlunoData] = useState(alunoInicial);
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [privacyAccepted, setPrivacyAccepted] = useState(false);
    const [privacyError, setPrivacyError] = useState("");
    const [loading, setLoading] = useState(false);

    const inputStyles = {
        "& .MuiOutlinedInput-root": {
            bgcolor: isDark ? "rgba(255,255,255,0.05)" : "rgba(16,185,129,0.05)",
            borderRadius: 2,
            "& fieldset": { borderColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(16,185,129,0.2)" },
            "&:hover fieldset": { borderColor: theme.palette.primary.main },
        },
        mb: 1.5,
    };

    const handleClose = () => {
        setAlunoData(alunoInicial);
        setPrivacyAccepted(false);
        setPrivacyError("");
        setShowPassword(false);
        setShowConfirmPassword(false);
        setAccountType("aluno");
        onClose();
    };

    const handleTypeChange = (_, newType) => {
        if (newType !== null) setAccountType(newType);
    };

    const handleAlunoSubmit = async (e) => {
        e.preventDefault();
        if (alunoData.senha !== alunoData.confirmarSenha) {
            toast.error("As senhas não coincidem!");
            return;
        }
        if (!validarSenha(alunoData.senha)) {
            toast.error("Senha deve ter no mínimo 8 caracteres, 1 maiúscula, 1 minúscula, 1 caractere especial e 1 número.");
            return;
        }
        if (!privacyAccepted) {
            setPrivacyError("Você precisa aceitar a Política de Privacidade para continuar.");
            return;
        }
        setLoading(true);
        try {
            await authService.register(alunoData);
            toast.success("Usuário cadastrado com sucesso!");
            onSuccess?.();
            handleClose();
        } catch (error) {
            const data = error?.response?.data;
            const message =
                data?.erro || data?.email || data?.senha ||
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

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3, maxHeight: "88vh" } }}
        >
            <DialogTitle sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", py: 2, px: 3 }}>
                <Typography variant="h6" fontWeight={700}>Novo Usuário</Typography>
                <IconButton onClick={handleClose} size="small">
                    <FaTimes size={16} />
                </IconButton>
            </DialogTitle>

            <DialogContent
                sx={{
                    overflowY: "auto",
                    "&::-webkit-scrollbar": { display: "none" },
                    msOverflowStyle: "none",
                    scrollbarWidth: "none",
                    px: 3,
                    pt: 0,
                    pb: 3,
                }}
            >
                {/* Seletor de tipo */}
                <Box sx={{ mb: 3, pt: 1 }}>
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
                                py: 1,
                                "&.Mui-selected": {
                                    bgcolor: "primary.main",
                                    color: "white",
                                    "&:hover": { bgcolor: "primary.dark" },
                                },
                            },
                        }}
                    >
                        <ToggleButton value="aluno">
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <FaUser size={13} /> Usuário
                            </Box>
                        </ToggleButton>
                        <ToggleButton value="estabelecimento">
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <FaBuilding size={13} /> Estabelecimento
                            </Box>
                        </ToggleButton>
                        <ToggleButton value="profissional">
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                                <FaUserTie size={13} /> Profissional
                            </Box>
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {/* Formulário de Aluno */}
                {accountType === "aluno" && (
                    <form id="admin-aluno-form" onSubmit={handleAlunoSubmit}>
                        {label("Nome Completo")}
                        <TextField
                            fullWidth                             name="nome"
                            value={alunoData.nome}
                            onChange={(e) => setAlunoData((p) => ({ ...p, nome: e.target.value }))}
                            placeholder="Nome completo"
                            sx={inputStyles}
                            required
                        />

                        {label("Email")}
                        <TextField
                            fullWidth                             name="email"
                            type="email"
                            value={alunoData.email}
                            onChange={(e) => setAlunoData((p) => ({ ...p, email: e.target.value }))}
                            placeholder="email@exemplo.com"
                            sx={inputStyles}
                            required
                        />

                        <Box sx={{ display: "flex", gap: 2, flexDirection: { xs: "column", sm: "row" } }}>
                            <Box sx={{ flex: 1 }}>
                                {label("Senha")}
                                <TextField
                                    fullWidth                                     name="senha"
                                    type={showPassword ? "text" : "password"}
                                    value={alunoData.senha}
                                    onChange={(e) => setAlunoData((p) => ({ ...p, senha: e.target.value }))}
                                    placeholder="********"
                                    required
                                    sx={inputStyles}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowPassword(!showPassword)} edge="end" size="small">
                                                    {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                            <Box sx={{ flex: 1 }}>
                                {label("Confirmar Senha")}
                                <TextField
                                    fullWidth                                     name="confirmarSenha"
                                    type={showConfirmPassword ? "text" : "password"}
                                    value={alunoData.confirmarSenha}
                                    onChange={(e) => setAlunoData((p) => ({ ...p, confirmarSenha: e.target.value }))}
                                    placeholder="********"
                                    required
                                    sx={inputStyles}
                                    InputProps={{
                                        endAdornment: (
                                            <InputAdornment position="end">
                                                <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end" size="small">
                                                    {showConfirmPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                                </IconButton>
                                            </InputAdornment>
                                        ),
                                    }}
                                />
                            </Box>
                        </Box>

                        <PrivacyPolicyConsent
                            checked={privacyAccepted}
                            onChange={(checked) => {
                                setPrivacyAccepted(checked);
                                if (checked) setPrivacyError("");
                            }}
                            error={privacyError}
                        />

                        <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
                            <Button onClick={handleClose} variant="outlined" fullWidth sx={{ borderRadius: 2, textTransform: "none" }}>
                                Cancelar
                            </Button>
                            <Button
                                type="submit"
                                variant="contained"
                                fullWidth
                                disabled={loading}
                                sx={{ borderRadius: 2, textTransform: "none", fontWeight: 700 }}
                            >
                                {loading ? "Cadastrando..." : "Cadastrar"}
                            </Button>
                        </Box>
                    </form>
                )}

                {/* Formulário de Estabelecimento */}
                {accountType === "estabelecimento" && (
                    <CadastroEstabelecimento
                        onSuccess={() => {
                            onSuccess?.();
                            handleClose();
                        }}
                    />
                )}

                {/* Formulário de Profissional */}
                {accountType === "profissional" && (
                    <CadastroProfissional
                        onSuccess={() => {
                            onSuccess?.();
                            handleClose();
                        }}
                    />
                )}
            </DialogContent>
        </Dialog>
    );
};

export default ModalNovoUsuario;

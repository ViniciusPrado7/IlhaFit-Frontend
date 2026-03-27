import React, { useState } from "react";
import {
    Box,
    Typography,
    TextField,
    Button,
    Grid,
    Paper,
    ToggleButton,
    ToggleButtonGroup,
    Checkbox,
    FormControlLabel,
    IconButton,
    Avatar,
    useTheme,
    Divider,
    Collapse,
    Autocomplete,
    Chip,
    InputAdornment
} from "@mui/material";
import { FaTimes, FaUpload, FaEye, FaEyeSlash, FaChevronDown } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { authService } from "../../../service/AuthService";

const CadastroProfissional = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const isDark = theme.palette.mode === 'dark';

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [step, setStep] = useState(1);
    const [expandedActivities, setExpandedActivities] = useState(new Set());
    const [formData, setFormData] = useState({
        nome: "",
        email: "",
        senha: "",
        confirmarSenha: "",
        telefone: "",
        cpf: "",
        sexo: "",
        registroCref: "",
        gradeAtividades: [],
        fotoUrl: "",
        outrosAtividade: "",
    });

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = error => reject(error);
        });
    };

    // --- Máscaras ---
    const maskCPF = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1');
    };

    const maskPhone = (value) => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1');
    };

    const maskCREF = (value) => {
        return value
            .toUpperCase()
            .replace(/[^0-9A-Z/-]/g, '')
            .replace(/^(\d{6})([a-zA-Z])/, '$1-$2')
            .replace(/(-[a-zA-Z])([a-zA-Z]{2})/, '$1/$2')
            .substring(0, 11);
    };

    const validatePassword = (password) => {
        const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        return regex.test(password);
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        let newValue = value;
        if (name === "cpf") newValue = maskCPF(value);
        else if (name === "telefone") newValue = maskPhone(value);
        else if (name === "registroCref") newValue = maskCREF(value);
        setFormData(prev => ({ ...prev, [name]: newValue }));
    };

    const handleExpandToggle = (atividade) => {
        setExpandedActivities(prev => {
            const next = new Set(prev);
            if (next.has(atividade)) next.delete(atividade);
            else next.add(atividade);
            return next;
        });
    };

    const handleGradeUpdate = (atividade, field, value) => {
        setFormData(prev => ({
            ...prev,
            gradeAtividades: prev.gradeAtividades.map(g =>
                g.atividade === atividade ? { ...g, [field]: value } : g
            )
        }));
    };

    const handleFileChange = async (e) => {
        if (e.target.files && e.target.files.length > 0) {
            try {
                const file = e.target.files[0];
                const base64 = await convertToBase64(file);
                setFormData(prev => ({ ...prev, fotoUrl: base64 }));
            } catch (error) {
                console.error("Erro ao converter imagem:", error);
                toast.error("Erro ao processar a imagem. Tente novamente.");
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (step === 1) {
            if (formData.senha !== formData.confirmarSenha) {
                toast.error("As senhas não coincidem!");
                return;
            }
            if (!validatePassword(formData.senha)) {
                toast.error("Senha deve ter no mínimo 8 dígitos, 1 maiúscula, 1 caractere especial e 1 número.");
                return;
            }
            // Avança para o Step 2
            setStep(2);
            window.scrollTo(0, 0);
            return;
        }
        performRegistration();
    };

    const performRegistration = async () => {
        try {
            const dataToSend = { ...formData };
            if (dataToSend.telefone) dataToSend.telefone = dataToSend.telefone.replace(/\D/g, "");
            if (dataToSend.cpf) dataToSend.cpf = dataToSend.cpf.replace(/\D/g, "");
            await authService.register(dataToSend, "profissional");
            try {
                const loginData = await authService.login(formData.email, formData.senha);
                toast.success(`Cadastro realizado! Bem-vindo(a), ${loginData.nome}! 🚀`);
                window.dispatchEvent(new Event('storage'));
            } catch (loginErr) {
                toast.success("Cadastro realizado com sucesso! Faça login para continuar.");
            }
            window.location.href = "/";
        } catch (error) {
            console.error("Erro no cadastro:", error);
        }
    };

    // --- Listas de Atividades ---
    const atividadesList = [
        "Academia", "CrossFit", "Funcional", "Pilates", "Yoga", "Dança",
        "Balé", "Basquete", "Futebol", "Natação", "Vôlei", "Jiu-Jitsu",
        "Boxe", "Muay Thai", "Kung Fu", "Ciclismo", "Circo", "Fisioterapia",
        "Outros"
    ];

    const crefRequiredActivities = [
        "Academia", "CrossFit", "Funcional", "Natação", "Basquete", "Futebol",
        "Vôlei", "Boxe", "Muay Thai", "Kung Fu", "Jiu-Jitsu", "Ciclismo"
    ];

    const showCref = formData.gradeAtividades.some(g => crefRequiredActivities.includes(g.atividade));

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
        <form onSubmit={handleSubmit} style={{ width: "100%" }}>
            {step === 1 ? (
                <>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                        Nome Completo
                    </Typography>
                    <TextField
                        fullWidth
                        name="nome"
                        value={formData.nome}
                        onChange={handleInputChange}
                        placeholder="Seu nome completo"
                        sx={inputStyles}
                        required
                    />
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                        Email
                    </Typography>
                    <TextField
                        fullWidth
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="seu@email.com"
                        sx={inputStyles}
                        required
                    />
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                WhatsApp / Telefone
                            </Typography>
                            <TextField
                                fullWidth
                                name="telefone"
                                value={formData.telefone}
                                onChange={handleInputChange}
                                placeholder="5548999999999"
                                sx={inputStyles}
                                required
                            />
                        </Box>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                CPF
                            </Typography>
                            <TextField
                                fullWidth
                                name="cpf"
                                value={formData.cpf}
                                onChange={handleInputChange}
                                placeholder="000.000.000-00"
                                sx={inputStyles}
                                required
                            />
                        </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Box sx={{ flex: 1 }}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                Senha
                            </Typography>
                            <TextField
                                fullWidth
                                name="senha"
                                type={showPassword ? "text" : "password"}
                                value={formData.senha}
                                onChange={handleInputChange}
                                placeholder="••••••••"
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
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                Confirmar Senha
                            </Typography>
                            <TextField
                                fullWidth
                                name="confirmarSenha"
                                type={showConfirmPassword ? "text" : "password"}
                                value={formData.confirmarSenha}
                                onChange={handleInputChange}
                                placeholder="••••••••"
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
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: "text.secondary" }}>
                        Foto de Perfil
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                            <Avatar
                                src={formData.fotoUrl}
                                sx={{
                                    width: 80,
                                    height: 80,
                                    border: '2px solid',
                                    borderColor: 'primary.main',
                                }}
                            />
                            <Button
                                variant="outlined"
                                component="label"
                                startIcon={<FaUpload />}
                                sx={{ textTransform: 'none', borderRadius: 2 }}
                            >
                                Upload
                                <input
                                    type="file"
                                    hidden
                                    accept="image/*"
                                    onChange={handleFileChange}
                                />
                            </Button>
                        </Box>
                    </Box>
                </>
            ) : (
                <>
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="h6" fontWeight={700} sx={{ mb: 1 }}>
                            Quase lá! 🏋️‍♀️
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                            Agora defina suas atividades e horários de disponibilidade.
                        </Typography>
                    </Box>
                    {showCref && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                Registro CREF (Opcional)
                            </Typography>
                            <TextField
                                fullWidth
                                name="registroCref"
                                value={formData.registroCref}
                                onChange={handleInputChange}
                                placeholder="000000-G/SC"
                                sx={inputStyles}
                            />
                        </Box>
                    )}
                    <Box sx={{ mb: 3 }}>
                        <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                            Sexo
                        </Typography>
                        <ToggleButtonGroup
                            value={formData.sexo}
                            exclusive
                            onChange={(e, val) => val && setFormData(prev => ({ ...prev, sexo: val }))}
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
                                        "&:hover": { bgcolor: "primary.dark" }
                                    }
                                }
                            }}
                        >
                            <ToggleButton value="Feminino">Feminino</ToggleButton>
                            <ToggleButton value="Masculino">Masculino</ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                    <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: "text.secondary" }}>
                        Sua Especialidade/Profissão *
                    </Typography>
                    <Autocomplete
                        multiple
                        options={atividadesList.sort()}
                        value={formData.gradeAtividades.map(g => g.atividade)}
                        onChange={(event, newValue) => {
                            const currentActivities = formData.gradeAtividades.map(g => g.atividade);
                            const added = newValue.filter(v => !currentActivities.includes(v));
                            const removed = currentActivities.filter(v => !newValue.includes(v));
                            let newGrade = [...formData.gradeAtividades];
                            added.forEach(atividade => {
                                newGrade.push({ atividade, diasSemana: [], periodos: [], exclusivoMulheres: false });
                                setExpandedActivities(prev => new Set(prev).add(atividade));
                            });
                            if (removed.length > 0) {
                                newGrade = newGrade.filter(g => !removed.includes(g.atividade));
                                setExpandedActivities(prev => {
                                    const next = new Set(prev);
                                    removed.forEach(r => next.delete(r));
                                    return next;
                                });
                            }
                            setFormData(prev => ({ ...prev, gradeAtividades: newGrade }));
                        }}
                        renderInput={(params) => <TextField {...params} placeholder="Selecione as atividades..." sx={inputStyles} />}
                        renderTags={() => null}
                        sx={{ mb: 2 }}
                    />
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
                        {formData.gradeAtividades.map((g, index) => (
                            <Chip
                                key={index}
                                label={g.atividade}
                                onDelete={() => {
                                    const newGrade = formData.gradeAtividades.filter(item => item.atividade !== g.atividade);
                                    setFormData(prev => ({ ...prev, gradeAtividades: newGrade }));
                                }}
                                sx={{ borderRadius: 1.5, fontWeight: 700, bgcolor: 'primary.main', color: 'white' }}
                            />
                        ))}
                    </Box>
                    {formData.gradeAtividades.some(g => g.atividade === "Outros") && (
                        <Box sx={{ mb: 3 }}>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 0.5, color: "text.secondary" }}>
                                Especifique a outra atividade
                            </Typography>
                            <TextField
                                fullWidth
                                name="outrosAtividade"
                                value={formData.outrosAtividade}
                                onChange={handleInputChange}
                                placeholder="Ex: Tênis de Mesa, Surf..."
                                sx={inputStyles}
                                required
                            />
                        </Box>
                    )}
                    {formData.gradeAtividades.length > 0 && (
                        <>
                            <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 1, color: "text.secondary" }}>
                                Configurar Horários
                            </Typography>
                            <Paper variant="outlined" sx={{
                                p: 2, mb: 3, borderRadius: 2, overflow: 'hidden',
                                bgcolor: isDark ? "rgba(255, 255, 255, 0.02)" : "rgba(16, 185, 129, 0.02)",
                            }}>
                                <Grid container spacing={1}>
                                    {formData.gradeAtividades.map((grade) => {
                                        const atividade = grade.atividade;
                                        return (
                                            <Grid item xs={12} key={atividade} sx={{ mb: 1 }}>
                                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                                    <Typography variant="body2" fontWeight={700} sx={{ color: 'primary.main', display: 'flex', alignItems: 'center', gap: 1 }}>
                                                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'primary.main' }} />
                                                        {atividade === "Outros" ? `Outros (${formData.outrosAtividade || '...'})` : atividade}
                                                    </Typography>
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleExpandToggle(atividade)}
                                                        sx={{
                                                            transition: 'transform 0.3s',
                                                            transform: expandedActivities.has(atividade) ? 'rotate(180deg)' : 'rotate(0deg)'
                                                        }}
                                                    >
                                                        <FaChevronDown size={14} />
                                                    </IconButton>
                                                </Box>
                                                <Collapse in={expandedActivities.has(atividade)}>
                                                    <Box sx={{ ml: 2, mt: 1, pb: 2 }}>
                                                        <Typography variant="caption" color="text.secondary" fontWeight={700}>Dias da Semana:</Typography>
                                                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1, mt: 0.5 }}>
                                                            {["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"].map(dia => (
                                                                <ToggleButton
                                                                    key={dia}
                                                                    value={dia}
                                                                    selected={grade.diasSemana?.includes(dia)}
                                                                    onChange={() => {
                                                                        const newDias = grade.diasSemana?.includes(dia)
                                                                            ? grade.diasSemana.filter(d => d !== dia)
                                                                            : [...(grade.diasSemana || []), dia];
                                                                        handleGradeUpdate(atividade, 'diasSemana', newDias);
                                                                    }}
                                                                    size="small"
                                                                    sx={{ borderRadius: 1.5, px: 1, py: 0.2, fontSize: '0.65rem' }}
                                                                >
                                                                    {dia}
                                                                </ToggleButton>
                                                            ))}
                                                        </Box>
                                                        <Typography variant="caption" color="text.secondary" fontWeight={700}>Período:</Typography>
                                                        <Box sx={{ display: 'flex', gap: 0.5, mt: 0.5 }}>
                                                            {["Manhã", "Tarde", "Noite"].map(periodo => (
                                                                <ToggleButton
                                                                    key={periodo}
                                                                    value={periodo}
                                                                    selected={grade.periodos?.includes(periodo)}
                                                                    onChange={() => {
                                                                        const newPeriodos = grade.periodos?.includes(periodo)
                                                                            ? grade.periodos.filter(p => p !== periodo)
                                                                            : [...(grade.periodos || []), periodo];
                                                                        handleGradeUpdate(atividade, 'periodos', newPeriodos);
                                                                    }}
                                                                    size="small"
                                                                    sx={{ borderRadius: 1.5, px: 1, py: 0.2, fontSize: '0.65rem' }}
                                                                >
                                                                    {periodo}
                                                                </ToggleButton>
                                                            ))}
                                                        </Box>
                                                        {formData.sexo === "Feminino" && (
                                                            <Box sx={{ mt: 1.5 }}>
                                                                <FormControlLabel
                                                                    control={
                                                                        <Checkbox
                                                                            size="small"
                                                                            checked={grade.exclusivoMulheres || false}
                                                                            onChange={(e) => handleGradeUpdate(atividade, 'exclusivoMulheres', e.target.checked)}
                                                                        />
                                                                    }
                                                                    label={<Typography variant="caption" fontWeight={600}>Oferecer aula apenas para mulheres</Typography>}
                                                                />
                                                            </Box>
                                                        )}
                                                    </Box>
                                                </Collapse>
                                                <Divider sx={{ mt: 1, opacity: 0.3 }} />
                                            </Grid>
                                        );
                                    })}
                                </Grid>
                            </Paper>
                        </>
                    )}
                    <Button onClick={() => setStep(1)} sx={{ mb: 2, textTransform: 'none' }}>
                        Voltar para dados básicos
                    </Button>
                </>
            )}
            <Button
                type="submit"
                variant="contained"
                fullWidth
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
                {step === 1 ? "Continuar" : "Cadastrar"}
            </Button>
        </form>
    );
};

export default CadastroProfissional;
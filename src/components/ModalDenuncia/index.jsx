import React, { useState } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    Typography,
    RadioGroup,
    FormControlLabel,
    Radio,
    TextField,
    Box,
    useTheme,
    alpha,
} from '@mui/material';
import { FaFlag, FaExclamationTriangle } from 'react-icons/fa';
import { denunciaService } from '../../service/DenunciaService';
import { toast } from 'react-toastify';

const MOTIVOS = [
    { value: 'PRECONCEITO', label: 'Conteúdo Preconceituoso / Discurso de Ódio' },
    { value: 'LINGUAGEM_OFENSIVA', label: 'Linguagem Ofensiva / Xingamentos' },
    { value: 'SPAM', label: 'Spam ou Propaganda' },
    { value: 'INFORMACAO_FALSA', label: 'Informação Falsa' },
    { value: 'OUTROS', label: 'Outros' },
];

const getDenunciaSubmitError = (error) => {
    if (error?.response?.status === 422) {
        return 'Não foi possível enviar sua denúncia porque a descrição contém conteúdo ofensivo ou inadequado.';
    }

    if (error?.response?.status === 503) {
        return 'Não foi possível validar sua mensagem no momento. Tente novamente em instantes.';
    }

    return error.response?.data?.erro || 'Erro ao enviar denúncia.';
};

const ModalDenuncia = ({ open, onClose, avaliacaoId, onSuccess }) => {
    const theme = useTheme();
    const [motivo, setMotivo] = useState('');
    const [descricaoAdicional, setDescricaoAdicional] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async () => {
        if (!motivo) {
            toast.warning('Selecione um motivo para a denúncia.');
            return;
        }

        setLoading(true);
        try {
            await denunciaService.criarDenuncia({
                avaliacaoId,
                motivo,
                descricaoAdicional: descricaoAdicional.trim() || null,
            });
            toast.success('Denúncia enviada com sucesso! Obrigado pelo seu reporte.');
            setMotivo('');
            setDescricaoAdicional('');
            onSuccess?.();
            onClose();
        } catch (error) {
            toast.error(getDenunciaSubmitError(error));
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setMotivo('');
        setDescricaoAdicional('');
        onClose();
    };

    return (
        <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="sm"
            fullWidth
            PaperProps={{ sx: { borderRadius: 3 } }}
        >
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1.5, pb: 1 }}>
                <Box sx={{
                    p: 1,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.error.main, 0.1),
                    color: 'error.main',
                    display: 'flex',
                    alignItems: 'center',
                }}>
                    <FaFlag size={18} />
                </Box>
                <Box>
                    <Typography variant="h6" fontWeight={700}>Denunciar Avaliação</Typography>
                    <Typography variant="caption" color="text.secondary">
                        Selecione o motivo da denúncia
                    </Typography>
                </Box>
            </DialogTitle>

            <DialogContent sx={{ pt: 2 }}>
                <RadioGroup value={motivo} onChange={(e) => setMotivo(e.target.value)}>
                    {MOTIVOS.map((m) => (
                        <FormControlLabel
                            key={m.value}
                            value={m.value}
                            control={<Radio size="small" />}
                            label={
                                <Typography variant="body2" fontWeight={500}>
                                    {m.label}
                                </Typography>
                            }
                            sx={{
                                mb: 0.5,
                                mx: 0,
                                py: 0.5,
                                px: 1.5,
                                borderRadius: 2,
                                border: '1px solid',
                                borderColor: motivo === m.value ? 'primary.main' : 'divider',
                                bgcolor: motivo === m.value ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                                transition: 'all 0.2s',
                            }}
                        />
                    ))}
                </RadioGroup>

                {motivo === 'OUTROS' && (
                    <TextField
                        fullWidth
                        multiline
                        rows={3}
                        placeholder="Descreva o motivo da denúncia..."
                        value={descricaoAdicional}
                        onChange={(e) => setDescricaoAdicional(e.target.value)}
                        sx={{ mt: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                        size="small"
                    />
                )}

                <Box sx={{
                    mt: 2,
                    p: 2,
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.warning.main, 0.08),
                    border: '1px solid',
                    borderColor: alpha(theme.palette.warning.main, 0.2),
                    display: 'flex',
                    gap: 1.5,
                    alignItems: 'flex-start',
                }}>
                    <FaExclamationTriangle color={theme.palette.warning.main} size={16} style={{ marginTop: 2, flexShrink: 0 }} />
                    <Typography variant="caption" color="text.secondary">
                        Denúncias falsas podem resultar em penalidades. Use este recurso apenas para reportar conteúdo genuinamente inapropriado.
                    </Typography>
                </Box>
            </DialogContent>

            <DialogActions sx={{ px: 3, pb: 2.5 }}>
                <Button
                    onClick={handleClose}
                    sx={{ textTransform: 'none', fontWeight: 600 }}
                >
                    Cancelar
                </Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    color="error"
                    disabled={loading || !motivo}
                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2, px: 3 }}
                >
                    {loading ? 'Enviando...' : 'Enviar Denúncia'}
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default ModalDenuncia;

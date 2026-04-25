import React, { useState, useEffect } from "react";
import {
    Box, Typography, Paper, Table, TableBody, TableCell,
    TableContainer, TableHead, TableRow, IconButton, Chip,
    Button, CircularProgress, Tooltip, useTheme, alpha,
} from "@mui/material";
import { FaCheck, FaTimes, FaTags } from "react-icons/fa";
import { solicitacaoCategoriaService } from "../../../services";
import { toast } from "react-toastify";

const STATUS_CONFIG = {
    PENDENTE:  { label: "Pendente",  color: "warning" },
    APROVADA:  { label: "Aprovada",  color: "success" },
    REJEITADA: { label: "Rejeitada", color: "error"   },
};

const FILTROS = [
    { value: null,        label: "Todas"      },
    { value: "PENDENTE",  label: "Pendentes"  },
    { value: "APROVADA",  label: "Aprovadas"  },
    { value: "REJEITADA", label: "Rejeitadas" },
];

const SolicitacoesCategoriasTab = ({ onCountChange }) => {
    const theme = useTheme();
    const [solicitacoes, setSolicitacoes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState("PENDENTE");

    useEffect(() => {
        load();
    }, [filterStatus]);

    const load = async () => {
        try {
            setLoading(true);
            const data = await solicitacaoCategoriaService.getAll(filterStatus);
            setSolicitacoes(data);
            if (onCountChange && filterStatus === "PENDENTE") {
                onCountChange(data.length);
            }
        } catch {
            toast.error("Erro ao carregar solicitações.");
        } finally {
            setLoading(false);
        }
    };

    const handleAprovar = async (id) => {
        try {
            await solicitacaoCategoriaService.aprovar(id);
            toast.success("Categoria criada com sucesso!");
            load();
        } catch (error) {
            toast.error(error.response?.data?.erro || "Erro ao aprovar solicitação.");
        }
    };

    const handleRejeitar = async (id) => {
        try {
            await solicitacaoCategoriaService.rejeitar(id);
            toast.success("Solicitação rejeitada.");
            load();
        } catch (error) {
            toast.error(error.response?.data?.erro || "Erro ao rejeitar solicitação.");
        }
    };

    const pendentes = solicitacoes.filter(s => s.status === "PENDENTE").length;

    const formatDate = (dateStr) => {
        if (!dateStr) return "—";
        return new Date(dateStr).toLocaleDateString("pt-BR", {
            day: "2-digit", month: "2-digit", year: "numeric",
            hour: "2-digit", minute: "2-digit",
        });
    };

    return (
        <Box>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                        <FaTags /> Solicitações de Categorias
                    </Typography>
                    <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                        {solicitacoes.length} solicitaç{solicitacoes.length !== 1 ? "ões" : "ão"}
                        {pendentes > 0 && ` · ${pendentes} pendente${pendentes !== 1 ? "s" : ""}`}
                    </Typography>
                </Box>
            </Box>

            <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
                {FILTROS.map((f) => (
                    <Button
                        key={f.label}
                        variant={filterStatus === f.value ? "contained" : "outlined"}
                        size="small"
                        onClick={() => setFilterStatus(f.value)}
                        sx={{ textTransform: "none", fontWeight: 600, borderRadius: 10, px: 2.5 }}
                    >
                        {f.label}
                    </Button>
                ))}
            </Box>

            <TableContainer component={Paper} elevation={0}
                sx={{ border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Nome</strong></TableCell>
                            <TableCell><strong>Descrição</strong></TableCell>
                            <TableCell><strong>Solicitante</strong></TableCell>
                            <TableCell><strong>Status</strong></TableCell>
                            <TableCell><strong>Data</strong></TableCell>
                            <TableCell align="right"><strong>Ações</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                    <CircularProgress size={32} />
                                </TableCell>
                            </TableRow>
                        ) : solicitacoes.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} align="center" sx={{ py: 5 }}>
                                    <Typography color="text.secondary">Nenhuma solicitação encontrada.</Typography>
                                </TableCell>
                            </TableRow>
                        ) : (
                            solicitacoes.map((s) => (
                                <TableRow key={s.id} hover>
                                    <TableCell sx={{ fontWeight: 600 }}>{s.nome}</TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary"
                                            noWrap sx={{ maxWidth: 220 }} title={s.descricao}>
                                            {s.descricao || "—"}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="body2" color="text.secondary">
                                            {s.solicitanteEmail}
                                        </Typography>
                                    </TableCell>
                                    <TableCell>
                                        <Chip
                                            label={STATUS_CONFIG[s.status]?.label || s.status}
                                            color={STATUS_CONFIG[s.status]?.color || "default"}
                                            size="small"
                                            sx={{ fontWeight: 600 }}
                                        />
                                    </TableCell>
                                    <TableCell>
                                        <Typography variant="caption" color="text.secondary">
                                            {formatDate(s.dataSolicitacao)}
                                        </Typography>
                                    </TableCell>
                                    <TableCell align="right">
                                        {s.status === "PENDENTE" && (
                                            <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                                                <Tooltip title="Aprovar e criar categoria">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleAprovar(s.id)}
                                                        sx={{
                                                            color: "success.main",
                                                            bgcolor: alpha(theme.palette.success.main, 0.08),
                                                            "&:hover": { bgcolor: alpha(theme.palette.success.main, 0.2) },
                                                        }}
                                                    >
                                                        <FaCheck size={12} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Rejeitar solicitação">
                                                    <IconButton
                                                        size="small"
                                                        onClick={() => handleRejeitar(s.id)}
                                                        sx={{
                                                            color: "error.main",
                                                            bgcolor: alpha(theme.palette.error.main, 0.08),
                                                            "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.2) },
                                                        }}
                                                    >
                                                        <FaTimes size={12} />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>
        </Box>
    );
};

export default SolicitacoesCategoriasTab;

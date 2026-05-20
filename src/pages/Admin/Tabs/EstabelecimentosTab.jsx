import React, { useState, useEffect, useMemo } from "react";
import { usePersistedRowsPerPage } from "../../../hooks/usePersistedRowsPerPage";
import {
    Box,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    Chip,
    Button,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    CircularProgress,
    Tooltip,
    TablePagination,
    useTheme,
    alpha,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
} from "@mui/material";
import {
    FaTrash,
    FaSearch,
    FaExclamationTriangle,
    FaEye,
    FaBuilding,
    FaDownload,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { estabelecimentoService } from "../../../services";
import ModalDetalhesEstabelecimento from "../../../components/ModalDetalhesEstabelecimento";

const EstabelecimentosTab = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    const [estabelecimentos, setEstabelecimentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [selectedEstado, setSelectedEstado] = useState("");
    const [deleteDialog, setDeleteDialog] = useState({ open: false, estabelecimento: null });
    const [selectedEstab, setSelectedEstab] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = usePersistedRowsPerPage(10);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(0);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        loadEstabelecimentos();
    }, []);

    const loadEstabelecimentos = async () => {
        try {
            setLoading(true);
            const data = await estabelecimentoService.getAll();
            setEstabelecimentos(data);
        } catch (error) {
            console.error("Erro ao carregar estabelecimentos:", error);
            toast.error("Erro ao carregar estabelecimentos");
        } finally {
            setLoading(false);
        }
    };

    const uniqueEstados = useMemo(() => {
        const states = estabelecimentos
            .map((e) => e.endereco?.estado)
            .filter((estado) => typeof estado === "string" && estado.trim() !== "");
        return [...new Set(states)].sort();
    }, [estabelecimentos]);

    const filteredEstabelecimentos = useMemo(() => {
        let filtered = estabelecimentos;

        if (selectedEstado) {
            filtered = filtered.filter(
                (e) => e.endereco?.estado?.toLowerCase() === selectedEstado.toLowerCase()
            );
        }

        if (debouncedSearchTerm) {
            filtered = filtered.filter(
                (e) =>
                    e.nome?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                    e.nomeFantasia?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                    e.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [estabelecimentos, selectedEstado, debouncedSearchTerm]);

    const paginatedEstabelecimentos = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return filteredEstabelecimentos.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredEstabelecimentos, page, rowsPerPage]);

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleOpenModal = (estab) => {
        const atividades = (estab.categorias || []).map((c) => c.nome);
        const mapped = {
            ...estab,
            nome: estab.nomeFantasia || estab.nome,
            Imagem: (estab.fotosUrl && estab.fotosUrl.length > 0) ? estab.fotosUrl[0] : "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop",
            Imagens: estab.fotosUrl || [],
            categorias: atividades,
            avaliacao: estab.avaliacao || 0.0,
            aberto: true,
            descricao: estab.descricao || "Um ótimo local para treinar e cuidar da sua saúde.",
        };
        setSelectedEstab(mapped);
        setIsModalOpen(true);
    };

    const handleDelete = async () => {
        if (!deleteDialog.estabelecimento) return;

        try {
            await estabelecimentoService.delete(deleteDialog.estabelecimento.id);
            toast.success("Estabelecimento excluído com sucesso!");
            loadEstabelecimentos();
            setDeleteDialog({ open: false, estabelecimento: null });
        } catch (error) {
            console.error("Erro ao excluir estabelecimento:", error);
            toast.error("Erro ao excluir estabelecimento");
        }
    };

    const handleExportCSV = () => {
        const headers = [
            "Nome Fantasia",
            "Razão Social",
            "Email",
            "Telefone",
            "CNPJ",
            "Categorias",
            "Endereço",
            "Bairro",
            "Cidade",
            "Estado",
            "CEP",
            "Avaliação"
        ];

        const rows = filteredEstabelecimentos.map(estab => {
            const nomeFantasia = estab.nomeFantasia || "";
            const razaoSocial = estab.nome || "";
            const email = estab.email || "";
            const telefone = estab.telefone || "";
            const cnpj = estab.cnpj || "";
            const categoriasStr = (estab.categorias || []).map(c => c.nome).join(", ");
            const rua = estab.endereco?.rua || "";
            const numero = estab.endereco?.numero || "";
            const enderecoStr = rua ? `${rua}${numero ? `, ${numero}` : ""}` : "";
            const bairro = estab.endereco?.bairro || "";
            const cidade = estab.endereco?.cidade || "";
            const estado = estab.endereco?.estado || "";
            const cep = estab.endereco?.cep || "";
            const avaliacao = estab.avaliacao !== undefined && estab.avaliacao !== null ? String(estab.avaliacao) : "0";

            return [
                nomeFantasia,
                razaoSocial,
                email,
                telefone,
                cnpj,
                categoriasStr,
                enderecoStr,
                bairro,
                cidade,
                estado,
                cep,
                avaliacao
            ];
        });

        const csvContent = "\uFEFF" + [
            headers.join(";"),
            ...rows.map(row => row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(";"))
        ].join("\n");

        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `estabelecimentos_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = "hidden";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Box>
            {/* Header com total e botão de exportação */}
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3 }}>
                <Box>
                    <Typography variant="h5" fontWeight={700} display="flex" alignItems="center" gap={1}>
                        <FaBuilding /> Estabelecimentos
                    </Typography>
                    <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
                        {estabelecimentos.length} estabelecimento{estabelecimentos.length !== 1 ? "s" : ""} cadastrado{estabelecimentos.length !== 1 ? "s" : ""}
                    </Typography>
                </Box>
                <Button
                    variant="contained"
                    color="primary"
                    startIcon={<FaDownload />}
                    onClick={handleExportCSV}
                    sx={{ borderRadius: 2, textTransform: "none", fontWeight: 600 }}
                >
                    Exportar para CSV
                </Button>
            </Box>

            {/* Busca e Filtros */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                    <TextField
                        placeholder="Buscar por nome, fantasia ou email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        size="small"
                        sx={{ flex: 1, minWidth: 250 }}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FaSearch size={16} />
                                </InputAdornment>
                            ),
                        }}
                    />

                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel id="select-estado-label">Filtrar por Estado</InputLabel>
                        <Select
                            labelId="select-estado-label"
                            value={selectedEstado}
                            label="Filtrar por Estado"
                            onChange={(e) => {
                                setSelectedEstado(e.target.value);
                                setPage(0);
                            }}
                            MenuProps={{
                                PaperProps: {
                                    sx: {
                                        maxHeight: 200,
                                        overflowY: "auto",
                                        "&::-webkit-scrollbar": {
                                            display: "none",
                                        },
                                        msOverflowStyle: "none",
                                        scrollbarWidth: "none",
                                    }
                                }
                            }}
                        >
                            <MenuItem value="">
                                <em>Todos os Estados</em>
                            </MenuItem>
                            {uniqueEstados.map((estado) => (
                                <MenuItem key={estado} value={estado}>
                                    {estado}
                                </MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <Chip
                        label={`${filteredEstabelecimentos.length} resultado${filteredEstabelecimentos.length !== 1 ? "s" : ""}`}
                        size="small"
                        color="primary"
                        sx={{ fontWeight: 600 }}
                    />
                </Box>
            </Paper>

            {/* Tabela */}
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Nome Fantasia</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Categorias</strong></TableCell>
                            <TableCell align="right"><strong>Ações</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center" sx={{ py: 5 }}>
                                    <CircularProgress size={32} />
                                </TableCell>
                            </TableRow>
                        ) : paginatedEstabelecimentos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">Nenhum estabelecimento encontrado</TableCell>
                            </TableRow>
                        ) : (
                            paginatedEstabelecimentos.map((estab) => (
                                <TableRow
                                    key={estab.id}
                                    hover
                                    onClick={() => handleOpenModal(estab)}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <TableCell>{estab.nomeFantasia || estab.nome || "N/A"}</TableCell>
                                    <TableCell>{estab.email || "N/A"}</TableCell>
                                    <TableCell>
                                        <Box sx={{ display: "flex", gap: 0.5, flexWrap: "wrap" }}>
                                            {(estab.categorias || []).slice(0, 3).map((c) => {
                                                return (
                                                    <Chip
                                                        key={c.id}
                                                        label={c.nome}
                                                        size="small"
                                                        sx={{
                                                            bgcolor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.1),
                                                            color: theme.palette.primary.main,
                                                            fontWeight: 600,
                                                            fontSize: "0.7rem",
                                                        }}
                                                    />
                                                );
                                            })}
                                            {(estab.categorias || []).length > 3 && (
                                                <Chip
                                                    label={`+${(estab.categorias || []).length - 3}`}
                                                    size="small"
                                                    sx={{
                                                        bgcolor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.1),
                                                        color: theme.palette.primary.main,
                                                        fontWeight: 600,
                                                        fontSize: "0.7rem",
                                                    }}
                                                />
                                            )}
                                            {(!estab.categorias || estab.categorias.length === 0) && (
                                                <Typography variant="caption" color="text.secondary">—</Typography>
                                            )}
                                        </Box>
                                    </TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                                            <Tooltip title="Ver perfil">
                                                <IconButton
                                                    size="small"
                                                    onClick={(e) => { e.stopPropagation(); handleOpenModal(estab); }}
                                                    sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}
                                                >
                                                    <FaEye size={14} />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Excluir">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, estabelecimento: estab }); }}
                                                    sx={{ bgcolor: alpha(theme.palette.error.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2), color: 'white' } }}
                                                >
                                                    <FaTrash size={14} />
                                                </IconButton>
                                            </Tooltip>
                                        </Box>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

            <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={filteredEstabelecimentos.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Linhas por página:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`}
            />

            {/* Dialog de Confirmação */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, estabelecimento: null })}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <FaExclamationTriangle color={theme.palette.error.main} />
                    Confirmar Exclusão
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Tem certeza que deseja excluir <strong>{deleteDialog.estabelecimento?.nomeFantasia || deleteDialog.estabelecimento?.nome}</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Esta ação não pode ser desfeita.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, estabelecimento: null })}>Cancelar</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">Excluir</Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Detalhes (mesmo do usuário final) */}
            <ModalDetalhesEstabelecimento
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                estabelecimento={selectedEstab}
            />
        </Box>
    );
};

export default EstabelecimentosTab;

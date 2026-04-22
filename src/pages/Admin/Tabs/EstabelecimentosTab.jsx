import React, { useState, useEffect } from "react";
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
    useTheme,
    alpha,
} from "@mui/material";
import {
    FaTrash,
    FaSearch,
    FaExclamationTriangle,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { estabelecimentoService } from "../../../services";
import ModalDetalhesEstabelecimento from "../../../components/ModalDetalhesEstabelecimento/index.jsx";

const EstabelecimentosTab = () => {
    const theme = useTheme();
    const [estabelecimentos, setEstabelecimentos] = useState([]);
    const [filteredEstabelecimentos, setFilteredEstabelecimentos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [deleteDialog, setDeleteDialog] = useState({ open: false, estabelecimento: null });
    const [selectedEstab, setSelectedEstab] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        loadEstabelecimentos();
    }, []);

    useEffect(() => {
        filterEstabelecimentos();
    }, [searchTerm, estabelecimentos]);

    const loadEstabelecimentos = async () => {
        try {
            setLoading(true);
            const res = await estabelecimentoService.listarEstabelecimentos();
            const data = res.data || res;
            setEstabelecimentos(data);
        } catch (error) {
            console.error("Erro ao carregar estabelecimentos:", error);
            toast.error("Erro ao carregar estabelecimentos");
        } finally {
            setLoading(false);
        }
    };

    const filterEstabelecimentos = () => {
        let filtered = estabelecimentos;

        if (searchTerm) {
            filtered = filtered.filter(
                (e) =>
                    e.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    e.nomeFantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    e.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredEstabelecimentos(filtered);
    };

    const handleOpenModal = (estab) => {
        const mapped = {
            ...estab,
            nome: estab.nomeFantasia || estab.nome,
            Imagem: (estab.fotosUrl && estab.fotosUrl.length > 0) ? estab.fotosUrl[0] : "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop",
            Imagens: estab.fotosUrl || [],
            categorias: estab.atividadesOferecidas || [],
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
            await estabelecimentoService.excluirEstabelecimento(deleteDialog.estabelecimento.id);
            toast.success("Estabelecimento excluído com sucesso!");
            loadEstabelecimentos();
            setDeleteDialog({ open: false, estabelecimento: null });
        } catch (error) {
            console.error("Erro ao excluir estabelecimento:", error);
            toast.error("Erro ao excluir estabelecimento");
        }
    };

    return (
        <Box>
            {/* Stats */}
            <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
                <Paper elevation={0} sx={{ flex: 1, p: 2, minWidth: 150, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <Typography variant="body2" color="text.secondary">Total</Typography>
                    <Typography variant="h4" fontWeight={700} color="warning.main">{estabelecimentos.length}</Typography>
                </Paper>
                <Paper elevation={0} sx={{ flex: 1, p: 2, minWidth: 150, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <Typography variant="body2" color="text.secondary">Filtrados</Typography>
                    <Typography variant="h4" fontWeight={700}>{filteredEstabelecimentos.length}</Typography>
                </Paper>
            </Box>

            {/* Busca */}
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
                </Box>
            </Paper>

            {/* Tabela */}
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Nome Fantasia</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
                            <TableCell><strong>Telefone</strong></TableCell>
                            <TableCell><strong>Exclusivo Mulheres</strong></TableCell>
                            <TableCell align="right"><strong>Ações</strong></TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center" sx={{ py: 5 }}>
                                    <CircularProgress size={32} />
                                </TableCell>
                            </TableRow>
                        ) : filteredEstabelecimentos.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">Nenhum estabelecimento encontrado</TableCell>
                            </TableRow>
                        ) : (
                            filteredEstabelecimentos.map((estab) => (
                                <TableRow
                                    key={estab.id}
                                    hover
                                    onClick={() => handleOpenModal(estab)}
                                    sx={{ cursor: 'pointer' }}
                                >
                                    <TableCell>{estab.nomeFantasia || estab.nome || "N/A"}</TableCell>
                                    <TableCell>{estab.email || "N/A"}</TableCell>
                                    <TableCell>{estab.telefone || "N/A"}</TableCell>
                                    <TableCell>
                                        <Chip
                                            label={estab.exclusivoMulheres ? "Sim" : "Não"}
                                            color={estab.exclusivoMulheres ? "secondary" : "default"}
                                            size="small"
                                        />
                                    </TableCell>
                                    <TableCell align="right">
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
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </TableContainer>

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

import React, { useState, useEffect, useMemo } from "react";
import {
    Box,
    Paper,
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
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Tooltip,
    TablePagination,
    useTheme,
    alpha,
    Divider,
} from "@mui/material";
import {
    FaTrash,
    FaSearch,
    FaPlus,
    FaUser,
    FaBuilding,
    FaUserTie,
    FaUserShield,
    FaExclamationTriangle,
    FaEye,
    FaEnvelope,
    FaIdCard,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { adminService, estabelecimentoService, profissionalService } from "../../../services";
import { useNavigate } from "react-router-dom";
import ModalProfissional from "../../../components/ModalProfissional";
import ModalDetalhesEstabelecimento from "../../../components/ModalDetalhesEstabelecimento";

const UsuariosTab = () => {
    const navigate = useNavigate();
    const theme = useTheme();
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("todos");
    const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [profissionalModal, setProfissionalModal] = useState({ open: false, profissional: null });
    const [estabelecimentoModal, setEstabelecimentoModal] = useState({ open: false, estabelecimento: null });
    const [alunoDialog, setAlunoDialog] = useState({ open: false, user: null });
    const [editLoading, setEditLoading] = useState(false);

    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearchTerm(searchTerm);
            setPage(0);
        }, 400);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            setLoading(true);
            const data = await adminService.getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error("Erro ao carregar usuários:", error);
            toast.error("Erro ao carregar usuários");
        } finally {
            setLoading(false);
        }
    };

    const filteredUsers = useMemo(() => {
        let filtered = users;

        if (filterType !== "todos") {
            filtered = filtered.filter((u) => u.tipo === filterType);
        }

        if (debouncedSearchTerm) {
            filtered = filtered.filter(
                (u) =>
                    u.nome?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                    u.nomeFantasia?.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                    u.email?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
            );
        }

        return filtered;
    }, [users, filterType, debouncedSearchTerm]);

    const paginatedUsers = useMemo(() => {
        const startIndex = page * rowsPerPage;
        return filteredUsers.slice(startIndex, startIndex + rowsPerPage);
    }, [filteredUsers, page, rowsPerPage]);

    const handleChangePage = (event, newPage) => setPage(newPage);

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const handleDelete = async () => {
        if (!deleteDialog.user) return;
        try {
            await adminService.deleteUser(deleteDialog.user.id, deleteDialog.user.tipo);
            toast.success("Usuário excluído com sucesso!");
            loadUsers();
            setDeleteDialog({ open: false, user: null });
        } catch (error) {
            console.error("Erro ao excluir usuário:", error);
            toast.error("Erro ao excluir usuário");
        }
    };

    const handleOpenEdit = async (user) => {
        if (user.tipo === "profissional") {
            try {
                setEditLoading(true);
                const profissional = await profissionalService.buscarProfissionalPorId(user.id);
                setProfissionalModal({ open: true, profissional });
            } catch {
                toast.error("Erro ao carregar perfil do profissional");
            } finally {
                setEditLoading(false);
            }
            return;
        }

        if (user.tipo === "estabelecimento") {
            try {
                setEditLoading(true);
                const estab = await estabelecimentoService.getById(user.id);
                const atividades = (estab.categorias || []).map((c) => c.nome);
                setEstabelecimentoModal({
                    open: true,
                    estabelecimento: {
                        ...estab,
                        nome: estab.nomeFantasia || estab.nome,
                        Imagem:
                            estab.fotosUrl && estab.fotosUrl.length > 0
                                ? estab.fotosUrl[0]
                                : "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop",
                        Imagens: estab.fotosUrl || [],
                        categorias: atividades,
                        avaliacao: estab.avaliacao || 0.0,
                        aberto: true,
                        descricao:
                            estab.descricao || "Um ótimo local para treinar e cuidar da sua saúde.",
                    },
                });
            } catch {
                toast.error("Erro ao carregar perfil do estabelecimento");
            } finally {
                setEditLoading(false);
            }
            return;
        }

        // aluno ou admin — mostra painel básico de informações
        setAlunoDialog({ open: true, user });
    };

    const USER_ROLE_CONFIG = {
        aluno: { icon: FaUser, color: "primary", label: "Aluno" },
        profissional: { icon: FaUserTie, color: "secondary", label: "Profissional" },
        estabelecimento: { icon: FaBuilding, color: "warning", label: "Estabelecimento" },
        admin: { icon: FaUserShield, color: "error", label: "Admin" },
    };

    const getTipoConfig = (tipo) =>
        USER_ROLE_CONFIG[tipo] || { icon: FaUser, color: "default", label: tipo };

    const stats = {
        total: users.length,
        alunos: users.filter((u) => u.tipo === "aluno").length,
        profissionais: users.filter((u) => u.tipo === "profissional").length,
        estabelecimentos: users.filter((u) => u.tipo === "estabelecimento").length,
        admins: users.filter((u) => u.tipo === "admin").length,
    };

    return (
        <Box>
            {/* Stats */}
            <Box sx={{ display: "flex", gap: 2, mb: 4, flexWrap: "wrap" }}>
                <Paper elevation={0} sx={{ flex: 1, p: 2, minWidth: 150, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <Typography variant="body2" color="text.secondary">Total de Usuários</Typography>
                    <Typography variant="h4" fontWeight={700}>{stats.total}</Typography>
                </Paper>
                <Paper elevation={0} sx={{ flex: 1, p: 2, minWidth: 150, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <Typography variant="body2" color="text.secondary">Alunos</Typography>
                    <Typography variant="h4" fontWeight={700} color="primary.main">{stats.alunos}</Typography>
                </Paper>
                <Paper elevation={0} sx={{ flex: 1, p: 2, minWidth: 150, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <Typography variant="body2" color="text.secondary">Profissionais</Typography>
                    <Typography variant="h4" fontWeight={700} color="secondary.main">{stats.profissionais}</Typography>
                </Paper>
                <Paper elevation={0} sx={{ flex: 1, p: 2, minWidth: 150, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                    <Typography variant="body2" color="text.secondary">Estabelecimentos</Typography>
                    <Typography variant="h4" fontWeight={700} color="warning.main">{stats.estabelecimentos}</Typography>
                </Paper>
            </Box>

            {/* Filtros e Busca */}
            <Paper elevation={0} sx={{ p: 3, mb: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Box sx={{ display: "flex", gap: 2, flexWrap: "wrap", alignItems: "center" }}>
                    <TextField
                        placeholder="Buscar por nome ou email..."
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
                    <FormControl sx={{ minWidth: 200 }}>
                        <InputLabel>Tipo de Usuário</InputLabel>
                        <Select
                            value={filterType}
                            onChange={(e) => {
                                setFilterType(e.target.value);
                                setPage(0);
                            }}
                            label="Tipo de Usuário"
                        >
                            <MenuItem value="todos">Todos</MenuItem>
                            <MenuItem value="aluno">Alunos</MenuItem>
                            <MenuItem value="profissional">Profissionais</MenuItem>
                            <MenuItem value="estabelecimento">Estabelecimentos</MenuItem>
                            <MenuItem value="admin">Administradores</MenuItem>
                        </Select>
                    </FormControl>
                    <Button
                        variant="contained"
                        startIcon={<FaPlus />}
                        onClick={() => navigate("/cadastro")}
                        sx={{ textTransform: "none" }}
                    >
                        Novo Usuário
                    </Button>
                </Box>
            </Paper>

            {/* Tabela */}
            <TableContainer component={Paper} elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell><strong>Tipo</strong></TableCell>
                            <TableCell><strong>Nome</strong></TableCell>
                            <TableCell><strong>Email</strong></TableCell>
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
                        ) : paginatedUsers.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={4} align="center">Nenhum usuário encontrado</TableCell>
                            </TableRow>
                        ) : (
                            paginatedUsers.map((user) => (
                                <TableRow key={`${user.tipo}-${user.id}`} hover>
                                    <TableCell>
                                        {(() => {
                                            const cfg = getTipoConfig(user.tipo);
                                            const IconComponent = cfg.icon;
                                            return (
                                                <Chip
                                                    icon={IconComponent ? <IconComponent size={14} /> : null}
                                                    label={cfg.label}
                                                    color={cfg.color}
                                                    size="small"
                                                />
                                            );
                                        })()}
                                    </TableCell>
                                    <TableCell>{user.nome || user.nomeFantasia || "N/A"}</TableCell>
                                    <TableCell>{user.email || "N/A"}</TableCell>
                                    <TableCell align="right">
                                        <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
                                            <Tooltip title="Ver perfil">
                                                <IconButton
                                                    size="small"
                                                    disabled={editLoading}
                                                    onClick={() => handleOpenEdit(user)}
                                                    sx={{
                                                        bgcolor: alpha(theme.palette.primary.main, 0.08),
                                                        "&:hover": { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                                                    }}
                                                >
                                                    {editLoading ? (
                                                        <CircularProgress size={12} />
                                                    ) : (
                                                        <FaEye size={14} />
                                                    )}
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Excluir">
                                                <IconButton
                                                    size="small"
                                                    color="error"
                                                    onClick={() => setDeleteDialog({ open: true, user })}
                                                    sx={{
                                                        bgcolor: alpha(theme.palette.error.main, 0.08),
                                                        "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.2), color: "white" },
                                                    }}
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
                count={filteredUsers.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Linhas por página:"
                labelDisplayedRows={({ from, to, count }) =>
                    `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                }
            />

            {/* Dialog de Confirmação de Exclusão */}
            <Dialog
                open={deleteDialog.open}
                onClose={() => setDeleteDialog({ open: false, user: null })}
            >
                <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <FaExclamationTriangle color={theme.palette.error.main} />
                    Confirmar Exclusão
                </DialogTitle>
                <DialogContent>
                    <Typography>
                        Tem certeza que deseja excluir o usuário{" "}
                        <strong>{deleteDialog.user?.nome || deleteDialog.user?.nomeFantasia}</strong>?
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                        Esta ação não pode ser desfeita.
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setDeleteDialog({ open: false, user: null })}>Cancelar</Button>
                    <Button onClick={handleDelete} color="error" variant="contained">
                        Excluir
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Dialog info de Aluno/Admin */}
            <Dialog
                open={alunoDialog.open}
                onClose={() => setAlunoDialog({ open: false, user: null })}
                maxWidth="xs"
                fullWidth
            >
                <DialogTitle sx={{ fontWeight: 700 }}>
                    Informações da conta
                </DialogTitle>
                <DialogContent>
                    {alunoDialog.user && (
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 2, pt: 1 }}>
                            {(() => {
                                const cfg = getTipoConfig(alunoDialog.user.tipo);
                                return (
                                    <Chip
                                        label={cfg.label}
                                        color={cfg.color}
                                        size="small"
                                        sx={{ alignSelf: "flex-start" }}
                                    />
                                );
                            })()}
                            <Divider />
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <FaIdCard color={theme.palette.text.secondary} size={15} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        ID
                                    </Typography>
                                    <Typography variant="body2">{alunoDialog.user.id}</Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <FaUser color={theme.palette.text.secondary} size={15} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Nome
                                    </Typography>
                                    <Typography variant="body2">
                                        {alunoDialog.user.nome || "Não informado"}
                                    </Typography>
                                </Box>
                            </Box>
                            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                                <FaEnvelope color={theme.palette.text.secondary} size={15} />
                                <Box>
                                    <Typography variant="caption" color="text.secondary" fontWeight={600}>
                                        Email
                                    </Typography>
                                    <Typography variant="body2">
                                        {alunoDialog.user.email || "Não informado"}
                                    </Typography>
                                </Box>
                            </Box>
                        </Box>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setAlunoDialog({ open: false, user: null })}>
                        Fechar
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Modal de Perfil do Profissional */}
            <ModalProfissional
                open={profissionalModal.open}
                onClose={() => setProfissionalModal({ open: false, profissional: null })}
                profissional={profissionalModal.profissional}
            />

            {/* Modal de Detalhes do Estabelecimento */}
            <ModalDetalhesEstabelecimento
                open={estabelecimentoModal.open}
                onClose={() => setEstabelecimentoModal({ open: false, estabelecimento: null })}
                estabelecimento={estabelecimentoModal.estabelecimento}
            />
        </Box>
    );
};

export default UsuariosTab;

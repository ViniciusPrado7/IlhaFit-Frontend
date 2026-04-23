import React, { useState, useEffect } from "react";
import {
    Box,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    TablePagination,
    IconButton,
    Chip,
    Button,
    TextField,
    InputAdornment,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Drawer,
    Typography,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    CircularProgress,
    Tooltip,
    Divider,
    useTheme,
    alpha,
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
    FaPhone,
    FaMapMarkerAlt,
    FaIdCard,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { adminService } from "../../../services";
import { useNavigate } from "react-router-dom";

const ROWS_PER_PAGE_OPTIONS = [10, 25, 50];

const getTipoIcon = (tipo) => {
    switch (tipo) {
        case "aluno": return <FaUser size={14} />;
        case "profissional": return <FaUserTie size={14} />;
        case "estabelecimento": return <FaBuilding size={14} />;
        case "admin": return <FaUserShield size={14} />;
        default: return null;
    }
};

const getTipoColor = (tipo) => {
    switch (tipo) {
        case "aluno": return "primary";
        case "profissional": return "secondary";
        case "estabelecimento": return "warning";
        case "admin": return "error";
        default: return "default";
    }
};

const getTipoLabel = (tipo) => {
    switch (tipo) {
        case "aluno": return "Aluno";
        case "profissional": return "Profissional";
        case "estabelecimento": return "Estabelecimento";
        case "admin": return "Admin";
        default: return tipo;
    }
};

const InfoRow = ({ icon, label, value }) => {
    if (!value) return null;
    return (
        <Box sx={{ display: "flex", gap: 1.5, alignItems: "flex-start", py: 1 }}>
            <Box sx={{ color: "text.secondary", mt: 0.3, flexShrink: 0 }}>{icon}</Box>
            <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{label}</Typography>
                <Typography variant="body2">{value}</Typography>
            </Box>
        </Box>
    );
};

const formatEndereco = (endereco) => {
    if (!endereco) return null;
    return [endereco.rua, endereco.numero, endereco.bairro, endereco.cidade, endereco.estado]
        .filter(Boolean).join(", ");
};

const UsuariosTab = () => {
    const theme = useTheme();
    const navigate = useNavigate();
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filterType, setFilterType] = useState("todos");
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
    const [detailsDrawer, setDetailsDrawer] = useState({ open: false, user: null });

    useEffect(() => {
        loadUsers();
    }, []);

    useEffect(() => {
        filterUsers();
    }, [searchTerm, filterType, users]);

    useEffect(() => {
        setPage(0);
    }, [searchTerm, filterType]);

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

    const filterUsers = () => {
        let filtered = users;

        if (filterType !== "todos") {
            filtered = filtered.filter((u) => u.tipo === filterType);
        }

        if (searchTerm) {
            filtered = filtered.filter(
                (u) =>
                    u.nome?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.nomeFantasia?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    u.email?.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }

        setFilteredUsers(filtered);
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

    const stats = {
        total: users.length,
        alunos: users.filter((u) => u.tipo === "aluno").length,
        profissionais: users.filter((u) => u.tipo === "profissional").length,
        estabelecimentos: users.filter((u) => u.tipo === "estabelecimento").length,
        admins: users.filter((u) => u.tipo === "admin").length,
    };

    const paginated = filteredUsers.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
    const selectedUser = detailsDrawer.user;

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
                    <FormControl sx={{ minWidth: 200 }} size="small">
                        <InputLabel>Tipo de Usuário</InputLabel>
                        <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} label="Tipo de Usuário">
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
            <Paper elevation={0} sx={{ border: '1px solid', borderColor: 'divider', borderRadius: 3, overflow: 'hidden' }}>
                <TableContainer>
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
                            ) : paginated.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                                        Nenhum usuário encontrado
                                    </TableCell>
                                </TableRow>
                            ) : (
                                paginated.map((user) => (
                                    <TableRow
                                        key={`${user.tipo}-${user.id}`}
                                        hover
                                        onClick={() => setDetailsDrawer({ open: true, user })}
                                        sx={{ cursor: "pointer" }}
                                    >
                                        <TableCell>
                                            <Chip
                                                icon={getTipoIcon(user.tipo)}
                                                label={getTipoLabel(user.tipo)}
                                                color={getTipoColor(user.tipo)}
                                                size="small"
                                            />
                                        </TableCell>
                                        <TableCell>{user.nome || user.nomeFantasia || "N/A"}</TableCell>
                                        <TableCell>{user.email || "N/A"}</TableCell>
                                        <TableCell align="right">
                                            <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'flex-end' }}>
                                                <Tooltip title="Ver detalhes">
                                                    <IconButton
                                                        size="small"
                                                        onClick={(e) => { e.stopPropagation(); setDetailsDrawer({ open: true, user }); }}
                                                        sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) } }}
                                                    >
                                                        <FaEye size={14} />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Excluir">
                                                    <IconButton
                                                        size="small"
                                                        color="error"
                                                        onClick={(e) => { e.stopPropagation(); setDeleteDialog({ open: true, user }); }}
                                                        sx={{ bgcolor: alpha(theme.palette.error.main, 0.08), '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.2) } }}
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
                    component="div"
                    count={filteredUsers.length}
                    page={page}
                    onPageChange={(_, newPage) => setPage(newPage)}
                    rowsPerPage={rowsPerPage}
                    onRowsPerPageChange={(e) => { setRowsPerPage(parseInt(e.target.value, 10)); setPage(0); }}
                    rowsPerPageOptions={ROWS_PER_PAGE_OPTIONS}
                    labelRowsPerPage="Linhas por página:"
                    labelDisplayedRows={({ from, to, count }) => `${from}–${to} de ${count}`}
                />
            </Paper>

            {/* Dialog de Exclusão */}
            <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, user: null })}>
                <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
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
                    <Button onClick={handleDelete} color="error" variant="contained">Excluir</Button>
                </DialogActions>
            </Dialog>

            {/* Drawer de Detalhes */}
            <Drawer
                anchor="right"
                open={detailsDrawer.open}
                onClose={() => setDetailsDrawer({ open: false, user: null })}
                PaperProps={{ sx: { width: { xs: '100%', sm: 380 }, p: 3 } }}
            >
                {selectedUser && (
                    <Box>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6" fontWeight={800}>Detalhes do Usuário</Typography>
                            <Chip
                                icon={getTipoIcon(selectedUser.tipo)}
                                label={getTipoLabel(selectedUser.tipo)}
                                color={getTipoColor(selectedUser.tipo)}
                                size="small"
                            />
                        </Box>
                        <Divider sx={{ mb: 2 }} />

                        <InfoRow
                            icon={<FaIdCard size={14} />}
                            label="ID"
                            value={String(selectedUser.id)}
                        />
                        <InfoRow
                            icon={<FaUser size={14} />}
                            label="Nome"
                            value={selectedUser.nome || selectedUser.nomeFantasia || selectedUser.razaoSocial}
                        />
                        {selectedUser.razaoSocial && selectedUser.nomeFantasia && (
                            <InfoRow
                                icon={<FaBuilding size={14} />}
                                label="Razão Social"
                                value={selectedUser.razaoSocial}
                            />
                        )}
                        <InfoRow
                            icon={<FaEnvelope size={14} />}
                            label="Email"
                            value={selectedUser.email}
                        />
                        <InfoRow
                            icon={<FaPhone size={14} />}
                            label="Telefone"
                            value={selectedUser.telefone}
                        />

                        {selectedUser.especialidade && (
                            <InfoRow
                                icon={<FaUserTie size={14} />}
                                label="Especialidade"
                                value={selectedUser.especialidade}
                            />
                        )}
                        {selectedUser.regiao && (
                            <InfoRow
                                icon={<FaMapMarkerAlt size={14} />}
                                label="Região"
                                value={selectedUser.regiao}
                            />
                        )}
                        {selectedUser.endereco && (
                            <InfoRow
                                icon={<FaMapMarkerAlt size={14} />}
                                label="Endereço"
                                value={formatEndereco(selectedUser.endereco)}
                            />
                        )}
                        {selectedUser.descricao && (
                            <>
                                <Divider sx={{ my: 2 }} />
                                <Typography variant="caption" color="text.secondary" fontWeight={600}>Descrição</Typography>
                                <Typography variant="body2" sx={{ mt: 0.5, lineHeight: 1.7 }}>
                                    {selectedUser.descricao}
                                </Typography>
                            </>
                        )}

                        <Box sx={{ mt: 4 }}>
                            <Button
                                fullWidth
                                variant="outlined"
                                color="error"
                                startIcon={<FaTrash size={13} />}
                                onClick={() => {
                                    setDetailsDrawer({ open: false, user: null });
                                    setDeleteDialog({ open: true, user: selectedUser });
                                }}
                                sx={{ textTransform: 'none' }}
                            >
                                Excluir usuário
                            </Button>
                        </Box>
                    </Box>
                )}
            </Drawer>
        </Box>
    );
};

export default UsuariosTab;

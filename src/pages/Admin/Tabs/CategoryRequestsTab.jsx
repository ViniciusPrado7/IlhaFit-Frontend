import React, { useCallback, useEffect, useMemo, useState } from "react";
import { usePersistedRowsPerPage } from "../../../hooks/usePersistedRowsPerPage";
import {
  Box,
  Button,
  InputAdornment,
  Paper,
  TablePagination,
  TextField,
  Typography,
} from "@mui/material";
import { FaBell, FaSearch } from "react-icons/fa";
import { toast } from "react-toastify";
import { categoriaPendenteService } from "../../../service/CategoryService";
import { CategoriaSolicitacoesList, getCategoriaSolicitacaoErrorMessage } from "../../../components/CategoryRequests";

const FILTROS = [
  { value: null, label: "Todas" },
  { value: "PENDENTE", label: "Pendentes" },
  { value: "APROVADA", label: "Aprovadas" },
  { value: "REJEITADA", label: "Rejeitadas" },
];

const SolicitacoesCategoriasTab = ({ onCountChange }) => {
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionLoadingId, setActionLoadingId] = useState(null);
  const [filterStatus, setFilterStatus] = useState("PENDENTE");
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = usePersistedRowsPerPage(10);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const response = await categoriaPendenteService.listarTodas(filterStatus);
      const data = Array.isArray(response.data) ? response.data : [];
      setSolicitacoes(data);
      if (onCountChange && filterStatus === "PENDENTE") {
        onCountChange(data.length);
      }
    } catch (error) {
      toast.error(
        getCategoriaSolicitacaoErrorMessage(
          error,
          "Não foi possível carregar as solicitações de categoria."
        )
      );
    } finally {
      setLoading(false);
    }
  }, [filterStatus, onCountChange]);

  useEffect(() => {
    setPage(0);
    load();
  }, [load]);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
      setPage(0);
    }, 300);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filteredSolicitacoes = useMemo(() => {
    if (!debouncedSearchTerm) return solicitacoes;
    const term = debouncedSearchTerm.toLowerCase();

    return solicitacoes.filter((item) => {
      const values = [
        item?.nome,
        item?.solicitanteNome,
        item?.solicitanteEmail,
        item?.tipoSolicitante,
        item?.observacaoAdmin,
      ];
      return values.some((value) => value?.toLowerCase?.().includes(term));
    });
  }, [solicitacoes, debouncedSearchTerm]);

  const paginatedSolicitacoes = useMemo(() => {
    const start = page * rowsPerPage;
    return filteredSolicitacoes.slice(start, start + rowsPerPage);
  }, [filteredSolicitacoes, page, rowsPerPage]);

  const pendingCount = solicitacoes.filter((item) => item.status === "PENDENTE").length;

  const handleAprovar = async (solicitacao) => {
    setActionLoadingId(solicitacao.id);
    try {
      await categoriaPendenteService.aprovar(solicitacao.id, { observacaoAdmin: "Aprovada" });
      toast.success("Solicitação aprovada com sucesso!");
      await load();
    } catch (error) {
      toast.error(
        getCategoriaSolicitacaoErrorMessage(
          error,
          "Não foi possível aprovar a solicitação."
        )
      );
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRejeitar = async (solicitacao, observacaoAdmin) => {
    setActionLoadingId(solicitacao.id);
    try {
      await categoriaPendenteService.rejeitar(solicitacao.id, {
        observacaoAdmin: observacaoAdmin || "Solicitação rejeitada.",
      });
      toast.success("Solicitação rejeitada.");
      await load();
    } catch (error) {
      toast.error(
        getCategoriaSolicitacaoErrorMessage(
          error,
          "Não foi possível rejeitar a solicitação."
        )
      );
      throw error;
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <Box>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3, gap: 2, flexWrap: "wrap" }}>
        <Box>
          <Typography variant="h5" fontWeight={700} sx={{ display: "flex", alignItems: "center", gap: 1 }}>
            <FaBell /> Solicitações de Categoria
          </Typography>
          <Typography color="text.secondary" variant="body2" sx={{ mt: 0.5 }}>
            {solicitacoes.length} solicitaç{solicitacoes.length !== 1 ? "ões" : "ão"}
            {pendingCount > 0 ? ` · ${pendingCount} pendente${pendingCount !== 1 ? "s" : ""}` : ""}
          </Typography>
        </Box>
      </Box>

      <Paper elevation={0} sx={{ p: 3, mb: 3, border: "1px solid", borderColor: "divider", borderRadius: 3 }}>
        <Box sx={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap" }}>
          <TextField
            placeholder="Buscar por categoria, solicitante ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            size="small"
            sx={{ flex: 1, minWidth: 280 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <FaSearch size={16} />
                </InputAdornment>
              ),
            }}
          />
          {debouncedSearchTerm ? (
            <Typography variant="caption" color="text.secondary" sx={{ whiteSpace: "nowrap" }}>
              {filteredSolicitacoes.length} resultado{filteredSolicitacoes.length !== 1 ? "s" : ""}
            </Typography>
          ) : null}
        </Box>
      </Paper>

      <Box sx={{ display: "flex", gap: 1, mb: 3, flexWrap: "wrap" }}>
        {FILTROS.map((filtro) => (
          <Button
            key={filtro.label}
            variant={filterStatus === filtro.value ? "contained" : "outlined"}
            size="small"
            onClick={() => setFilterStatus(filtro.value)}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 10, px: 2.5 }}
          >
            {filtro.label}
          </Button>
        ))}
      </Box>

      <CategoriaSolicitacoesList
        solicitacoes={paginatedSolicitacoes}
        loading={loading}
        showRequester
        showAdminActions
        actionLoadingId={actionLoadingId}
        onApprove={handleAprovar}
        onReject={handleRejeitar}
        emptyTitle="Nenhuma solicitação encontrada."
        emptyDescription="Ajuste os filtros ou aguarde novas solicitações para análise."
      />

      <TablePagination
        rowsPerPageOptions={[5, 10, 25, 50]}
        component="div"
        count={filteredSolicitacoes.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={(_, newPage) => setPage(newPage)}
        onRowsPerPageChange={(e) => {
          setRowsPerPage(parseInt(e.target.value, 10));
          setPage(0);
        }}
        labelRowsPerPage="Linhas por página:"
        labelDisplayedRows={({ from, to, count }) => `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`}
      />
    </Box>
  );
};

export default SolicitacoesCategoriasTab;

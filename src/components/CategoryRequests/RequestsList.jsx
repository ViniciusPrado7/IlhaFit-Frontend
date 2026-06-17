import {
  Alert,
  Box,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import CategoriaSolicitacaoAdminActions from "./AdminActions";
import CategoriaSolicitacaoStatusBadge from "./StatusBadge";
import {
  formatSolicitacaoDate,
  formatSolicitacaoTipo,
  getDataSolicitacao,
  getObservacaoAdmin,
  getSolicitacaoNome,
  getSolicitanteEmail,
  getSolicitanteNome,
  getSolicitanteTipo,
} from "./utils";

const CategoriaSolicitacoesList = ({
  solicitacoes = [],
  loading = false,
  emptyTitle = "Nenhuma solicitação encontrada.",
  emptyDescription = "",
  showRequester = false,
  showAdminActions = false,
  actionLoadingId = null,
  onApprove,
  onReject,
}) => {
  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 6 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!solicitacoes.length) {
    return (
      <Alert severity="info" sx={{ borderRadius: 2 }}>
        <Typography fontWeight={700}>{emptyTitle}</Typography>
        {emptyDescription ? (
          <Typography variant="body2" sx={{ mt: 0.5 }}>
            {emptyDescription}
          </Typography>
        ) : null}
      </Alert>
    );
  }

  return (
    <TableContainer
      component={Paper}
      elevation={0}
      sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2 }}
    >
      <Table>
        <TableHead>
          <TableRow>
            <TableCell><strong>Categoria</strong></TableCell>
            {showRequester ? <TableCell><strong>Solicitante</strong></TableCell> : null}
            <TableCell><strong>Status</strong></TableCell>
            <TableCell><strong>Data</strong></TableCell>
            <TableCell><strong>Observação do admin</strong></TableCell>
            {showAdminActions ? <TableCell align="right"><strong>Ações</strong></TableCell> : null}
          </TableRow>
        </TableHead>
        <TableBody>
          {solicitacoes.map((solicitacao) => {
            const observacaoAdmin = getObservacaoAdmin(solicitacao);
            const solicitanteNome = getSolicitanteNome(solicitacao);
            const solicitanteEmail = getSolicitanteEmail(solicitacao);
            const solicitanteTipo = formatSolicitacaoTipo(getSolicitanteTipo(solicitacao));

            return (
              <TableRow key={solicitacao.id} hover>
                <TableCell sx={{ fontWeight: 700 }}>
                  {getSolicitacaoNome(solicitacao) || "Sem nome"}
                </TableCell>
                {showRequester ? (
                  <TableCell>
                    <Typography variant="body2" fontWeight={600}>
                      {solicitanteNome || "Não informado"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {solicitanteEmail || "Email não informado"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {solicitanteTipo}
                    </Typography>
                  </TableCell>
                ) : null}
                <TableCell>
                  <CategoriaSolicitacaoStatusBadge status={solicitacao.status} />
                </TableCell>
                <TableCell>
                  <Typography variant="body2" color="text.secondary">
                    {formatSolicitacaoDate(getDataSolicitacao(solicitacao))}
                  </Typography>
                </TableCell>
                <TableCell>
                  <Typography
                    variant="body2"
                    color={observacaoAdmin ? "text.primary" : "text.secondary"}
                  >
                    {observacaoAdmin || "—"}
                  </Typography>
                  {solicitacao.status === "APROVADA" ? (
                    <Typography
                      variant="caption"
                      color="success.main"
                      display="block"
                      sx={{ mt: 0.5 }}
                    >
                      Categoria aprovada. Agora você já pode adicioná-la manualmente ao seu perfil.
                    </Typography>
                  ) : null}
                </TableCell>
                {showAdminActions ? (
                  <TableCell align="right">
                    {solicitacao.status === "PENDENTE" ? (
                      <CategoriaSolicitacaoAdminActions
                        solicitacao={solicitacao}
                        loading={actionLoadingId === solicitacao.id}
                        onApprove={onApprove}
                        onReject={onReject}
                      />
                    ) : null}
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default CategoriaSolicitacoesList;

import { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  TextField,
  Tooltip,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { FaCheck, FaTimes } from "react-icons/fa";

const CategoriaSolicitacaoAdminActions = ({
  solicitacao,
  loading = false,
  onApprove,
  onReject,
}) => {
  const theme = useTheme();
  const [openRejectDialog, setOpenRejectDialog] = useState(false);
  const [observacaoAdmin, setObservacaoAdmin] = useState("");

  const closeDialog = () => {
    if (loading) return;
    setOpenRejectDialog(false);
    setObservacaoAdmin("");
  };

  return (
    <>
      <Box sx={{ display: "flex", gap: 0.5, justifyContent: "flex-end" }}>
        <Tooltip title="Aprovar solicitação">
          <span>
            <IconButton
              size="small"
              disabled={loading}
              onClick={() => onApprove?.(solicitacao)}
              sx={{
                color: "success.main",
                bgcolor: alpha(theme.palette.success.main, 0.08),
                "&:hover": { bgcolor: alpha(theme.palette.success.main, 0.2) },
              }}
            >
              <FaCheck size={12} />
            </IconButton>
          </span>
        </Tooltip>
        <Tooltip title="Rejeitar solicitação">
          <span>
            <IconButton
              size="small"
              disabled={loading}
              onClick={() => setOpenRejectDialog(true)}
              sx={{
                color: "error.main",
                bgcolor: alpha(theme.palette.error.main, 0.08),
                "&:hover": { bgcolor: alpha(theme.palette.error.main, 0.2) },
              }}
            >
              <FaTimes size={12} />
            </IconButton>
          </span>
        </Tooltip>
      </Box>

      <Dialog open={openRejectDialog} onClose={closeDialog} maxWidth="sm" fullWidth>
        <DialogTitle>Rejeitar solicitação</DialogTitle>
        <DialogContent dividers>
          <TextField
            autoFocus
            fullWidth
            multiline
            minRows={3}
            label="Observação para o solicitante"
            placeholder="Ex.: Categoria duplicada ou fora do escopo da plataforma."
            value={observacaoAdmin}
            onChange={(event) => setObservacaoAdmin(event.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={loading} color="inherit">
            Cancelar
          </Button>
          <Button
            onClick={async () => {
              await onReject?.(solicitacao, observacaoAdmin.trim());
              closeDialog();
            }}
            disabled={loading}
            color="error"
            variant="contained"
          >
            {loading ? "Rejeitando..." : "Rejeitar"}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default CategoriaSolicitacaoAdminActions;

import { Alert, Box, Button, TextField, Typography } from "@mui/material";
import { MAX_SOLICITACOES_PENDENTES } from "./utils";

const apenasTexto = (value = "") => value.replace(/[^A-Za-zÀ-ÿ\s]/g, "");

const CategoriaSolicitacaoForm = ({
  value,
  onChange,
  onSubmit,
  disabled = false,
  loading = false,
  pendingCount = 0,
  error = "",
  successMessage = "",
}) => {
  const remaining = Math.max(MAX_SOLICITACOES_PENDENTES - pendingCount, 0);
  const limitReached = pendingCount >= MAX_SOLICITACOES_PENDENTES;

  return (
    <Box component="form" onSubmit={onSubmit}>
      <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
        Solicitar nova categoria
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 2 }}>
        Você pode ter até 3 solicitações pendentes. Restam {remaining} no momento.
      </Typography>

      {limitReached ? (
        <Alert severity="warning" sx={{ mb: 2, borderRadius: 2 }}>
          Você já possui 3 solicitações pendentes. Aguarde a análise do admin para enviar uma nova.
        </Alert>
      ) : null}

      {error ? (
        <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
          {error}
        </Alert>
      ) : null}

      {successMessage ? (
        <Alert severity="success" sx={{ mb: 2, borderRadius: 2 }}>
          {successMessage}
        </Alert>
      ) : null}

      <Box sx={{ display: "flex", gap: 1.5, flexDirection: { xs: "column", sm: "row" } }}>
        <TextField
          fullWidth
          label="Nome da categoria"
          placeholder="Ex.: Pilates Aéreo"
          value={value}
          onChange={(event) => onChange(apenasTexto(event.target.value))}
          disabled={disabled || limitReached}
        />
        <Button
          type="submit"
          variant="contained"
          disabled={disabled || limitReached || loading || !value.trim()}
          sx={{ minWidth: { sm: 180 }, fontWeight: 700, borderRadius: 2 }}
        >
          {loading ? "Enviando..." : "Solicitar categoria"}
        </Button>
      </Box>
    </Box>
  );
};

export default CategoriaSolicitacaoForm;

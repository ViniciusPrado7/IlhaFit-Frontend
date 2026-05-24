import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { FaTimes } from "react-icons/fa";

const LimitedChipList = ({
  items = [],
  limit = 5,
  chipSx,
  title = "Categorias",
  buttonLabel = "Ver mais",
  emptyLabel = "Nenhum item encontrado.",
  dialogLabel = "Todos os itens",
}) => {
  const [open, setOpen] = useState(false);

  const normalizedItems = useMemo(
    () => [...new Set((Array.isArray(items) ? items : []).filter(Boolean))],
    [items]
  );

  useEffect(() => {
    setOpen(false);
  }, [title, dialogLabel, normalizedItems.length]);

  const visibleItems = normalizedItems.slice(0, limit);
  const hiddenCount = Math.max(normalizedItems.length - visibleItems.length, 0);

  return (
    <>
      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
        {visibleItems.map((item) => (
          <Chip key={item} label={item} size="small" sx={chipSx} />
        ))}

        {hiddenCount > 0 && (
          <Button
            size="small"
            variant="text"
            onClick={() => setOpen(true)}
            sx={{ fontWeight: 800, px: 0.5, minWidth: "auto" }}
          >
            {buttonLabel} (+{hiddenCount})
          </Button>
        )}
      </Box>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        fullWidth
        maxWidth="md"
        disableRestoreFocus
        PaperProps={{
          sx: {
            borderRadius: 3,
            overflow: "hidden",
          },
        }}
      >
        <DialogTitle
          sx={{
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "space-between",
            gap: 2,
            pb: 1.5,
          }}
        >
          <Box>
            <Typography variant="h5" fontWeight={900} sx={{ lineHeight: 1.1, mb: 0.5 }}>
              {dialogLabel}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Total de {normalizedItems.length} {normalizedItems.length === 1 ? "categoria" : "categorias"} disponíveis
            </Typography>
          </Box>

          <IconButton
            onClick={() => setOpen(false)}
            aria-label="Fechar"
            size="small"
            sx={{
              mt: 0.25,
              bgcolor: "rgba(15, 23, 42, 0.06)",
              color: "text.secondary",
              "&:hover": {
                bgcolor: "rgba(15, 23, 42, 0.12)",
              },
            }}
          >
            <FaTimes size={14} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 0, pb: 3 }}>
          {normalizedItems.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              {emptyLabel}
            </Typography>
          ) : (
            <Box
              sx={{
                display: "flex",
                gap: 1.25,
                flexWrap: "wrap",
                p: 2,
                borderRadius: 2.5,
                bgcolor: "rgba(16, 185, 129, 0.04)",
                border: "1px solid",
                borderColor: "rgba(16, 185, 129, 0.12)",
                minHeight: 96,
                alignContent: "flex-start",
              }}
            >
              {normalizedItems.map((item) => (
                <Chip key={item} label={item} size="small" sx={chipSx} />
              ))}
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default LimitedChipList;

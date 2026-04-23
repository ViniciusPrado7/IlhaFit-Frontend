import { Dialog, DialogContent, IconButton, Box } from "@mui/material";
import { FaTimes } from "react-icons/fa";
import { ModalEstabelecimentoContent } from "../ModalEstabelecimento";

const ModalDetalhesEstabelecimento = ({ open, onClose, estabelecimento }) => {
  if (!estabelecimento) return null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth scroll="paper">
      <Box sx={{ position: "absolute", top: 12, right: 12, zIndex: 10 }}>
        <IconButton onClick={onClose} size="small" sx={{ bgcolor: "background.paper" }}>
          <FaTimes size={14} />
        </IconButton>
      </Box>
      <DialogContent sx={{ p: 0 }}>
        <ModalEstabelecimentoContent
          estabelecimento={estabelecimento}
          onClose={onClose}
          closeLabel="Fechar"
        />
      </DialogContent>
    </Dialog>
  );
};

export default ModalDetalhesEstabelecimento;

import React from "react";
import { Dialog, DialogContent } from "@mui/material";
import ModalEstabelecimentoContent from "../ModalEstabelecimento";

const ModalDetalhesEstabelecimento = ({ open, onClose, estabelecimento }) => (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogContent sx={{ p: 0 }}>
            {estabelecimento && (
                <ModalEstabelecimentoContent
                    estabelecimento={estabelecimento}
                    onClose={onClose}
                    closeLabel="Fechar"
                />
            )}
        </DialogContent>
    </Dialog>
);

export default ModalDetalhesEstabelecimento;

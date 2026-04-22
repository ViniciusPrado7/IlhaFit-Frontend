import React from "react";
import { Box, Typography, Paper, useTheme } from "@mui/material";
import { FaStar } from "react-icons/fa";

const AvaliacoesTab = () => {
    const theme = useTheme();

    return (
        <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", py: 8 }}>
            <Paper elevation={0} sx={{ p: 4, textAlign: "center", maxWidth: 500, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Box sx={{ mb: 2 }}>
                    <FaStar size={48} color={theme.palette.warning.main} />
                </Box>
                <Typography variant="h5" gutterBottom fontWeight={700}>
                    Avaliações
                </Typography>
                <Typography color="text.secondary">
                    O módulo de gerenciamento de avaliações está em desenvolvimento.
                    <br />
                    Em breve você poderá moderar e visualizar as avaliações do sistema aqui.
                </Typography>
            </Paper>
        </Box>
    );
};

export default AvaliacoesTab;

import React, { useState } from "react";
import {
  Box,
  Paper,
  Typography,
  ToggleButton,
  ToggleButtonGroup,
  IconButton
} from "@mui/material";
import { FaTimes, FaUser, FaBuilding, FaUserTie } from "react-icons/fa";
import { useNavigate } from "react-router-dom";

import CadastroUsuario from "./CadastroUsuario";
import CadastroProfissional from "./CadastroProfissional";
import CadastroEstabelecimento from "./CadastroEstabelecimento";

const Cadastro = () => {
  const [type, setType] = useState("usuario");
  const navigate = useNavigate();

  const renderForm = () => {
    switch (type) {
      case "usuario":
        return <CadastroUsuario />;
      case "profissional":
        return <CadastroProfissional />;
      case "estabelecimento":
        return <CadastroEstabelecimento />;
      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "background.default",
        px: 2
      }}
    >
      <Paper
        sx={{
          width: "100%",
          maxWidth: 600,
          p: 4,
          borderRadius: 4,
          position: "relative"
        }}
      >
        <IconButton
          onClick={() => navigate("/")}
          sx={{ position: "absolute", top: 16, right: 16 }}
        >
          <FaTimes />
        </IconButton>

        <Typography variant="h4" fontWeight={800} sx={{ mb: 3 }}>
          Criar Conta
        </Typography>

        <Typography variant="subtitle2" sx={{ mb: 1 }}>
          Tipo de conta
        </Typography>

        <ToggleButtonGroup
          value={type}
          exclusive
          onChange={(e, val) => {
            if (val !== null) setType(val);
          }}
          fullWidth
          sx={{ mb: 3, gap: 1 }}
        >
          <ToggleButton value="usuario">
            <FaUser style={{ marginRight: 8 }} /> Usuário
          </ToggleButton>

          <ToggleButton value="estabelecimento">
            <FaBuilding style={{ marginRight: 8 }} /> Estabelecimento
          </ToggleButton>

          <ToggleButton value="profissional">
            <FaUserTie style={{ marginRight: 8 }} /> Profissional
          </ToggleButton>
        </ToggleButtonGroup>

        {renderForm()}
      </Paper>
    </Box>
  );
};

export default Cadastro;
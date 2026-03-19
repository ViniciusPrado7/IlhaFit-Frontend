import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";

const CadastroProfissional = () => {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    cpf: "",
    especializacao: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("Cadastro profissional:", form);
  };

  return (
    <Box>
      <TextField name="nome" label="Nome" fullWidth onChange={handleChange} />
      <TextField name="email" label="Email" fullWidth onChange={handleChange} />
      <TextField name="cpf" label="CPF" fullWidth onChange={handleChange} />
      <TextField name="especializacao" label="Especialização" fullWidth onChange={handleChange} />

      <Button onClick={handleSubmit}>Cadastrar</Button>
    </Box>
  );
};

export default CadastroProfissional;
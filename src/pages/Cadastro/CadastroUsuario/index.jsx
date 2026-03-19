import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";

const CadastroUsuario = () => {
  const [form, setForm] = useState({ nome: "", email: "", senha: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("Cadastro usuário:", form);
  };

  return (
    <Box>
      <TextField name="nome" label="Nome" fullWidth onChange={handleChange} />
      <TextField name="email" label="Email" fullWidth onChange={handleChange} />
      <TextField name="senha" label="Senha" type="password" fullWidth onChange={handleChange} />

      <Button onClick={handleSubmit}>Cadastrar</Button>
    </Box>
  );
};

export default CadastroUsuario;
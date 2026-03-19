import React, { useState } from "react";
import { TextField, Button, Box } from "@mui/material";

const CadastroEstabelecimento = () => {
  const [form, setForm] = useState({
    nome: "",
    email: "",
    cnpj: "",
    endereco: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = () => {
    console.log("Cadastro estabelecimento:", form);
  };

  return (
    <Box>
      <TextField name="nome" label="Nome do Estabelecimento" fullWidth onChange={handleChange} />
      <TextField name="email" label="Email" fullWidth onChange={handleChange} />
      <TextField name="cnpj" label="CNPJ" fullWidth onChange={handleChange} />
      <TextField name="endereco" label="Endereço" fullWidth onChange={handleChange} />

      <Button onClick={handleSubmit}>Cadastrar</Button>
    </Box>
  );
};

export default CadastroEstabelecimento;
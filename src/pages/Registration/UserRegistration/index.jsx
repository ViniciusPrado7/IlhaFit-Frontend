import { TextField, Typography, Button, Box } from "@mui/material";
import { useState } from "react";

export default function CadastroUsuario() {
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <form>
      <Typography>Nome Completo</Typography>
      <TextField fullWidth name="nome" onChange={handleChange} />

      <Typography>Email</Typography>
      <TextField fullWidth name="email" onChange={handleChange} />

      <Typography>Senha</Typography>
      <TextField fullWidth type="password" name="senha" onChange={handleChange} />

      <Typography>Confirmar Senha</Typography>
      <TextField fullWidth type="password" name="confirmarSenha" onChange={handleChange} />

      <Button fullWidth variant="contained" sx={{ mt: 3 }}>
        Cadastrar
      </Button>
    </form>
  );
}
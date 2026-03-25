import { Box, Typography } from "@mui/material";
import { useState } from "react";
import CardProfissional from "../../components/Card/CardProfissional";

const Profissional = () => {
  
  const [profissionais] = useState([
    {
      id: 1,
      nome: "João Silva",
      especialidades: ["Musculação", "Funcional"],
      descricao: "Especialista em treinamento de força e condicionamento físico.",
      Imagem: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=60",
      avaliacao: 4.9,
      telefone: "(11) 99999-9999",
      email: "joao.silva@email.com"
    },
    {
      id: 2,
      nome: "Maria Oliveira",
      especialidades: ["Pilates", "Yoga"],
      descricao: "Instrutora certificada em Pilates e Yoga para bem-estar.",
      Imagem: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=60",
      avaliacao: 4.7,
      telefone: "(11) 88888-8888",
      email: "maria.oliveira@email.com"
    },
    {
      id: 3,
      nome: "Carlos Santos",
      especialidades: ["Natação", "Aquafit"],
      descricao: "Treinador especializado em atividades aquáticas.",
      Imagem: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=60",
      avaliacao: 4.8,
      telefone: "(11) 77777-7777",
      email: "carlos.santos@email.com"
    },
    {
      id: 4,
      nome: "Ana Costa",
      especialidades: ["Jiu Jitsu", "Artes Marciais"],
      descricao: "Professora de artes marciais com foco em Jiu Jitsu.",
      Imagem: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=60",
      avaliacao: 4.6,
      telefone: "(11) 66666-6666",
      email: "ana.costa@email.com"
    },
    {
      id: 5,
      nome: "Pedro Lima",
      especialidades: ["Crossfit", "HIIT"],
      descricao: "Especialista em treinos intensos e funcionais.",
      Imagem: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=60",
      avaliacao: 4.9,
      telefone: "(11) 55555-5555",
      email: "pedro.lima@email.com"
    },
  ]);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={1}>
        Melhores profissionais
      </Typography>
      <Typography color="text.secondary" mb={4}>
        Profissionais com as melhores notas da comunidade
      </Typography>
      <Box
        sx={{
          display: "grid",
          gap: 4,
          gridTemplateColumns: {
            xs: "1fr", 
            sm: "repeat(2, 1fr)", 
            md: "repeat(3, 1fr)", 
            lg: "repeat(4, 1fr)",
          },
        }}
      >
        {profissionais.map((item) => (
          <CardProfissional key={item.id} profissional={item} />
        ))}
      </Box>
    </Box>
  );
};

export default Profissional;

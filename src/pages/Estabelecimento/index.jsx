import { Box, Container, Grid, Typography } from "@mui/material";
import { useState } from "react";
import CardEstabelecimento from "../../components/Card/CardEstabelecimento";

const Estabelecimento = () => {
  
  const [estabelecimento] = useState([
   {
  id: 1,
  categorias: ["Academia", "Natação"],
  descricao: "Confortável e estilosa, perfeita para o dia a dia.",
  aberto: true,
  Imagem: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFxbx1sl-l2S8ENr1uzxMGAAay_x2vfZPGgw&s",
   avaliacao: 4.9,
},
      {
  id: 2,
  categorias: ["Academia", "Natação"],
  descricao: "Confortável e estilosa, perfeita para o dia a dia.",
  aberto: true,
  Imagem: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFxbx1sl-l2S8ENr1uzxMGAAay_x2vfZPGgw&s",
   avaliacao: 4.6,
},
  {
  id: 3,
  categorias: ["Academia", "Natação"],
  descricao: "Confortável e estilosa, perfeita para o dia a dia.",
  aberto: true,
  Imagem: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFxbx1sl-l2S8ENr1uzxMGAAay_x2vfZPGgw&s",
   avaliacao: 4.8,
},
  {
  id: 4,
  categorias: ["Jiu Jitsu", "Artes Marciais"],
  descricao: "Confortável e estilosa, perfeita para o dia a dia.",
  aberto: true,
  Imagem: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFxbx1sl-l2S8ENr1uzxMGAAay_x2vfZPGgw&s",
   avaliacao: 4.7,
},
  {
  id: 5,
  categorias:  ["Academia", "Funcional", "Pilates"],
  descricao: "Confortável e estilosa, perfeita para o dia a dia.",
  aberto: true,
  Imagem: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSFxbx1sl-l2S8ENr1uzxMGAAay_x2vfZPGgw&s",
   avaliacao: 4.8,
},
  ]);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={1}>
        Melhores estabelecimentos
      </Typography>
      <Typography color="text.secondary" mb={4}>
        Locais com as melhores notas da comunidade
      </Typography>
      <Box
        sx={{
          display: "grid",
          gap: 4,
          gridTemplateColumns: {
            xs: "1fr", 
            sm: "repeat(2, 1fr)", 
            md: "repeat(3, 1fr)", 
          },
        }}
      >
        {estabelecimento.map((item) => (
          <CardEstabelecimento key={item.id} estabelecimento={item} />
        ))}
      </Box>
    </Box>
  );
};

export default Estabelecimento;

import { Box, Typography, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CardProfissional from "../../components/Card/CardProfissional";
import { profissionalService } from "../../service/ProfissionalService";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=500&auto=format&fit=crop&q=60";

const mapProfissional = (p) => ({
  ...p,
  Imagem: p.fotosUrl?.[0] || p.foto || FALLBACK_IMAGE,
  especialidades: p.especialidade ? [p.especialidade] : (p.especialidades || []),
  avaliacao: p.avaliacao ?? 0,
});

const Profissional = () => {
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    profissionalService.listarProfissionais()
      .then((res) => setProfissionais((res.data || []).map(mapProfissional)))
      .catch(() => toast.error("Erro ao carregar profissionais"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={1}>
        Melhores profissionais
      </Typography>
      <Typography color="text.secondary" mb={4}>
        Profissionais com as melhores notas da comunidade
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : profissionais.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={8}>
          Nenhum profissional cadastrado ainda.
        </Typography>
      ) : (
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
      )}
    </Box>
  );
};

export default Profissional;

import { Box, Typography, CircularProgress } from "@mui/material";
import { useState, useEffect } from "react";
import { toast } from "react-toastify";
import CardEstabelecimento from "../../components/Card/CardEstabelecimento";
import ModalDetalhesEstabelecimento from "../../components/ModalDetalhesEstabelecimento";
import { estabelecimentoService } from "../../service/EstabelecimentoService";

const FALLBACK_IMAGE = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=80";

const mapEstabelecimento = (e) => ({
  ...e,
  nome: e.nomeFantasia || e.razaoSocial || e.nome || "Estabelecimento",
  Imagem: e.fotosUrl?.[0] || FALLBACK_IMAGE,
  categorias: e.atividadesOferecidas || [],
  avaliacao: e.avaliacao ?? 0,
  aberto: true,
});

const Estabelecimento = () => {
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    estabelecimentoService.listarEstabelecimentos()
      .then((res) => setEstabelecimentos((res.data || []).map(mapEstabelecimento)))
      .catch(() => toast.error("Erro ao carregar estabelecimentos"))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={1}>
        Melhores estabelecimentos
      </Typography>
      <Typography color="text.secondary" mb={4}>
        Locais com as melhores notas da comunidade
      </Typography>

      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      ) : estabelecimentos.length === 0 ? (
        <Typography color="text.secondary" textAlign="center" py={8}>
          Nenhum estabelecimento cadastrado ainda.
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
            },
          }}
        >
          {estabelecimentos.map((item) => (
            <CardEstabelecimento
              key={item.id}
              estabelecimento={item}
              onClick={() => setSelected(item)}
            />
          ))}
        </Box>
      )}

      <ModalDetalhesEstabelecimento
        open={Boolean(selected)}
        onClose={() => setSelected(null)}
        estabelecimento={selected}
      />
    </Box>
  );
};

export default Estabelecimento;

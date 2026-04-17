import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Chip,
  Divider,
  Typography,
} from "@mui/material";
import { FaArrowRight, FaMapMarkerAlt, FaStar } from "react-icons/fa";
import { CiTimer } from "react-icons/ci";

const fallbackImage = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1200&q=80";

const getFoto = (estabelecimento) => {
  if (Array.isArray(estabelecimento.fotosUrl) && estabelecimento.fotosUrl.length > 0) {
    return estabelecimento.fotosUrl[0];
  }

  return estabelecimento.Imagem || fallbackImage;
};

const getNome = (estabelecimento) => estabelecimento.nomeFantasia || estabelecimento.nome || "Estabelecimento";

const getLocalizacao = (estabelecimento) => {
  const endereco = estabelecimento.endereco;
  if (!endereco) return estabelecimento.telefone || "Localizacao nao informada";

  return [endereco.bairro, endereco.cidade].filter(Boolean).join(", ") || endereco.rua || "Localizacao nao informada";
};

const getCategorias = (estabelecimento) => {
  if (Array.isArray(estabelecimento.gradeAtividades) && estabelecimento.gradeAtividades.length > 0) {
    return [...new Set(estabelecimento.gradeAtividades.map((item) => item.atividade).filter(Boolean))];
  }

  return ["Estabelecimento"];
};

const getDescricao = (estabelecimento) => {
  const categorias = getCategorias(estabelecimento);
  if (categorias.length > 0 && categorias[0] !== "Estabelecimento") {
    return `Espaco com atividades de ${categorias.join(", ")}.`;
  }

  return estabelecimento.email || "Conheca este estabelecimento da comunidade IlhaFit.";
};

const CardEstabelecimento = ({ estabelecimento, onClick }) => {
  const foto = getFoto(estabelecimento);
  const nome = getNome(estabelecimento);
  const avaliacao = estabelecimento.avaliacao ?? 0;
  const categorias = getCategorias(estabelecimento);

  return (
    <Card
      onClick={onClick}
      sx={{
        width: "100%",
        minHeight: 405,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 2,
        boxShadow: 0,
        transition: "all 0.25s ease",
        border: "1px solid",
        borderColor: "divider",
        cursor: "pointer",
        overflow: "hidden",
        bgcolor: "background.paper",
        "&:hover": {
          transform: "translateY(-3px)",
          borderColor: "primary.main",
          boxShadow: 3,
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia component="img" height="230" image={foto} alt={nome} sx={{ objectFit: "cover" }} />
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(to top, rgba(0,0,0,0.72), rgba(0,0,0,0.04) 58%)",
          }}
        />
        <Box
          sx={{
            position: "absolute",
            top: 14,
            right: 14,
            bgcolor: "background.paper",
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            px: 1.2,
            py: 0.5,
            borderRadius: 1.5,
            boxShadow: 2,
          }}
        >
          <FaStar size={13} color="#FBBF24" />
          <Typography variant="caption" sx={{ color: "text.primary", fontWeight: 800 }}>
            {avaliacao}
          </Typography>
        </Box>
        <Box sx={{ position: "absolute", left: 20, right: 20, bottom: 16 }}>
          <Typography variant="h6" fontWeight={900} sx={{ color: "white", lineHeight: 1.15 }}>
            {nome}
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mt: 0.75, color: "rgba(255,255,255,0.88)" }}>
            <FaMapMarkerAlt size={12} />
            <Typography variant="caption" fontWeight={700}>
              {getLocalizacao(estabelecimento)}
            </Typography>
          </Box>
        </Box>
      </Box>

      <CardContent sx={{ display: "flex", flexDirection: "column", flexGrow: 1, p: 2.5 }}>
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 2 }}>
          {categorias.slice(0, 3).map((cat) => (
            <Chip
              key={cat}
              label={cat}
              size="small"
              sx={{
                bgcolor: "rgba(16, 185, 129, 0.10)",
                color: "primary.main",
                fontWeight: 800,
                borderRadius: 1.5,
              }}
            />
          ))}
        </Box>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2.5,
            lineHeight: 1.7,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {getDescricao(estabelecimento)}
        </Typography>

        <Divider sx={{ mt: "auto", mb: 1.5 }} />
        <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "text.secondary" }}>
            <CiTimer size={18} />
            <Typography variant="caption" fontWeight={700}>
              Aberto hoje
            </Typography>
          </Box>
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, color: "primary.main", fontSize: 14, fontWeight: 800 }}>
            Ver detalhes
            <FaArrowRight size={13} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CardEstabelecimento;

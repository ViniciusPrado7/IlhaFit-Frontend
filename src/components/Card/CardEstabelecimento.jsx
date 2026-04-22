import {
  Card,
  CardContent,
  Typography,
  Box,
  CardMedia,
  Chip,
  Divider,
} from "@mui/material";

import { CiTimer } from "react-icons/ci";
import { FaArrowRight, FaStar } from "react-icons/fa";

const CardEstabelecimento = ({ estabelecimento, onClick }) => {
  return (
    <Card
      onClick={onClick}
      sx={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        borderRadius: 4,
        boxShadow: 3,
        transition: "all 0.3s ease",
        border: "1px solid transparent",
        cursor: "pointer",

        "&:hover": {
          boxShadow: 6,
          transform: "translateY(-4px)",
          borderColor: "primary.main",
        },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          height="200"
          image={estabelecimento.Imagem}
          alt="Estabelecimento"
        />
        <Box
          sx={{
            position: "absolute",
            top: 15,
            right: 15,
            bgcolor: "#fff",
            display: "flex",
            alignItems: "center",
            gap: "4px",
            px: 1,
            py: "2px",
            borderRadius: 1.5,
            boxShadow: 2,
          }}
        >
          <FaStar size={14} color="#FBBF24" /> 
          <Typography
            variant="caption"
            sx={{ color: "#000", fontWeight: 600 }}
          >
            {estabelecimento.avaliacao}
          </Typography>
        </Box>
      </Box>

      <CardContent
        sx={{
          display: "flex",
          flexDirection: "column",
          flexGrow: 1,
        }}
      >
        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap", mb: 1 }}>
          {estabelecimento.categorias?.map((cat) => (
            <Chip
              key={cat}
              label={cat}
              size="small"
              sx={{
                bgcolor: "rgba(16, 185, 129, 0.12)",
                color: "primary.main",
                fontWeight: 500,
              }}
            />
          ))}
        </Box>
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 2,
            display: "-webkit-box",
            WebkitLineClamp: 3,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {estabelecimento.descricao}
        </Typography>
        <Divider sx={{ mb: 1.5 }} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
            <CiTimer size={18} color="rgba(0,0,0,0.54)" />
            <Typography
              variant="caption"
              sx={{ color: "text.secondary", fontWeight: 500 }}
            >
              {estabelecimento.aberto ? "Aberto agora" : "Fechado"}
            </Typography>
          </Box>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 0.5,
              color: "primary.main",
              fontSize: 14,
              fontWeight: 500,
              "&:hover": {
                textDecoration: "underline",
              },
            }}
          >
            Ver detalhes
            <FaArrowRight size={14} />
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CardEstabelecimento;

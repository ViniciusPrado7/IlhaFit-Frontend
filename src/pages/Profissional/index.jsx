import { Alert, Box, CircularProgress, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import CardProfissional from "../../components/Card/CardProfissional";
import { profissionalService } from "../../service/ProfissionalService";

const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  if (data && typeof data === "object") return Object.values(data).filter(Boolean).join(" ");
  return error?.message || "Nao foi possivel carregar os profissionais.";
};

const Profissional = () => {
  const [profissionais, setProfissionais] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const carregarProfissionais = async () => {
      try {
        const response = await profissionalService.listarProfissionais();
        if (mounted) {
          setProfissionais(Array.isArray(response.data) ? response.data : []);
          setError("");
        }
      } catch (err) {
        if (mounted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    carregarProfissionais();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={1}>
        Melhores profissionais
      </Typography>
      <Typography color="text.secondary" mb={4}>
        Profissionais com as melhores notas da comunidade
      </Typography>

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress />
        </Box>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && profissionais.length === 0 && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Nenhum profissional encontrado.
        </Alert>
      )}

      {!loading && !error && profissionais.length > 0 && (
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

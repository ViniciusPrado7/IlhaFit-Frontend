import { Alert, Box, Button, CircularProgress } from "@mui/material";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ModalEstabelecimentoContent from "./components/ModalEstabelecimento";
import { estabelecimentoService } from "../../service/EstabelecimentoService";

const getErrorMessage = (error) => {
  const data = error?.response?.data;
  if (typeof data === "string") return data;
  if (data && typeof data === "object") return Object.values(data).filter(Boolean).join(" ");
  return "Nao foi possivel carregar o estabelecimento.";
};

const DetalheEstabelecimento = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [estabelecimento, setEstabelecimento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const carregar = async () => {
      try {
        const response = await estabelecimentoService.buscarEstabelecimentoPorId(id);
        if (mounted) {
          setEstabelecimento(response.data);
          setError("");
        }
      } catch (err) {
        if (mounted) setError(getErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };

    carregar();

    return () => {
      mounted = false;
    };
  }, [id]);

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Alert severity="error" action={<Button onClick={() => navigate("/estabelecimento")}>Voltar</Button>}>
        {error}
      </Alert>
    );
  }

  return (
    <Box sx={{ maxWidth: 980, mx: "auto", pb: 6 }}>
      <ModalEstabelecimentoContent
        estabelecimento={estabelecimento}
        onClose={() => navigate("/estabelecimento")}
      />
    </Box>
  );
};

export default DetalheEstabelecimento;

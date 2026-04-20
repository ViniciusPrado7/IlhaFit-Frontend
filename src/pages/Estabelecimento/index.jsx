import { Alert, Box, CircularProgress, Dialog, Typography } from "@mui/material";
import { useEffect, useState } from "react";
import CardEstabelecimento from "../../components/Card/CardEstabelecimento";
import { ModalEstabelecimentoContent } from "../../components/ModalEstabelecimento";
import { estabelecimentoService } from "../../service/EstabelecimentoService";

const getErrorMessage = (error) => {
  const data = error?.response?.data;

  if (typeof data === "string") {
    return data;
  }

  if (data && typeof data === "object" && !Array.isArray(data)) {
    return Object.values(data).filter(Boolean).join(" ");
  }

  return error?.message || "Nao foi possivel carregar os estabelecimentos.";
};

const normalizeList = (data) => {
  if (Array.isArray(data)) {
    return data;
  }

  if (Array.isArray(data?.content)) {
    return data.content;
  }

  if (Array.isArray(data?.data)) {
    return data.data;
  }

  return [];
};

const Estabelecimento = () => {
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [selectedEstabelecimento, setSelectedEstabelecimento] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    const carregarEstabelecimentos = async () => {
      try {
        const response = await estabelecimentoService.listarEstabelecimentos();

        if (isMounted) {
          setEstabelecimentos(normalizeList(response.data));
          setError("");
        }
      } catch (err) {
        if (isMounted) {
          setError(getErrorMessage(err));
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    carregarEstabelecimentos();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={1}>
        Melhores estabelecimentos
      </Typography>
      <Typography color="text.secondary" mb={4}>
        Locais com as melhores notas da comunidade
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

      {!loading && !error && estabelecimentos.length === 0 && (
        <Alert severity="info">
          Nenhum estabelecimento encontrado.
        </Alert>
      )}

      {!loading && !error && estabelecimentos.length > 0 && (
        <Box
          sx={{
            display: "grid",
            gap: 4,
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2, 1fr)",
              lg: "repeat(3, minmax(0, 1fr))",
            },
          }}
        >
          {estabelecimentos.map((item) => (
            <CardEstabelecimento
              key={item.id || item.cnpj || item.email}
              estabelecimento={item}
              onClick={() => setSelectedEstabelecimento(item)}
            />
          ))}
        </Box>
      )}

      <Dialog
        open={Boolean(selectedEstabelecimento)}
        onClose={() => setSelectedEstabelecimento(null)}
        fullWidth
        maxWidth="md"
        scroll="body"
        slotProps={{
          backdrop: {
            sx: {
              bgcolor: "rgba(2, 6, 23, 0.72)",
              backdropFilter: "blur(2px)",
            },
          },
          paper: {
            sx: {
              borderRadius: 2,
              bgcolor: "transparent",
              boxShadow: "none",
              overflow: "visible",
            },
          },
        }}
      >
        {selectedEstabelecimento && (
          <ModalEstabelecimentoContent
            estabelecimento={selectedEstabelecimento}
            onClose={() => setSelectedEstabelecimento(null)}
            closeLabel="Fechar"
          />
        )}
      </Dialog>
    </Box>
  );
};

export default Estabelecimento;

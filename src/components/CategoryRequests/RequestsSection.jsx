import { useEffect, useState } from "react";
import { Alert, Box, CircularProgress, Divider, Typography } from "@mui/material";
import { toast } from "react-toastify";
import { categoriaPendenteService } from "../../service/CategoryService";
import { authSession } from "../../service/AuthSession";
import CategoriaSolicitacaoForm from "./RequestForm";
import CategoriaSolicitacoesList from "./RequestsList";
import {
  countPendingSolicitacoes,
  getCategoriaSolicitacaoErrorMessage,
} from "./utils";

const contemApenasTexto = (value = "") => /^[A-Za-zÀ-ÿ\s]+$/.test(value.trim());

const CategoriaSolicitacoesSection = ({ onRefreshCategoriasOficiais }) => {
  const user = authSession.getUser();
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [solicitacoes, setSolicitacoes] = useState([]);
  const [novaCategoria, setNovaCategoria] = useState("");
  const [formError, setFormError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [accessError, setAccessError] = useState("");

  const canRequestCategoria =
    user?.tipo === "PROFISSIONAL" || user?.tipo === "ESTABELECIMENTO";

  const carregarSolicitacoes = async () => {
    const response = await categoriaPendenteService.listarMinhas();
    setSolicitacoes(Array.isArray(response.data) ? response.data : []);
  };

  useEffect(() => {
    if (!canRequestCategoria) {
      setAccessError(
        "Solicitações de categoria estão disponíveis apenas para perfis profissional e estabelecimento."
      );
      setLoading(false);
      return;
    }

    let mounted = true;

    const load = async () => {
      try {
        setLoading(true);
        setAccessError("");
        const response = await categoriaPendenteService.listarMinhas();
        if (!mounted) return;
        setSolicitacoes(Array.isArray(response.data) ? response.data : []);
        await onRefreshCategoriasOficiais?.();
      } catch (error) {
        if (!mounted) return;

        if (error?.response?.status === 403) {
          setAccessError(
            "Sua conta não tem permissão para acessar solicitações de categoria no momento."
          );
          setSolicitacoes([]);
          return;
        }

        setFormError(
          getCategoriaSolicitacaoErrorMessage(
            error,
            "Não foi possível carregar suas solicitações de categoria."
          )
        );
      } finally {
        if (mounted) setLoading(false);
      }
    };

    load();

    return () => {
      mounted = false;
    };
  }, [canRequestCategoria, onRefreshCategoriasOficiais]);

  const pendingCount = countPendingSolicitacoes(solicitacoes);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nome = novaCategoria.trim();
    if (!nome) return;
    if (!contemApenasTexto(nome)) {
      const message = "O nome da categoria deve conter apenas letras.";
      setFormError(message);
      toast.error(message);
      return;
    }

    setSubmitting(true);
    setFormError("");
    setSuccessMessage("");

    try {
      await categoriaPendenteService.solicitar({ nome });
      await carregarSolicitacoes();
      setNovaCategoria("");
      setSuccessMessage(
        "Solicitação enviada com sucesso. Agora é só aguardar a análise do admin."
      );
      toast.success("Solicitação de categoria enviada!");
    } catch (error) {
      const message = getCategoriaSolicitacaoErrorMessage(
        error,
        "Não foi possível enviar sua solicitação de categoria."
      );
      setFormError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={900} sx={{ mb: 1 }}>
        Solicitações de Categoria
      </Typography>
      <Typography color="text.secondary" sx={{ mb: 3 }}>
        Use esta área para pedir novas categorias depois do cadastro. Quando uma solicitação for aprovada, a categoria entra na lista oficial e poderá ser adicionada manualmente por você ao perfil.
      </Typography>

      {accessError ? (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          {accessError}
        </Alert>
      ) : null}

      <CategoriaSolicitacaoForm
        value={novaCategoria}
        onChange={(value) => {
          setNovaCategoria(value);
          setFormError("");
          setSuccessMessage("");
        }}
        onSubmit={handleSubmit}
        loading={submitting}
        disabled={Boolean(accessError) || !canRequestCategoria}
        pendingCount={pendingCount}
        error={formError}
        successMessage={successMessage}
      />

      <Divider sx={{ my: 3 }} />

      <Typography variant="h6" fontWeight={800} sx={{ mb: 2 }}>
        Minhas solicitações
      </Typography>

      <CategoriaSolicitacoesList
        solicitacoes={solicitacoes}
        emptyTitle="Você ainda não solicitou nenhuma categoria."
        emptyDescription="Conclua o cadastro com categorias existentes e use este formulário quando precisar sugerir uma nova categoria."
      />
    </Box>
  );
};

export default CategoriaSolicitacoesSection;

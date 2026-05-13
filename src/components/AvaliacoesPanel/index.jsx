import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Paper,
  Rating,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { useCallback, useEffect, useMemo, useState } from "react";
import { toast } from "react-toastify";
import { avaliacaoService } from "../../service/AvaliacaoService";
import { authSession } from "../../service/AuthSession";
import { denunciaService } from "../../service/DenunciaService";

const MOTIVOS_DENUNCIA = [
  { value: "PRECONCEITO", label: "Preconceito" },
  { value: "LINGUAGEM_OFENSIVA", label: "Linguagem ofensiva" },
  { value: "SPAM", label: "Spam" },
  { value: "INFORMACAO_FALSA", label: "Informacao falsa" },
  { value: "OUTROS", label: "Outros" },
];

const getApiError = (error, fallback) => {
  const data = error?.response?.data;

  if (data?.erro) return data.erro;
  if (typeof data === "string") return data;
  if ([401, 403].includes(error?.response?.status)) {
    return "Sessao invalida ou sem permissao. Saia da conta e faca login novamente.";
  }

  return error?.message || fallback;
};

const getAvaliacaoSubmitError = (error) => {
  if (error?.response?.status === 403) {
    return "Usuarios do tipo estabelecimento nao podem realizar avaliacoes.";
  }

  if (error?.response?.status === 422) {
    return "Nao foi possivel enviar sua avaliacao porque o comentario contem conteudo ofensivo ou inadequado.";
  }

  if (error?.response?.status === 503) {
    return "Nao foi possivel validar sua mensagem no momento. Tente novamente em instantes.";
  }

  return getApiError(error, "Nao foi possivel enviar a avaliacao.");
};

const getDenunciaSubmitError = (error) => {
  if (error?.response?.status === 422) {
    return "Nao foi possivel enviar sua denuncia porque a descricao contem conteudo ofensivo ou inadequado.";
  }

  if (error?.response?.status === 503) {
    return "Nao foi possivel validar sua mensagem no momento. Tente novamente em instantes.";
  }

  return getApiError(error, "Nao foi possivel enviar a denuncia.");
};

const formatDate = (date) => {
  if (!date) return "";
  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "";

  return parsed.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const isOwnReview = (avaliacao, user) => {
  if (!user || !avaliacao) return false;
  return Number(avaliacao.autorId) === Number(user.id) && avaliacao.tipoAutor === user.tipo;
};

const AvaliacoesPanel = ({ targetType, targetId }) => {
  const [avaliacoes, setAvaliacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [denunciaOpen, setDenunciaOpen] = useState(false);
  const [avaliacaoSelecionada, setAvaliacaoSelecionada] = useState(null);
  const [motivo, setMotivo] = useState("");
  const [descricaoAdicional, setDescricaoAdicional] = useState("");
  const [denunciando, setDenunciando] = useState(false);

  const [user, setUser] = useState(() => authSession.getUser());
  const token = authSession.getToken();
  const isAutenticado = ["USUARIO", "ESTABELECIMENTO", "PROFISSIONAL"].includes(user?.tipo) && Boolean(token);
  const canCreateReview = ["USUARIO", "PROFISSIONAL"].includes(user?.tipo) && Boolean(token);

  useEffect(() => {
    const onAuthChange = () => {
      setUser(authSession.getUser());
    };
    window.addEventListener("auth-change", onAuthChange);
    return () => window.removeEventListener("auth-change", onAuthChange);
  }, []);

  const isSelfTarget =
    (targetType === "estabelecimento" && user?.tipo === "ESTABELECIMENTO" && Number(user?.id) === Number(targetId)) ||
    (targetType === "profissional" && user?.tipo === "PROFISSIONAL" && Number(user?.id) === Number(targetId));

  const authMessage = useMemo(() => {
    if (!isAutenticado) return "Faca login para avaliar.";
    if (!canCreateReview) return "Usuarios do tipo estabelecimento nao podem realizar avaliacoes.";
    if (isSelfTarget) return user?.tipo === "PROFISSIONAL" ? "Voce nao pode avaliar seu proprio perfil." : "Voce nao pode avaliar seu proprio estabelecimento.";
    return "";
  }, [canCreateReview, isAutenticado, isSelfTarget, user]);

  const carregarAvaliacoes = useCallback(async () => {
    if (!targetId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const response = targetType === "profissional"
        ? await avaliacaoService.listarPorProfissional(targetId)
        : await avaliacaoService.listarPorEstabelecimento(targetId);
      setAvaliacoes(Array.isArray(response.data) ? response.data : []);
      setError("");
    } catch (err) {
      setError(getApiError(err, "Nao foi possivel carregar as avaliacoes."));
    } finally {
      setLoading(false);
    }
  }, [targetId, targetType]);

  useEffect(() => {
    carregarAvaliacoes();
  }, [carregarAvaliacoes]);

  const handleCriarAvaliacao = async (event) => {
    event.preventDefault();

    if (!isAutenticado) {
      toast.warning("Faca login para avaliar.");
      return;
    }

    if (!canCreateReview) {
      toast.warning("Usuarios do tipo estabelecimento nao podem realizar avaliacoes.");
      return;
    }

    if (isSelfTarget) {
      toast.warning(user?.tipo === "PROFISSIONAL" ? "Voce nao pode avaliar seu proprio perfil." : "Voce nao pode avaliar seu proprio estabelecimento.");
      return;
    }

    if (!nota) {
      toast.warning("Informe uma nota para avaliar.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        nota,
        comentario: comentario.trim(),
        ...(targetType === "profissional" ? { profissionalId: targetId } : { estabelecimentoId: targetId }),
      };

      await avaliacaoService.criarAvaliacao(payload);
      setNota(0);
      setComentario("");
      toast.success("Avaliacao enviada com sucesso.");
      await carregarAvaliacoes();
    } catch (err) {
      toast.error(getAvaliacaoSubmitError(err));
    } finally {
      setSaving(false);
    }
  };

  const abrirDenuncia = (avaliacao) => {
    if (!isAutenticado) {
      toast.warning("Faca login para denunciar.");
      return;
    }

    if (isOwnReview(avaliacao, user)) {
      toast.warning("Voce nao pode denunciar sua propria avaliacao.");
      return;
    }

    setAvaliacaoSelecionada(avaliacao);
    setMotivo("");
    setDescricaoAdicional("");
    setDenunciaOpen(true);
  };

  const handleDenunciar = async () => {
    if (!motivo || !avaliacaoSelecionada?.id) return;

    setDenunciando(true);
    try {
      await denunciaService.criarDenuncia({
        avaliacaoId: avaliacaoSelecionada.id,
        motivo,
        descricaoAdicional: descricaoAdicional.trim() || null,
      });
      toast.success("Denuncia enviada com sucesso.");
      setDenunciaOpen(false);
    } catch (err) {
      toast.error(getDenunciaSubmitError(err));
    } finally {
      setDenunciando(false);
    }
  };

  const handleDeletar = async (avaliacao) => {
    if (!isOwnReview(avaliacao, user)) return;

    try {
      await avaliacaoService.deletarAvaliacao(avaliacao.id);
      toast.success("Avaliacao excluida com sucesso.");
      await carregarAvaliacoes();
    } catch (err) {
      toast.error(getApiError(err, "Nao foi possivel excluir a avaliacao."));
    }
  };

  return (
    <Box>
      {authMessage && (
        <Alert severity="info" sx={{ mb: 2 }}>
          {authMessage}
        </Alert>
      )}

      {canCreateReview && !isSelfTarget && (
        <Paper
          component="form"
          onSubmit={handleCriarAvaliacao}
          elevation={0}
          sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2, mb: 2 }}
        >
          <Typography variant="subtitle2" fontWeight={900} sx={{ mb: 1 }}>
            Deixe sua avaliacao
          </Typography>
          <Rating value={nota} onChange={(_, value) => setNota(value || 0)} sx={{ mb: 1 }} />
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={comentario}
            onChange={(event) => setComentario(event.target.value)}
            placeholder="Conte como foi sua experiencia..."
            sx={{ mb: 1.5 }}
          />
          <Button type="submit" variant="contained" disabled={saving || !nota} sx={{ borderRadius: 2, fontWeight: 900 }}>
            {saving ? "Enviando..." : "Enviar avaliacao"}
          </Button>
        </Paper>
      )}

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", py: 3 }}>
          <CircularProgress size={24} />
        </Box>
      )}

      {!loading && error && <Alert severity="error">{error}</Alert>}

      {!loading && !error && avaliacoes.length === 0 && (
        <Box sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2, textAlign: "center", color: "text.secondary" }}>
          Nenhuma avaliacao encontrada.
        </Box>
      )}

      {!loading && !error && avaliacoes.length > 0 && (
        <Box sx={{ display: "grid", gap: 1.5 }}>
          {avaliacoes.map((avaliacao) => {
            const ownReview = isOwnReview(avaliacao, user);

            return (
              <Paper key={avaliacao.id} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 1, flexWrap: "wrap" }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={900}>
                      {avaliacao.nomeAutor || "Usuario"}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {formatDate(avaliacao.dataAvaliacao)}
                    </Typography>
                  </Box>
                  <Rating value={Number(avaliacao.nota) || 0} readOnly size="small" />
                </Box>

                {avaliacao.comentario && (
                  <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.7, mb: 1 }}>
                    {avaliacao.comentario}
                  </Typography>
                )}

                {isAutenticado && (
                  <Box sx={{ display: "flex", justifyContent: "flex-end", gap: 1, flexWrap: "wrap" }}>
                    {ownReview ? (
                      <Button size="small" color="error" onClick={() => handleDeletar(avaliacao)}>
                        Excluir
                      </Button>
                    ) : (
                      <Button size="small" color="warning" onClick={() => abrirDenuncia(avaliacao)}>
                        Denunciar
                      </Button>
                    )}
                  </Box>
                )}
              </Paper>
            );
          })}
        </Box>
      )}

      <Dialog open={denunciaOpen} onClose={() => setDenunciaOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>Denunciar avaliacao</DialogTitle>
        <DialogContent sx={{ display: "grid", gap: 2, pt: 1 }}>
          <Select
            value={motivo}
            displayEmpty
            onChange={(event) => setMotivo(event.target.value)}
          >
            <MenuItem value="" disabled>
              Selecione o motivo
            </MenuItem>
            {MOTIVOS_DENUNCIA.map((item) => (
              <MenuItem key={item.value} value={item.value}>
                {item.label}
              </MenuItem>
            ))}
          </Select>
          <TextField
            multiline
            minRows={3}
            value={descricaoAdicional}
            onChange={(event) => setDescricaoAdicional(event.target.value)}
            placeholder="Descricao adicional"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDenunciaOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="warning" disabled={!motivo || denunciando} onClick={handleDenunciar}>
            {denunciando ? "Enviando..." : "Enviar denuncia"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AvaliacoesPanel;

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
import { avaliacaoService } from "../../service/ReviewService";
import { authSession } from "../../service/AuthSession";
import { denunciaService } from "../../service/ReportService";
import { normalizeAvaliacoes } from "../../utils/review";

const MOTIVOS_DENUNCIA = [
  { value: "PRECONCEITO", label: "Preconceito" },
  { value: "LINGUAGEM_OFENSIVA", label: "Linguagem ofensiva" },
  { value: "SPAM", label: "Spam" },
  { value: "INFORMACAO_FALSA", label: "Informação falsa" },
  { value: "OUTROS", label: "Outros" },
];

const getApiError = (error, fallback) => {
  const data = error?.response?.data;

  if (data?.erro) return data.erro;
  if (typeof data === "string") return data;
  if ([401, 403].includes(error?.response?.status)) {
    return "Sessão inválida ou sem permissão. Saia da conta e faça login novamente.";
  }

  return error?.message || fallback;
};

const getAvaliacaoSubmitError = (error) => {
  if (error?.response?.status === 403) {
    return "Usuários do tipo estabelecimento não podem realizar avaliações.";
  }

  if (error?.response?.status === 422) {
    return "Não foi possível enviar sua avaliação porque o comentário contém conteúdo ofensivo ou inadequado.";
  }

  if (error?.response?.status === 503) {
    return "Não foi possível validar sua mensagem no momento. Tente novamente em instantes.";
  }

  return getApiError(error, "Não foi possível enviar a avaliação.");
};

const getDenunciaSubmitError = (error) => {
  if (error?.response?.status === 422) {
    return "Não foi possível enviar sua denúncia porque a descrição contém conteúdo ofensivo ou inadequado.";
  }

  if (error?.response?.status === 503) {
    return "Não foi possível validar sua mensagem no momento. Tente novamente em instantes.";
  }

  return getApiError(error, "Não foi possível enviar a denúncia.");
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

const REVIEWS_PAGE_SIZE = 5;

const AvaliacoesPanel = ({ targetType, targetId, onAvaliacoesChange }) => {
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
  const [visibleCount, setVisibleCount] = useState(REVIEWS_PAGE_SIZE);

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
    if (!isAutenticado) return "Faça login para avaliar.";
    if (!canCreateReview) return "Usuários do tipo estabelecimento não podem realizar avaliações.";
    if (isSelfTarget) return user?.tipo === "PROFISSIONAL" ? "Você não pode avaliar seu próprio perfil." : "Você não pode avaliar seu próprio estabelecimento.";
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
      const lista = normalizeAvaliacoes(response.data);
      setAvaliacoes(lista);
      onAvaliacoesChange?.(lista);
      setError("");
    } catch (err) {
      setError(getApiError(err, "Não foi possível carregar as avaliações."));
    } finally {
      setLoading(false);
    }
  }, [targetId, targetType]);

  useEffect(() => {
    carregarAvaliacoes();
  }, [carregarAvaliacoes]);

  useEffect(() => {
    setVisibleCount(REVIEWS_PAGE_SIZE);
  }, [targetId, targetType]);

  const handleCriarAvaliacao = async (event) => {
    event.preventDefault();

    if (!isAutenticado) {
      toast.warning("Faça login para avaliar.");
      return;
    }

    if (!canCreateReview) {
      toast.warning("Usuários do tipo estabelecimento não podem realizar avaliações.");
      return;
    }

    if (isSelfTarget) {
      toast.warning(user?.tipo === "PROFISSIONAL" ? "Você não pode avaliar seu próprio perfil." : "Você não pode avaliar seu próprio estabelecimento.");
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
      toast.success("Avaliação enviada com sucesso.");
      await carregarAvaliacoes();
    } catch (err) {
      toast.error(getAvaliacaoSubmitError(err));
    } finally {
      setSaving(false);
    }
  };

  const abrirDenuncia = (avaliacao) => {
    if (!isAutenticado) {
      toast.warning("Faça login para denunciar.");
      return;
    }

    if (isOwnReview(avaliacao, user)) {
      toast.warning("Você não pode denunciar sua própria avaliação.");
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
      toast.success("Denúncia enviada com sucesso.");
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
      toast.success("Avaliação excluída com sucesso.");
      await carregarAvaliacoes();
    } catch (err) {
      toast.error(getApiError(err, "Não foi possível excluir a avaliação."));
    }
  };

  const avaliacoesVisiveis = avaliacoes.slice(0, visibleCount);
  const hasMoreAvaliacoes = avaliacoes.length > visibleCount;

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
            Deixe sua avaliação
          </Typography>
          <Rating value={nota} onChange={(_, value) => setNota(value || 0)} sx={{ mb: 1 }} />
          <TextField
            fullWidth
            multiline
            minRows={3}
            value={comentario}
            onChange={(event) => setComentario(event.target.value)}
            placeholder="Conte como foi sua experiência..."
            sx={{ mb: 1.5 }}
          />
          <Button type="submit" variant="contained" disabled={saving || !nota} sx={{ borderRadius: 2, fontWeight: 900 }}>
            {saving ? "Enviando..." : "Enviar avaliação"}
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
          Nenhuma avaliação encontrada.
        </Box>
      )}

      {!loading && !error && avaliacoes.length > 0 && (
        <Box sx={{ display: "grid", gap: 1.5 }}>
          {avaliacoesVisiveis.map((avaliacao) => {
            const ownReview = isOwnReview(avaliacao, user);

            return (
              <Paper key={avaliacao.id} elevation={0} sx={{ border: "1px solid", borderColor: "divider", borderRadius: 2, p: 2 }}>
                <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, mb: 1, flexWrap: "wrap" }}>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={900}>
                      {avaliacao.nomeAutor || "Usuário"}
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

          {hasMoreAvaliacoes && (
            <Button
              variant="outlined"
              onClick={() => setVisibleCount((current) => current + REVIEWS_PAGE_SIZE)}
              sx={{ justifySelf: "center", borderRadius: 2, fontWeight: 900, mt: 0.5 }}
            >
              Ver mais avaliações
            </Button>
          )}
        </Box>
      )}

      <Dialog
        open={denunciaOpen}
        onClose={() => setDenunciaOpen(false)}
        fullWidth
        maxWidth="sm"
        disableRestoreFocus
      >
        <DialogTitle>Denunciar avaliação</DialogTitle>
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
            placeholder="Descrição adicional"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDenunciaOpen(false)}>Cancelar</Button>
          <Button variant="contained" color="warning" disabled={!motivo || denunciando} onClick={handleDenunciar}>
            {denunciando ? "Enviando..." : "Enviar denúncia"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AvaliacoesPanel;

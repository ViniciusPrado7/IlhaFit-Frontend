import { useState, useEffect, useCallback, useRef } from "react";
import { solicitacaoCategoriaService, denunciaService } from "../service";

const STORAGE_KEY = "ilhaFitSeenNotifications";
const POLL_INTERVAL = 30_000;
const DENUNCIA_THRESHOLD = 3;

const parseDate = (raw) => {
  if (!raw) return null;
  if (Array.isArray(raw)) {
    const [y, m, d, h = 0, min = 0, s = 0] = raw;
    const date = new Date(y, m - 1, d, h, min, s);
    return isNaN(date.getTime()) ? null : date;
  }
  const date = new Date(raw);
  return isNaN(date.getTime()) ? null : date;
};

const getSeenIds = () => {
  try {
    return new Set(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"));
  } catch {
    return new Set();
  }
};

const saveSeenIds = (ids) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
  } catch {
    /* ignore */
  }
};

export function useAdminNotifications(enabled = true) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [seenIds, setSeenIds] = useState(getSeenIds);
  const mountedRef = useRef(true);

  const fetchNotifications = useCallback(
    async (silent = false) => {
      if (!enabled) return;
      if (!silent) setLoading(true);
      try {
        const [solicitacoes, denuncias] = await Promise.all([
          solicitacaoCategoriaService.getAll("PENDENTE"),
          denunciaService.getAll("PENDENTE"),
        ]);

        if (!mountedRef.current) return;

        const mapped = [
          ...(solicitacoes || []).map((s) => ({
            id: `solicitacao-${s.id}`,
            type: "solicitacao",
            title: "Solicitação de Categoria",
            message: `${s.solicitanteNome || s.solicitanteEmail || "Usuário"} solicitou "${s.nome}"`,
            createdAt: parseDate(s.dataCadastro || s.createdAt || s.created_at),
            tab: 5,
          })),
          ...Object.values(
            (denuncias || []).reduce((acc, d) => {
              const key = d.avaliacaoId;
              if (!acc[key]) acc[key] = [];
              acc[key].push(d);
              return acc;
            }, {})
          )
            .filter((grupo) => grupo.length >= DENUNCIA_THRESHOLD)
            .map((grupo) => {
              const latest = grupo[grupo.length - 1];
              const trecho = latest.comentarioAvaliacao?.slice(0, 40) || "comentário";
              return {
                id: `denuncia-avaliacao-${latest.avaliacaoId}`,
                type: "denuncia",
                title: `Avaliação com ${grupo.length} denúncias`,
                message: `"${trecho}${latest.comentarioAvaliacao?.length > 40 ? "…" : ""}" — ${latest.nomeAutorAvaliacao || "autor desconhecido"}`,
                createdAt: parseDate(latest.dataDenuncia),
                tab: 3,
              };
            }),
        ].sort((a, b) => {
          if (!a.createdAt && !b.createdAt) return 0;
          if (!a.createdAt) return 1;
          if (!b.createdAt) return -1;
          return b.createdAt - a.createdAt;
        });

        setItems(mapped);
      } catch {
        /* silent fail */
      } finally {
        if (mountedRef.current && !silent) setLoading(false);
      }
    },
    [enabled]
  );

  useEffect(() => {
    mountedRef.current = true;
    fetchNotifications(false);
    const interval = setInterval(() => fetchNotifications(true), POLL_INTERVAL);
    return () => {
      mountedRef.current = false;
      clearInterval(interval);
    };
  }, [fetchNotifications]);

  const isRead = useCallback((id) => seenIds.has(id), [seenIds]);

  const markAsRead = useCallback((id) => {
    setSeenIds((prev) => {
      const next = new Set(prev);
      next.add(id);
      saveSeenIds(next);
      return next;
    });
  }, []);

  const markAllAsRead = useCallback(
    (ids) => {
      setSeenIds((prev) => {
        const next = new Set(prev);
        (ids ?? items.map((i) => i.id)).forEach((id) => next.add(id));
        saveSeenIds(next);
        return next;
      });
    },
    [items]
  );

  const unreadCount = items.filter((item) => !seenIds.has(item.id)).length;

  return { items, unreadCount, loading, isRead, markAsRead, markAllAsRead };
}

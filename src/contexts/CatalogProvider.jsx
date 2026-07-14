import { useCallback, useMemo, useRef, useState } from "react";
import { estabelecimentoService } from "../service/EstablishmentService";
import { profissionalService } from "../service/ProfessionalService";
import { CatalogContext } from "./CatalogContext";

const normalizeList = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

const useResourceCache = (fetcher) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const loadedRef = useRef(false);
  const inFlightRef = useRef(null);

  // Serve o cache existente para quem navega de volta a uma tela ja carregada
  // antes; so busca de novo se ainda nao carregou ou se refresh() for chamado.
  const ensure = useCallback(() => {
    if (loadedRef.current || inFlightRef.current) {
      return inFlightRef.current;
    }

    setLoading(true);
    const promise = fetcher()
      .then((response) => {
        setData(normalizeList(response.data));
        setError("");
        loadedRef.current = true;
      })
      .catch((err) => {
        setError(err?.message || "Não foi possível carregar os dados.");
      })
      .finally(() => {
        setLoading(false);
        inFlightRef.current = null;
      });

    inFlightRef.current = promise;
    return promise;
  }, [fetcher]);

  const refresh = useCallback(() => {
    loadedRef.current = false;
    return ensure();
  }, [ensure]);

  const update = useCallback((updated) => {
    setData((current) => current.map((item) => (item.id === updated.id ? { ...item, ...updated } : item)));
  }, []);

  return { data, loading, error, ensure, refresh, update };
};

export const CatalogProvider = ({ children }) => {
  const estabelecimentosFetcher = useCallback(() => estabelecimentoService.listarEstabelecimentos(), []);
  const profissionaisFetcher = useCallback(() => profissionalService.listarProfissionais(), []);

  const estabelecimentos = useResourceCache(estabelecimentosFetcher);
  const profissionais = useResourceCache(profissionaisFetcher);

  const value = useMemo(
    () => ({
      estabelecimentos: estabelecimentos.data,
      loadingEstabelecimentos: estabelecimentos.loading,
      errorEstabelecimentos: estabelecimentos.error,
      ensureEstabelecimentos: estabelecimentos.ensure,
      refreshEstabelecimentos: estabelecimentos.refresh,
      updateEstabelecimento: estabelecimentos.update,

      profissionais: profissionais.data,
      loadingProfissionais: profissionais.loading,
      errorProfissionais: profissionais.error,
      ensureProfissionais: profissionais.ensure,
      refreshProfissionais: profissionais.refresh,
      updateProfissional: profissionais.update,
    }),
    [estabelecimentos, profissionais]
  );

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
};

export default CatalogProvider;

export const normalizeAvaliacoes = (data) => {
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.content)) return data.content;
  if (Array.isArray(data?.data)) return data.data;
  return [];
};

export const calcularResumoAvaliacoes = (avaliacoes, fallback = {}) => {
  const lista = normalizeAvaliacoes(avaliacoes).filter((item) => item && item.nota !== undefined && item.nota !== null);

  if (lista.length === 0) {
    return {
      avaliacao: Number(fallback.avaliacao) || 0,
      totalAvaliacoes: Number(fallback.totalAvaliacoes) || 0,
    };
  }

  const somaNotas = lista.reduce((total, item) => total + (Number(item.nota) || 0), 0);
  const media = somaNotas / lista.length;

  return {
    avaliacao: Number(media.toFixed(1)),
    totalAvaliacoes: lista.length,
  };
};

export const formatarAvaliacao = (value) => {
  const nota = Number(value) || 0;

  return new Intl.NumberFormat("pt-BR", {
    minimumFractionDigits: Number.isInteger(nota) ? 0 : 1,
    maximumFractionDigits: 1,
  }).format(nota);
};

export const enriquecerEstabelecimentoComResumo = (estabelecimento, avaliacoes) => {
  const resumo = calcularResumoAvaliacoes(avaliacoes, estabelecimento);

  return {
    ...estabelecimento,
    ...resumo,
  };
};

export const enriquecerListaEstabelecimentosComAvaliacoes = async (estabelecimentos, listarPorEstabelecimento) => {
  const lista = Array.isArray(estabelecimentos) ? estabelecimentos : [];

  const itens = await Promise.all(
    lista.map(async (estabelecimento) => {
      if (!estabelecimento?.id) {
        return estabelecimento;
      }

      try {
        const response = await listarPorEstabelecimento(estabelecimento.id);
        return enriquecerEstabelecimentoComResumo(estabelecimento, response.data);
      } catch {
        return estabelecimento;
      }
    })
  );

  return itens;
};

export const STATUS_LABELS = {
  PENDENTE: "Pendente",
  APROVADA: "Aprovada",
  REJEITADA: "Rejeitada",
};

export const STATUS_COLORS = {
  PENDENTE: "warning",
  APROVADA: "success",
  REJEITADA: "error",
};

export const MAX_SOLICITACOES_PENDENTES = 3;

export const getSolicitacaoStatusLabel = (status) => STATUS_LABELS[status] || status || "Sem status";

export const getSolicitacaoStatusColor = (status) => STATUS_COLORS[status] || "default";

export const getSolicitacaoNome = (solicitacao) =>
  solicitacao?.nome ||
  solicitacao?.nomeCategoria ||
  solicitacao?.nomeCategoriaSolicitada ||
  solicitacao?.categoriaNome ||
  "";

export const getSolicitanteNome = (solicitacao) =>
  solicitacao?.solicitanteNome ||
  solicitacao?.nomeSolicitante ||
  solicitacao?.profissionalNome ||
  solicitacao?.estabelecimentoNome ||
  solicitacao?.solicitante ||
  "";

export const getSolicitanteEmail = (solicitacao) =>
  solicitacao?.solicitanteEmail ||
  solicitacao?.emailSolicitante ||
  solicitacao?.email ||
  "";

export const getSolicitanteTipo = (solicitacao) =>
  solicitacao?.tipoSolicitante ||
  solicitacao?.solicitanteTipo ||
  solicitacao?.tipo ||
  "";

export const getObservacaoAdmin = (solicitacao) =>
  solicitacao?.observacaoAdmin ||
  solicitacao?.observacao ||
  "";

export const getDataSolicitacao = (solicitacao) =>
  solicitacao?.dataSolicitacao ||
  solicitacao?.createdAt ||
  solicitacao?.dataCriacao ||
  "";

export const countPendingSolicitacoes = (solicitacoes = []) =>
  solicitacoes.filter((item) => item?.status === "PENDENTE").length;

export const formatSolicitacaoTipo = (tipo = "") => {
  if (tipo === "PROFISSIONAL") return "Profissional";
  if (tipo === "ESTABELECIMENTO") return "Estabelecimento";
  return tipo || "Não informado";
};

export const formatSolicitacaoDate = (value) => {
  if (!value) return "—";

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const getCategoriaSolicitacaoErrorMessage = (error, fallback) => {
  const data = error?.response?.data;
  const message =
    typeof data === "string"
      ? data
      : data?.erro || data?.message || error?.message || fallback;

  const mappedMessages = {
    "Cada usuário pode ter no máximo 3 categorias pendentes":
      "Você já atingiu o limite de 3 solicitações pendentes no momento.",
    "Você já possui uma solicitação pendente para essa categoria":
      "Essa categoria já está aguardando análise na sua lista de solicitações.",
    "Essa categoria já existe e pode ser usada no cadastro":
      "Essa categoria já foi aprovada e já pode ser selecionada normalmente.",
    "Categoria ainda não aprovada. Solicite uma nova categoria em /api/categorias/pendentes/solicitar":
      "Essa categoria ainda não foi aprovada. Solicite-a na seção de solicitações de categoria.",
  };

  return mappedMessages[message] || message || fallback;
};

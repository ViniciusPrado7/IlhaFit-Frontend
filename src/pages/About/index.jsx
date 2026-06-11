import { Box, Paper, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

const sections = [
  {
    title: "O que é a IlhaFit",
    text:
      "A IlhaFit é uma plataforma pensada para aproximar pessoas, profissionais e estabelecimentos em um fluxo mais claro de descoberta, comparação e contato. O sistema organiza categorias, perfis, localização e informações essenciais para reduzir atrito na busca por serviços e espaços.",
  },
  {
    title: "Como a plataforma ajuda",
    text:
      "Na prática, a plataforma permite navegar por estabelecimentos, profissionais e mapa, aplicar filtros por categoria e visualizar detalhes relevantes antes do contato. O objetivo do produto é tornar a busca mais objetiva, com menos dispersão e mais contexto para decidir.",
  },
  {
    title: "Para quem o sistema foi desenhado",
    text:
      "A IlhaFit atende três frentes principais: usuários que procuram opções, profissionais que querem se apresentar com mais clareza e estabelecimentos que precisam expor serviços, imagens, categorias e localização de forma organizada.",
  },
  {
    title: "Direção do produto",
    text:
      "A base do sistema combina descoberta por categoria, navegação por mapa, exibição de perfis e gestão de conta. Conforme a operação evoluir, essa página pode ser refinada com a história institucional, dados da empresa, canais oficiais e informações comerciais definitivas.",
  },
];

const Sobre = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Box sx={{ maxWidth: 920, mx: "auto", mb: 4 }}>
        <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 900, letterSpacing: 1.1 }}>
          SOBRE A ILHAFIT
        </Typography>
        <Typography variant="h3" fontWeight={900} sx={{ mt: 1, mb: 1.5 }}>
          Uma plataforma para conectar busca, contexto e localização
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.85 }}>
          Este texto institucional foi estruturado a partir do funcionamento atual do sistema e pode ser ajustado depois com a comunicação oficial da marca.
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 920, mx: "auto", display: "grid", gap: 2.25 }}>
        {sections.map((section) => (
          <Paper
            key={section.title}
            elevation={0}
            sx={{
              p: { xs: 2.25, md: 3 },
              borderRadius: 2,
              border: "1px solid",
              borderColor: alpha(theme.palette.primary.main, isDark ? 0.18 : 0.12),
              bgcolor: alpha(theme.palette.background.paper, isDark ? 0.6 : 0.82),
            }}
          >
            <Typography variant="h6" fontWeight={800} sx={{ mb: 1 }}>
              {section.title}
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.9 }}>
              {section.text}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default Sobre;

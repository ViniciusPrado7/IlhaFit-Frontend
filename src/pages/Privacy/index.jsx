import { Alert, Box, Paper, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { politicaPrivacidadeSections } from "./privacyPolicySections";

const Privacidade = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  return (
    <Box sx={{ py: { xs: 4, md: 6 } }}>
      <Box sx={{ maxWidth: 960, mx: "auto", mb: 4 }}>
        <Typography variant="overline" sx={{ color: "primary.main", fontWeight: 900, letterSpacing: 1.1 }}>
          PRIVACIDADE
        </Typography>
        <Typography variant="h3" fontWeight={900} sx={{ mt: 1, mb: 1.5 }}>
          Politica de Privacidade da IlhaFit
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.85 }}>
          Esta versao foi estruturada para refletir os recursos atuais do sistema e os parametros gerais da LGPD no Brasil.
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 960, mx: "auto", mb: 3 }}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Antes da publicacao definitiva, revise este texto com os dados oficiais da operacao e com orientacao juridica adequada.
        </Alert>
      </Box>

      <Box sx={{ maxWidth: 960, mx: "auto", display: "grid", gap: 2.25 }}>
        {politicaPrivacidadeSections.map((section) => (
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
              {section.body}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default Privacidade;

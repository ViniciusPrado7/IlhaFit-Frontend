import { useMemo } from "react";
import {
  Box,
  Button,
  Container,
  IconButton,
  Typography,
} from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";
import { FaArrowUp, FaWhatsapp } from "react-icons/fa";
import { Link as RouterLink } from "react-router-dom";
import logo from "../../assets/logo.svg";

const solutionLinks = [
  { label: "Explorar estabelecimentos", to: "/estabelecimento" },
  { label: "Encontrar profissionais", to: "/profissional" },
  { label: "Navegar no mapa", to: "/mapa" },
];

const companyLinks = [
  { label: "Sobre nós", to: "/sobre" },
  { label: "Política de privacidade", to: "/politica-de-privacidade" },
];

const Footer = () => {
  const theme = useTheme();
  const isDark = theme.palette.mode === "dark";

  const year = useMemo(() => new Date().getFullYear(), []);
  const handleScrollTop = () => {
    const topAnchor = document.getElementById("app-top");

    if (topAnchor) {
      topAnchor.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
    document.documentElement.scrollTo({ top: 0, behavior: "smooth" });
    document.body.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Box
      component="footer"
      sx={{
        mt: 8,
        borderTop: "1px solid",
        borderColor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.14),
        bgcolor: isDark ? "#04111C" : "#ECFDF5",
        color: "text.primary",
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          maxWidth: "1680px",
          px: { xs: 2, sm: 3, md: 4, xl: 5 },
          py: { xs: 5, md: 6 },
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "1.1fr 0.9fr 0.9fr 1fr" },
            gap: { xs: 4, md: 3 },
          }}
        >
          <Box
            sx={{
              pr: { md: 3 },
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5, mb: 2 }}>
              <Box
                component="img"
                src={logo}
                alt="Logo IlhaFit"
                sx={{ width: 42, height: 42, borderRadius: 2 }}
              />
              <Box>
                <Typography variant="h6" fontWeight={800}>
                  IlhaFit
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Plataforma para descobrir serviços, espaços e profissionais.
                </Typography>
              </Box>
            </Box>

            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ maxWidth: 320, lineHeight: 1.8 }}
            >
              A IlhaFit organiza categorias, perfis e localização para tornar a busca por opções mais direta e com menos atrito para o usuário final.
            </Typography>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.75 }}>
              Nossas soluções
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.1 }}>
              {solutionLinks.map((link) => (
                <Button
                  key={link.to}
                  component={RouterLink}
                  to={link.to}
                  variant="text"
                  sx={{
                    justifyContent: "flex-start",
                    px: 0,
                    color: "text.secondary",
                    fontWeight: 500,
                    "&:hover": { color: "primary.main", bgcolor: "transparent" },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.75 }}>
              IlhaFit
            </Typography>
            <Box sx={{ display: "flex", flexDirection: "column", gap: 1.1 }}>
              {companyLinks.map((link) => (
                <Button
                  key={link.to}
                  component={RouterLink}
                  to={link.to}
                  variant="text"
                  sx={{
                    justifyContent: "flex-start",
                    px: 0,
                    color: "text.secondary",
                    fontWeight: 500,
                    "&:hover": { color: "primary.main", bgcolor: "transparent" },
                  }}
                >
                  {link.label}
                </Button>
              ))}
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" fontWeight={800} sx={{ mb: 1.75 }}>
              Contato direto
            </Typography>

            <Box
              sx={{
                border: "1px solid",
                borderColor: alpha(theme.palette.primary.main, isDark ? 0.2 : 0.14),
                bgcolor: alpha(theme.palette.background.paper, isDark ? 0.5 : 0.65),
                borderRadius: 3,
                p: 2.25,
              }}
            >
              <Button
                component="a"
                href="https://wa.me/5500000000000"
                target="_blank"
                rel="noreferrer"
                variant="contained"
                fullWidth
                startIcon={<FaWhatsapp size={14} />}
                sx={{
                  borderRadius: 2.5,
                  py: 1.2,
                  fontWeight: 700,
                  mb: 1.5,
                }}
              >
                Falar com especialista
              </Button>

              <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                Canal de contato ilustrativo para atendimento e orientação comercial. Ajuste depois para o número oficial do WhatsApp.
              </Typography>
            </Box>
          </Box>
        </Box>

        <Box
          sx={{
            mt: 4,
            pt: 2.5,
            borderTop: "1px solid",
            borderColor: alpha(theme.palette.primary.main, isDark ? 0.12 : 0.08),
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 2,
            flexWrap: "wrap",
          }}
        >
          <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 600 }}>
            {"\u00A9"} {year} IlhaFit. Todos os direitos reservados.
          </Typography>

          <IconButton
            aria-label="Voltar ao topo"
            onClick={handleScrollTop}
            sx={{
              width: 48,
              height: 48,
              borderRadius: 2.5,
              bgcolor: "primary.main",
              color: "#FFFFFF",
              boxShadow: isDark
                ? "0 10px 24px rgba(16, 185, 129, 0.28)"
                : "0 10px 24px rgba(16, 185, 129, 0.22)",
              "&:hover": {
                bgcolor: theme.palette.custom?.primaryHover || "primary.dark",
              },
            }}
          >
            <FaArrowUp size={16} />
          </IconButton>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer;

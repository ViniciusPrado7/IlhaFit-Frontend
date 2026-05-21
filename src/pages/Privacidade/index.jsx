import { Alert, Box, Paper, Typography } from "@mui/material";
import { alpha, useTheme } from "@mui/material/styles";

const sections = [
  {
    title: "1. Escopo desta política",
    body:
      "Esta Política de Privacidade descreve, de forma inicial, como a IlhaFit pode coletar, utilizar, armazenar e proteger dados pessoais de usuários, profissionais e estabelecimentos que utilizam a plataforma. O texto deve ser revisado e complementado com os dados oficiais da operação antes de uso definitivo em produção.",
  },
  {
    title: "2. Dados que podem ser tratados",
    body:
      "Conforme os fluxos atualmente presentes no sistema, a plataforma pode tratar dados cadastrais e de contato, como nome, email, telefone, senha, tipo de conta e informações de perfil. Para estabelecimentos e profissionais, também podem ser tratados dados de apresentação pública, como categorias, imagens, descrição operacional e localização.",
  },
  {
    title: "3. Finalidades de uso",
    body:
      "Os dados podem ser utilizados para criar e manter contas, autenticar acesso, exibir perfis, relacionar categorias, mostrar localização no mapa, viabilizar configurações de conta, melhorar a navegação, responder solicitações e manter a integridade básica da plataforma.",
  },
  {
    title: "4. Bases legais aplicáveis",
    body:
      "O tratamento pode ocorrer, conforme o caso concreto, com fundamento em execução de contrato ou de procedimentos preliminares relacionados ao uso da plataforma, cumprimento de obrigação legal ou regulatória, exercício regular de direitos, legítimo interesse e, quando aplicável, consentimento do titular.",
  },
  {
    title: "5. Compartilhamento de dados",
    body:
      "A IlhaFit pode compartilhar dados com provedores e operadores necessários ao funcionamento técnico da aplicação, hospedagem, autenticação, armazenamento, análise operacional e atendimento de obrigações legais. Dados exibidos em perfis públicos também podem ser visualizados por outros usuários da plataforma conforme a configuração e a natureza da conta.",
  },
  {
    title: "6. Retenção e eliminação",
    body:
      "Os dados devem ser mantidos apenas pelo tempo necessário para cumprir as finalidades informadas, atender obrigações legais, exercer direitos em processos administrativos, judiciais ou arbitrais e preservar evidências mínimas de segurança. Encerrada a necessidade, os dados devem ser eliminados, anonimizados ou mantidos somente nas hipóteses admitidas pela legislação.",
  },
  {
    title: "7. Direitos do titular",
    body:
      "Nos termos da LGPD, o titular pode solicitar confirmação da existência de tratamento, acesso aos dados, correção de dados incompletos ou desatualizados, anonimização, bloqueio ou eliminação quando cabível, portabilidade, informação sobre compartilhamentos e revogação do consentimento nos casos em que ele for a base legal aplicável.",
  },
  {
    title: "8. Segurança",
    body:
      "A operação deve adotar medidas técnicas e administrativas razoáveis para proteger dados pessoais contra acessos não autorizados, destruição, perda, alteração, comunicação ou difusão indevida, observada a natureza dos dados e os riscos envolvidos no tratamento.",
  },
  {
    title: "9. Contato para privacidade",
    body:
      "O canal de contato para solicitações relacionadas a dados pessoais deve ser informado de forma clara pela operação. Até a definição oficial, esta página pode ser ajustada para incluir o email institucional, o nome do encarregado e o fluxo de atendimento aplicável.",
  },
];

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
          Política de Privacidade da IlhaFit
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.85 }}>
          Esta versão foi estruturada para refletir os recursos atuais do sistema e os parâmetros gerais da LGPD no Brasil.
        </Typography>
      </Box>

      <Box sx={{ maxWidth: 960, mx: "auto", mb: 3 }}>
        <Alert severity="warning" sx={{ borderRadius: 2 }}>
          Antes da publicação definitiva, revise este texto com os dados oficiais da operação e com orientação jurídica adequada.
        </Alert>
      </Box>

      <Box sx={{ maxWidth: 960, mx: "auto", display: "grid", gap: 2.25 }}>
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
              {section.body}
            </Typography>
          </Paper>
        ))}
      </Box>
    </Box>
  );
};

export default Privacidade;

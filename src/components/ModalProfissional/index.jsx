import React from "react";
import { Box, Button, Chip, Dialog, DialogContent, Paper, Typography } from "@mui/material";
import { FaStar, FaWhatsapp } from "react-icons/fa";
import AvaliacoesPanel from "../AvaliacoesPanel";
import LimitedChipList from "../LimitedChipList";

const formatTelefone = (value) => {
  const digits = String(value || "").replace(/\D/g, "").slice(0, 11);
  if (digits.length <= 2) return digits;
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const fallbackImage = "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=1200&auto=format&fit=crop&q=60";

const getFoto = (profissional) => profissional?.fotoUrl || profissional?.Imagem || fallbackImage;
const getNome = (profissional) => profissional?.nome || "Profissional";

const getCategorias = (profissional) => {
  if (Array.isArray(profissional?.gradeAtividades) && profissional.gradeAtividades.length > 0) {
    return [...new Set(profissional.gradeAtividades.map((item) => item.categoriaNome).filter(Boolean))];
  }

  if (Array.isArray(profissional?.especialidades) && profissional.especialidades.length > 0) {
    return profissional.especialidades;
  }

  if (profissional?.especializacao) {
    return [profissional.especializacao];
  }

  return ["Profissional"];
};

const formatLabel = (value) => {
  if (!value) return "";

  return value
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
};

const tagSx = {
  bgcolor: "rgba(16,185,129,0.10)",
  color: "primary.main",
  fontWeight: 800,
  borderRadius: 1.5,
};

const periodoTagSx = {
  bgcolor: "background.paper",
  color: "primary.main",
  border: "1px solid",
  borderColor: "rgba(16,185,129,0.35)",
  fontWeight: 800,
  borderRadius: 1.5,
};

const ACTIVITIES_PAGE_SIZE = 5;

const ModalProfissional = ({ open, onClose, profissional }) => {
  if (!profissional) return null;

  const categorias = getCategorias(profissional);
  const atividades = profissional.gradeAtividades || [];
  const [visibleActivitiesCount, setVisibleActivitiesCount] = React.useState(ACTIVITIES_PAGE_SIZE);

  React.useEffect(() => {
    setVisibleActivitiesCount(ACTIVITIES_PAGE_SIZE);
  }, [profissional?.id]);

  const handleClose = (_, reason) => {
    if (reason === "backdropClick" || reason === "escapeKeyDown" || !reason) {
      onClose();
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="md"
      disableRestoreFocus
      PaperProps={{
        sx: {
          borderRadius: 2,
          overflow: "hidden",
          bgcolor: "background.paper",
          width: "100%",
          maxWidth: 980,
        },
      }}
    >
      <DialogContent
        sx={{
          p: 0,
          scrollbarWidth: "none",
          "&::-webkit-scrollbar": { display: "none" },
          msOverflowStyle: "none",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <Paper
          elevation={0}
          sx={{
            overflow: "hidden",
            borderRadius: 2,
            border: "1px solid",
            borderColor: "divider",
            bgcolor: "background.paper",
          }}
        >
          <Box sx={{ position: "relative", height: { xs: 230, md: 330 } }}>
            <Box
              component="img"
              src={getFoto(profissional)}
              alt={getNome(profissional)}
              sx={{ width: "100%", height: "100%", objectFit: "cover" }}
              onError={(e) => { e.currentTarget.src = fallbackImage; }}
            />
            <Box
              sx={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(to top, rgba(0,0,0,0.62), rgba(0,0,0,0.08) 60%)",
              }}
            />
            <Button
              onClick={onClose}
              type="button"
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                zIndex: 2,
                bgcolor: "background.paper",
                color: "text.primary",
                "&:hover": { bgcolor: "background.paper" },
              }}
            >
              Fechar
            </Button>
          </Box>

          <Box sx={{ p: { xs: 2.5, md: 4 } }}>
            <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap", mb: 1 }}>
              <Box>
                <Typography variant="h4" fontWeight={900} sx={{ color: "text.primary", mb: 0.75 }}>
                  {getNome(profissional)}
                </Typography>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
                  <FaStar color="#FBBF24" />
                  <Typography variant="body2" fontWeight={800}>
                    {profissional.avaliacao ?? 0} avaliação
                  </Typography>
                </Box>
              </Box>
              {profissional.telefone && (
                <Button
                  variant="contained"
                  startIcon={<FaWhatsapp />}
                  href={`https://wa.me/55${String(profissional.telefone).replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  sx={{ borderRadius: 2, alignSelf: "flex-start", fontWeight: 800 }}
                >
                  WhatsApp
                </Button>
              )}
            </Box>

            <Box sx={{ my: 2.5 }}>
              <LimitedChipList
                items={categorias}
                limit={5}
                chipSx={tagSx}
                title="Categorias do profissional"
                dialogLabel={`Categorias oferecidas por ${getNome(profissional)}`}
                buttonLabel="Ver mais"
              />
            </Box>

            <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
              Sobre
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
              {`${getNome(profissional)} atende a comunidade IlhaFit com foco em ${categorias.join(", ")}.`}
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
                Informações
              </Typography>
              <Box sx={{ display: "grid", gap: 1, color: "text.secondary", mb: 3 }}>
                <Typography variant="body2"><strong>Email:</strong> {profissional.email || "Não informado"}</Typography>
                <Typography variant="body2"><strong>Telefone:</strong> {profissional.telefone ? formatTelefone(profissional.telefone) : "Não informado"}</Typography>
                <Typography variant="body2"><strong>Região:</strong> {profissional.regiao || profissional.zona || "Não informado"}</Typography>
                <Typography variant="body2"><strong>Gênero:</strong> {formatLabel(profissional.sexo || profissional.genero) || "Não informado"}</Typography>
                <Typography variant="body2"><strong>CREF:</strong> {profissional.registroCref || "Não informado"}</Typography>
              </Box>

            </Box>

            <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
              Atividades oferecidas
            </Typography>
            <Box sx={{ display: "grid", gap: 1.5, mb: 3 }}>
              {atividades.slice(0, visibleActivitiesCount).map((grade, index) => (
                <Box
                  key={`${grade.categoriaNome}-${index}`}
                  sx={{
                    border: "1px solid",
                    borderColor: "divider",
                    borderRadius: 2,
                    p: 2.25,
                    display: "grid",
                    gap: 2,
                  }}
                >
                  <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, flexWrap: "wrap" }}>
                    <Typography variant="subtitle1" fontWeight={900} color="text.primary">
                      {grade.categoriaNome}
                    </Typography>
                    {grade.exclusivoMulheres && (
                      <Chip label="Exclusiva para mulheres" size="small" sx={tagSx} />
                    )}
                  </Box>

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", sm: "1fr 1fr" },
                      gap: 2,
                    }}
                  >
                    <Box>
                      <Typography variant="caption" fontWeight={900} color="text.secondary" sx={{ display: "block", mb: 1 }}>
                        Dias oferecidos
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {grade.diasSemana?.map((dia) => (
                          <Chip key={dia} label={formatLabel(dia)} size="small" sx={tagSx} />
                        ))}
                      </Box>
                    </Box>

                    <Box>
                      <Typography variant="caption" fontWeight={900} color="text.secondary" sx={{ display: "block", mb: 1 }}>
                        Períodos oferecidos
                      </Typography>
                      <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
                        {grade.periodos?.map((periodo) => (
                          <Chip key={periodo} label={formatLabel(periodo)} size="small" sx={periodoTagSx} />
                        ))}
                      </Box>
                    </Box>
                  </Box>
                </Box>
              ))}

              {atividades.length > visibleActivitiesCount && (
                <Button
                  variant="outlined"
                  onClick={() => setVisibleActivitiesCount((current) => current + ACTIVITIES_PAGE_SIZE)}
                  sx={{ justifySelf: "center", borderRadius: 2, fontWeight: 900, mt: 0.5 }}
                >
                  Ver mais atividades
                </Button>
              )}
            </Box>

            <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
              Avaliações
            </Typography>
            <AvaliacoesPanel targetType="profissional" targetId={profissional.id} />
          </Box>
        </Paper>
      </DialogContent>
    </Dialog>
  );
};

export default ModalProfissional;

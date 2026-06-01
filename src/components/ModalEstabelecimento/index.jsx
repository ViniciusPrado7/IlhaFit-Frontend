import { useEffect, useState } from "react";
import {
  Box,
  Button,
  Chip,
  IconButton,
  Paper,
  Typography,
} from "@mui/material";
import {
  FaChevronLeft,
  FaChevronRight,
  FaMapMarkerAlt,
  FaStar,
  FaWhatsapp,
} from "react-icons/fa";
import AvaliacoesPanel from "../AvaliacoesPanel";
import LimitedChipList from "../LimitedChipList";
import MapComponent from "../MapComponent";
import { calcularResumoAvaliacoes, formatarAvaliacao } from "../../utils/avaliacao";

const fallbackImage = "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1400&q=80";

const getFotos = (estabelecimento) => {
  if (Array.isArray(estabelecimento?.fotosUrl) && estabelecimento.fotosUrl.length > 0) {
    return estabelecimento.fotosUrl.slice(0, 6);
  }

  return [fallbackImage];
};

const getNome = (estabelecimento) => estabelecimento?.nomeFantasia || "Estabelecimento";

const getEndereco = (estabelecimento) => {
  const endereco = estabelecimento?.endereco;
  if (!endereco) return "Endereço não informado";

  return [
    endereco.rua,
    endereco.numero,
    endereco.bairro,
    endereco.cidade,
    endereco.estado,
  ].filter(Boolean).join(", ");
};

const getCategorias = (estabelecimento) => {
  if (Array.isArray(estabelecimento?.gradeAtividades) && estabelecimento.gradeAtividades.length > 0) {
    return [...new Set(estabelecimento.gradeAtividades.map((item) => item.categoriaNome).filter(Boolean))];
  }

  return ["Estabelecimento"];
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

export const ModalEstabelecimentoContent = ({ estabelecimento, onClose, closeLabel = "Voltar", onEstabelecimentoChange }) => {
  const categorias = getCategorias(estabelecimento);
  const fotos = getFotos(estabelecimento);
  const atividades = estabelecimento.gradeAtividades || [];
  const [fotoAtual, setFotoAtual] = useState(0);
  const [visibleActivitiesCount, setVisibleActivitiesCount] = useState(ACTIVITIES_PAGE_SIZE);
  const [resumoAvaliacoes, setResumoAvaliacoes] = useState(() => ({
    avaliacao: Number(estabelecimento?.avaliacao) || 0,
    totalAvaliacoes: Number(estabelecimento?.totalAvaliacoes) || 0,
  }));
  const [coords, setCoords] = useState({ 
    lat: estabelecimento.endereco?.latitude || null, 
    lng: estabelecimento.endereco?.longitude || null 
  });
  const temMultiplasFotos = fotos.length > 1;

  useEffect(() => {
    let cancelled = false;
    const initialLat = estabelecimento.endereco?.latitude || null;
    const initialLng = estabelecimento.endereco?.longitude || null;

    Promise.resolve().then(() => {
      if (cancelled) return;
      setFotoAtual(0);
      setCoords({ lat: initialLat, lng: initialLng });
      setVisibleActivitiesCount(ACTIVITIES_PAGE_SIZE);
      setResumoAvaliacoes({
        avaliacao: Number(estabelecimento?.avaliacao) || 0,
        totalAvaliacoes: Number(estabelecimento?.totalAvaliacoes) || 0,
      });
    });

    if (!initialLat || !initialLng) {
      const addr = estabelecimento.endereco;
      if (addr && (addr.rua || addr.cep)) {
        const query = `${addr.rua || ""}, ${addr.numero || ""}, ${addr.bairro || ""}, ${addr.cidade || ""}, ${addr.estado || ""}, Brasil`;
        fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`)
          .then(res => res.json())
          .then(data => {
            if (!cancelled && data && data.length > 0) {
              setCoords({
                lat: parseFloat(data[0].lat),
                lng: parseFloat(data[0].lon)
              });
            }
          })
          .catch(err => console.warn("Erro ao geocodificar no modal:", err));
      }
    }

    return () => {
      cancelled = true;
    };
  }, [estabelecimento?.id, estabelecimento?.endereco]);

  const handleAvaliacoesChange = (avaliacoes) => {
    const resumo = calcularResumoAvaliacoes(avaliacoes, estabelecimento);
    setResumoAvaliacoes(resumo);
    onEstabelecimentoChange?.({
      ...estabelecimento,
      ...resumo,
    });
  };

  const irParaFoto = (index) => {
    setFotoAtual(index);
  };

  const irParaAnterior = () => {
    setFotoAtual((prev) => (prev === 0 ? fotos.length - 1 : prev - 1));
  };

  const irParaProxima = () => {
    setFotoAtual((prev) => (prev === fotos.length - 1 ? 0 : prev + 1));
  };

  return (
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
          src={fotos[fotoAtual]}
          alt={`${getNome(estabelecimento)} - imagem ${fotoAtual + 1}`}
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

        {temMultiplasFotos && (
          <>
            <IconButton
              onClick={irParaAnterior}
              sx={{
                position: "absolute",
                left: 16,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "rgba(15, 23, 42, 0.55)",
                color: "white",
                "&:hover": { bgcolor: "rgba(15, 23, 42, 0.72)" },
              }}
            >
              <FaChevronLeft size={16} />
            </IconButton>

            <IconButton
              onClick={irParaProxima}
              sx={{
                position: "absolute",
                right: 16,
                top: "50%",
                transform: "translateY(-50%)",
                bgcolor: "rgba(15, 23, 42, 0.55)",
                color: "white",
                "&:hover": { bgcolor: "rgba(15, 23, 42, 0.72)" },
              }}
            >
              <FaChevronRight size={16} />
            </IconButton>

            <Box
              sx={{
                position: "absolute",
                left: "50%",
                bottom: 16,
                transform: "translateX(-50%)",
                display: "flex",
                gap: 1,
                px: 1.25,
                py: 0.75,
                borderRadius: 999,
                bgcolor: "rgba(15, 23, 42, 0.45)",
                backdropFilter: "blur(6px)",
              }}
            >
              {fotos.map((_, index) => (
                <Box
                  key={`foto-indicador-${index}`}
                  onClick={() => irParaFoto(index)}
                  sx={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    bgcolor: index === fotoAtual ? "white" : "rgba(255,255,255,0.45)",
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                    transform: index === fotoAtual ? "scale(1.1)" : "scale(1)",
                  }}
                />
              ))}
            </Box>
          </>
        )}

        <Button
          onClick={onClose}
          sx={{
            position: "absolute",
            top: 16,
            right: temMultiplasFotos ? 64 : 16,
            bgcolor: "background.paper",
            color: "text.primary",
            "&:hover": { bgcolor: "background.paper" },
          }}
        >
          {closeLabel}
        </Button>
      </Box>

      <Box sx={{ p: { xs: 2.5, md: 4 } }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", gap: 2, flexWrap: "wrap", mb: 1 }}>
          <Box>
            <Typography variant="h4" fontWeight={900} sx={{ color: "text.primary", mb: 0.75 }}>
              {getNome(estabelecimento)}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1, color: "text.secondary" }}>
              <FaStar color="#FBBF24" />
              <Typography variant="body2" fontWeight={800}>
                {formatarAvaliacao(resumoAvaliacoes.avaliacao)} Estrelas
              </Typography>
            </Box>
          </Box>
          {estabelecimento.telefone && (
            <Button
              variant="contained"
              startIcon={<FaWhatsapp />}
              href={`https://wa.me/55${estabelecimento.telefone}`}
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
            title="Categorias do estabelecimento"
            dialogLabel={`Categorias oferecidas por ${getNome(estabelecimento)}`}
            buttonLabel="Ver mais"
          />
        </Box>

        <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
          Sobre
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.8, mb: 3 }}>
          {getNome(estabelecimento)} oferece atividades de {categorias.join(", ")} para a comunidade IlhaFit.
        </Typography>

        <Typography variant="h6" fontWeight={900} sx={{ mb: 1 }}>
          Localização
        </Typography>
        <Box sx={{ display: "flex", gap: 1, color: "text.secondary", mb: 2 }}>
          <FaMapMarkerAlt color="#EF4444" />
          <Typography variant="body2">{getEndereco(estabelecimento)}</Typography>
        </Box>
        <Box
          sx={{
            height: 250,
            borderRadius: 2,
            overflow: "hidden",
            border: "1px solid",
            borderColor: "divider",
            mb: 3,
          }}
        >
          {coords.lat && coords.lng ? (
            <MapComponent
              lat={coords.lat}
              lng={coords.lng}
              zoom={15}
              markers={[{
                id: estabelecimento.id,
                lat: coords.lat,
                lng: coords.lng,
                title: getNome(estabelecimento)
              }]}
              autoFit={false}
            />
          ) : (
            <Box
              sx={{
                height: "100%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "action.hover",
                color: "text.secondary",
              }}
            >
              <Typography variant="body2" fontWeight={700}>
                Coordenadas não disponíveis para este estabelecimento.
              </Typography>
            </Box>
          )}
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
              <Typography variant="subtitle1" fontWeight={900} color="text.primary">
                {grade.categoriaNome}
              </Typography>

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
        <AvaliacoesPanel
          targetType="estabelecimento"
          targetId={estabelecimento.id}
          onAvaliacoesChange={handleAvaliacoesChange}
        />
      </Box>
    </Paper>
  );
};

export default ModalEstabelecimentoContent;

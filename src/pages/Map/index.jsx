import { useState, useMemo, useEffect, useCallback, useRef } from "react";
import {
    Box,
    Typography,
    TextField,
    InputAdornment,
    Chip,
    Paper,
    Avatar,
    Rating,
    IconButton,
    Button,
    useTheme,
    useMediaQuery,
    CircularProgress,
    FormControl,
    InputLabel,
    Select,
    OutlinedInput,
    MenuItem,
    ListItemText as MuiListItemText,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import {
    FaSearch,
    FaMapMarkerAlt,
    FaPhone,
    FaClock,
    FaChevronRight,
    FaStar,
    FaTimes,
    FaLocationArrow,
    FaCheck,
} from "react-icons/fa";
import { toast } from "react-toastify";
import { estabelecimentoService } from "../../service";
import { useCatalog } from "../../contexts/CatalogContext";
import MapComponent from "../../components/MapComponent";
import ModalDetalhesEstabelecimento from "../../components/EstablishmentDetailsModal";
import { toTitleCase } from "../../utils/titleCase";

const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

const DEFAULT_ZOOM = 12;
const VISIBLE_CHIPS = 5;
const FALLBACK_COORDS = { lat: -27.5948, lng: -48.5482 };
const PERIOD_ORDER = ["MANHA", "TARDE", "NOITE"];

const formatDistance = (distance) =>
    Number.isFinite(distance) ? distance.toFixed(1) : null;

const formatPhone = (value) => {
    const digits = String(value || "").replace(/\D/g, "").slice(0, 11);

    if (!digits) return "Nao informado";
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) {
        return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    }

    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatPeriodLabel = (periodo) => {
    const labels = {
        MANHA: "Manha",
        TARDE: "Tarde",
        NOITE: "Noite",
    };

    return labels[periodo] || periodo;
};

const formatPeriods = (gradeAtividades = []) => {
    const uniquePeriods = Array.from(
        new Set(
            gradeAtividades.flatMap((item) =>
                Array.isArray(item?.periodos) ? item.periodos : []
            )
        )
    )
        .filter(Boolean)
        .sort((a, b) => PERIOD_ORDER.indexOf(a) - PERIOD_ORDER.indexOf(b));

    if (uniquePeriods.length === 0) return "Periodos nao informados";
    return uniquePeriods.map(formatPeriodLabel).join(" e ");
};

const Mapa = () => {
    const theme = useTheme();
    const isDark = theme.palette.mode === "dark";

    const isStacked = useMediaQuery(theme.breakpoints.down("lg"));

    const { estabelecimentos, loadingEstabelecimentos, ensureEstabelecimentos } = useCatalog();
    // Coordenadas obtidas via geocoding para estabelecimentos sem lat/lng cadastrados.
    const [geocodedCoords, setGeocodedCoords] = useState({});
    const [selectedId, setSelectedId] = useState(null);
    const [search, setSearch] = useState("");
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [minRating, setMinRating] = useState(0);
    const [modalOpen, setModalOpen] = useState(false);
    const [estabelecimentoParaModal, setEstabelecimentoParaModal] = useState(null);
    const [userLocation, setUserLocation] = useState(null);
    const [locationStatus, setLocationStatus] = useState("pending");
    const [locationError, setLocationError] = useState("");
    const locationToastIdRef = useRef(null);

    const requestUserLocation = useCallback(() => {
        if (!navigator.geolocation) {
            setLocationStatus("unsupported");
            setLocationError("Seu navegador não suporta geolocalização.");
            return;
        }

        setLocationStatus("requesting");
        setLocationError("");

        navigator.geolocation.getCurrentPosition(
            ({ coords }) => {
                setUserLocation({
                    lat: coords.latitude,
                    lng: coords.longitude,
                });
                setLocationStatus("granted");
            },
            (error) => {
                if (error.code === error.PERMISSION_DENIED) {
                    setLocationStatus("denied");
                    setLocationError(
                        "Ative a localização do navegador/computador para ver os locais mais próximos de você."
                    );
                    return;
                }

                setLocationStatus("error");
                setLocationError(
                    "Não foi possível obter sua localização agora. Tente ativar a localização do dispositivo e recarregar a página."
                );
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    }, []);

    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect -- dispara a API assincrona de geolocalizacao do navegador, nao deriva estado de props/state
        requestUserLocation();
    }, [requestUserLocation]);

    useEffect(() => {
        const shouldShowToast =
            locationStatus === "requesting" ||
            locationStatus === "pending" ||
            locationStatus === "unsupported" ||
            locationStatus === "denied" ||
            locationStatus === "error";

        if (!shouldShowToast) {
            if (locationToastIdRef.current) {
                toast.dismiss(locationToastIdRef.current);
                locationToastIdRef.current = null;
            }
            return;
        }

        const messageByStatus = {
            requesting:
                "Permita o acesso à localização no navegador para exibirmos os locais próximos de você.",
            pending:
                "Ao abrir o mapa, o sistema pode pedir acess    // Mobile e tablet empilham (mapa em cima, lista embaixo); so desktop (>=lg) fica lado a lado.
    // Precisa bater com o breakpoint que da altura explicita ao container (abaixo).o à sua localização para mostrar opções próximas.",
            unsupported: locationError,
            denied: locationError,
            error: locationError,
        };

        const toastContent = (
            <Box
                sx={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: 1.5,
                    minWidth: 0,
                }}
            >
                <Box
                    sx={{
                        width: 40,
                        height: 40,
                        borderRadius: "50%",
                        flexShrink: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        bgcolor: alpha(theme.palette.primary.main, 0.12),
                        color: "primary.main",
                    }}
                >
                    <FaLocationArrow size={16} />
                </Box>

                <Box sx={{ display: "flex", flexDirection: "column", gap: 1.25, minWidth: 0 }}>
                    <Box sx={{ display: "flex", flexDirection: "column", gap: 0.35 }}>
                        <Typography
                            variant="body2"
                            fontWeight={800}
                            sx={{ color: "text.primary", lineHeight: 1.2 }}
                        >
                            Localização necessária
                        </Typography>
                        <Typography
                            variant="body2"
                            sx={{ color: "text.secondary", lineHeight: 1.45 }}
                        >
                            {messageByStatus[locationStatus]}
                        </Typography>
                    </Box>

                    <Button
                        size="small"
                        variant="contained"
                        onClick={() => {
                            requestUserLocation();
                            if (locationToastIdRef.current) {
                                toast.dismiss(locationToastIdRef.current);
                                locationToastIdRef.current = null;
                            }
                        }}
                        startIcon={<FaLocationArrow />}
                        sx={{
                            alignSelf: "flex-start",
                            minHeight: 36,
                            px: 1.75,
                            borderRadius: 999,
                            textTransform: "none",
                            fontWeight: 800,
                            boxShadow: `0 8px 18px ${alpha(theme.palette.primary.main, 0.28)}`,
                            "&:hover": {
                                boxShadow: `0 10px 22px ${alpha(theme.palette.primary.main, 0.34)}`,
                            },
                        }}
                    >
                        {userLocation ? "Atualizar localização" : "Ativar localização"}
                    </Button>
                </Box>
            </Box>
        );

        if (locationToastIdRef.current && toast.isActive(locationToastIdRef.current)) {
            toast.update(locationToastIdRef.current, {
                render: toastContent,
                autoClose: false,
                closeOnClick: false,
                style: {
                    width: 460,
                    borderRadius: 18,
                    padding: "14px 16px",
                    background: theme.palette.background.paper,
                    color: theme.palette.text.primary,
                    border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                    boxShadow: "0 18px 40px rgba(15, 23, 42, 0.16)",
                },
            });
            return;
        }

        locationToastIdRef.current = toast.info(toastContent, {
            autoClose: false,
            closeOnClick: false,
            draggable: false,
            icon: false,
            style: {
                width: 460,
                borderRadius: 18,
                padding: "14px 16px",
                background: theme.palette.background.paper,
                color: theme.palette.text.primary,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.12)}`,
                boxShadow: "0 18px 40px rgba(15, 23, 42, 0.16)",
            },
        });
    }, [locationStatus, locationError, requestUserLocation, theme, userLocation]);

    useEffect(() => {
        ensureEstabelecimentos();
    }, [ensureEstabelecimentos]);

    const dbEstablishments = useMemo(
        () =>
            estabelecimentos.map((est) => {
                const override = geocodedCoords[est.id];
                const lat = override?.lat ?? est.endereco?.latitude ?? null;
                const lng = override?.lng ?? est.endereco?.longitude ?? null;
                const gradeAtividades = est.gradeAtividades || [];
                const atividades = gradeAtividades.map((g) => g.categoriaNome).filter(Boolean);
                const atividadesTC = atividades.map(toTitleCase);

                return {
                    id: est.id,
                    nome: toTitleCase(est.nomeFantasia || est.nome),
                    categoria: atividadesTC[0] || "Outros",
                    lat,
                    lng,
                    avaliacao: est.avaliacao || 0,
                    imagem:
                        est.fotosUrl?.[0] ||
                        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=60",
                    telefone: est.telefone,
                    aberto: true,
                    atividades: atividadesTC,
                    periodosLabel: formatPeriods(gradeAtividades),
                    bairro: est.endereco?.bairro || "",
                };
            }),
        [estabelecimentos, geocodedCoords]
    );

    // Geocoding roda em segundo plano, um estabelecimento por vez (rate limit do Nominatim),
    // so para quem ainda nao tem lat/lng cadastrados nem geocodificados nesta sessao.
    useEffect(() => {
        let cancelled = false;

        const pendentes = estabelecimentos.filter((est) => {
            const temCoordOriginal = Number.isFinite(est.endereco?.latitude) && Number.isFinite(est.endereco?.longitude);
            return !temCoordOriginal && !geocodedCoords[est.id] && est.endereco;
        });

        if (pendentes.length === 0) {
            return undefined;
        }

        const geocodeProximo = async () => {
            const est = pendentes[0];
            const addr = est.endereco;
            const query = `${addr.rua || ""}, ${addr.numero || ""}, ${addr.bairro || ""}, ${addr.cidade || ""}, ${addr.estado || ""}, Brasil`;

            try {
                const geoRes = await fetch(
                    `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
                );
                const geoData = await geoRes.json();

                if (!cancelled && geoData && geoData.length > 0) {
                    const lat = parseFloat(geoData[0].lat);
                    const lng = parseFloat(geoData[0].lon);
                    setGeocodedCoords((prev) => ({ ...prev, [est.id]: { lat, lng } }));
                }

                await new Promise((resolve) => setTimeout(resolve, 1000));
            } catch {
                console.warn("Falha ao geocodificar estabelecimento:", est.nomeFantasia || est.nome);
                if (!cancelled) {
                    setGeocodedCoords((prev) => ({ ...prev, [est.id]: { lat: null, lng: null } }));
                }
            }
        };

        geocodeProximo();
        return () => { cancelled = true; };
    }, [estabelecimentos, geocodedCoords]);

    const referenceLocation = userLocation || FALLBACK_COORDS;

    const establishmentsWithDistance = useMemo(
        () =>
            dbEstablishments
                .map((item) => {
                    const hasCoords =
                        Number.isFinite(item.lat) && Number.isFinite(item.lng);
                    const distance = hasCoords
                        ? haversineDistance(
                            referenceLocation.lat,
                            referenceLocation.lng,
                            item.lat,
                            item.lng
                        )
                        : null;

                    return {
                        ...item,
                        distanciaNumerica: distance,
                        distancia: formatDistance(distance),
                    };
                })
                .sort((a, b) => {
                    if (a.distanciaNumerica === null) return 1;
                    if (b.distanciaNumerica === null) return -1;
                    return a.distanciaNumerica - b.distanciaNumerica;
                }),
        [dbEstablishments, referenceLocation]
    );

    const allCategories = useMemo(() => {
        const set = new Set();
        establishmentsWithDistance.forEach((e) =>
            e.atividades.forEach((a) => set.add(a))
        );
        return Array.from(set).sort();
    }, [establishmentsWithDistance]);

    const toggleCategory = (cat) => {
        setSelectedCategories((prev) =>
            prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
        );
    };

    const clearFilters = () => {
        setSearch("");
        setSelectedCategories([]);
        setMinRating(0);
    };

    const filteredEstablishments = useMemo(() => {
        return establishmentsWithDistance.filter((e) => {
            const searchLower = search.toLowerCase();
            const matchesSearch =
                e.nome.toLowerCase().includes(searchLower) ||
                e.bairro.toLowerCase().includes(searchLower) ||
                e.atividades.some((a) => a.toLowerCase().includes(searchLower));
            const matchesCategory =
                selectedCategories.length === 0 ||
                e.atividades.some((a) => selectedCategories.includes(a));
            const matchesRating = e.avaliacao >= minRating;

            return matchesSearch && matchesCategory && matchesRating;
        });
    }, [search, selectedCategories, minRating, establishmentsWithDistance]);

    const selectedEstablishment =
        filteredEstablishments.find((e) => e.id === selectedId) ||
        establishmentsWithDistance.find((e) => e.id === selectedId);

    const chipSx = (active) => ({
        borderRadius: 2.5,
        fontWeight: 600,
        transition: "all 0.2s ease",
        bgcolor: active ? theme.palette.primary.main : "background.paper",
        color: active ? "white" : "text.primary",
        border: "1px solid",
        borderColor: active ? theme.palette.primary.main : "divider",
        cursor: "pointer",
        "&:hover": {
            bgcolor: active
                ? theme.palette.primary.dark
                : alpha(theme.palette.primary.main, 0.1),
        },
        boxShadow: active
            ? `0 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`
            : "none",
    });

    return (
        <Box
            sx={{
                p: 2,
                minHeight: "calc(100vh - 80px)",
                height: { xs: "auto", lg: "calc(100vh - 64px)" },
                display: "flex",
                flexDirection: "column",
                gap: 1.5,
                bgcolor: "background.default",
            }}
        >
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
                <Box
                    sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: 2,
                        flexWrap: "wrap",
                    }}
                >
                    <Box>
                        <Typography
                            variant="h4"
                            fontWeight={700}
                            sx={{ color: "text.primary" }}
                        >
                            Mapa de Academias
                        </Typography>
                        <Typography color="text.secondary">
                            Encontre os melhores lugares para treinar perto de voce
                        </Typography>
                    </Box>
                    <Button
                        variant="outlined"
                        onClick={clearFilters}
                        startIcon={<FaTimes />}
                        sx={{
                            borderRadius: 3,
                            textTransform: "none",
                            fontWeight: 700,
                            borderColor: theme.palette.primary.main,
                            color: theme.palette.primary.main,
                            "&:hover": {
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                borderColor: theme.palette.primary.dark,
                            },
                        }}
                    >
                        Limpar Filtros
                    </Button>
                </Box>

                <Box
                    sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 2.5,
                        flexWrap: "wrap",
                    }}
                >
                    <TextField
                        placeholder="Buscar por nome, bairro ou atividade..."
                        size="small"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <FaSearch color={theme.palette.primary.main} />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            flex: "1 1 240px",
                            minWidth: 0,
                            maxWidth: { xs: "100%", sm: 360 },
                            "& .MuiOutlinedInput-root": {
                                borderRadius: 3,
                                bgcolor: "background.paper",
                            },
                        }}
                    />

                    <Box
                        sx={{
                            display: "flex",
                            gap: 1,
                            overflowX: "auto",
                            pb: 0.5,
                            flexWrap: "wrap",
                        }}
                    >
                        {allCategories.length > VISIBLE_CHIPS ? (
                            <FormControl sx={{ flex: "1 1 200px", minWidth: 0, maxWidth: 260 }} size="small">
                                {selectedCategories.length === 0 && (
                                    <InputLabel id="categoria-select-label">
                                        Categorias
                                    </InputLabel>
                                )}
                                <Select
                                    labelId="categoria-select-label"
                                    multiple
                                    value={selectedCategories}
                                    onChange={(e) => setSelectedCategories(e.target.value)}
                                    input={
                                        <OutlinedInput
                                            label={
                                                selectedCategories.length === 0
                                                    ? "Categorias"
                                                    : ""
                                            }
                                        />
                                    }
                                    renderValue={(selected) => {
                                        if (selected.length === 0) {
                                            return (
                                                <Typography
                                                    color="text.secondary"
                                                    variant="body2"
                                                >
                                                    Todas as Categorias
                                                </Typography>
                                            );
                                        }

                                        if (selected.length > 2) {
                                            return (
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        gap: 0.5,
                                                    }}
                                                >
                                                    <Typography
                                                        variant="body2"
                                                        fontWeight={600}
                                                    >
                                                        {selected.slice(0, 2).join(", ")}
                                                    </Typography>
                                                    <Chip
                                                        label={`+${selected.length - 2}`}
                                                        size="small"
                                                        sx={{
                                                            height: 20,
                                                            fontSize: "0.65rem",
                                                            bgcolor: alpha(
                                                                theme.palette.primary.main,
                                                                0.1
                                                            ),
                                                            color: "primary.main",
                                                            fontWeight: 700,
                                                        }}
                                                    />
                                                </Box>
                                            );
                                        }

                                        return (
                                            <Typography
                                                variant="body2"
                                                fontWeight={600}
                                            >
                                                {selected.join(", ")}
                                            </Typography>
                                        );
                                    }}
                                    sx={{
                                        borderRadius: 3,
                                        minWidth: { xs: "100%", sm: 260 },
                                        bgcolor: "background.paper",
                                        "& .MuiSelect-select": {
                                            display: "flex",
                                            alignItems: "center",
                                            py: 1,
                                        },
                                    }}
                                    MenuProps={{
                                        PaperProps: {
                                            sx: {
                                                maxHeight: 224,
                                                overflowY: "auto",
                                                "&::-webkit-scrollbar": {
                                                    display: "none",
                                                },
                                                msOverflowStyle: "none",
                                                scrollbarWidth: "none",
                                            }
                                        }
                                    }}
                                >
                                    {allCategories.map((cat) => (
                                        <MenuItem
                                            key={cat}
                                            value={cat}
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                justifyContent: "space-between",
                                                gap: 1,
                                            }}
                                        >
                                            <MuiListItemText primary={cat} />
                                            <Box
                                                component="span"
                                                sx={{
                                                    display: "inline-flex",
                                                    alignItems: "center",
                                                    justifyContent: "center",
                                                    color: "primary.main",
                                                    opacity: selectedCategories.includes(cat) ? 1 : 0,
                                                    transform: selectedCategories.includes(cat)
                                                        ? "scale(1)"
                                                        : "scale(0.7)",
                                                    transition: "all 0.18s ease",
                                                }}
                                            >
                                                <FaCheck size={13} />
                                            </Box>
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                        ) : (
                            <>
                                <Chip
                                    label="Todos"
                                    onClick={() => setSelectedCategories([])}
                                    sx={chipSx(selectedCategories.length === 0)}
                                />
                                {allCategories.map((cat) => (
                                    <Chip
                                        key={cat}
                                        label={cat}
                                        onClick={() => toggleCategory(cat)}
                                        sx={chipSx(selectedCategories.includes(cat))}
                                    />
                                ))}
                            </>
                        )}
                    </Box>

                    <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                        {[1, 2, 3, 4, 5].map((star) => (
                            <IconButton
                                key={star}
                                size="small"
                                onClick={() => setMinRating(star === minRating ? 0 : star)}
                                sx={{
                                    p: 0.5,
                                    color: star <= minRating ? "#FBBF24" : "#E5E7EB",
                                    transition: "all 0.2s",
                                    "&:hover": { transform: "scale(1.2)" },
                                }}
                            >
                                <FaStar size={18} />
                            </IconButton>
                        ))}
                    </Box>
                </Box>

            </Box>

            <Box
                    sx={{
                        display: "flex",
                        gap: 3,
                        flex: 1,
                        minHeight: 0,
                        flexDirection: isStacked ? "column" : "row",
                        alignItems: "stretch",
                    }}
                >
                    <Box
                        sx={{
                            flex: isStacked ? "1 1 auto" : "1.2 1 0%",
                            bgcolor: "background.paper",
                            borderRadius: 6,
                            overflow: "hidden",
                            position: "relative",
                            border: "1px solid",
                            borderColor: "divider",
                            boxShadow: "inset 0 2px 10px rgba(0,0,0,0.05)",
                            minHeight: isStacked ? 360 : 0,
                            height: isStacked ? "clamp(360px, 55vh, 560px)" : "100%",
                            flexShrink: 0,
                        }}
                    >
                        <MapComponent
                            lat={referenceLocation.lat}
                            lng={referenceLocation.lng}
                            zoom={DEFAULT_ZOOM}
                            autoFit={!userLocation}
                            markers={filteredEstablishments.map((e) => ({
                                id: e.id,
                                lat: e.lat,
                                lng: e.lng,
                                title: e.nome,
                            }))}
                            onMarkerClick={(id) => setSelectedId(id)}
                            selectedId={selectedId}
                            userLocation={userLocation}
                        />
                        {loadingEstabelecimentos && (
                            <Box
                                sx={{
                                    position: "absolute",
                                    top: 10,
                                    left: "50%",
                                    transform: "translateX(-50%)",
                                    zIndex: 1000,
                                    display: "flex",
                                    alignItems: "center",
                                    gap: 1,
                                    bgcolor: "background.paper",
                                    borderRadius: 99,
                                    px: 2,
                                    py: 0.75,
                                    boxShadow: 3,
                                    border: "1px solid",
                                    borderColor: "divider",
                                    pointerEvents: "none",
                                }}
                            >
                                <CircularProgress size={14} color="primary" />
                                <Typography variant="caption" fontWeight={600}>
                                    Carregando estabelecimentos…
                                </Typography>
                            </Box>
                        )}
                    </Box>

                    <Box
                        sx={{
                            width: isStacked ? "100%" : "clamp(360px, 30vw, 520px)",
                            display: "flex",
                            flexDirection: "column",
                            gap: 1.5,
                            height: isStacked ? "auto" : "100%",
                            minHeight: 0,
                            p: { xs: 1.25, md: 1.5 },
                            borderRadius: 5,
                            bgcolor: isDark
                                ? alpha("#052E2B", 0.72)
                                : alpha("#DDF7EF", 0.92),
                            border: "1px solid",
                            borderColor: alpha(theme.palette.primary.main, isDark ? 0.22 : 0.16),
                            boxShadow: isDark
                                ? "0 22px 42px rgba(2, 12, 27, 0.34)"
                                : "0 20px 38px rgba(16, 185, 129, 0.14)",
                            backdropFilter: "blur(10px)",
                        }}
                    >
                        <Paper
                            elevation={4}
                            sx={{
                                p: 1.8,
                                borderRadius: 3.5,
                                minHeight: "auto",
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                transition: "all 0.3s ease",
                                bgcolor: alpha(theme.palette.background.paper, isDark ? 0.74 : 0.88),
                                backdropFilter: "blur(10px)",
                                border: "1px solid",
                                borderColor: alpha(theme.palette.primary.main, 0.12),
                                opacity: selectedId ? 1 : 0.8,
                                flexShrink: 0,
                            }}
                        >
                            {selectedEstablishment ? (
                                <>
                                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 1, mb: 1 }}>
                                        <Box sx={{ display: "flex", gap: 1.25 }}>
                                            <Avatar
                                                src={selectedEstablishment.imagem}
                                                variant="rounded"
                                                sx={{
                                                    width: 56,
                                                    height: 56,
                                                    borderRadius: 2,
                                                }}
                                            />
                                            <Box>
                                                <Typography variant="subtitle1" fontWeight={800} sx={{ lineHeight: 1.2 }}>
                                                    {selectedEstablishment.nome}
                                                </Typography>
                                                <Box
                                                    sx={{
                                                        display: "flex",
                                                        alignItems: "center",
                                                        mt: 0.25,
                                                    }}
                                                >
                                                    <Rating
                                                        value={selectedEstablishment.avaliacao}
                                                        readOnly
                                                        size="small"
                                                        precision={0.1}
                                                    />
                                                    <Typography
                                                        variant="caption"
                                                        sx={{ ml: 0.5, fontWeight: 600 }}
                                                    >
                                                        {selectedEstablishment.avaliacao}
                                                    </Typography>
                                                </Box>
                                            </Box>
                                        </Box>
                                        <IconButton
                                            size="small"
                                            onClick={() => setSelectedId(null)}
                                            sx={{ mt: -0.5, mr: -0.5 }}
                                        >
                                            <FaTimes size={13} />
                                        </IconButton>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 0.65,
                                            mb: 1,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                color: "text.secondary",
                                            }}
                                        >
                                            <FaMapMarkerAlt
                                                size={12}
                                                color={theme.palette.primary.main}
                                            />
                                            <Typography variant="caption">
                                                {selectedEstablishment.distancia
                                                    ? `${selectedEstablishment.distancia}km de voce`
                                                    : "Distancia indisponivel"}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                color: "text.secondary",
                                            }}
                                        >
                                            <FaPhone
                                                size={12}
                                                color={theme.palette.primary.main}
                                            />
                                            <Typography variant="caption">
                                                {formatPhone(selectedEstablishment.telefone)}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1,
                                                color: "text.secondary",
                                            }}
                                        >
                                            <FaClock
                                                size={12}
                                                color={theme.palette.primary.main}
                                            />
                                            <Typography variant="caption">
                                                {selectedEstablishment.periodosLabel}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Button
                                        fullWidth
                                        variant="contained"
                                        size="small"
                                        onClick={async () => {
                                            try {
                                                const fullData =
                                                    await estabelecimentoService.getById(
                                                        selectedId
                                                    );
                                                setEstabelecimentoParaModal(fullData);
                                                setModalOpen(true);
                                            } catch (err) {
                                                console.error(
                                                    "Erro ao buscar detalhes:",
                                                    err
                                                );
                                            }
                                        }}
                                        sx={{
                                            py: 0.95,
                                            borderRadius: 1.5,
                                            fontWeight: 700,
                                            fontSize: "0.88rem",
                                            textTransform: "none",
                                            bgcolor: "primary.main",
                                            boxShadow: `0 4px 12px ${alpha(
                                                theme.palette.primary.main,
                                                0.4
                                            )}`,
                                            "&:hover": {
                                                bgcolor: "primary.dark",
                                                transform: "translateY(-2px)",
                                                boxShadow: `0 6px 16px ${alpha(
                                                    theme.palette.primary.main,
                                                    0.5
                                                )}`,
                                            },
                                        }}
                                    >
                                        Ver Perfil Completo
                                    </Button>
                                </>
                            ) : (
                                <Box
                                    sx={{
                                        display: "flex",
                                        alignItems: "center",
                                        gap: 1.5,
                                        py: 0.25,
                                    }}
                                >
                                    <FaMapMarkerAlt
                                        size={18}
                                        color={theme.palette.primary.main}
                                        style={{ opacity: 0.6, flexShrink: 0 }}
                                    />
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        sx={{ fontSize: "0.8rem", lineHeight: 1.3 }}
                                    >
                                        Selecione um local no mapa para ver detalhes.
                                    </Typography>
                                </Box>
                            )}
                        </Paper>

                        <Box
                            sx={{
                                flex: "1 1 0%",
                                display: "flex",
                                flexDirection: "column",
                                minHeight: 0,
                                overflow: "hidden",
                            }}
                        >
                            <Typography variant="subtitle1" fontWeight={700} mb={2}>
                                Resultados ({filteredEstablishments.length})
                            </Typography>
                            <Box
                                sx={{
                                    overflowY: "auto",
                                    display: "flex",
                                    flexDirection: "column",
                                    gap: 1.75,
                                    pr: 1,
                                    flex: 1,
                                    minHeight: 0,
                                }}
                            >
                                {filteredEstablishments.map((est) => (
                                    <Box
                                        key={est.id}
                                        onClick={() => setSelectedId(est.id)}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.2,
                                            p: 1.2,
                                            borderRadius: 2,
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                            border: "1px solid",
                                            borderColor:
                                                selectedId === est.id
                                                    ? alpha(
                                                        theme.palette.primary.main,
                                                        0.3
                                                    )
                                                    : theme.palette.divider,
                                            bgcolor:
                                                selectedId === est.id
                                                    ? alpha(
                                                        theme.palette.primary.main,
                                                        0.1
                                                    )
                                                    : theme.palette.background.paper,
                                            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.02)",
                                            "&:hover": {
                                                bgcolor: alpha(
                                                    theme.palette.primary.main,
                                                    0.04
                                                ),
                                                borderColor: alpha(
                                                    theme.palette.primary.main,
                                                    0.15
                                                ),
                                                transform: "translateY(-1px)",
                                                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.04)",
                                            },
                                        }}
                                    >
                                        <Avatar
                                            src={est.imagem}
                                            variant="rounded"
                                            sx={{
                                                width: 44,
                                                height: 44,
                                                borderRadius: 2,
                                            }}
                                        />
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography
                                                variant="body2"
                                                fontWeight={700}
                                                sx={{ fontSize: "0.88rem", lineHeight: 1.2 }}
                                            >
                                                {est.nome}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{ fontSize: "0.7rem" }}
                                            >
                                                {est.categoria}
                                                {est.bairro ? ` • ${est.bairro}` : ""}
                                                {est.distancia
                                                    ? ` • ${est.distancia}km`
                                                    : ""}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                                sx={{
                                                    display: "block",
                                                    mt: 0.18,
                                                    fontSize: "0.69rem",
                                                }}
                                            >
                                                {est.periodosLabel}
                                            </Typography>
                                        </Box>
                                        <FaChevronRight
                                            size={12}
                                            color={theme.palette.text.secondary}
                                        />
                                    </Box>
                                ))}

                                {loadingEstabelecimentos && (
                                    <Box sx={{ display: "flex", justifyContent: "center", pt: 4 }}>
                                        <CircularProgress size={24} color="primary" />
                                    </Box>
                                )}

                                {!loadingEstabelecimentos && filteredEstablishments.length === 0 && (
                                    <Box sx={{ p: 4, textAlign: "center" }}>
                                        <Typography
                                            variant="body2"
                                            color="text.secondary"
                                        >
                                            Nenhum resultado encontrado para os filtros
                                            selecionados.
                                        </Typography>
                                    </Box>
                                )}
                            </Box>
                        </Box>
                    </Box>
                </Box>

            <ModalDetalhesEstabelecimento
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                estabelecimento={estabelecimentoParaModal}
            />
        </Box>
    );
};

export default Mapa;

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
} from "react-icons/fa";
import { toast } from "react-toastify";
import { estabelecimentoService } from "../../services";
import MapComponent from "../../components/MapComponent";
import ModalDetalhesEstabelecimento from "../../components/ModalDetalhesEstabelecimento";

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

const formatDistance = (distance) =>
    Number.isFinite(distance) ? distance.toFixed(1) : null;

const Mapa = () => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down("md"));
    const isTablet = useMediaQuery(theme.breakpoints.down("lg"));

    const [loading, setLoading] = useState(true);
    const [dbEstablishments, setDbEstablishments] = useState([]);
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
            setLocationError("Seu navegador nao suporta geolocalizacao.");
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
                        "Ative a localizacao do navegador/computador para ver os locais mais proximos de voce."
                    );
                    return;
                }

                setLocationStatus("error");
                setLocationError(
                    "Nao foi possivel obter sua localizacao agora. Tente ativar a localizacao do dispositivo e recarregar a pagina."
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
                "Permita o acesso a localizacao no navegador para exibirmos os locais proximos de voce.",
            pending:
                "Ao abrir o mapa, o sistema pode pedir acesso a sua localizacao para mostrar opcoes proximas.",
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
                            Localizacao necessaria
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
                        {userLocation ? "Atualizar localizacao" : "Ativar localizacao"}
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
        const fetchAll = async () => {
            try {
                const data = await estabelecimentoService.getAll();

                const mapped = data.map((est) => {
                    const lat = est.endereco?.latitude ?? null;
                    const lng = est.endereco?.longitude ?? null;
                    const atividades = (est.gradeAtividades || [])
                        .map((g) => g.atividade)
                        .filter(Boolean);

                    return {
                        id: est.id,
                        nome: est.nomeFantasia || est.nome,
                        categoria: atividades[0] || "Outros",
                        lat,
                        lng,
                        avaliacao: est.avaliacao || 0,
                        imagem:
                            est.fotosUrl?.[0] ||
                            "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=500&auto=format&fit=crop&q=60",
                        telefone: est.telefone,
                        horario: "06:00 - 22:00",
                        aberto: true,
                        atividades,
                        bairro: est.endereco?.bairro || "",
                    };
                });

                setDbEstablishments(mapped);

                const withoutCoords = mapped.filter(
                    (e) => !Number.isFinite(e.lat) || !Number.isFinite(e.lng)
                );

                if (withoutCoords.length > 0) {
                    for (const est of withoutCoords) {
                        const original = data.find((d) => d.id === est.id);
                        if (!original?.endereco) continue;

                        const addr = original.endereco;
                        const query = `${addr.rua || ""}, ${addr.numero || ""}, ${addr.bairro || ""}, ${addr.cidade || ""}, ${addr.estado || ""}, Brasil`;

                        try {
                            const geoRes = await fetch(
                                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
                            );
                            const geoData = await geoRes.json();

                            if (geoData && geoData.length > 0) {
                                const lat = parseFloat(geoData[0].lat);
                                const lng = parseFloat(geoData[0].lon);

                                setDbEstablishments((prev) =>
                                    prev.map((p) =>
                                        p.id === est.id ? { ...p, lat, lng } : p
                                    )
                                );
                            }

                            await new Promise((resolve) => setTimeout(resolve, 1000));
                        } catch (error) {
                            console.warn(
                                "Falha ao geocodificar estabelecimento:",
                                est.nome
                            );
                        }
                    }
                }
            } catch (err) {
                console.error("Erro ao buscar dados do mapa:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchAll();
    }, []);

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
                p: 3,
                height: "calc(100vh - 80px)",
                display: "flex",
                flexDirection: "column",
                gap: 3,
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
                            minWidth: 300,
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
                            <FormControl sx={{ minWidth: 220 }} size="small">
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
                                        minWidth: 220,
                                        bgcolor: "background.paper",
                                        "& .MuiSelect-select": {
                                            display: "flex",
                                            alignItems: "center",
                                            py: 1,
                                        },
                                    }}
                                >
                                    {allCategories.map((cat) => (
                                        <MenuItem key={cat} value={cat}>
                                            <MuiListItemText primary={cat} />
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

            {loading ? (
                <Box
                    sx={{
                        display: "flex",
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                    }}
                >
                    <CircularProgress color="primary" />
                </Box>
            ) : (
                <Box
                    sx={{
                        display: "flex",
                        gap: 3,
                        flex: 1,
                        minHeight: 0,
                        flexDirection: isMobile ? "column" : "row",
                    }}
                >
                    <Box
                        sx={{
                            flex: 1,
                            bgcolor: "background.paper",
                            borderRadius: 6,
                            overflow: "hidden",
                            position: "relative",
                            border: "1px solid",
                            borderColor: "divider",
                            boxShadow: "inset 0 2px 10px rgba(0,0,0,0.05)",
                            height: isMobile ? 400 : "100%",
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
                    </Box>

                    <Box
                        sx={{
                            width: isMobile ? "100%" : isTablet ? 300 : 380,
                            display: "flex",
                            flexDirection: "column",
                            gap: 2.5,
                        }}
                    >
                        <Paper
                            elevation={4}
                            sx={{
                                p: 2.5,
                                borderRadius: 5,
                                minHeight: 200,
                                display: "flex",
                                flexDirection: "column",
                                justifyContent: "center",
                                transition: "all 0.3s ease",
                                bgcolor: alpha(theme.palette.background.paper, 0.8),
                                backdropFilter: "blur(10px)",
                                border: "1px solid",
                                borderColor: "divider",
                                opacity: selectedId ? 1 : 0.8,
                            }}
                        >
                            {selectedEstablishment ? (
                                <>
                                    <Box sx={{ display: "flex", gap: 2, mb: 2.5 }}>
                                        <Avatar
                                            src={selectedEstablishment.imagem}
                                            variant="rounded"
                                            sx={{
                                                width: 60,
                                                height: 60,
                                                borderRadius: 3,
                                            }}
                                        />
                                        <Box>
                                            <Typography variant="h6" fontWeight={700}>
                                                {selectedEstablishment.nome}
                                            </Typography>
                                            <Box
                                                sx={{
                                                    display: "flex",
                                                    alignItems: "center",
                                                    mt: 0.5,
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
                                                    sx={{ ml: 1, fontWeight: 600 }}
                                                >
                                                    {selectedEstablishment.avaliacao}
                                                </Typography>
                                            </Box>
                                        </Box>
                                    </Box>

                                    <Box
                                        sx={{
                                            display: "flex",
                                            flexDirection: "column",
                                            gap: 1.5,
                                            mb: 2.5,
                                        }}
                                    >
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1.5,
                                                color: "text.secondary",
                                            }}
                                        >
                                            <FaMapMarkerAlt
                                                color={theme.palette.primary.main}
                                            />
                                            <Typography variant="body2">
                                                {selectedEstablishment.distancia
                                                    ? `${selectedEstablishment.distancia}km de voce`
                                                    : "Distancia indisponivel"}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1.5,
                                                color: "text.secondary",
                                            }}
                                        >
                                            <FaPhone
                                                color={theme.palette.primary.main}
                                            />
                                            <Typography variant="body2">
                                                {selectedEstablishment.telefone ||
                                                    "Nao informado"}
                                            </Typography>
                                        </Box>
                                        <Box
                                            sx={{
                                                display: "flex",
                                                alignItems: "center",
                                                gap: 1.5,
                                                color: "text.secondary",
                                            }}
                                        >
                                            <FaClock
                                                color={theme.palette.primary.main}
                                            />
                                            <Typography variant="body2">
                                                {selectedEstablishment.horario}
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Button
                                        fullWidth
                                        variant="contained"
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
                                            py: 1.5,
                                            borderRadius: 3,
                                            fontWeight: 700,
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
                                        flexDirection: "column",
                                        alignItems: "center",
                                    }}
                                >
                                    <FaMapMarkerAlt
                                        size={40}
                                        color={theme.palette.primary.main}
                                        style={{ opacity: 0.5, marginBottom: 16 }}
                                    />
                                    <Typography
                                        variant="body2"
                                        color="text.secondary"
                                        textAlign="center"
                                    >
                                        Clique em um marcador no mapa para ver os
                                        detalhes do estabelecimento
                                    </Typography>
                                </Box>
                            )}
                        </Paper>

                        <Box
                            sx={{
                                flex: 1,
                                display: "flex",
                                flexDirection: "column",
                                minHeight: 0,
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
                                    gap: 1.5,
                                    pr: 1,
                                }}
                            >
                                {filteredEstablishments.map((est) => (
                                    <Box
                                        key={est.id}
                                        onClick={() => setSelectedId(est.id)}
                                        sx={{
                                            display: "flex",
                                            alignItems: "center",
                                            gap: 1.5,
                                            p: 1.5,
                                            borderRadius: 4,
                                            cursor: "pointer",
                                            transition: "all 0.2s",
                                            border: "1px solid",
                                            borderColor:
                                                selectedId === est.id
                                                    ? alpha(
                                                          theme.palette.primary.main,
                                                          0.3
                                                      )
                                                    : "transparent",
                                            bgcolor:
                                                selectedId === est.id
                                                    ? alpha(
                                                          theme.palette.primary.main,
                                                          0.1
                                                      )
                                                    : "transparent",
                                            "&:hover": {
                                                bgcolor: alpha(
                                                    theme.palette.primary.main,
                                                    0.05
                                                ),
                                            },
                                        }}
                                    >
                                        <Avatar
                                            src={est.imagem}
                                            variant="rounded"
                                            sx={{
                                                width: 48,
                                                height: 48,
                                                borderRadius: 2,
                                            }}
                                        />
                                        <Box sx={{ flexGrow: 1 }}>
                                            <Typography variant="body2" fontWeight={700}>
                                                {est.nome}
                                            </Typography>
                                            <Typography
                                                variant="caption"
                                                color="text.secondary"
                                            >
                                                {est.categoria}
                                                {est.bairro ? ` • ${est.bairro}` : ""}
                                                {est.distancia
                                                    ? ` • ${est.distancia}km`
                                                    : ""}
                                            </Typography>
                                        </Box>
                                        <FaChevronRight
                                            size={12}
                                            color={theme.palette.text.secondary}
                                        />
                                    </Box>
                                ))}

                                {filteredEstablishments.length === 0 && (
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
            )}

            <ModalDetalhesEstabelecimento
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                estabelecimento={estabelecimentoParaModal}
            />
        </Box>
    );
};

export default Mapa;

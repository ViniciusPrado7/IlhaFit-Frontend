import { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const BATCH_SIZE = 10;
const CLUSTER_CELL_PX = 60;

function computeClusters(markers, map) {
    if (markers.length === 0) return [];
    const zoom = map.getZoom();
    const cells = new Map();
    for (const marker of markers) {
        const pt = map.project([marker.lat, marker.lng], zoom);
        const key = `${Math.floor(pt.x / CLUSTER_CELL_PX)}:${Math.floor(pt.y / CLUSTER_CELL_PX)}`;
        if (!cells.has(key)) cells.set(key, { items: [], sumLat: 0, sumLng: 0 });
        const c = cells.get(key);
        c.items.push(marker);
        c.sumLat += marker.lat;
        c.sumLng += marker.lng;
    }
    return Array.from(cells.values()).map(c => ({
        count: c.items.length,
        lat: c.sumLat / c.items.length,
        lng: c.sumLng / c.items.length,
        items: c.items,
    }));
}

function clusterIcon(count) {
    const size = count < 10 ? 36 : count < 100 ? 44 : 52;
    const bg = count < 10 ? '#10B981' : count < 50 ? '#F59E0B' : '#EF4444';
    return L.divIcon({
        className: '',
        html: `<div style="width:${size}px;height:${size}px;background:${bg};border:3px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:${count < 100 ? 13 : 11}px;box-shadow:0 2px 10px rgba(0,0,0,0.3)">${count}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2],
    });
}

function pinIcon(isSelected) {
    const color = isSelected ? '#059669' : '#10B981';
    const size = isSelected ? 36 : 30;
    return L.divIcon({
        className: '',
        html: `<div style="position:relative;width:${size}px;height:${size}px;display:flex;align-items:center;justify-content:center"><svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" style="filter:drop-shadow(0 2px 4px rgba(0,0,0,.3))"><path d="M12 21C16 17 20 13.4183 20 9C20 4.58172 16.4183 1 12 1C7.58172 1 4 4.58172 4 9C4 13.4183 8 17 12 21Z" fill="${color}" stroke="white" stroke-width="1.5"/><circle cx="12" cy="9" r="3" fill="white"/></svg>${isSelected ? `<div style="position:absolute;width:100%;height:100%;background:${color};border-radius:50%;opacity:.2;transform:scale(1.5);animation:pulse 2s infinite"></div>` : ''}</div>`,
        iconSize: [size, size],
        iconAnchor: [size / 2, size],
        popupAnchor: [0, -size],
    });
}

const MapComponent = ({
    lat = -27.5948,
    lng = -48.5482,
    zoom = 13,
    markerTitle = 'Localização',
    markers = [],
    onMarkerClick = null,
    autoFit = true,
    selectedId = null,
    userLocation = null,
}) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const estLayerRef = useRef(null);
    const userLayerRef = useRef(null);
    const markerObjectsRef = useRef({});
    const prevMarkersKeyRef = useRef('');
    const validMarkersRef = useRef([]);
    const batchRafRef = useRef(null);
    const redrawRef = useRef(null);

    // Reassigned each render so the zoomend handler always sees latest selectedId/onMarkerClick
    redrawRef.current = () => {
        const map = mapInstance.current;
        const layer = estLayerRef.current;
        if (!map || !layer) return;

        if (batchRafRef.current) {
            cancelAnimationFrame(batchRafRef.current);
            batchRafRef.current = null;
        }
        layer.clearLayers();
        markerObjectsRef.current = {};

        const clusters = computeClusters(validMarkersRef.current, map);
        let i = 0;

        function nextBatch() {
            const end = Math.min(i + BATCH_SIZE, clusters.length);
            for (; i < end; i++) {
                const c = clusters[i];
                if (c.count > 1) {
                    const clusterBounds = L.latLngBounds(c.items.map(mk => [mk.lat, mk.lng]));
                    const m = L.marker([c.lat, c.lng], { icon: clusterIcon(c.count) }).addTo(layer);
                    m.on('click', () => map.fitBounds(clusterBounds.pad(0.25), { animate: true, maxZoom: 17 }));
                } else {
                    const mk = c.items[0];
                    const isSelected = mk.id === selectedId;
                    const m = L.marker([mk.lat, mk.lng], { icon: pinIcon(isSelected) })
                        .addTo(layer)
                        .bindPopup(`<b>${mk.title || ''}</b>`);
                    if (onMarkerClick) m.on('click', () => onMarkerClick(mk.id));
                    markerObjectsRef.current[mk.id] = m;
                }
            }
            if (i < clusters.length) {
                batchRafRef.current = requestAnimationFrame(nextBatch);
            } else {
                batchRafRef.current = null;
            }
        }
        nextBatch();
    };

    // 1. Initialize map once
    useEffect(() => {
        if (mapInstance.current) return;

        mapInstance.current = L.map(mapRef.current, {
            zoomControl: true,
            scrollWheelZoom: true,
        }).setView([lat, lng], zoom);

        L.tileLayer(
            `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=${import.meta.env.VITE_MAPTILER_KEY}`,
            {
                attribution:
                    '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
                    '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
            }
        ).addTo(mapInstance.current);

        estLayerRef.current = L.layerGroup().addTo(mapInstance.current);
        userLayerRef.current = L.layerGroup().addTo(mapInstance.current);

        return () => {
            if (batchRafRef.current) cancelAnimationFrame(batchRafRef.current);
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    // 2. Redraw clusters when markers or selectedId change
    useEffect(() => {
        if (!mapInstance.current) return;

        const key = markers
            .map(m => `${m.id}:${m.lat?.toFixed(5)}:${m.lng?.toFixed(5)}`)
            .sort()
            .join(',');
        const changed = key !== prevMarkersKeyRef.current;
        prevMarkersKeyRef.current = key;

        validMarkersRef.current = markers.filter(
            m => Number.isFinite(m.lat) && Number.isFinite(m.lng)
        );
        redrawRef.current();

        if (autoFit && changed) {
            const vm = validMarkersRef.current;
            if (vm.length > 1) {
                const pts = vm.map(m => [m.lat, m.lng]);
                if (userLocation?.lat) pts.push([userLocation.lat, userLocation.lng]);
                const grp = L.featureGroup(pts.map(c => L.marker(c)));
                mapInstance.current.fitBounds(grp.getBounds().pad(0.15), {
                    maxZoom: 15,
                    animate: true,
                    duration: 0.5,
                });
            } else if (vm.length === 1) {
                mapInstance.current.setView([vm[0].lat, vm[0].lng], 14, { animate: true });
            }
        }
    }, [markers, selectedId, onMarkerClick, autoFit, lat, lng, zoom, userLocation]);

    useEffect(() => {
        const map = mapInstance.current;
        if (!map || autoFit) return;
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;
        map.setView([lat, lng], map.getZoom(), { animate: true });
    }, [lat, lng, autoFit]);

    // 3. Recompute clusters on every zoom change
    useEffect(() => {
        const map = mapInstance.current;
        if (!map) return;
        const handler = () => redrawRef.current();
        map.on('zoomend', handler);
        return () => map.off('zoomend', handler);
    }, []);

    // 4. Update user location marker independently
    useEffect(() => {
        const layer = userLayerRef.current;
        if (!layer) return;
        layer.clearLayers();
        if (userLocation && Number.isFinite(userLocation.lat) && Number.isFinite(userLocation.lng)) {
            const icon = L.divIcon({
                className: '',
                html: `<div style="position:relative;width:24px;height:24px"><div style="position:absolute;inset:0;background:#2563EB;border:3px solid white;border-radius:50%;box-shadow:0 2px 10px rgba(37,99,235,.35)"></div><div style="position:absolute;inset:-10px;background:rgba(37,99,235,.18);border-radius:50%;animation:pulse 2s infinite"></div></div>`,
                iconSize: [24, 24],
                iconAnchor: [12, 12],
            });
            L.marker([userLocation.lat, userLocation.lng], { icon })
                .addTo(layer)
                .bindPopup('<b>Sua localização</b>');
        }
    }, [userLocation]);

    // 5. Pan to and highlight selected individual marker
    useEffect(() => {
        if (!mapInstance.current || !selectedId) return;
        const m = markerObjectsRef.current[selectedId];
        if (m) {
            mapInstance.current.panTo(m.getLatLng(), { animate: true, duration: 0.4 });
            m.openPopup();
        }
    }, [selectedId]);

    return (
        <Box
            ref={mapRef}
            sx={{
                width: '100%',
                height: '100%',
                borderRadius: 'inherit',
                '& .leaflet-container': {
                    width: '100%',
                    height: '100%',
                    borderRadius: 'inherit',
                    zIndex: 1,
                },
                '@keyframes pulse': {
                    '0%': { transform: 'scale(1)', opacity: 0.4 },
                    '70%': { transform: 'scale(2)', opacity: 0 },
                    '100%': { transform: 'scale(1)', opacity: 0 },
                },
            }}
        />
    );
};

export default MapComponent;

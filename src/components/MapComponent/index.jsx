import React, { useEffect, useRef } from 'react';
import { Box } from '@mui/material';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

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
    const markersLayerRef = useRef(null);
    const markerObjectsRef = useRef({});
    const prevMarkersKeyRef = useRef('');

    useEffect(() => {
        if (mapInstance.current) return;

        mapInstance.current = L.map(mapRef.current, {
            zoomControl: true,
            scrollWheelZoom: true,
        }).setView([lat, lng], zoom);

        L.tileLayer(
            `https://api.maptiler.com/maps/streets-v2/{z}/{x}/{y}.png?key=MFouw8iASb0sVoPbhqsk`,
            {
                attribution:
                    '<a href="https://www.maptiler.com/copyright/" target="_blank">&copy; MapTiler</a> ' +
                    '<a href="https://www.openstreetmap.org/copyright" target="_blank">&copy; OpenStreetMap contributors</a>',
            }
        ).addTo(mapInstance.current);

        markersLayerRef.current = L.layerGroup().addTo(mapInstance.current);

        return () => {
            if (mapInstance.current) {
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, []);

    useEffect(() => {
        if (!mapInstance.current) return;

        const markersKey = markers.map((m) => `${m.id}`).sort().join(',');
        const markersChanged = markersKey !== prevMarkersKeyRef.current;
        prevMarkersKeyRef.current = markersKey;

        if (markersLayerRef.current) markersLayerRef.current.clearLayers();
        markerObjectsRef.current = {};

        if (markers && markers.length > 0) {
            const validMarkers = markers.filter(
                (m) => Number.isFinite(m.lat) && Number.isFinite(m.lng)
            );

            if (userLocation && Number.isFinite(userLocation.lat) && Number.isFinite(userLocation.lng)) {
                const userIcon = L.divIcon({
                    className: 'custom-user-marker',
                    html: `
                        <div style="position: relative; width: 24px; height: 24px;">
                            <div style="position: absolute; inset: 0; background: #2563EB; border: 3px solid white; border-radius: 50%; box-shadow: 0 2px 10px rgba(37,99,235,0.35);"></div>
                            <div style="position: absolute; inset: -10px; background: rgba(37,99,235,0.18); border-radius: 50%; animation: pulse 2s infinite;"></div>
                        </div>
                    `,
                    iconSize: [24, 24],
                    iconAnchor: [12, 12],
                    popupAnchor: [0, -12],
                });

                L.marker([userLocation.lat, userLocation.lng], { icon: userIcon })
                    .addTo(markersLayerRef.current)
                    .bindPopup('<b>Sua localização</b>');
            }

            validMarkers.forEach((marker) => {
                const isSelected = marker.id === selectedId;
                const color = isSelected ? '#059669' : '#10B981';
                const size = isSelected ? 36 : 30;
                
                const icon = L.divIcon({
                    className: 'custom-marker',
                    html: `
                        <div style="position: relative; width: ${size}px; height: ${size}px; display: flex; align-items: center; justify-content: center;">
                            <svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">
                                <path d="M12 21C16 17 20 13.4183 20 9C20 4.58172 16.4183 1 12 1C7.58172 1 4 4.58172 4 9C4 13.4183 8 17 12 21Z" fill="${color}" stroke="white" stroke-width="1.5"/>
                                <circle cx="12" cy="9" r="3" fill="white"/>
                            </svg>
                            ${isSelected ? `<div style="position: absolute; width: 100%; height: 100%; background: ${color}; border-radius: 50%; opacity: 0.2; transform: scale(1.5); animation: pulse 2s infinite;"></div>` : ''}
                        </div>
                    `,
                    iconSize: [size, size],
                    iconAnchor: [size / 2, size],
                    popupAnchor: [0, -size],
                });

                const m = L.marker([marker.lat, marker.lng], { icon })
                    .addTo(markersLayerRef.current)
                    .bindPopup(`<b>${marker.title || ''}</b>`);

                if (onMarkerClick) {
                    m.on('click', () => onMarkerClick(marker.id));
                }

                markerObjectsRef.current[marker.id] = m;
            });

            if (autoFit && (markersChanged || !selectedId || userLocation)) {
                if (validMarkers.length > 1) {
                    const boundsPoints = validMarkers.map((m) => [m.lat, m.lng]);
                    if (userLocation && Number.isFinite(userLocation.lat) && Number.isFinite(userLocation.lng)) {
                        boundsPoints.push([userLocation.lat, userLocation.lng]);
                    }

                    const group = L.featureGroup(boundsPoints.map((coords) => L.marker(coords)));
                    mapInstance.current.fitBounds(group.getBounds().pad(0.15), {
                        maxZoom: 15,
                        animate: true,
                        duration: 0.5,
                    });
                } else if (validMarkers.length === 1) {
                    const center = userLocation && Number.isFinite(userLocation.lat) && Number.isFinite(userLocation.lng)
                        ? L.latLngBounds(
                            [validMarkers[0].lat, validMarkers[0].lng],
                            [userLocation.lat, userLocation.lng]
                          ).getCenter()
                        : [validMarkers[0].lat, validMarkers[0].lng];
                    mapInstance.current.setView(center, 14, { animate: true });
                } else if (userLocation && Number.isFinite(userLocation.lat) && Number.isFinite(userLocation.lng)) {
                    mapInstance.current.setView([userLocation.lat, userLocation.lng], zoom, {
                        animate: true,
                    });
                }
            } else if (!autoFit && Number.isFinite(lat) && Number.isFinite(lng)) {
                mapInstance.current.setView([lat, lng], zoom, { animate: true });
            }
        } else {
            const fallbackLat = userLocation?.lat ?? lat;
            const fallbackLng = userLocation?.lng ?? lng;

            if (markersChanged || fallbackLat || fallbackLng) {
                mapInstance.current.setView([fallbackLat, fallbackLng], zoom, { animate: true });
            }
            L.marker([fallbackLat, fallbackLng])
                .addTo(markersLayerRef.current)
                .bindPopup(markerTitle);
        }
    }, [markers, selectedId, onMarkerClick, autoFit, lat, lng, zoom, markerTitle, userLocation]);

    useEffect(() => {
        if (!mapInstance.current || !selectedId) return;
        const markerObj = markerObjectsRef.current[selectedId];
        if (markerObj) {
            mapInstance.current.panTo(markerObj.getLatLng(), { animate: true, duration: 0.4 });
            markerObj.openPopup();
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
                    '0%': {
                        transform: 'scale(1)',
                        opacity: 0.4,
                    },
                    '70%': {
                        transform: 'scale(2)',
                        opacity: 0,
                    },
                    '100%': {
                        transform: 'scale(1)',
                        opacity: 0,
                    },
                },
            }}
        />
    );
};

export default MapComponent;

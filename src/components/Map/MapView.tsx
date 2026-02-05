"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useCheckInStore } from "@/store/checkInStore";
import { useEffect } from "react";

// Reset default marker fix
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

// Precision Dot Icons
const createProIcon = (isUser: boolean, hasDouble: boolean) => {
    let color = "#404040";
    if (isUser) color = "#ffffff";
    else if (hasDouble) color = "#fb923c";

    return L.divIcon({
        className: 'pro-marker',
        html: `
      <div style="
        width: 12px;
        height: 12px;
        background: ${color};
        border: 2px solid ${isUser ? '#000' : 'rgba(0,0,0,0.5)'};
        border-radius: 50%;
        box-shadow: 0 0 10px ${color}33;
      "></div>
    `,
        iconSize: [12, 12],
        iconAnchor: [6, 6],
    });
};

function MapViewHandler({ centerCoords }: { centerCoords: [number, number] | null }) {
    const map = useMap();
    useEffect(() => {
        if (centerCoords) {
            map.flyTo(centerCoords, 16, { animate: true, duration: 1.5 });
        }
    }, [centerCoords, map]);
    return null;
}

export default function MapView({ searchQuery = "", centerCoords = null }: { searchQuery?: string; centerCoords?: [number, number] | null }) {
    const { cafes, currentCafeId, isCheckedIn, checkIn, checkOut } = useCheckInStore();

    const filteredCafes = cafes.filter(cafe =>
        cafe.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div style={{ height: '100%', width: '100%', background: '#000' }}>
            <MapContainer
                center={[12.9352, 77.6245]}
                zoom={13}
                zoomControl={false}
                attributionControl={false}
                style={{ height: "100%", width: "100%", background: '#000' }}
            >
                <MapViewHandler centerCoords={centerCoords} />
                <TileLayer
                    url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    opacity={0.8}
                />

                {filteredCafes.map((cafe) => {
                    const isUserHere = isCheckedIn && currentCafeId === cafe.id;
                    const hasDouble = cafe.hasDouble || cafe.coworkers.some(c => c.intent === 'body-double');
                    const count = cafe.coworkers.length + (isUserHere ? 1 : 0);
                    const icon = createProIcon(isUserHere, hasDouble);

                    return (
                        <Marker key={cafe.id} position={cafe.coords} icon={icon}>
                            <Popup>
                                <div style={{ color: '#fff' }}>
                                    <div style={{ fontSize: '10px', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', marginBottom: '2px' }}>Location Node</div>
                                    <h3 style={{ fontSize: '13px', fontWeight: 600, marginBottom: '8px', letterSpacing: '-0.01em' }}>{cafe.name}</h3>
                                    <div style={{ fontSize: '11px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                                        {count} ACTIVE_NODES
                                    </div>

                                    {isUserHere ? (
                                        <button onClick={checkOut} className="btn-minimal" style={{ width: '100%', background: '#ff4444' }}>
                                            Disconnect
                                        </button>
                                    ) : (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                                            <button onClick={() => checkIn(cafe.id, 'body-double')} className="btn-minimal">
                                                Double
                                            </button>
                                            <button onClick={() => checkIn(cafe.id, 'focus')} className="btn-border">
                                                Focus
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}

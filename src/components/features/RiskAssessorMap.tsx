"use client";

import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { useState, useMemo } from 'react';


type Location = { lat: number; lng: number };

function LocationPicker({ onLocationSelect, markerIcon }: { onLocationSelect: (loc: Location) => void, markerIcon: L.Icon }) {
  const [position, setPosition] = useState<L.LatLng | null>(null);

  const map = useMapEvents({
    click(e) {
      setPosition(e.latlng);
      onLocationSelect({ lat: e.latlng.lat, lng: e.latlng.lng });
      map.flyTo(e.latlng, map.getZoom());
    },
  });

  return position === null ? null : (
    <Marker position={position} icon={markerIcon} />
  );
}

export default function RiskAssessorMap({ onLocationSelect }: { onLocationSelect: (loc: Location) => void }) {
    
    const markerIcon = useMemo(() => {
        return new L.Icon({
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });
    }, []);

  return (
    <MapContainer
      center={[28.6139, 77.2090]} // Default to New Delhi
      zoom={10}
      style={{ height: '100%', width: '100%' }}
      className="rounded-md"
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <LocationPicker onLocationSelect={onLocationSelect} markerIcon={markerIcon} />
    </MapContainer>
  );
}

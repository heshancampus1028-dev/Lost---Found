import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Leaflet's default marker icon paths break under most bundlers (Vite/Webpack) -
// this re-points them at the bundled image assets instead.
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow
});

const SRI_LANKA_CENTER = [7.8731, 80.7718];

// Listens for map clicks and reports the clicked lat/lng back up
function ClickHandler({ onSelect }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

// Click anywhere on the map to drop/move the pin. onChange(lat, lng) fires on every pick.
function LocationPicker({ latitude, longitude, onChange }) {
  const [position, setPosition] = useState(
    latitude && longitude ? [latitude, longitude] : null
  );

  const handleSelect = (lat, lng) => {
    setPosition([lat, lng]);
    onChange(lat, lng);
  };

  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-slate-700" style={{ height: '220px' }}>
      <MapContainer
        center={position || SRI_LANKA_CENTER}
        zoom={position ? 14 : 7}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ClickHandler onSelect={handleSelect} />
        {position && <Marker position={position} />}
      </MapContainer>
    </div>
  );
}

export default LocationPicker;

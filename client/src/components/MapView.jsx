import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { MapPin, AlertTriangle, Clock, Zap, Shield } from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in Leaflet + bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom colored marker icons
function createIcon(color) {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="
      width: 28px; height: 28px;
      background: ${color};
      border: 3px solid white;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      box-shadow: 0 2px 8px rgba(0,0,0,0.4);
      position: relative;
    "><div style="
      width: 10px; height: 10px;
      background: white;
      border-radius: 50%;
      position: absolute;
      top: 50%; left: 50%;
      transform: translate(-50%, -50%);
    "></div></div>`,
    iconSize: [28, 28],
    iconAnchor: [14, 28],
    popupAnchor: [0, -28],
  });
}

const ICONS = {
  CRITICAL: createIcon('#ef4444'),
  STABLE: createIcon('#f59e0b'),
  Resolved: createIcon('#22c55e'),
  DEFAULT: createIcon('#6b7280'),
};

// Component to auto-fit bounds when incidents change
function FitBounds({ incidents }) {
  const map = useMap();

  useEffect(() => {
    const markers = incidents
      .filter(i => i.coords)
      .map(i => {
        const [lat, lng] = i.coords.split(',').map(Number);
        return [lat, lng];
      })
      .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));

    if (markers.length > 0) {
      const bounds = L.latLngBounds(markers);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [incidents, map]);

  return null;
}

export default function MapView({ incidents }) {
  const validIncidents = incidents.filter(i => {
    if (!i.coords) return false;
    const [lat, lng] = i.coords.split(',').map(Number);
    return !isNaN(lat) && !isNaN(lng);
  });

  const defaultCenter = [20.5937, 78.9629]; // India center
  const defaultZoom = 5;

  return (
    <div className="map-view animate-fade-in">
      {/* Header */}
      <div className="map-header">
        <div className="map-header-left">
          <MapPin size={28} className="map-header-icon" />
          <div>
            <h2 className="map-title">Live Incident Map</h2>
            <p className="map-subtitle">Real-time geographic visualization</p>
          </div>
        </div>
        <div className="map-legend">
          <div className="map-legend-item">
            <div className="map-legend-dot" style={{ background: '#ef4444' }} />
            <span>Critical</span>
          </div>
          <div className="map-legend-item">
            <div className="map-legend-dot" style={{ background: '#f59e0b' }} />
            <span>Stable</span>
          </div>
          <div className="map-legend-item">
            <div className="map-legend-dot" style={{ background: '#22c55e' }} />
            <span>Resolved</span>
          </div>
        </div>
      </div>

      {/* Map container */}
      <div className="map-container">
        {validIncidents.length === 0 ? (
          <div className="map-empty">
            <MapPin size={48} className="map-empty-icon" />
            <h3>No geolocated incidents yet</h3>
            <p>Incidents with GPS coordinates will appear on the map in real-time.</p>
          </div>
        ) : (
          <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            className="leaflet-map"
            style={{ height: '100%', width: '100%', borderRadius: '20px' }}
          >
            <TileLayer
              attribution='&copy; <a href="https://carto.com/">CARTO</a>'
              url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            />
            <FitBounds incidents={validIncidents} />
            {validIncidents.map((incident) => {
              const [lat, lng] = incident.coords.split(',').map(Number);
              const icon = incident.status === 'Resolved'
                ? ICONS.Resolved
                : (ICONS[incident.priority] || ICONS.DEFAULT);

              return (
                <Marker key={incident.firebaseId || incident.id} position={[lat, lng]} icon={icon}>
                  <Popup className="incident-popup">
                    <div className="popup-content">
                      <div className="popup-header">
                        <span className={`popup-status ${(incident.status || '').toLowerCase()}`}>
                          {incident.status}
                        </span>
                        <span className={`popup-severity ${(incident.priority || '').toLowerCase()}`}>
                          {incident.priority}
                        </span>
                      </div>
                      <h4 className="popup-location">{incident.location}</h4>
                      {incident.type && <p className="popup-type">{incident.type}</p>}
                      {incident.translatedDesc && (
                        <p className="popup-desc">"{incident.translatedDesc}"</p>
                      )}
                      {incident.aiAdvice && (
                        <div className="popup-ai">
                          <Zap size={12} />
                          <span>{incident.aiAdvice}</span>
                        </div>
                      )}
                      <div className="popup-time">
                        <Clock size={10} />
                        <span>{incident.timestamp}</span>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}
      </div>

      {/* Stats bar */}
      <div className="map-stats-bar">
        <div className="map-stat">
          <span className="map-stat-value">{validIncidents.length}</span>
          <span className="map-stat-label">Mapped Incidents</span>
        </div>
        <div className="map-stat">
          <span className="map-stat-value" style={{ color: '#ef4444' }}>
            {validIncidents.filter(i => i.priority === 'CRITICAL' && i.status !== 'Resolved').length}
          </span>
          <span className="map-stat-label">Active Critical</span>
        </div>
        <div className="map-stat">
          <span className="map-stat-value" style={{ color: '#22c55e' }}>
            {validIncidents.filter(i => i.status === 'Resolved').length}
          </span>
          <span className="map-stat-label">Resolved</span>
        </div>
      </div>
    </div>
  );
}

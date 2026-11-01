import React, { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { 
  MapPin, Clock, Zap, Layers, Compass, Crosshair, 
  ExternalLink, CheckCircle, ShieldAlert
} from 'lucide-react';
import 'leaflet/dist/leaflet.css';

// Fix default marker icon issue in Leaflet + bundlers
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// High-Tech Radar Pulsing DivIcons
function createTacticalBeacon(priority, status, type) {
  const isResolved = status === 'Resolved';
  const isCritical = priority === 'CRITICAL';
  
  let beaconClass = 'beacon-stable';
  let color = '#f59e0b';
  let badgeLetter = 'S';

  if (isResolved) {
    beaconClass = 'beacon-resolved';
    color = '#10b981';
    badgeLetter = '✓';
  } else if (isCritical) {
    beaconClass = 'beacon-critical';
    color = '#ef4444';
    badgeLetter = '!';
  }

  return L.divIcon({
    className: 'tactical-beacon-wrapper',
    html: `
      <div class="tactical-beacon ${beaconClass}">
        <div class="beacon-wave wave-1"></div>
        <div class="beacon-wave wave-2"></div>
        <div class="beacon-core" style="background: ${color}; box-shadow: 0 0 16px ${color}">
          <span class="beacon-glyph">${badgeLetter}</span>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
}

const TILE_LAYERS = {
  dark: {
    name: 'Tactical Dark',
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OpenStreetMap'
  },
  satellite: {
    name: 'Satellite Recon',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Earthstar Geographics'
  },
  streets: {
    name: 'High Contrast',
    url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
    attribution: '&copy; CARTO &copy; OpenStreetMap'
  }
};

// Component to handle auto-fit bounds or focus on a specific incident
function MapController({ incidents, focusedIncident }) {
  const map = useMap();

  useEffect(() => {
    if (focusedIncident && focusedIncident.coords) {
      const [lat, lng] = focusedIncident.coords.split(',').map(Number);
      if (!isNaN(lat) && !isNaN(lng)) {
        map.flyTo([lat, lng], 15, { duration: 1.2 });
      }
      return;
    }

    const markers = incidents
      .filter(i => i.coords)
      .map(i => {
        const [lat, lng] = i.coords.split(',').map(Number);
        return [lat, lng];
      })
      .filter(([lat, lng]) => !isNaN(lat) && !isNaN(lng));

    if (markers.length === 1) {
      map.flyTo(markers[0], 13, { duration: 1 });
    } else if (markers.length > 1) {
      const bounds = L.latLngBounds(markers);
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
    }
  }, [incidents, focusedIncident, map]);

  return null;
}

export default function MapView({ 
  incidents = [], 
  focusedIncident = null, 
  onSelectIncident = null,
  compact = false 
}) {
  const [tileMode, setTileMode] = useState('dark');
  const [filterPriority, setFilterPriority] = useState('ALL');

  const validIncidents = useMemo(() => {
    return incidents.filter(i => {
      if (!i.coords) return false;
      const [lat, lng] = i.coords.split(',').map(Number);
      return !isNaN(lat) && !isNaN(lng);
    });
  }, [incidents]);

  const filteredIncidents = useMemo(() => {
    if (filterPriority === 'CRITICAL') {
      return validIncidents.filter(i => i.priority === 'CRITICAL' && i.status !== 'Resolved');
    }
    if (filterPriority === 'ACTIVE') {
      return validIncidents.filter(i => i.status !== 'Resolved');
    }
    if (filterPriority === 'RESOLVED') {
      return validIncidents.filter(i => i.status === 'Resolved');
    }
    return validIncidents;
  }, [validIncidents, filterPriority]);

  const defaultCenter = [20.5937, 78.9629]; // Default India regional center
  const defaultZoom = 5;

  const criticalCount = validIncidents.filter(i => i.priority === 'CRITICAL' && i.status !== 'Resolved').length;
  const activeCount = validIncidents.filter(i => i.status !== 'Resolved').length;

  return (
    <div className={`tactical-map-view ${compact ? 'compact-mode' : ''} animate-fade-in`}>
      {/* Tactical HUD Header */}
      <div className="map-tactical-header">
        <div className="map-header-left">
          <div className="tactical-hud-badge">
            <Compass size={18} className="hud-compass-icon" />
            <div className="hud-status-indicator">
              <span className="hud-radar-dot" />
              <span>RADAR TELEMETRY LIVE</span>
            </div>
          </div>
          <div>
            <h2 className="tactical-map-title">Geospatial Crisis Map</h2>
            <p className="tactical-map-sub">Real-Time Situational Awareness & Beacon Tracking</p>
          </div>
        </div>

        {/* Layer Switcher & Quick Filters */}
        <div className="map-hud-controls">
          <div className="map-layer-selector">
            <Layers size={14} className="text-slate-400" />
            {Object.keys(TILE_LAYERS).map(key => (
              <button
                key={key}
                type="button"
                onClick={() => setTileMode(key)}
                className={`layer-toggle-btn ${tileMode === key ? 'active' : ''}`}
              >
                {TILE_LAYERS[key].name}
              </button>
            ))}
          </div>

          <div className="map-filter-chips">
            <button
              type="button"
              onClick={() => setFilterPriority('ALL')}
              className={`map-filter-chip ${filterPriority === 'ALL' ? 'active' : ''}`}
            >
              All ({validIncidents.length})
            </button>
            <button
              type="button"
              onClick={() => setFilterPriority('CRITICAL')}
              className={`map-filter-chip critical ${filterPriority === 'CRITICAL' ? 'active' : ''}`}
            >
              Critical ({criticalCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterPriority('ACTIVE')}
              className={`map-filter-chip active-dispatches ${filterPriority === 'ACTIVE' ? 'active' : ''}`}
            >
              Active ({activeCount})
            </button>
          </div>
        </div>
      </div>

      {/* Map Viewport Container */}
      <div className="tactical-map-container">
        {validIncidents.length === 0 ? (
          <div className="map-empty-state">
            <Crosshair size={48} className="empty-crosshair" />
            <h3>Awaiting GPS Incident Coordinates</h3>
            <p>Active emergency alerts reporting location coordinates will synchronize here in real-time.</p>
          </div>
        ) : (
          <MapContainer
            center={defaultCenter}
            zoom={defaultZoom}
            className="leaflet-map-instance"
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              attribution={TILE_LAYERS[tileMode].attribution}
              url={TILE_LAYERS[tileMode].url}
            />
            
            <MapController incidents={filteredIncidents} focusedIncident={focusedIncident} />

            {filteredIncidents.map((incident) => {
              const [lat, lng] = incident.coords.split(',').map(Number);
              const beaconIcon = createTacticalBeacon(incident.priority, incident.status, incident.type);

              return (
                <Marker 
                  key={incident.firebaseId || incident.id} 
                  position={[lat, lng]} 
                  icon={beaconIcon}
                  eventHandlers={{
                    click: () => onSelectIncident && onSelectIncident(incident)
                  }}
                >
                  <Popup className="tactical-popup">
                    <div className="popup-hud-card">
                      {/* Top Bar */}
                      <div className="popup-hud-top">
                        <span className={`popup-tag-priority ${(incident.priority || '').toLowerCase()}`}>
                          {incident.priority || 'EVALUATING'}
                        </span>
                        <span className={`popup-tag-status ${(incident.status || '').toLowerCase()}`}>
                          {incident.status}
                        </span>
                        <span className="popup-timestamp">
                          <Clock size={10} />
                          {incident.timestamp}
                        </span>
                      </div>

                      {/* Title & Category */}
                      <h4 className="popup-incident-location">{incident.location}</h4>
                      {incident.type && (
                        <div className="popup-category-badge">
                          <span>Sector:</span> <strong>{incident.type}</strong>
                        </div>
                      )}

                      {/* Multilingual Translation */}
                      {incident.translatedDesc && (
                        <p className="popup-translation-text">"{incident.translatedDesc}"</p>
                      )}

                      {/* Gemini AI Directive */}
                      {incident.aiAdvice && (
                        <div className="popup-ai-directive">
                          <div className="popup-ai-header">
                            <Zap size={12} />
                            <span>AI TACTICAL RECOMMENDATION</span>
                          </div>
                          <p className="popup-ai-body">{incident.aiAdvice}</p>
                        </div>
                      )}

                      {/* Action Links */}
                      <div className="popup-action-row">
                        <a
                          href={`https://www.google.com/maps?q=${incident.coords}`}
                          target="_blank"
                          rel="noreferrer"
                          className="popup-nav-link"
                        >
                          <ExternalLink size={12} />
                          <span>Directions / Navigation</span>
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        )}

        {/* Map Corner Crosshair Overlay */}
        <div className="map-overlay-compass">
          <Crosshair size={24} className="compass-icon" />
          <span className="compass-coords">
            {focusedIncident && focusedIncident.coords ? focusedIncident.coords : 'GRID ACTIVE'}
          </span>
        </div>
      </div>

      {/* Map Bottom Status Bar */}
      <div className="map-hud-statusbar">
        <div className="hud-metric">
          <span className="metric-label">Mapped Beacons</span>
          <span className="metric-val">{validIncidents.length}</span>
        </div>
        <div className="hud-metric">
          <span className="metric-label">Critical Red Zones</span>
          <span className="metric-val text-red-500">{criticalCount}</span>
        </div>
        <div className="hud-metric">
          <span className="metric-label">Units Active</span>
          <span className="metric-val text-blue-400">{activeCount}</span>
        </div>
        <div className="hud-metric">
          <span className="metric-label">Stabilized</span>
          <span className="metric-val text-emerald-400">
            {validIncidents.filter(i => i.status === 'Resolved').length}
          </span>
        </div>
      </div>
    </div>
  );
}

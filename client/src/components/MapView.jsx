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

  if (type === 'hospital' || priority === 'HOSPITAL') {
    beaconClass = 'beacon-hospital';
    color = '#06b6d4';
    badgeLetter = '🏥';
  } else if (type === 'hotel' || type === 'shelter' || priority === 'SHELTER') {
    beaconClass = 'beacon-shelter';
    color = '#10b981';
    badgeLetter = '🏨';
  } else if (isResolved) {
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
          <span class="beacon-glyph" style="font-size: 13px;">${badgeLetter}</span>
        </div>
      </div>
    `,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
  });
}

const cartoKey = import.meta.env.VITE_CARTO_API_KEY;

const TILE_LAYERS = {
  dark: {
    name: 'Tactical Dark',
    // Uses watermark-free Esri Dark Gray canvas by default, or CARTO if API key is provided
    url: cartoKey 
      ? `https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png?api_key=${cartoKey}`
      : 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: cartoKey ? '&copy; CARTO &copy; OpenStreetMap' : 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: cartoKey ? 19 : 16
  },
  satellite: {
    name: 'Satellite Recon',
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Earthstar Geographics',
    maxZoom: 19
  },
  streets: {
    name: 'High Contrast',
    // Uses standard OpenStreetMap by default, or CARTO Voyager if API key is provided
    url: cartoKey
      ? `https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png?api_key=${cartoKey}`
      : 'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: cartoKey ? '&copy; CARTO &copy; OpenStreetMap' : '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    maxZoom: 19
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

export const HOSPITALITY_FACILITIES = [
  {
    id: 'fac-hosp-01',
    type: 'hospital',
    priority: 'HOSPITAL',
    name: 'Apex Super-Specialty & Trauma Center',
    coords: '22.5804, 88.4326',
    location: 'Sector 5, Salt Lake, Kolkata',
    availableCapacity: 34,
    totalCapacity: 250,
    icuBeds: 8,
    status: 'Ready',
    contact: '+91 33 2357 0000',
    description: 'Trauma ICU & Burn Unit'
  },
  {
    id: 'fac-hotel-01',
    type: 'hotel',
    priority: 'SHELTER',
    name: 'Grand Horizon Hotel & Evacuation Suites',
    coords: '22.5867, 88.4682',
    location: 'New Town Action Area 1, Kolkata',
    availableCapacity: 48,
    totalCapacity: 120,
    status: 'Open',
    contact: '+91 33 6688 1234',
    description: 'Emergency Evacuee Suites'
  },
  {
    id: 'fac-hosp-02',
    type: 'hospital',
    priority: 'HOSPITAL',
    name: 'Apollo Emergency & Pediatric Care',
    coords: '22.5697, 88.3995',
    location: 'Canal Circular Road, Phoolbagan',
    availableCapacity: 19,
    totalCapacity: 180,
    icuBeds: 4,
    status: 'Surge',
    contact: '+91 33 2320 3040',
    description: 'Pediatric ICU & Emergency Triage'
  },
  {
    id: 'fac-shelter-01',
    type: 'shelter',
    priority: 'SHELTER',
    name: 'Netaji Stadium Relief Camp',
    coords: '22.5714, 88.4120',
    location: 'Bidhannagar Sports Complex',
    availableCapacity: 145,
    totalCapacity: 400,
    status: 'Open 24/7',
    contact: '+91 98300 11223',
    description: 'Disaster Relief Shelter & Rations'
  }
];

export default function MapView({ 
  incidents = [], 
  focusedIncident = null, 
  onSelectIncident = null,
  compact = false 
}) {
  const [tileMode, setTileMode] = useState('dark');
  const [filterPriority, setFilterPriority] = useState('ALL');

  // Combine live disaster incidents with hospitality & healthcare facilities
  const allMapEntities = useMemo(() => {
    return [...incidents, ...HOSPITALITY_FACILITIES];
  }, [incidents]);

  const validIncidents = useMemo(() => {
    return allMapEntities.filter(i => {
      if (!i.coords) return false;
      const [lat, lng] = i.coords.split(',').map(Number);
      return !isNaN(lat) && !isNaN(lng);
    });
  }, [allMapEntities]);

  const filteredIncidents = useMemo(() => {
    if (filterPriority === 'CRITICAL') {
      return validIncidents.filter(i => i.priority === 'CRITICAL' && i.status !== 'Resolved');
    }
    if (filterPriority === 'ACTIVE') {
      return validIncidents.filter(i => i.status !== 'Resolved' && i.priority !== 'HOSPITAL' && i.priority !== 'SHELTER');
    }
    if (filterPriority === 'HOSPITAL') {
      return validIncidents.filter(i => i.type === 'hospital' || i.priority === 'HOSPITAL');
    }
    if (filterPriority === 'SHELTER') {
      return validIncidents.filter(i => i.type === 'hotel' || i.type === 'shelter' || i.priority === 'SHELTER');
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
            <button
              type="button"
              onClick={() => setFilterPriority('HOSPITAL')}
              className={`map-filter-chip ${filterPriority === 'HOSPITAL' ? 'active' : ''}`}
              style={{ color: '#06b6d4' }}
            >
              🏥 Hospitals (2)
            </button>
            <button
              type="button"
              onClick={() => setFilterPriority('SHELTER')}
              className={`map-filter-chip ${filterPriority === 'SHELTER' ? 'active' : ''}`}
              style={{ color: '#10b981' }}
            >
              🏨 Hotels/Shelters (2)
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
              key={tileMode}
              attribution={TILE_LAYERS[tileMode].attribution}
              url={TILE_LAYERS[tileMode].url}
              maxZoom={TILE_LAYERS[tileMode].maxZoom || 19}
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
                      <h4 className="popup-incident-location">{incident.name || incident.location}</h4>
                      {incident.availableCapacity !== undefined && (
                        <div className="popup-category-badge" style={{ color: '#4ecdc4', background: 'rgba(6,182,212,0.1)' }}>
                          <span>Capacity:</span> <strong>{incident.availableCapacity} / {incident.totalCapacity} Free</strong>
                          {incident.icuBeds && <span className="ml-1 text-rose-400">({incident.icuBeds} ICU)</span>}
                        </div>
                      )}
                      {incident.type && !incident.name && (
                        <div className="popup-category-badge">
                          <span>Sector:</span> <strong>{incident.type}</strong>
                        </div>
                      )}

                      {/* Multilingual Translation or Facility Description */}
                      {incident.description && incident.name && (
                        <p className="popup-translation-text">"{incident.description}"</p>
                      )}
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

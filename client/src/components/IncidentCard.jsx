import React, { useState } from 'react';
import { 
  Clock, MapPin, Languages, Zap, CheckCircle, Shield, 
  Flame, Stethoscope, Activity, AlertTriangle, Copy, Check, Crosshair
} from 'lucide-react';

const CATEGORY_META = {
  Medical: { icon: Stethoscope, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)', border: 'rgba(16, 185, 129, 0.3)' },
  Fire: { icon: Flame, color: '#f97316', bg: 'rgba(249, 115, 22, 0.12)', border: 'rgba(249, 115, 22, 0.3)' },
  Security: { icon: Shield, color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.12)', border: 'rgba(6, 182, 212, 0.3)' },
  Earthquake: { icon: Activity, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)', border: 'rgba(168, 85, 247, 0.3)' },
  Default: { icon: AlertTriangle, color: '#e11d48', bg: 'rgba(225, 29, 72, 0.12)', border: 'rgba(225, 29, 72, 0.3)' }
};

export default function IncidentCard({ incident, onUpdateStatus, onFocusMap, index = 0 }) {
  const [copied, setCopied] = useState(false);
  const isResolved = incident.status === 'Resolved';
  const isResponding = incident.status === 'Responding';
  const isCritical = incident.priority === 'CRITICAL';

  const catMeta = CATEGORY_META[incident.type] || CATEGORY_META.Default;
  const CategoryIcon = catMeta.icon;

  const handleCopyCoords = (e) => {
    e.stopPropagation();
    if (!incident.coords) return;
    navigator.clipboard.writeText(incident.coords);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div
      className={`tactical-card ${isResolved ? 'is-resolved' : ''} ${isCritical && !isResolved ? 'is-critical' : ''}`}
      style={{ animationDelay: `${index * 0.05}s` }}
    >
      {/* Corner HUD Accent Brackets */}
      <span className="hud-corner top-left" />
      <span className="hud-corner top-right" />
      <span className="hud-corner bottom-left" />
      <span className="hud-corner bottom-right" />

      {/* Header bar: priority beacon, category pill, lifecycle and timestamp */}
      <div className="tactical-card-header">
        <div className="tactical-card-tags">
          {/* Priority Beacon */}
          <span className={`priority-tag ${isCritical ? 'critical' : 'stable'}`}>
            <span className="beacon-ping" />
            {incident.priority || 'EVALUATING'}
          </span>

          {/* Category Tag */}
          <span 
            className="category-tag"
            style={{ color: catMeta.color, background: catMeta.bg, borderColor: catMeta.border }}
          >
            <CategoryIcon size={12} />
            <span>{incident.type || 'Emergency'}</span>
          </span>

          {/* Status Badge */}
          <span className={`status-pill status-${(incident.status || 'pending').toLowerCase()}`}>
            {incident.status || 'Pending'}
          </span>
        </div>

        {/* Time / Caller */}
        <div className="tactical-card-time">
          <Clock size={12} />
          <span>{incident.timestamp || 'Live'}</span>
        </div>
      </div>

      <div className="tactical-card-body">
        {/* Media Preview if attached */}
        {incident.media && (
          <div className="tactical-media-frame">
            <img src={incident.media} alt="Crisis Evidence" />
            <span className="media-overlay-tag">EVIDENCE CAPTURE</span>
          </div>
        )}

        <div className="tactical-card-info">
          {/* Location & GPS */}
          <div className="tactical-location-row">
            <h3 className="tactical-location-title">{incident.location}</h3>
            {incident.coords && (
              <div className="coords-action-group">
                <button
                  type="button"
                  onClick={handleCopyCoords}
                  className="tactical-coords-pill"
                  title="Copy GPS coordinates"
                >
                  {copied ? <Check size={12} className="text-emerald-400" /> : <Copy size={12} />}
                  <span>{incident.coords}</span>
                </button>

                {onFocusMap && (
                  <button
                    type="button"
                    onClick={() => onFocusMap(incident)}
                    className="tactical-map-btn"
                    title="Focus on Radar Map"
                  >
                    <Crosshair size={14} />
                    <span>Radar</span>
                  </button>
                )}

                <a
                  href={`https://www.google.com/maps?q=${incident.coords}`}
                  target="_blank"
                  rel="noreferrer"
                  className="tactical-map-btn"
                  title="Open External Google Map"
                >
                  <MapPin size={14} />
                </a>
              </div>
            )}
          </div>

          {/* AI Multilingual Translation */}
          {incident.translatedDesc && (
            <div className="tactical-translation-box">
              <Languages size={14} className="translation-icon" />
              <div className="translation-body">
                <span className="translation-label">Multilingual Feed:</span>
                <span className="translation-text">"{incident.translatedDesc}"</span>
              </div>
            </div>
          )}

          {/* Gemini AI Tactical Advice Panel */}
          {incident.aiAdvice && (
            <div className="tactical-ai-dispatch">
              <div className="ai-dispatch-header">
                <Zap size={14} className="ai-icon-glow" />
                <span className="ai-dispatch-title">GEMINI 1.5 TACTICAL DISPATCH DIRECTIVE</span>
                <span className="ai-dispatch-model">AI VERIFIED</span>
              </div>
              <p className="ai-dispatch-directive">{incident.aiAdvice}</p>
            </div>
          )}
        </div>
      </div>

      {/* Incident Lifecycle Action Footer */}
      <div className="tactical-card-footer">
        <div className="lifecycle-stepper">
          <span className={`step-dot ${!isResponding && !isResolved ? 'active' : 'completed'}`} title="Triage Stage" />
          <span className="step-connector" />
          <span className={`step-dot ${isResponding ? 'active' : isResolved ? 'completed' : ''}`} title="Units Responding" />
          <span className="step-connector" />
          <span className={`step-dot ${isResolved ? 'completed' : ''}`} title="Resolved & Secured" />
        </div>

        <div className="tactical-action-buttons">
          {incident.status === 'Pending' && (
            <button
              onClick={() => onUpdateStatus(incident.firebaseId || incident.id, 'Responding')}
              className="action-btn dispatch-btn"
            >
              <Shield size={14} />
              <span>Acknowledge & Dispatch</span>
            </button>
          )}

          {incident.status === 'Responding' && (
            <button
              onClick={() => onUpdateStatus(incident.firebaseId || incident.id, 'Resolved')}
              className="action-btn resolve-btn"
            >
              <CheckCircle size={14} />
              <span>Mark Stabilized</span>
            </button>
          )}

          {incident.status === 'Resolved' && (
            <button
              onClick={() => onUpdateStatus(incident.firebaseId || incident.id, 'Responding')}
              className="action-btn reopen-btn"
            >
              <span>Reopen Triage</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

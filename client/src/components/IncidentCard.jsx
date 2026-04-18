import React from 'react';
import { Clock, MapPin, Languages, Zap, CheckCircle, Shield } from 'lucide-react';

const SEVERITY_STYLES = {
  CRITICAL: { border: '#ef4444', bg: 'rgba(239, 68, 68, 0.08)', text: '#ef4444', pulse: true },
  STABLE: { border: '#f59e0b', bg: 'rgba(245, 158, 11, 0.08)', text: '#f59e0b', pulse: false },
};

const STATUS_STYLES = {
  Pending: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)', border: 'rgba(245, 158, 11, 0.3)' },
  Responding: { color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)', border: 'rgba(59, 130, 246, 0.3)' },
  Resolved: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)', border: 'rgba(34, 197, 94, 0.3)' },
};

export default function IncidentCard({ incident, onUpdateStatus, index = 0 }) {
  const sev = SEVERITY_STYLES[incident.priority] || SEVERITY_STYLES.STABLE;
  const stat = STATUS_STYLES[incident.status] || STATUS_STYLES.Pending;
  const isResolved = incident.status === 'Resolved';

  return (
    <div
      className={`incident-card animate-slide-up ${isResolved ? 'resolved' : ''} ${sev.pulse ? 'severity-pulse' : ''}`}
      style={{
        animationDelay: `${index * 0.08}s`,
        borderLeftColor: isResolved ? 'transparent' : sev.border,
      }}
    >
      <div className="incident-content">
        {/* Media */}
        {incident.media && (
          <div className="incident-media">
            <img src={incident.media} alt="Evidence" />
          </div>
        )}

        {/* Details */}
        <div className="incident-details">
          {/* Top bar: status + timestamp + map */}
          <div className="incident-meta">
            <div className="incident-meta-left">
              <span
                className="incident-status-badge"
                style={{ color: stat.color, background: stat.bg, borderColor: stat.border }}
              >
                {incident.status}
              </span>
              {incident.priority && (
                <span
                  className="incident-severity-badge"
                  style={{ color: sev.text, background: sev.bg }}
                >
                  {incident.priority}
                </span>
              )}
              <span className="incident-time">
                <Clock size={12} />
                {incident.timestamp}
              </span>
            </div>
            {incident.coords && (
              <a
                href={`https://www.google.com/maps?q=${incident.coords}`}
                target="_blank"
                rel="noreferrer"
                className="incident-map-btn"
              >
                <MapPin size={16} />
              </a>
            )}
          </div>

          {/* Location + Type */}
          <h3 className="incident-title">
            {incident.location}
            {incident.type && (
              <>
                <span className="incident-title-sep">/</span>
                <span className="incident-type">{incident.type}</span>
              </>
            )}
          </h3>

          {/* AI Translation */}
          {incident.translatedDesc && (
            <div className="incident-translation">
              <Languages size={14} />
              <span className="incident-translation-label">AI Translation:</span>
              <span className="incident-translation-text">"{incident.translatedDesc}"</span>
            </div>
          )}

          {/* AI Advice */}
          {incident.aiAdvice && (
            <div className="incident-ai-panel">
              <Zap size={24} className="incident-ai-icon" />
              <div>
                <p className="incident-ai-label">Gemini Tactical Dispatch</p>
                <p className="incident-ai-text">{incident.aiAdvice}</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Actions */}
      {!isResolved && (
        <div className="incident-actions">
          {incident.status === 'Pending' && (
            <button
              onClick={() => onUpdateStatus(incident.firebaseId || incident.id, 'Responding')}
              className="incident-action-btn acknowledge"
            >
              <Shield size={16} />
              Acknowledge
            </button>
          )}
          <button
            onClick={() => onUpdateStatus(incident.firebaseId || incident.id, 'Resolved')}
            className="incident-action-btn resolve"
          >
            <CheckCircle size={16} />
            Resolve
          </button>
        </div>
      )}
    </div>
  );
}

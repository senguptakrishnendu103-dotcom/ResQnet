import React, { useState, useMemo } from 'react';
import { 
  Activity, Megaphone, AlertTriangle, CheckCircle, Clock, 
  Loader2, Radio, LayoutGrid, Columns3, Split, Search, 
  Filter, ShieldAlert, Sparkles, Send, Crosshair, ChevronRight
} from 'lucide-react';
import IncidentCard from './IncidentCard';
import MapView from './MapView';
import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

const QUICK_BROADCASTS = [
  '⚡ Severe Flood Warning: Evacuate immediately to designated relief shelters.',
  '🚨 Seismic Aftershock Alert: Shelter in place under reinforced structures.',
  '🚑 Medical Surge Units Dispatched to Sector Coordinates.',
  '⛔ Route Hazard: Main arterial roadway obstructed. Avoid transit corridor.'
];

export default function StaffHub({ incidents = [] }) {
  const [broadcastText, setBroadcastText] = useState('');
  const [sending, setSending] = useState(false);
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' | 'split' | 'grid'
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedPriority, setSelectedPriority] = useState('ALL');
  const [focusedIncident, setFocusedIncident] = useState(null);

  const handleBroadcast = async (customMessage = null) => {
    const textToSend = (customMessage || broadcastText).trim();
    if (!textToSend) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'broadcasts'), {
        message: textToSend,
        time: new Date().toLocaleTimeString(),
        createdAt: serverTimestamp()
      });
      if (!customMessage) setBroadcastText('');
      alert("Emergency broadcast alert transmitted to all connected civilians.");
    } catch (error) {
      console.error("Error sending broadcast:", error);
      alert("Failed to transmit broadcast alert.");
    } finally {
      setSending(false);
    }
  };

  const handleUpdateStatus = async (firebaseId, status) => {
    try {
      const docRef = doc(db, 'incidents', firebaseId);
      await updateDoc(docRef, { status: status });
    } catch (error) {
      console.error("Error updating status:", error);
      alert("Failed to update incident status.");
    }
  };

  const handleFocusMap = (incident) => {
    setFocusedIncident(incident);
    if (viewMode !== 'split') {
      setViewMode('split');
    }
  };

  // Filtered incidents
  const filteredIncidents = useMemo(() => {
    return incidents.filter(inc => {
      // Search query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const loc = (inc.location || '').toLowerCase();
        const desc = (inc.description || '').toLowerCase();
        const trans = (inc.translatedDesc || '').toLowerCase();
        const type = (inc.type || '').toLowerCase();
        if (!loc.includes(query) && !desc.includes(query) && !trans.includes(query) && !type.includes(query)) {
          return false;
        }
      }

      // Priority filter
      if (selectedPriority !== 'ALL' && inc.priority !== selectedPriority) {
        return false;
      }

      // Category filter
      if (selectedCategory !== 'ALL' && inc.type !== selectedCategory) {
        return false;
      }

      return true;
    });
  }, [incidents, searchQuery, selectedPriority, selectedCategory]);

  // Kanban column buckets
  const pendingIncidents = filteredIncidents.filter(i => i.status === 'Pending');
  const respondingIncidents = filteredIncidents.filter(i => i.status === 'Responding');
  const resolvedIncidents = filteredIncidents.filter(i => i.status === 'Resolved');

  const criticalTotal = incidents.filter(i => i.priority === 'CRITICAL' && i.status !== 'Resolved').length;

  return (
    <div className="tactical-staff-hub animate-fade-in">
      {/* Commander Deck Top Banner */}
      <header className="tactical-deck-header">
        <div className="deck-header-top">
          <div className="deck-title-group">
            <div className="deck-icon-shield">
              <ShieldAlert size={28} className="shield-pulse-icon" />
            </div>
            <div>
              <div className="deck-status-line">
                <span className="live-telemetry-ping" />
                <span className="deck-badge-status">DEFCON 1 • COMMAND HEADQUARTERS</span>
                <span className="deck-sdg-tag">UN SDG 11.5 DISASTER RESPONSE</span>
              </div>
              <h2 className="deck-main-title">Tactical Emergency Command Hub</h2>
            </div>
          </div>

          {/* Quick Metrics Ribbon */}
          <div className="deck-metrics-ribbon">
            <div className="deck-metric-card critical">
              <span className="metric-tag">CRITICAL TRIAGE</span>
              <span className="metric-number">{criticalTotal}</span>
            </div>
            <div className="deck-metric-card responding">
              <span className="metric-tag">UNITS ENGAGED</span>
              <span className="metric-number">{respondingIncidents.length}</span>
            </div>
            <div className="deck-metric-card resolved">
              <span className="metric-tag">STABILIZED</span>
              <span className="metric-number">{resolvedIncidents.length}</span>
            </div>
            <div className="deck-metric-card total">
              <span className="metric-tag">TOTAL INCIDENTS</span>
              <span className="metric-number">{incidents.length}</span>
            </div>
          </div>
        </div>

        {/* Tactical Mass Alert Broadcaster */}
        <div className="tactical-broadcaster-zone">
          <div className="broadcast-input-bar">
            <div className="broadcast-icon-box">
              <Megaphone size={18} className="text-rose-500 animate-pulse" />
            </div>
            <input
              value={broadcastText}
              onChange={e => setBroadcastText(e.target.value)}
              className="broadcast-text-input"
              placeholder="Transmit high-priority alert to all connected civilian screens..."
              onKeyDown={e => e.key === 'Enter' && handleBroadcast()}
            />
            <button
              onClick={() => handleBroadcast()}
              className="broadcast-transmit-btn"
              disabled={sending || !broadcastText.trim()}
            >
              {sending ? (
                <Loader2 size={16} className="animate-spin" />
              ) : (
                <>
                  <Send size={16} />
                  <span>BROADCAST DISPATCH</span>
                </>
              )}
            </button>
          </div>

          {/* Quick Preset Alert Chips */}
          <div className="broadcast-presets-row">
            <span className="presets-label">Tactical Presets:</span>
            {QUICK_BROADCASTS.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setBroadcastText(preset)}
                className="preset-chip-btn"
                title="Click to insert preset message"
              >
                {preset.slice(0, 42)}...
              </button>
            ))}
          </div>
        </div>

        {/* View Switcher & Filter Toolbar */}
        <div className="deck-toolbar">
          {/* Mode Switcher */}
          <div className="deck-view-switcher">
            <button
              type="button"
              onClick={() => setViewMode('kanban')}
              className={`view-mode-btn ${viewMode === 'kanban' ? 'active' : ''}`}
            >
              <Columns3 size={16} />
              <span>Triage Board</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('split')}
              className={`view-mode-btn ${viewMode === 'split' ? 'active' : ''}`}
            >
              <Split size={16} />
              <span>Tactical Split (Map + Feed)</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`view-mode-btn ${viewMode === 'grid' ? 'active' : ''}`}
            >
              <LayoutGrid size={16} />
              <span>Command Feed</span>
            </button>
          </div>

          {/* Search Input */}
          <div className="deck-search-box">
            <Search size={16} className="search-icon" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Filter by sector, landmark, or description..."
              className="deck-search-input"
            />
          </div>

          {/* Category Dropdown */}
          <div className="deck-filter-group">
            <Filter size={14} className="filter-icon" />
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="deck-select"
            >
              <option value="ALL">All Categories</option>
              <option value="Medical">Medical</option>
              <option value="Fire">Fire</option>
              <option value="Security">Security</option>
              <option value="Earthquake">Earthquake</option>
            </select>

            <select
              value={selectedPriority}
              onChange={e => setSelectedPriority(e.target.value)}
              className="deck-select"
            >
              <option value="ALL">All Priorities</option>
              <option value="CRITICAL">Critical Only</option>
              <option value="STABLE">Stable Only</option>
            </select>
          </div>
        </div>
      </header>

      {/* Main Content Area based on View Mode */}
      <main className="deck-view-body">
        {/* VIEW 1: TRIAGE KANBAN BOARD */}
        {viewMode === 'kanban' && (
          <div className="kanban-board-grid">
            {/* Column 1: Critical Triage */}
            <div className="kanban-column pending-column">
              <div className="kanban-column-header">
                <div className="column-title-left">
                  <span className="column-status-indicator pending-dot" />
                  <h3>Pending Triage</h3>
                </div>
                <span className="column-badge-counter">{pendingIncidents.length}</span>
              </div>
              <div className="kanban-cards-stack">
                {pendingIncidents.length === 0 ? (
                  <div className="kanban-empty-dropzone">
                    <CheckCircle size={32} className="text-slate-600 mb-2" />
                    <p>All incoming reports triaged</p>
                  </div>
                ) : (
                  pendingIncidents.map((inc, i) => (
                    <IncidentCard
                      key={inc.firebaseId || inc.id}
                      incident={inc}
                      onUpdateStatus={handleUpdateStatus}
                      onFocusMap={handleFocusMap}
                      index={i}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Column 2: Units Responding */}
            <div className="kanban-column responding-column">
              <div className="kanban-column-header">
                <div className="column-title-left">
                  <span className="column-status-indicator responding-dot" />
                  <h3>Active Responders</h3>
                </div>
                <span className="column-badge-counter">{respondingIncidents.length}</span>
              </div>
              <div className="kanban-cards-stack">
                {respondingIncidents.length === 0 ? (
                  <div className="kanban-empty-dropzone">
                    <Radio size={32} className="text-slate-600 mb-2" />
                    <p>No active units deployed</p>
                  </div>
                ) : (
                  respondingIncidents.map((inc, i) => (
                    <IncidentCard
                      key={inc.firebaseId || inc.id}
                      incident={inc}
                      onUpdateStatus={handleUpdateStatus}
                      onFocusMap={handleFocusMap}
                      index={i}
                    />
                  ))
                )}
              </div>
            </div>

            {/* Column 3: Resolved & Stabilized */}
            <div className="kanban-column resolved-column">
              <div className="kanban-column-header">
                <div className="column-title-left">
                  <span className="column-status-indicator resolved-dot" />
                  <h3>Stabilized Cases</h3>
                </div>
                <span className="column-badge-counter">{resolvedIncidents.length}</span>
              </div>
              <div className="kanban-cards-stack">
                {resolvedIncidents.length === 0 ? (
                  <div className="kanban-empty-dropzone">
                    <CheckCircle size={32} className="text-slate-600 mb-2" />
                    <p>No cleared incidents yet</p>
                  </div>
                ) : (
                  resolvedIncidents.map((inc, i) => (
                    <IncidentCard
                      key={inc.firebaseId || inc.id}
                      incident={inc}
                      onUpdateStatus={handleUpdateStatus}
                      onFocusMap={handleFocusMap}
                      index={i}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: TACTICAL SPLIT (MAP + FEED) */}
        {viewMode === 'split' && (
          <div className="deck-split-layout">
            <div className="split-map-panel">
              <MapView
                incidents={incidents}
                focusedIncident={focusedIncident}
                onSelectIncident={(inc) => setFocusedIncident(inc)}
                compact={true}
              />
            </div>
            <div className="split-feed-panel">
              <div className="split-feed-header">
                <div className="split-header-info">
                  <Activity size={18} className="text-rose-500 animate-pulse" />
                  <h4>Live Incident Dispatch Stream</h4>
                </div>
                <span className="split-count-badge">{filteredIncidents.length} Incidents</span>
              </div>
              <div className="split-feed-list">
                {filteredIncidents.length === 0 ? (
                  <div className="deck-empty-state">
                    <Activity size={40} className="empty-icon" />
                    <p>No incidents matching tactical filters</p>
                  </div>
                ) : (
                  filteredIncidents.map((inc, i) => (
                    <IncidentCard
                      key={inc.firebaseId || inc.id}
                      incident={inc}
                      onUpdateStatus={handleUpdateStatus}
                      onFocusMap={handleFocusMap}
                      index={i}
                    />
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 3: COMMAND FEED (GRID VIEW) */}
        {viewMode === 'grid' && (
          <div className="deck-grid-layout">
            {filteredIncidents.length === 0 ? (
              <div className="deck-empty-state">
                <Activity size={48} className="empty-icon" />
                <p>Standing by for incoming incident dispatches...</p>
              </div>
            ) : (
              <div className="deck-cards-matrix">
                {filteredIncidents.map((inc, i) => (
                  <IncidentCard
                    key={inc.firebaseId || inc.id}
                    incident={inc}
                    onUpdateStatus={handleUpdateStatus}
                    onFocusMap={handleFocusMap}
                    index={i}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

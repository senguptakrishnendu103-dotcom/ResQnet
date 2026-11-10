import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import CosmicToggle from './CosmicToggle';
import { ShieldAlert, LogOut, User, Shield, Radio, Map, BarChart3, AlertTriangle, Activity, Building2 } from 'lucide-react';

export default function Navbar({ view, setView, isConnected, sectorMode = 'emergency', setSectorMode }) {
  const { user, logout } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  const getTabs = () => {
    if (sectorMode === 'hospitality') {
      return [
        { id: 'hospitality', label: 'Beds & Shelters', icon: Building2, staffOnly: false },
        { id: 'map', label: 'Tactical Map', icon: Map, staffOnly: false },
        { id: 'analytics', label: 'Analytics', icon: BarChart3, staffOnly: false },
        { id: 'staff', label: 'Command Hub', icon: Activity, staffOnly: true },
      ];
    }
    return [
      { id: 'guest', label: 'SOS', icon: AlertTriangle, staffOnly: false },
      { id: 'hospitality', label: 'Care Grid', icon: Building2, staffOnly: false },
      { id: 'map', label: 'Map', icon: Map, staffOnly: false },
      { id: 'analytics', label: 'Analytics', icon: BarChart3, staffOnly: false },
      { id: 'staff', label: 'Command Hub', icon: Activity, staffOnly: true },
    ];
  };

  const visibleTabs = getTabs().filter(tab => !tab.staffOnly || user?.role === 'staff');

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        {/* Brand */}
        <div className="navbar-brand">
          <div className="navbar-logo-pulse">
            <ShieldAlert size={28} />
          </div>
          <h1 className="navbar-title">ResQnet</h1>
          <div className={`navbar-status ${isConnected ? '' : 'disconnected'}`}>
            <Radio size={10} className={isConnected ? 'animate-pulse' : ''} />
            <span>{isConnected ? 'LIVE' : 'OFFLINE'}</span>
          </div>
        </div>

        {/* Cosmic Sector Switcher */}
        {setSectorMode && (
          <div className="cosmic-toggle-wrapper">
            <span className={`cosmic-toggle-label ${sectorMode === 'emergency' ? 'active' : ''}`}>
              <AlertTriangle size={12} className={sectorMode === 'emergency' ? 'text-rose-400' : ''} />
              <span className="hidden sm:inline">Crisis</span>
            </span>
            <CosmicToggle
              checked={sectorMode === 'hospitality'}
              onChange={(checked) => {
                const newMode = checked ? 'hospitality' : 'emergency';
                setSectorMode(newMode);
                if (checked && view === 'guest') {
                  setView('hospitality');
                } else if (!checked && view === 'hospitality') {
                  setView('guest');
                }
              }}
            />
            <span className={`cosmic-toggle-label ${sectorMode === 'hospitality' ? 'active' : ''}`}>
              <Building2 size={12} className={sectorMode === 'hospitality' ? 'text-cyan-400' : ''} />
              <span className="hidden sm:inline">Care Hub</span>
            </span>
          </div>
        )}

        {/* View Toggle — multi-tab */}
        <div className="navbar-tabs">
          {visibleTabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setView(tab.id)}
              className={`navbar-tab-btn ${view === tab.id ? 'active' : ''}`}
            >
              <tab.icon size={14} />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* User section */}
        <div className="navbar-user">
          <div className="navbar-user-info">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="navbar-avatar" />
            ) : (
              <div className="navbar-avatar-placeholder">
                <User size={16} />
              </div>
            )}
            <div className="navbar-user-details">
              <span className="navbar-user-name">{user?.name}</span>
              <span className={`navbar-role-badge ${user?.role === 'staff' ? 'staff' : 'guest'}`}>
                <Shield size={10} />
                {user?.role === 'staff' ? 'Commander' : 'Civilian'}
              </span>
            </div>
          </div>
          <button
            onClick={() => setShowLogout(!showLogout)}
            className="navbar-logout-btn"
            title="Sign out"
          >
            <LogOut size={18} />
          </button>
          {showLogout && (
            <div className="navbar-logout-confirm animate-fade-in">
              <p>Sign out?</p>
              <div className="navbar-logout-actions">
                <button onClick={handleLogout} className="confirm-yes">Yes</button>
                <button onClick={() => setShowLogout(false)} className="confirm-no">Cancel</button>
              </div>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogOut, User, Shield, Radio, Map, BarChart3, AlertTriangle, Activity } from 'lucide-react';

const TABS = [
  { id: 'guest', label: 'SOS', icon: AlertTriangle, staffOnly: false },
  { id: 'staff', label: 'Command Hub', icon: Activity, staffOnly: false },
  { id: 'map', label: 'Map', icon: Map, staffOnly: false },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, staffOnly: false },
];

export default function Navbar({ view, setView, isConnected }) {
  const { user, logout } = useAuth();
  const [showLogout, setShowLogout] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

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

        {/* View Toggle — multi-tab */}
        <div className="navbar-tabs">
          {TABS.map((tab) => (
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

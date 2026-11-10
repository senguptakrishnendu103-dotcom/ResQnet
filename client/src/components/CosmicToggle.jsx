import React from 'react';

export default function CosmicToggle({ checked, onChange, compact = true, className = '' }) {
  return (
    <label className={`cosmic-toggle ${compact ? 'nav-compact' : ''} ${className}`}>
      <input
        type="checkbox"
        className="toggle"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <div className="slider">
        <div className="cosmos" />
        <div className="toggle-orb">
          <div className="inner-orb" />
          <div className="ring" />
        </div>
        <div className="energy-line" />
        <div className="energy-line" />
        <div className="energy-line" />
        <div className="particles">
          <div className="particle" style={{ '--angle': '0deg' }} />
          <div className="particle" style={{ '--angle': '60deg' }} />
          <div className="particle" style={{ '--angle': '120deg' }} />
          <div className="particle" style={{ '--angle': '180deg' }} />
          <div className="particle" style={{ '--angle': '240deg' }} />
          <div className="particle" style={{ '--angle': '300deg' }} />
        </div>
      </div>
    </label>
  );
}

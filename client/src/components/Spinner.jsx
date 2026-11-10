import React from 'react';

export default function Spinner({ size = 'default', className = '' }) {
  return (
    <div className={`spinner ${size === 'sm' ? 'spinner-sm' : ''} ${className}`}>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
    </div>
  );
}


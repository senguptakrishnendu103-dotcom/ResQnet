import React, { useEffect, useState } from 'react';
import { Megaphone, X } from 'lucide-react';

export default function BroadcastOverlay({ broadcast, onDismiss }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (broadcast) {
      setVisible(true);
      const timer = setTimeout(() => {
        setVisible(false);
        setTimeout(onDismiss, 400); // wait for exit animation
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [broadcast, onDismiss]);

  if (!broadcast) return null;

  return (
    <div className={`broadcast-overlay ${visible ? 'visible' : 'hidden'}`}>
      <div className="broadcast-card">
        <button onClick={() => { setVisible(false); setTimeout(onDismiss, 300); }} className="broadcast-close">
          <X size={20} />
        </button>
        <div className="broadcast-icon-container">
          <Megaphone size={32} />
        </div>
        <div className="broadcast-content">
          <p className="broadcast-label">
            Official Command Dispatch • {broadcast.time}
          </p>
          <p className="broadcast-message">{broadcast.message}</p>
        </div>
      </div>
    </div>
  );
}

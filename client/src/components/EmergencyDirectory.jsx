import React from 'react';
import { PhoneCall, Phone } from 'lucide-react';

const NUMBERS = [
  { name: 'Integrated Emergency', number: '112', color: '#ef4444' },
  { name: 'Women Helpline', number: '1091', color: '#ec4899' },
  { name: 'Child Helpline', number: '1098', color: '#f59e0b' },
  { name: 'Fire Department', number: '101', color: '#f97316' },
  { name: 'Ambulance', number: '108', color: '#22c55e' },
  { name: 'Police', number: '100', color: '#3b82f6' },
  { name: 'Disaster Management', number: '1078', color: '#8b5cf6' },
  { name: 'Senior Citizens', number: '14567', color: '#06b6d4' },
];

export default function EmergencyDirectory() {
  return (
    <div className="directory-card animate-slide-up" style={{ animationDelay: '0.1s' }}>
      <div className="directory-header">
        <PhoneCall size={16} className="directory-header-icon" />
        <span>India Emergency Directory</span>
      </div>
      <div className="directory-list">
        {NUMBERS.map((item, i) => (
          <a
            key={item.number}
            href={`tel:${item.number}`}
            className="directory-item"
            style={{ animationDelay: `${i * 0.05}s` }}
          >
            <div className="directory-item-left">
              <div className="directory-item-dot" style={{ background: item.color }} />
              <span className="directory-item-name">{item.name}</span>
            </div>
            <div className="directory-item-right">
              <span className="directory-item-number" style={{ color: item.color }}>{item.number}</span>
              <Phone size={14} className="directory-phone-icon" />
            </div>
          </a>
        ))}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { Activity, Megaphone, AlertTriangle, CheckCircle, Clock, Loader2 } from 'lucide-react';
import IncidentCard from './IncidentCard';import { db } from '../firebase';
import { collection, addDoc, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
export default function StaffHub({ incidents }) {
  const [broadcastText, setBroadcastText] = useState('');
  const [sending, setSending] = useState(false);

  const handleBroadcast = async () => {
    if (!broadcastText.trim()) return;
    setSending(true);
    try {
      await addDoc(collection(db, 'broadcasts'), {
        message: broadcastText,
        time: new Date().toLocaleTimeString(),
        createdAt: serverTimestamp()
      });
      setBroadcastText('');
      alert("Broadcast alert sent to all citizens successfully!");
    } catch (error) {
      console.error("Error sending broadcast:", error);
      alert("Failed to send broadcast.");
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
      alert("Failed to update status.");
    }
  };

  const pendingCount = incidents.filter(i => i.status === 'Pending').length;
  const respondingCount = incidents.filter(i => i.status === 'Responding').length;
  const resolvedCount = incidents.filter(i => i.status === 'Resolved').length;

  return (
    <div className="staff-hub animate-fade-in">
      {/* Header with stats */}
      <header className="staff-header">
        <div className="staff-header-top">
          <div className="staff-header-title">
            <Activity size={28} className="staff-header-icon" />
            <div>
              <h2>Intelligence Hub</h2>
              <p className="staff-sdg-badge">UN SDG Goal 11.5 Active</p>
            </div>
          </div>

          {/* Broadcast input */}
          <div className="staff-broadcast-box">
            <input
              value={broadcastText}
              onChange={e => setBroadcastText(e.target.value)}
              className="staff-broadcast-input"
              placeholder="Broadcast mass alert..."
              onKeyDown={e => e.key === 'Enter' && handleBroadcast()}
            />
            <button
              onClick={handleBroadcast}
              className="staff-broadcast-btn"
              disabled={sending}
            >
              {sending ? <Loader2 size={18} className="animate-spin" /> : <Megaphone size={18} />}
            </button>
          </div>
        </div>

        {/* Stats bar */}
        <div className="staff-stats">
          <div className="staff-stat pending">
            <AlertTriangle size={16} />
            <span className="staff-stat-count">{pendingCount}</span>
            <span className="staff-stat-label">Pending</span>
          </div>
          <div className="staff-stat responding">
            <Clock size={16} />
            <span className="staff-stat-count">{respondingCount}</span>
            <span className="staff-stat-label">Responding</span>
          </div>
          <div className="staff-stat resolved">
            <CheckCircle size={16} />
            <span className="staff-stat-count">{resolvedCount}</span>
            <span className="staff-stat-label">Resolved</span>
          </div>
          <div className="staff-stat total">
            <Activity size={16} />
            <span className="staff-stat-count">{incidents.length}</span>
            <span className="staff-stat-label">Total</span>
          </div>
        </div>
      </header>

      {/* Incident list */}
      <div className="staff-incidents">
        {incidents.length === 0 ? (
          <div className="staff-empty">
            <Activity size={48} className="staff-empty-icon" />
            <p>Standing by for incidents...</p>
          </div>
        ) : (
          incidents.map((inc, i) => (
            <IncidentCard
              key={inc.firebaseId || inc.id}
              incident={inc}
              onUpdateStatus={handleUpdateStatus}
              index={i}
            />
          ))
        )}
      </div>
    </div>
  );
}

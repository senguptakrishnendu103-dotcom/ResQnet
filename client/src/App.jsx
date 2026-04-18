import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { db } from './firebase';
import { collection, onSnapshot, query, orderBy, serverTimestamp, addDoc, limit } from 'firebase/firestore';
import LandingPage from './components/LandingPage';
import LoginPage from './components/LoginPage';
import Navbar from './components/Navbar';
import SOSForm from './components/SOSForm';
import EmergencyDirectory from './components/EmergencyDirectory';
import StaffHub from './components/StaffHub';
import MapView from './components/MapView';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import BroadcastOverlay from './components/BroadcastOverlay';
import { Radio, Loader2 } from 'lucide-react';

const SERVER_URL = import.meta.env.VITE_SERVER_URL || 'https://resqnet-kpo0.onrender.com';

function AppContent() {
  const { user, loading } = useAuth();
  const [view, setView] = useState('guest');
  const [incidents, setIncidents] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [broadcast, setBroadcast] = useState(null);
  const [form, setForm] = useState({ location: '', description: '', media: null, coords: null });
  const [showLogin, setShowLogin] = useState(false);

  useEffect(() => {
    if (!user) return;

    setView(user.role === 'staff' ? 'staff' : 'guest');

    // Firestore Listeners
    const q = query(collection(db, 'incidents'), orderBy('createdAt', 'desc'));
    const unsubscribeIncidents = onSnapshot(q, (snapshot) => {
      const incList = snapshot.docs.map(doc => ({ firebaseId: doc.id, ...doc.data() }));
      setIncidents(incList);

      if (user?.role === 'staff') {
        snapshot.docChanges().forEach((change) => {
          if (change.type === 'added' && !snapshot.metadata.hasPendingWrites) {
            const newInc = change.doc.data();
            playEmergencyChime();
            if (newInc.location) announceEmergency(newInc.location);
          }
        });
      }
    });

    let isInitialLoad = true;
    const bq = query(collection(db, 'broadcasts'), orderBy('createdAt', 'desc'), limit(1));
    const unsubscribeBroadcasts = onSnapshot(bq, (snapshot) => {
      // Ignore the historical broadcast on initial mount so it doesn't spam the user
      if (isInitialLoad) {
        isInitialLoad = false;
        return;
      }
      
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const newBcast = change.doc.data();
          setBroadcast(newBcast);
          playEmergencyChime();
        }
      });
    });

    // GPS
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setForm(prev => ({ ...prev, coords: `${pos.coords.latitude}, ${pos.coords.longitude}` })),
      () => console.log('GPS unavailable')
    );

    return () => {
      unsubscribeIncidents();
      unsubscribeBroadcasts();
      if (watchId) navigator.geolocation.clearWatch(watchId);
    };
  }, [user]);

  const playEmergencyChime = () => {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.value = 880;
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch {}
  };

  const announceEmergency = (loc) => {
    try {
      window.speechSynthesis.speak(new SpeechSynthesisUtterance(`Emergency alert at ${loc}`));
    } catch {}
  };

  const triggerSOS = async (e) => {
    e.preventDefault();
    setIsAnalyzing(true);
    
    try {
        const payload = {
            ...form,
            reportedBy: user?.email || 'anonymous',
            status: 'Pending',
            createdAt: serverTimestamp(),
            timestamp: new Date().toLocaleTimeString(),
            aiAdvice: "Pending AI Analysis..."
        };

        const docRef = await addDoc(collection(db, 'incidents'), payload);
        console.log("SOS securely dispatched directly to Firebase:", docRef.id);
        alert("SOS Dispatch Successful!");
    } catch (error) {
         console.error("SOS trigger error:", error);
         alert("Error generating SOS: " + error.message);
    } finally {
      setIsAnalyzing(false);
      setForm(prev => ({ ...prev, description: '', media: null }));
    }
  };

  const dismissBroadcast = useCallback(() => setBroadcast(null), []);

  if (loading) {
    return (
      <div className="app-loading-screen">
        <div className="app-loading-content">
          <Loader2 size={48} className="animate-spin" style={{ color: '#e11d48' }} />
          <p className="app-loading-text">Initializing ResQnet Serverless...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    if (showLogin) {
      return <LoginPage onBack={() => setShowLogin(false)} />;
    }
    return <LandingPage onGetStarted={() => setShowLogin(true)} />;
  }

  return (
    <div className="app-root">
      <BroadcastOverlay broadcast={broadcast} onDismiss={dismissBroadcast} />
      {/* Firebase is serverless, connection is handled natively, hardcode true for UI */}
      <Navbar view={view} setView={setView} isConnected={true} />

      <main className="app-main">
        {view === 'guest' && (
          <div className="guest-layout">
            <div className="guest-main">
              <SOSForm
                form={form}
                setForm={setForm}
                onSubmit={triggerSOS}
                isAnalyzing={isAnalyzing}
              />
            </div>
            <div className="guest-sidebar">
              <EmergencyDirectory />
            </div>
          </div>
        )}

        {view === 'staff' && (
          <StaffHub incidents={incidents} />
        )}

        {view === 'map' && (
          <MapView incidents={incidents} />
        )}

        {view === 'analytics' && (
          <AnalyticsDashboard incidents={incidents} />
        )}
      </main>

      <footer className="app-footer">
        <div className="footer-left">
          <Radio size={10} className="footer-pulse" />
          <span>Integrated Gemini 1.5 Flash AI Core</span>
        </div>
        <span className="footer-right">
          ResQnet | SDG 11: Sustainable Cities & Communities | Solution Challenge 2026
        </span>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
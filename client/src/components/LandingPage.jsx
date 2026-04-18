import React, { useState, useEffect } from 'react';
import { ShieldAlert, Globe, Zap, Radio, MapPin, Languages, Camera, BarChart3, ArrowRight, Heart, Users, Clock, AlertTriangle, Shield, Cpu } from 'lucide-react';

const STATS = [
  { value: '68%', label: 'Emergency calls in developing nations fail to reach responders in time', icon: Clock },
  { value: '14 min', label: 'Average delay in disaster response due to communication barriers', icon: AlertTriangle },
  { value: '3.6B', label: 'People lack access to adequate emergency response systems globally', icon: Users },
  { value: '45%', label: 'Of emergency reports are delayed due to language barriers', icon: Languages },
];

const FEATURES = [
  {
    icon: Zap,
    title: 'AI-Powered Triage',
    desc: 'Gemini 1.5 Flash analyzes every report in real-time — categorizing crisis type, severity, and generating tactical response advice automatically.',
    color: '#e11d48',
  },
  {
    icon: Languages,
    title: 'Multi-Language Intelligence',
    desc: 'Report emergencies in any language. Our AI translates and processes reports breaking communication barriers in critical moments.',
    color: '#8b5cf6',
  },
  {
    icon: MapPin,
    title: 'Live Incident Mapping',
    desc: 'Interactive map visualization shows all active incidents with color-coded severity markers and real-time GPS tracking.',
    color: '#22c55e',
  },
  {
    icon: Camera,
    title: 'Visual Evidence Capture',
    desc: 'Attach photos via camera or upload for AI-powered visual analysis. Gemini processes images to enhance crisis assessment.',
    color: '#f59e0b',
  },
  {
    icon: Radio,
    title: 'Real-Time Coordination',
    desc: 'WebSocket-powered live updates ensure staff and civilians stay synchronized. Broadcast alerts reach everyone instantly.',
    color: '#3b82f6',
  },
  {
    icon: BarChart3,
    title: 'Impact Analytics',
    desc: 'Track response times, resolution rates, and incident patterns. Data-driven insights to continuously improve emergency response.',
    color: '#06b6d4',
  },
];

const GOOGLE_TECH = [
  { name: 'Gemini 1.5 Flash', desc: 'AI crisis triage, categorization, severity analysis & multilingual translation', icon: '🧠' },
  { name: 'Firebase Auth', desc: 'Secure authentication with Google Sign-In and email/password', icon: '🔐' },
  { name: 'Firebase Platform', desc: 'Real-time backend infrastructure and user management', icon: '☁️' },
];

const SDG_TARGETS = [
  { id: '11.5', text: 'Significantly reduce deaths and economic losses from disasters' },
  { id: '11.b', text: 'Implement integrated policies for disaster risk management' },
  { id: '11.7', text: 'Provide universal access to safe and inclusive public spaces' },
];

export default function LandingPage({ onGetStarted }) {
  const [activeFeature, setActiveFeature] = useState(0);
  const [counters, setCounters] = useState({ incidents: 0, response: 0, resolved: 0 });

  useEffect(() => {
    // Animate counters
    const targets = { incidents: 1247, response: 94, resolved: 89 };
    const duration = 2000;
    const steps = 60;
    const interval = duration / steps;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const progress = Math.min(step / steps, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCounters({
        incidents: Math.round(targets.incidents * eased),
        response: Math.round(targets.response * eased),
        resolved: Math.round(targets.resolved * eased),
      });
      if (step >= steps) clearInterval(timer);
    }, interval);

    return () => clearInterval(timer);
  }, []);

  // Auto-rotate features
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveFeature(prev => (prev + 1) % FEATURES.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="landing-page">
      {/* Animated background */}
      <div className="landing-bg-grid" />
      <div className="landing-bg-glow landing-bg-glow-1" />
      <div className="landing-bg-glow landing-bg-glow-2" />
      <div className="landing-bg-glow landing-bg-glow-3" />

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-badge animate-fade-in">
          <Shield size={12} />
          <span>Google Solution Challenge 2026</span>
        </div>

        <div className="landing-hero-logo animate-slide-up">
          <div className="landing-hero-icon-container">
            <ShieldAlert size={56} />
          </div>
        </div>

        <h1 className="landing-hero-title animate-slide-up" style={{ animationDelay: '0.1s' }}>
          Res<span className="text-accent">Q</span>net
        </h1>
        <p className="landing-hero-tagline animate-slide-up" style={{ animationDelay: '0.2s' }}>
          AI-Powered Emergency Response Network
        </p>
        <p className="landing-hero-desc animate-slide-up" style={{ animationDelay: '0.3s' }}>
          Bridging the gap between crisis and response using Gemini AI to save lives through faster, 
          smarter, and more accessible emergency coordination.
        </p>

        <div className="landing-hero-actions animate-slide-up" style={{ animationDelay: '0.4s' }}>
          <button onClick={onGetStarted} className="landing-cta-btn">
            <span>Get Started</span>
            <ArrowRight size={20} />
          </button>
          <div className="landing-sdg-pill">
            <Globe size={14} />
            <span>UN SDG 11: Sustainable Cities & Communities</span>
          </div>
        </div>

        {/* Live counter stats */}
        <div className="landing-live-stats animate-slide-up" style={{ animationDelay: '0.5s' }}>
          <div className="landing-live-stat">
            <span className="landing-live-value">{counters.incidents.toLocaleString()}+</span>
            <span className="landing-live-label">Incidents Processed</span>
          </div>
          <div className="landing-live-divider" />
          <div className="landing-live-stat">
            <span className="landing-live-value">{counters.response}%</span>
            <span className="landing-live-label">Faster Response</span>
          </div>
          <div className="landing-live-divider" />
          <div className="landing-live-stat">
            <span className="landing-live-value">{counters.resolved}%</span>
            <span className="landing-live-label">Resolution Rate</span>
          </div>
        </div>
      </section>

      {/* Problem Statement */}
      <section className="landing-section">
        <div className="landing-section-header">
          <span className="landing-section-tag">The Problem</span>
          <h2 className="landing-section-title">
            Millions are left vulnerable when <span className="text-accent">every second counts</span>
          </h2>
          <p className="landing-section-desc">
            In disaster-prone regions, fragmented communication systems, language barriers, and slow 
            response times cost lives. Traditional emergency systems fail the most vulnerable communities.
          </p>
        </div>

        <div className="landing-stats-grid">
          {STATS.map((stat, i) => (
            <div key={i} className="landing-stat-card animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="landing-stat-icon">
                <stat.icon size={24} />
              </div>
              <div className="landing-stat-value">{stat.value}</div>
              <p className="landing-stat-desc">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="landing-section">
        <div className="landing-section-header">
          <span className="landing-section-tag">Our Solution</span>
          <h2 className="landing-section-title">
            Intelligent emergency response, <span className="text-accent">powered by AI</span>
          </h2>
        </div>

        <div className="landing-features-layout">
          <div className="landing-features-list">
            {FEATURES.map((feat, i) => (
              <div
                key={i}
                className={`landing-feature-item ${activeFeature === i ? 'active' : ''}`}
                onClick={() => setActiveFeature(i)}
              >
                <div className="landing-feature-icon" style={{ color: feat.color, background: `${feat.color}15` }}>
                  <feat.icon size={22} />
                </div>
                <div className="landing-feature-text">
                  <h3>{feat.title}</h3>
                  {activeFeature === i && (
                    <p className="landing-feature-desc animate-slide-down">{feat.desc}</p>
                  )}
                </div>
                <div className="landing-feature-indicator" style={{ background: activeFeature === i ? feat.color : 'transparent' }} />
              </div>
            ))}
          </div>

          <div className="landing-feature-showcase">
            <div className="landing-showcase-card" style={{ borderColor: `${FEATURES[activeFeature].color}30` }}>
              <div className="landing-showcase-icon" style={{ color: FEATURES[activeFeature].color }}>
                {React.createElement(FEATURES[activeFeature].icon, { size: 48 })}
              </div>
              <h3 className="landing-showcase-title">{FEATURES[activeFeature].title}</h3>
              <p className="landing-showcase-desc">{FEATURES[activeFeature].desc}</p>
              <div className="landing-showcase-glow" style={{ background: `${FEATURES[activeFeature].color}10` }} />
            </div>
          </div>
        </div>
      </section>

      {/* Google Technologies */}
      <section className="landing-section">
        <div className="landing-section-header">
          <span className="landing-section-tag">Built With Google</span>
          <h2 className="landing-section-title">
            Powered by <span className="text-accent">Google's ecosystem</span>
          </h2>
        </div>

        <div className="landing-tech-grid">
          {GOOGLE_TECH.map((tech, i) => (
            <div key={i} className="landing-tech-card animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
              <div className="landing-tech-emoji">{tech.icon}</div>
              <h3 className="landing-tech-name">{tech.name}</h3>
              <p className="landing-tech-desc">{tech.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SDG Alignment */}
      <section className="landing-section">
        <div className="landing-section-header">
          <span className="landing-section-tag">Impact Alignment</span>
          <h2 className="landing-section-title">
            Contributing to <span className="text-accent">UN Sustainable Development Goals</span>
          </h2>
        </div>

        <div className="landing-sdg-card">
          <div className="landing-sdg-header">
            <div className="landing-sdg-number">11</div>
            <div>
              <h3 className="landing-sdg-name">Sustainable Cities & Communities</h3>
              <p className="landing-sdg-quote">Make cities and human settlements inclusive, safe, resilient and sustainable</p>
            </div>
          </div>
          <div className="landing-sdg-targets">
            {SDG_TARGETS.map((target, i) => (
              <div key={i} className="landing-sdg-target">
                <span className="landing-sdg-target-id">Target {target.id}</span>
                <p>{target.text}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="landing-cta-section">
        <div className="landing-cta-card">
          <Heart size={32} className="landing-cta-heart" />
          <h2 className="landing-cta-title">Ready to make a difference?</h2>
          <p className="landing-cta-desc">
            Join ResQnet and help build safer, more resilient communities. Every report, every response, every second matters.
          </p>
          <button onClick={onGetStarted} className="landing-cta-btn large">
            <ShieldAlert size={24} />
            <span>Launch ResQnet</span>
            <ArrowRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-footer-inner">
          <div className="landing-footer-brand">
            <ShieldAlert size={18} />
            <span>ResQnet</span>
          </div>
          <span className="landing-footer-text">
            Solution Challenge 2026 • SDG 11: Sustainable Cities & Communities
          </span>
          <div className="landing-footer-powered">
            <Cpu size={12} />
            <span>Powered by Gemini AI</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

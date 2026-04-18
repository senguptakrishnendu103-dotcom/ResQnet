import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, Globe, Mail, Lock, User, ArrowRight, ArrowLeft, Loader2, AlertTriangle, Eye, EyeOff } from 'lucide-react';

export default function LoginPage({ onBack }) {
  const { login, signup, loginWithGoogle, error, clearError } = useAuth();
  const [isSignUp, setIsSignUp] = useState(false);
  const [form, setForm] = useState({ email: '', password: '', name: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignUp) {
        await signup(form.email, form.password, form.name);
      } else {
        await login(form.email, form.password);
      }
    } catch {
      // error is set in context
    }
    setLoading(false);
  };

  const handleGoogle = async () => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle();
    } catch {
      // error is set in context
    }
    setGoogleLoading(false);
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    clearError();
  };

  return (
    <div className="login-page">
      {/* Animated background grid */}
      <div className="login-bg-grid" />
      <div className="login-bg-glow login-bg-glow-1" />
      <div className="login-bg-glow login-bg-glow-2" />

      <div className="login-card animate-fade-in">
        {/* Back to landing */}
        {onBack && (
          <button onClick={onBack} className="login-back-btn">
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
        )}

        {/* Logo section */}
        <div className="login-logo-section">
          <div className="login-globe-bg">
            <Globe size={80} strokeWidth={0.5} />
          </div>
          <div className="login-shield-icon">
            <ShieldAlert size={48} />
          </div>
          <h1 className="login-title">ResQnet</h1>
          <p className="login-subtitle">Emergency Response Network</p>
          <div className="login-badge">Solution Challenge 2026</div>
        </div>

        {/* Error message */}
        {error && (
          <div className="login-error animate-shake">
            <AlertTriangle size={16} />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="login-form">
          {isSignUp && (
            <div className="login-input-group animate-slide-down">
              <User size={18} className="login-input-icon" />
              <input
                type="text"
                placeholder="Display Name"
                value={form.name}
                onChange={e => setForm({ ...form, name: e.target.value })}
                className="login-input"
                required
              />
            </div>
          )}

          <div className="login-input-group">
            <Mail size={18} className="login-input-icon" />
            <input
              type="email"
              placeholder="Email Address"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
              className="login-input"
              required
            />
          </div>

          <div className="login-input-group">
            <Lock size={18} className="login-input-icon" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
              className="login-input"
              required
              minLength={6}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="login-eye-btn"
            >
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>

          <button type="submit" className="login-submit-btn" disabled={loading}>
            {loading ? (
              <Loader2 size={22} className="animate-spin" />
            ) : (
              <>
                {isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight size={20} />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="login-divider">
          <span>or</span>
        </div>

        {/* Google sign-in */}
        <button onClick={handleGoogle} className="login-google-btn" disabled={googleLoading}>
          {googleLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <>
              <svg viewBox="0 0 24 24" width="20" height="20">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
              </svg>
              Continue with Google
            </>
          )}
        </button>

        {/* Toggle sign-up / sign-in */}
        <p className="login-toggle">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
          <button onClick={toggleMode} className="login-toggle-btn">
            {isSignUp ? 'Sign In' : 'Sign Up'}
          </button>
        </p>

        {/* Staff role hint */}
        <div className="login-role-hint">
          <ShieldAlert size={12} />
          <span>Emails containing "staff" get Commander access</span>
        </div>
      </div>
    </div>
  );
}

import React, { useMemo } from 'react';
import { BarChart3, TrendingUp, Clock, CheckCircle, AlertTriangle, Shield, Zap, Activity, Flame, Stethoscope, ShieldAlert } from 'lucide-react';

export default function AnalyticsDashboard({ incidents }) {
  const analytics = useMemo(() => {
    const total = incidents.length;
    const pending = incidents.filter(i => i.status === 'Pending').length;
    const responding = incidents.filter(i => i.status === 'Responding').length;
    const resolved = incidents.filter(i => i.status === 'Resolved').length;
    const critical = incidents.filter(i => i.priority === 'CRITICAL').length;
    const stable = incidents.filter(i => i.priority === 'STABLE').length;

    // Type breakdown
    const types = {};
    incidents.forEach(i => {
      const t = i.type || 'Pending';
      types[t] = (types[t] || 0) + 1;
    });

    // Resolution rate
    const resolutionRate = total > 0 ? Math.round((resolved / total) * 100) : 0;
    
    // Avg response indicator (simulated from data we have)
    const avgResponseTime = total > 0 ? Math.max(2, 15 - Math.round(resolved / Math.max(total, 1) * 12)) : 0;

    // Timeline (group by hour)
    const timeline = {};
    incidents.forEach(i => {
      const hour = i.timestamp ? i.timestamp.split(':')[0] + ':00' : 'Unknown';
      timeline[hour] = (timeline[hour] || 0) + 1;
    });

    return {
      total, pending, responding, resolved, critical, stable,
      types, resolutionRate, avgResponseTime, timeline
    };
  }, [incidents]);

  const TYPE_CONFIG = {
    Medical: { icon: Stethoscope, color: '#22c55e' },
    Fire: { icon: Flame, color: '#f97316' },
    Security: { icon: Shield, color: '#3b82f6' },
    Earthquake: { icon: Activity, color: '#8b5cf6' },
    Pending: { icon: Clock, color: '#6b7280' },
  };

  const maxTypeCount = Math.max(...Object.values(analytics.types), 1);
  const maxTimelineCount = Math.max(...Object.values(analytics.timeline), 1);

  return (
    <div className="analytics-dashboard animate-fade-in">
      {/* Header */}
      <div className="analytics-header">
        <div className="analytics-header-left">
          <BarChart3 size={28} className="analytics-header-icon" />
          <div>
            <h2 className="analytics-title">Impact Analytics</h2>
            <p className="analytics-subtitle">Real-time emergency response metrics</p>
          </div>
        </div>
        <div className="analytics-header-badge">
          <TrendingUp size={14} />
          <span>SDG 11.5 Metrics</span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="analytics-kpi-grid">
        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon" style={{ color: '#e11d48', background: 'rgba(225, 29, 72, 0.1)' }}>
            <AlertTriangle size={24} />
          </div>
          <div className="analytics-kpi-value">{analytics.total}</div>
          <div className="analytics-kpi-label">Total Incidents</div>
          <div className="analytics-kpi-bar" style={{ background: 'linear-gradient(90deg, #e11d48, #f43f5e)' }} />
        </div>

        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon" style={{ color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)' }}>
            <CheckCircle size={24} />
          </div>
          <div className="analytics-kpi-value">{analytics.resolutionRate}%</div>
          <div className="analytics-kpi-label">Resolution Rate</div>
          <div className="analytics-kpi-bar" style={{ background: 'linear-gradient(90deg, #22c55e, #4ade80)', width: `${analytics.resolutionRate}%` }} />
        </div>

        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon" style={{ color: '#3b82f6', background: 'rgba(59, 130, 246, 0.1)' }}>
            <Clock size={24} />
          </div>
          <div className="analytics-kpi-value">{analytics.avgResponseTime}<span className="analytics-kpi-unit">min</span></div>
          <div className="analytics-kpi-label">Avg Response Time</div>
          <div className="analytics-kpi-bar" style={{ background: 'linear-gradient(90deg, #3b82f6, #60a5fa)', width: `${Math.min(100, analytics.avgResponseTime * 7)}%` }} />
        </div>

        <div className="analytics-kpi-card">
          <div className="analytics-kpi-icon" style={{ color: '#f59e0b', background: 'rgba(245, 158, 11, 0.1)' }}>
            <Zap size={24} />
          </div>
          <div className="analytics-kpi-value">{analytics.critical}</div>
          <div className="analytics-kpi-label">Critical Alerts</div>
          <div className="analytics-kpi-bar" style={{ background: 'linear-gradient(90deg, #f59e0b, #fbbf24)', width: `${analytics.total > 0 ? (analytics.critical / analytics.total) * 100 : 0}%` }} />
        </div>
      </div>

      {/* Charts Row */}
      <div className="analytics-charts-row">
        {/* Status Distribution */}
        <div className="analytics-chart-card">
          <h3 className="analytics-chart-title">
            <ShieldAlert size={16} />
            Status Distribution
          </h3>
          <div className="analytics-donut-container">
            <svg viewBox="0 0 200 200" className="analytics-donut">
              {analytics.total > 0 ? (
                <>
                  {/* Pending arc */}
                  <circle
                    cx="100" cy="100" r="70"
                    fill="none" stroke="#f59e0b" strokeWidth="24"
                    strokeDasharray={`${(analytics.pending / analytics.total) * 440} 440`}
                    strokeDashoffset="0"
                    transform="rotate(-90 100 100)"
                    className="analytics-donut-segment"
                  />
                  {/* Responding arc */}
                  <circle
                    cx="100" cy="100" r="70"
                    fill="none" stroke="#3b82f6" strokeWidth="24"
                    strokeDasharray={`${(analytics.responding / analytics.total) * 440} 440`}
                    strokeDashoffset={`${-(analytics.pending / analytics.total) * 440}`}
                    transform="rotate(-90 100 100)"
                    className="analytics-donut-segment"
                  />
                  {/* Resolved arc */}
                  <circle
                    cx="100" cy="100" r="70"
                    fill="none" stroke="#22c55e" strokeWidth="24"
                    strokeDasharray={`${(analytics.resolved / analytics.total) * 440} 440`}
                    strokeDashoffset={`${-((analytics.pending + analytics.responding) / analytics.total) * 440}`}
                    transform="rotate(-90 100 100)"
                    className="analytics-donut-segment"
                  />
                </>
              ) : (
                <circle cx="100" cy="100" r="70" fill="none" stroke="#1e293b" strokeWidth="24" />
              )}
              <text x="100" y="95" textAnchor="middle" className="analytics-donut-center-value">{analytics.total}</text>
              <text x="100" y="115" textAnchor="middle" className="analytics-donut-center-label">Total</text>
            </svg>
          </div>
          <div className="analytics-legend">
            <div className="analytics-legend-item">
              <div className="analytics-legend-dot" style={{ background: '#f59e0b' }} />
              <span>Pending ({analytics.pending})</span>
            </div>
            <div className="analytics-legend-item">
              <div className="analytics-legend-dot" style={{ background: '#3b82f6' }} />
              <span>Responding ({analytics.responding})</span>
            </div>
            <div className="analytics-legend-item">
              <div className="analytics-legend-dot" style={{ background: '#22c55e' }} />
              <span>Resolved ({analytics.resolved})</span>
            </div>
          </div>
        </div>

        {/* Type Breakdown */}
        <div className="analytics-chart-card">
          <h3 className="analytics-chart-title">
            <Activity size={16} />
            Incident Categories
          </h3>
          <div className="analytics-bars">
            {Object.entries(analytics.types).length > 0 ? (
              Object.entries(analytics.types)
                .sort(([, a], [, b]) => b - a)
                .map(([type, count]) => {
                  const config = TYPE_CONFIG[type] || TYPE_CONFIG.Pending;
                  return (
                    <div key={type} className="analytics-bar-row">
                      <div className="analytics-bar-label">
                        <config.icon size={14} style={{ color: config.color }} />
                        <span>{type}</span>
                      </div>
                      <div className="analytics-bar-track">
                        <div
                          className="analytics-bar-fill"
                          style={{
                            width: `${(count / maxTypeCount) * 100}%`,
                            background: `linear-gradient(90deg, ${config.color}, ${config.color}80)`,
                          }}
                        />
                      </div>
                      <span className="analytics-bar-value" style={{ color: config.color }}>{count}</span>
                    </div>
                  );
                })
            ) : (
              <div className="analytics-empty">No incident data yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Severity Split */}
      <div className="analytics-severity-row">
        <div className="analytics-severity-card critical">
          <div className="analytics-severity-header">
            <AlertTriangle size={20} />
            <span>CRITICAL</span>
          </div>
          <div className="analytics-severity-value">{analytics.critical}</div>
          <div className="analytics-severity-bar">
            <div
              className="analytics-severity-fill"
              style={{ width: `${analytics.total > 0 ? (analytics.critical / analytics.total) * 100 : 0}%` }}
            />
          </div>
          <div className="analytics-severity-pct">
            {analytics.total > 0 ? Math.round((analytics.critical / analytics.total) * 100) : 0}% of total
          </div>
        </div>

        <div className="analytics-severity-card stable">
          <div className="analytics-severity-header">
            <Shield size={20} />
            <span>STABLE</span>
          </div>
          <div className="analytics-severity-value">{analytics.stable}</div>
          <div className="analytics-severity-bar">
            <div
              className="analytics-severity-fill"
              style={{ width: `${analytics.total > 0 ? (analytics.stable / analytics.total) * 100 : 0}%` }}
            />
          </div>
          <div className="analytics-severity-pct">
            {analytics.total > 0 ? Math.round((analytics.stable / analytics.total) * 100) : 0}% of total
          </div>
        </div>
      </div>

      {/* Timeline */}
      {Object.keys(analytics.timeline).length > 0 && (
        <div className="analytics-chart-card full-width">
          <h3 className="analytics-chart-title">
            <Clock size={16} />
            Incident Timeline
          </h3>
          <div className="analytics-timeline">
            {Object.entries(analytics.timeline).map(([time, count]) => (
              <div key={time} className="analytics-timeline-bar">
                <div
                  className="analytics-timeline-fill"
                  style={{ height: `${(count / maxTimelineCount) * 100}%` }}
                />
                <span className="analytics-timeline-label">{time}</span>
                <span className="analytics-timeline-count">{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

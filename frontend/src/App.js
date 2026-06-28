// RescueNet-AI Command Center Dashboard - Main Application Controller
// Integrates state router, sub-modules, role-based dashboards, and mock fallback.

import React, { useState, useEffect } from 'react';
import './App.css';
import { api, getMode, setMode, getActiveUser } from './services/api';
import RescueNetMap from './components/Map';
import { TacticalBarChart, TacticalDonutChart, TacticalLineChart } from './components/Charts';
import SOSWidget from './components/SOSWidget';

// ==========================================
// INLINE SVG ICONS HELPER FOR ZERO-DEPENDENCY COMPILATION
// ==========================================
const Icons = {
  Home: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>,
  Alert: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  Users: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  Ngo: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="8" rx="2"/><rect x="2" y="14" width="20" height="8" rx="2"/><line x1="6" y1="6" x2="6.01" y2="6"/><line x1="6" y1="18" x2="6.01" y2="18"/></svg>,
  Resource: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
  Shelter: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 21 1.9-5.7a8.5 8.5 0 1 1 14.2 0L21 21Z"/><path d="M9 21v-4a3 3 0 0 1 6 0v4"/></svg>,
  Analytics: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>,
  Lock: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>,
  Bell: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  User: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
};

function App() {
  const [currentScreen, setCurrentScreen] = useState('home'); // home, auth, disasters, volunteers, ngos, resources, shelters, analytics
  const [connectionMode, setConnectionMode] = useState('DEMO'); // DEMO, LIVE
  const [currentUser, setCurrentUser] = useState(null);
  
  // Quick account switch drawer state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // App global collections
  const [disasters, setDisasters] = useState([]);
  const [volunteers, setVolunteers] = useState([]);
  const [ngos, setNgos] = useState([]);
  const [resources, setResources] = useState([]);
  const [shelters, setShelters] = useState([]);
  const [emergencyRequests, setEmergencyRequests] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [metrics, setMetrics] = useState({});
  const [usersList, setUsersList] = useState([]); // for Admin

  // Form states
  const [loginForm, setLoginForm] = useState({ username: '', password: '' });
  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '', phone: '', role: 'ROLE_USER' });
  const [isRegisterActive, setIsRegisterActive] = useState(false);
  const [authError, setAuthError] = useState('');
  
  // Reporting States
  const [mapSelectedPoint, setMapSelectedPoint] = useState(null);
  const [notifDropdownOpen, setNotifDropdownOpen] = useState(false);

  // Fetch all dashboard data
  const loadDashboardData = async () => {
    try {
      const activeUser = getActiveUser();
      setCurrentUser(activeUser);

      const dData = await api.disasters.getAll();
      setDisasters(dData);

      const vData = await api.volunteers.getAll();
      setVolunteers(vData);

      const nData = await api.ngos.getAll();
      setNgos(nData);

      const rData = await api.resources.getAll();
      setResources(rData);

      const sData = await api.shelters.getAll();
      setShelters(sData);

      const sosData = await api.volunteers.getEmergencyRequests();
      setEmergencyRequests(sosData);

      const notifData = await api.notifications.getMy();
      setNotifications(notifData);

      const metricsData = await api.analytics.getMetrics();
      setMetrics(metricsData);

      const logsData = await api.analytics.getLogs();
      setAuditLogs(logsData);

      if (activeUser && activeUser.role === 'ROLE_ADMIN') {
        const uList = await api.users.getAll();
        setUsersList(uList);
      }
    } catch (err) {
      console.error("Error loading dashboard metrics:", err);
    }
  };

  useEffect(() => {
    const savedMode = getMode();
    setConnectionMode(savedMode || 'DEMO');
    loadDashboardData();
  }, [connectionMode]);

  // Handle Mode Change
  const handleModeToggle = (mode) => {
    setMode(mode);
    setConnectionMode(mode);
  };

  // Perform quick login for ease of demo evaluation
  const handleQuickLogin = async (username, roleLabel) => {
    try {
      api.auth.logout();
      const res = await api.auth.login(username, "password");
      if (res.success) {
        setCurrentUser(res.user);
        setIsDrawerOpen(false);
        setAuthError('');
        loadDashboardData();
        setCurrentScreen('home');
      }
    } catch (err) {
      // Create user if not existing in mock database
      try {
        await api.auth.register(username, `${username}@rescuenet.org`, "password", "+1 555-0900", roleLabel);
        const res = await api.auth.login(username, "password");
        if (res.success) {
          setCurrentUser(res.user);
          setIsDrawerOpen(false);
          setAuthError('');
          loadDashboardData();
          setCurrentScreen('home');
        }
      } catch (e) {
        setAuthError(e.message);
      }
    }
  };

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await api.auth.login(loginForm.username, loginForm.password);
      if (res.success) {
        setCurrentUser(res.user);
        loadDashboardData();
        setLoginForm({ username: '', password: '' });
        setCurrentScreen('home');
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
    setAuthError('');
    try {
      const res = await api.auth.register(
        registerForm.username,
        registerForm.email,
        registerForm.password,
        registerForm.phone,
        registerForm.role
      );
      if (res.success) {
        alert("Registration successful! Please login.");
        setIsRegisterActive(false);
        setLoginForm({ username: registerForm.username, password: '' });
      }
    } catch (err) {
      setAuthError(err.message);
    }
  };

  const handleLogout = () => {
    api.auth.logout();
    setCurrentUser(null);
    setCurrentScreen('home');
    loadDashboardData();
  };

  const handleMapSelection = (coords) => {
    setMapSelectedPoint(coords);
  };

  // Mark notification read
  const handleMarkNotifRead = async (id) => {
    await api.notifications.markAsRead(id);
    loadDashboardData();
  };

  // Screen Rendering Router Helper
  const navigateTo = (screen) => {
    setCurrentScreen(screen);
    setNotifDropdownOpen(false);
  };

  return (
    <div className="app-container">
      
      {/* Quick Login Evaluation Drawer */}
      <div className="quick-login-handle" onClick={() => setIsDrawerOpen(!isDrawerOpen)}>
        🔑 PRESET ACCOUNTS
      </div>
      <div className={`quick-login-drawer ${isDrawerOpen ? 'open' : ''}`}>
        <div className="drawer-title">
          <span>EVALUATION ACCOUNTS</span>
          <button className="close-btn" style={{ fontSize: '16px' }} onClick={() => setIsDrawerOpen(false)}>&times;</button>
        </div>
        <p style={{ fontSize: '10px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
          Instantly switch user personas to evaluate different system privilege views:
        </p>
        <button className="quick-role-btn" onClick={() => handleQuickLogin('admin', 'ROLE_ADMIN')}>
          <span>System Administrator</span>
          <span className="badge MEDIUM" style={{ fontSize: '8px' }}>ADMIN</span>
        </button>
        <button className="quick-role-btn" onClick={() => handleQuickLogin('volunteer_jane', 'ROLE_VOLUNTEER')}>
          <span>Jane (Active Volunteer)</span>
          <span className="badge LOW" style={{ fontSize: '8px' }}>VOLUNTEER</span>
        </button>
        <button className="quick-role-btn" onClick={() => handleQuickLogin('ngo_relief', 'ROLE_NGO')}>
          <span>NGO Relief Org</span>
          <span className="badge HIGH" style={{ fontSize: '8px' }}>NGO</span>
        </button>
        <button className="quick-role-btn" onClick={() => handleQuickLogin('john_citizen', 'ROLE_USER')}>
          <span>John Doe (Citizen User)</span>
          <span className="badge ACTIVE" style={{ fontSize: '8px' }}>USER</span>
        </button>
      </div>

      {/* Floating SOS Distress Signal Trigger */}
      <SOSWidget onSOSCreated={loadDashboardData} />

      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="sidebar">
        <div className="brand-section">
          <div className="brand-logo-icon">🛟</div>
          <div>
            <span className="brand-name">RescueNet-AI</span>
            <span className="brand-sub">TACTICAL CONTROL</span>
          </div>
        </div>

        <ul className="nav-menu">
          <li className="nav-item">
            <div className={`nav-link ${currentScreen === 'home' ? 'active' : ''}`} onClick={() => navigateTo('home')}>
              <Icons.Home /> Home Operations
            </div>
          </li>
          <li className="nav-item">
            <div className={`nav-link ${currentScreen === 'disasters' ? 'active' : ''}`} onClick={() => navigateTo('disasters')}>
              <Icons.Alert /> Disasters Panel
            </div>
          </li>
          <li className="nav-item">
            <div className={`nav-link ${currentScreen === 'volunteers' ? 'active' : ''}`} onClick={() => navigateTo('volunteers')}>
              <Icons.Users /> Volunteers Coord
            </div>
          </li>
          <li className="nav-item">
            <div className={`nav-link ${currentScreen === 'ngos' ? 'active' : ''}`} onClick={() => navigateTo('ngos')}>
              <Icons.Ngo /> NGO Linkage Hub
            </div>
          </li>
          <li className="nav-item">
            <div className={`nav-link ${currentScreen === 'resources' ? 'active' : ''}`} onClick={() => navigateTo('resources')}>
              <Icons.Resource /> Resource Depot
            </div>
          </li>
          <li className="nav-item">
            <div className={`nav-link ${currentScreen === 'shelters' ? 'active' : ''}`} onClick={() => navigateTo('shelters')}>
              <Icons.Shelter /> Shelters & Housing
            </div>
          </li>
          <li className="nav-item">
            <div className={`nav-link ${currentScreen === 'analytics' ? 'active' : ''}`} onClick={() => navigateTo('analytics')}>
              <Icons.Analytics /> Insights & Logs
            </div>
          </li>
        </ul>

        <div className="sidebar-footer">
          {currentUser ? (
            <div>
              <div className="user-badge-mini">
                <div className="avatar">
                  {currentUser.username.substring(0, 2).toUpperCase()}
                </div>
                <div className="user-info-mini">
                  <div className="user-name-mini">{currentUser.username}</div>
                  <div className="user-role-mini">{currentUser.role.replace('ROLE_', '')}</div>
                </div>
              </div>
              <button className="btn btn-secondary btn-full" style={{ fontSize: '11px', padding: '6px' }} onClick={handleLogout}>
                DISCONNECT USER
              </button>
            </div>
          ) : (
            <button className="btn btn-primary btn-full" onClick={() => navigateTo('auth')}>
              🔒 LOG IN COMMANDER
            </button>
          )}
        </div>
      </aside>

      {/* MAIN SCREEN SPACE */}
      <main className="main-content">
        
        {/* TOP COMMAND BAR */}
        <header className="top-bar">
          <div className="top-bar-left">
            <div className="page-title">
              {currentScreen === 'home' && "TACTICAL HOME BOARD"}
              {currentScreen === 'auth' && "PORTAL AUTHENTICATION"}
              {currentScreen === 'disasters' && "INCIDENT AND REPORTING CONTROL"}
              {currentScreen === 'volunteers' && "VOLUNTEER MOBILIZATION SERVICES"}
              {currentScreen === 'ngos' && "REGISTERED ORGANIZATIONS CENTRE"}
              {currentScreen === 'resources' && "LOGISTICAL SUPPLIES MANAGEMENT"}
              {currentScreen === 'shelters' && "SHELTER COORDINATES MONITOR"}
              {currentScreen === 'analytics' && "AGGREGATED METRICS & AUDITING LOGS"}
            </div>
          </div>

          <div className="top-bar-right">
            {/* Dual Mode Switcher */}
            <div className="mode-toggle-panel">
              <button
                className={`mode-toggle-btn ${connectionMode === 'LIVE' ? 'active LIVE' : ''}`}
                onClick={() => handleModeToggle('LIVE')}
              >
                LIVE SERVER (8089)
              </button>
              <button
                className={`mode-toggle-btn ${connectionMode === 'DEMO' ? 'active DEMO' : ''}`}
                onClick={() => handleModeToggle('DEMO')}
              >
                DEMO MODE
              </button>
            </div>

            {/* Notification bell widget */}
            <div className="notification-bell-container">
              <button className="bell-btn" onClick={() => setNotifDropdownOpen(!notifDropdownOpen)}>
                <Icons.Bell />
                {notifications.some(n => !n.read) && <span className="bell-badge"></span>}
              </button>
              {notifDropdownOpen && (
                <div className="notification-dropdown glassmorphism">
                  <div className="notification-header">
                    <span>Tactical Notifications</span>
                    <button className="close-btn" style={{ fontSize: '11px' }} onClick={() => setNotifDropdownOpen(false)}>Close</button>
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ padding: '16px', fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center' }}>No active alerts</div>
                  ) : (
                    notifications.map(n => (
                      <div
                        key={n.id}
                        className={`notification-item ${!n.read ? 'unread' : ''}`}
                        onClick={() => handleMarkNotifRead(n.id)}
                      >
                        <span className="notification-item-text">{n.message}</span>
                        <span className="notification-item-time">{new Date(n.createdAt).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* PAGE BODY SCREEN ROUTER */}
        <section className="page-body">
          
          {/* ==========================================
              SCREEN: HOME / LANDING PORTAL
              ========================================== */}
          {currentScreen === 'home' && (
            <div className="fade-in">
              <div className="landing-hero">
                <h1>RescueNet-AI Operations Center</h1>
                <p>
                  A premium tactical platform designed for crisis coordination, relief logistics allocation, active refugee shelter management, volunteer dispatching, and auditing logs.
                </p>
                <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
                  <button className="btn btn-primary" onClick={() => navigateTo('disasters')}>
                    📡 MANAGE INCIDENTS
                  </button>
                  {!currentUser && (
                    <button className="btn btn-secondary" onClick={() => navigateTo('auth')}>
                      JOIN COMMAND NETWORK
                    </button>
                  )}
                </div>
              </div>

              {/* KPI Cards Row */}
              <div className="kpi-grid">
                <div className="card kpi-card">
                  <div>
                    <div className="kpi-title">Active Disasters</div>
                    <div className="kpi-value">{metrics.activeDisasters || 0}</div>
                  </div>
                  <div className="kpi-icon" style={{ color: 'var(--accent-red)' }}>🔥</div>
                </div>
                <div className="card kpi-card">
                  <div>
                    <div className="kpi-title">Ready Volunteers</div>
                    <div className="kpi-value">{metrics.availableVolunteers || 0}</div>
                  </div>
                  <div className="kpi-icon" style={{ color: 'var(--primary)' }}>⚡</div>
                </div>
                <div className="card kpi-card">
                  <div>
                    <div className="kpi-title">Pending SOS Alerts</div>
                    <div className="kpi-value">{metrics.pendingEmergencyRequests || 0}</div>
                  </div>
                  <div className="kpi-icon" style={{ color: 'var(--accent-orange)' }}>🚨</div>
                </div>
                <div className="card kpi-card">
                  <div>
                    <div className="kpi-title">Active Shelter Spots</div>
                    <div className="kpi-value">{(metrics.totalCapacity - metrics.occupiedCapacity) || 0}</div>
                  </div>
                  <div className="kpi-icon" style={{ color: 'var(--accent-green)' }}>🏨</div>
                </div>
              </div>

              <div className="dashboard-split">
                {/* Tactical map on home screen */}
                <div>
                  <RescueNetMap
                    disasters={disasters}
                    shelters={shelters}
                    volunteers={volunteers}
                    emergencyRequests={emergencyRequests}
                    onMapClick={handleMapSelection}
                    selectedPoint={mapSelectedPoint}
                  />
                </div>

                {/* Live News Alert Board */}
                <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', marginBottom: '12px' }}>
                    🚩 UNRESOLVED ALERTS
                  </h3>
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '10px', overflowY: 'auto', maxHeight: '350px' }}>
                    {disasters.filter(d => d.status !== 'RESOLVED').length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>All incidents resolved. System green.</p>
                    ) : (
                      disasters.filter(d => d.status !== 'RESOLVED').map(d => (
                        <div key={d.id} className="alert-item card" style={{ padding: '12px', background: 'rgba(255, 78, 80, 0.04)', borderColor: 'rgba(255, 78, 80, 0.15)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span className={`badge ${d.severity}`}>{d.severity}</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>{d.location}</span>
                          </div>
                          <strong style={{ display: 'block', fontSize: '13px', marginTop: '6px' }}>{d.title}</strong>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Core capabilities breakdown */}
              <div className="feature-cards-grid">
                <div className="card feature-card">
                  <div className="feature-icon">🛡</div>
                  <h4>Disaster Spotting</h4>
                  <p>Map incidents in real time using automated coordinate locations mapping.</p>
                </div>
                <div className="card feature-card">
                  <div className="feature-icon">📢</div>
                  <h4>Pulsing SOS Alerts</h4>
                  <p>Distress beacon tracking with nearby volunteer triangulation simulation.</p>
                </div>
                <div className="card feature-card">
                  <div className="feature-icon">📦</div>
                  <h4>Logistics Management</h4>
                  <p>Coordinate emergency resources like medical, blankets, water, and food.</p>
                </div>
                <div className="card feature-card">
                  <div className="feature-icon">🔬</div>
                  <h4>Audited Insights</h4>
                  <p>Detailed administrator security log tracker and system KPIs charts.</p>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SCREEN: AUTH LOGIN & REGISTER
              ========================================== */}
          {currentScreen === 'auth' && (
            <div className="fade-in" style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
              <div className="card glassmorphism" style={{ maxWidth: '400px', width: '100%', padding: '30px' }}>
                <div style={{ textAlign: 'center', marginBottom: '24px' }}>
                  <h2>{isRegisterActive ? "CREATE ACCOUNT" : "SECURE COMMAND LOGIN"}</h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                    {isRegisterActive ? "Join the relief network" : "Enter credential tokens to authenticate"}
                  </p>
                </div>

                {authError && (
                  <div className="card" style={{ padding: '10px 14px', background: 'rgba(255, 78, 80, 0.1)', borderColor: 'var(--accent-red)', color: 'var(--accent-red)', fontSize: '12px', marginBottom: '16px' }}>
                    ⚠️ {authError}
                  </div>
                )}

                {!isRegisterActive ? (
                  /* LOGIN FORM */
                  <form onSubmit={handleLoginSubmit}>
                    <div className="form-group">
                      <label>Username or Email Address</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="admin"
                        value={loginForm.username}
                        onChange={(e) => setLoginForm({ ...loginForm, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Password Key</label>
                      <input
                        type="password"
                        className="form-input"
                        placeholder="••••••••"
                        value={loginForm.password}
                        onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                        required
                      />
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '10px' }}>
                      🔑 AUTHENTICATE COMMANDER
                    </button>
                    <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      New responder?{" "}
                      <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => { setIsRegisterActive(true); setAuthError(''); }}>
                        Register Profile
                      </span>
                    </div>
                  </form>
                ) : (
                  /* REGISTER FORM */
                  <form onSubmit={handleRegisterSubmit}>
                    <div className="form-group">
                      <label>Username (Identity Name)</label>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="volunteer_jane"
                        value={registerForm.username}
                        onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Email Address</label>
                      <input
                        type="email"
                        className="form-input"
                        placeholder="jane@rescuenet.org"
                        value={registerForm.email}
                        onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                        required
                      />
                    </div>
                    <div className="form-row">
                      <div className="form-group">
                        <label>Password</label>
                        <input
                          type="password"
                          className="form-input"
                          placeholder="min 6 chars"
                          value={registerForm.password}
                          onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Phone Number</label>
                        <input
                          type="tel"
                          className="form-input"
                          placeholder="+1 555-0122"
                          value={registerForm.phone}
                          onChange={(e) => setRegisterForm({ ...registerForm, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="form-group">
                      <label>Operational Role</label>
                      <select
                        className="form-input"
                        value={registerForm.role}
                        onChange={(e) => setRegisterForm({ ...registerForm, role: e.target.value })}
                      >
                        <option value="ROLE_USER">ROLE_USER (Regular Citizen)</option>
                        <option value="ROLE_VOLUNTEER">ROLE_VOLUNTEER (First Responder)</option>
                        <option value="ROLE_NGO">ROLE_NGO (Relief Organization)</option>
                        <option value="ROLE_ADMIN">ROLE_ADMIN (Command Center Admin)</option>
                      </select>
                    </div>
                    <button type="submit" className="btn btn-primary btn-full" style={{ marginTop: '10px' }}>
                      ✓ CREATE SECURE REGISTER
                    </button>
                    <div style={{ textAlign: 'center', marginTop: '16px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      Already registered?{" "}
                      <span style={{ color: 'var(--primary)', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => { setIsRegisterActive(false); setAuthError(''); }}>
                        Login here
                      </span>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}

          {/* ==========================================
              SCREEN: DISASTERS CONTROL PANEL
              ========================================== */}
          {currentScreen === 'disasters' && (
            <div className="fade-in">
              <div className="dashboard-split" style={{ gridTemplateColumns: '1.8fr 1.2fr' }}>
                
                {/* Left side: Map and Table List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  <RescueNetMap
                    disasters={disasters}
                    shelters={shelters}
                    volunteers={volunteers}
                    emergencyRequests={emergencyRequests}
                    onMapClick={handleMapSelection}
                    selectedPoint={mapSelectedPoint}
                  />

                  <div className="card">
                    <h3>ACTIVE INCIDENTS DATABASE</h3>
                    <div className="table-responsive">
                      <table className="tactical-table">
                        <thead>
                          <tr>
                            <th>Incident Title</th>
                            <th>Type</th>
                            <th>Severity</th>
                            <th>Location</th>
                            <th>Status</th>
                            {currentUser && (currentUser.role === 'ROLE_ADMIN' || currentUser.role === 'ROLE_NGO') && <th>Action</th>}
                          </tr>
                        </thead>
                        <tbody>
                          {disasters.map(d => (
                            <tr key={d.id}>
                              <td>
                                <strong>{d.title}</strong>
                                <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>{d.description}</span>
                              </td>
                              <td>{d.disasterType}</td>
                              <td><span className={`badge ${d.severity}`}>{d.severity}</span></td>
                              <td>{d.location}</td>
                              <td><span className={`badge ${d.status}`}>{d.status}</span></td>
                              {currentUser && (currentUser.role === 'ROLE_ADMIN' || currentUser.role === 'ROLE_NGO') && (
                                <td>
                                  {d.status !== 'RESOLVED' ? (
                                    <button
                                      className="btn btn-success"
                                      style={{ padding: '4px 8px', fontSize: '10px' }}
                                      onClick={async () => {
                                        await api.disasters.updateStatus(d.id, 'RESOLVED');
                                        loadDashboardData();
                                      }}
                                    >
                                      Mark Resolved
                                    </button>
                                  ) : (
                                    <span style={{ color: 'var(--text-muted)' }}>Resolved</span>
                                  )}
                                </td>
                              )}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right side: Report disaster Form */}
                <div className="card glassmorphism">
                  <h3>REPORT NEW CRISIS EVENT</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Tip: Click coordinates directly on the control map above to auto-pin the incident location coordinates!
                  </p>
                  
                  <form onSubmit={async (e) => {
                    e.preventDefault();
                    const form = e.target;
                    try {
                      await api.disasters.create(
                        form.title.value,
                        form.description.value,
                        form.location.value,
                        form.latitude.value,
                        form.longitude.value,
                        form.disasterType.value,
                        form.severity.value
                      );
                      alert("Disaster incident logged successfully into tactical system.");
                      form.reset();
                      setMapSelectedPoint(null);
                      loadDashboardData();
                    } catch (err) {
                      alert(err.message);
                    }
                  }}>
                    <div className="form-group">
                      <label>Incident Label / Title *</label>
                      <input type="text" name="title" className="form-input" placeholder="e.g. Forest Fire Boundary Shift" required />
                    </div>

                    <div className="form-group">
                      <label>Crisis Type *</label>
                      <select name="disasterType" className="form-input">
                        <option value="FLOOD">FLOOD</option>
                        <option value="FIRE">FIRE</option>
                        <option value="EARTHQUAKE">EARTHQUAKE</option>
                        <option value="TORNADO">TORNADO</option>
                        <option value="MEDICAL">MEDICAL EMERGENCY</option>
                      </select>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Severity Level</label>
                        <select name="severity" className="form-input">
                          <option value="LOW">LOW</option>
                          <option value="MEDIUM">MEDIUM</option>
                          <option value="HIGH">HIGH</option>
                          <option value="CRITICAL">CRITICAL</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Location Sector Name *</label>
                        <input type="text" name="location" className="form-input" placeholder="e.g. Suburban Sector W" required />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label>Latitude Coordinates *</label>
                        <input
                          type="number"
                          step="0.0001"
                          name="latitude"
                          className="form-input"
                          value={mapSelectedPoint ? mapSelectedPoint.latitude : ''}
                          onChange={(e) => setMapSelectedPoint({ ...mapSelectedPoint, latitude: parseFloat(e.target.value) })}
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label>Longitude Coordinates *</label>
                        <input
                          type="number"
                          step="0.0001"
                          name="longitude"
                          className="form-input"
                          value={mapSelectedPoint ? mapSelectedPoint.longitude : ''}
                          onChange={(e) => setMapSelectedPoint({ ...mapSelectedPoint, longitude: parseFloat(e.target.value) })}
                          required
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label>Incident Breakdown / Details</label>
                      <textarea name="description" className="form-input" rows="4" placeholder="Report details, road blockages, structural damages, or containment instructions..."></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary btn-full">
                      📡 LOG DISASTER SIGNAL
                    </button>
                  </form>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SCREEN: VOLUNTEERS PORTAL
              ========================================== */}
          {currentScreen === 'volunteers' && (
            <div className="fade-in">
              <div className="dashboard-split" style={{ gridTemplateColumns: '1.2fr 1.8fr' }}>
                
                {/* Left Panel: Profile Setup & Toggle Status */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  
                  {/* Volunteer Registration */}
                  {currentUser && currentUser.role === 'ROLE_VOLUNTEER' ? (
                    (() => {
                      const matchedVol = volunteers.find(v => v.userId === currentUser.id) || {};
                      return (
                        <div className="card glassmorphism">
                          <h3>VOLUNTEER COMMAND PROFILE</h3>
                          <div className="user-badge-mini" style={{ margin: '12px 0' }}>
                            <div className="avatar">✓</div>
                            <div>
                              <strong>{currentUser.username}</strong>
                              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)' }}>Identity Validated</span>
                            </div>
                          </div>
                          
                          <div style={{ marginBottom: '16px' }}>
                            <strong style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'block', textTransform: 'uppercase' }}>Registered Skills</strong>
                            <p style={{ color: 'var(--primary)', fontSize: '14px', marginTop: '4px' }}>{matchedVol.skills || "Not specified"}</p>
                          </div>

                          <div className="form-group">
                            <label>Duty Availability Status</label>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '6px' }}>
                              <button
                                className={`btn ${matchedVol.available ? 'btn-success' : 'btn-secondary'}`}
                                onClick={async () => {
                                  await api.volunteers.updateAvailability(matchedVol.id, !matchedVol.available);
                                  loadDashboardData();
                                }}
                              >
                                {matchedVol.available ? "● ONLINE / DISPATCHABLE" : "○ BUSY / OFF-DUTY"}
                              </button>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)' }}>
                                Toggle status to trigger active SOS dispatch.
                              </span>
                            </div>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="card glassmorphism">
                      <h3>ENLIST AS FIELD VOLUNTEER</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        Provide your specific skills (e.g. Medical Aid, Heavy Machinery, Debris Removal) to accept coordinate dispatches.
                      </p>
                      {currentUser ? (
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          const skills = e.target.skills.value;
                          try {
                            await api.volunteers.register(skills);
                            alert("Volunteer profile registered successfully! Welcome on duty.");
                            loadDashboardData();
                          } catch (err) {
                            alert(err.message);
                          }
                        }}>
                          <div className="form-group">
                            <label>Professional Relief Skills *</label>
                            <input type="text" name="skills" className="form-input" placeholder="e.g. Paramedic EMT, Heavy Driver, Search & Rescue" required />
                          </div>
                          <button type="submit" className="btn btn-primary btn-full">
                            🛡 ENLIST TO COMMAND BASE
                          </button>
                        </form>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '16px 0' }}>
                          <p style={{ fontSize: '12px', color: 'var(--accent-red)', marginBottom: '12px' }}>Please log in to register a volunteer profile.</p>
                          <button className="btn btn-secondary" onClick={() => navigateTo('auth')}>Log In Commander</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Operational Stats info */}
                  <div className="card">
                    <h3>VOLUNTEER STATISTICS</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>Total Enlisted Personnel:</span>
                        <strong>{volunteers.length}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>Active Standby Responders:</span>
                        <strong style={{ color: 'var(--primary)' }}>{volunteers.filter(v => v.available).length}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px' }}>
                        <span>Assigned Dispatch Duty:</span>
                        <strong style={{ color: 'var(--accent-orange)' }}>
                          {emergencyRequests.filter(s => s.status === 'ASSIGNED').length}
                        </strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel: SOS Missions control */}
                <div className="card">
                  <h3>SOS EMERGENCY MISSIONS</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    Review real-time citizen distress beacon broadcasts and coordinate active dispatches:
                  </p>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '520px', overflowY: 'auto' }}>
                    {emergencyRequests.length === 0 ? (
                      <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '24px 0' }}>No active distress alerts logged.</p>
                    ) : (
                      emergencyRequests.map(sos => (
                        <div key={sos.id} className="card glassmorphism" style={{ borderLeftWidth: '4px', borderLeftColor: sos.status === 'PENDING' ? 'var(--accent-red)' : sos.status === 'ASSIGNED' ? 'var(--primary)' : 'var(--accent-green)' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <span className={`badge ${sos.severity}`}>{sos.severity} SOS</span>
                            <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>🕒 {new Date(sos.requestedAt).toLocaleTimeString()}</span>
                          </div>

                          <div style={{ fontSize: '13px', marginBottom: '6px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Requester: </span>
                            <strong>{sos.requesterName}</strong> | 📞 {sos.requesterPhone}
                          </div>

                          <div style={{ fontSize: '13px', marginBottom: '8px' }}>
                            <span style={{ color: 'var(--text-secondary)' }}>Location: </span>
                            <strong style={{ color: 'var(--primary)' }}>{sos.location}</strong>
                          </div>

                          <div style={{ fontSize: '12.5px', background: 'rgba(0,0,0,0.15)', padding: '8px', borderRadius: '4px', color: '#e2e8f0', marginBottom: '10px' }}>
                            {sos.description}
                          </div>

                          {sos.status === 'PENDING' ? (
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                              {currentUser && currentUser.role === 'ROLE_VOLUNTEER' ? (
                                (() => {
                                  const selfVol = volunteers.find(v => v.userId === currentUser.id);
                                  return (
                                    <button
                                      className="btn btn-primary"
                                      onClick={async () => {
                                        if (selfVol) {
                                          await api.volunteers.assignEmergencyRequest(sos.id, selfVol.id);
                                          loadDashboardData();
                                        }
                                      }}
                                    >
                                      🚨 ACCEPT DISPATCH
                                    </button>
                                  );
                                })()
                              ) : (
                                <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Only registered volunteers can accept dispatch.</span>
                              )}
                            </div>
                          ) : sos.status === 'ASSIGNED' ? (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(0, 242, 254, 0.04)', padding: '6px 10px', borderRadius: '6px', border: '1px solid rgba(0, 242, 254, 0.1)' }}>
                              <span style={{ fontSize: '12px', color: 'var(--primary)' }}>
                                👤 Assigned: <strong>{sos.assignedVolunteer?.username}</strong>
                              </span>
                              {currentUser && currentUser.role === 'ROLE_VOLUNTEER' && volunteers.find(v => v.userId === currentUser.id)?.id === sos.assignedVolunteer?.id && (
                                <button
                                  className="btn btn-success"
                                  style={{ padding: '4px 8px', fontSize: '10px' }}
                                  onClick={async () => {
                                    await api.volunteers.completeEmergencyRequest(sos.id);
                                    loadDashboardData();
                                  }}
                                >
                                  Mark Completed
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="badge COMPLETED" style={{ alignSelf: 'flex-start' }}>✓ Rescue Mission Completed</span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SCREEN: NGO LINKAGE HUB
              ========================================== */}
          {currentScreen === 'ngos' && (
            <div className="fade-in">
              <div className="dashboard-split" style={{ gridTemplateColumns: '1.2fr 1.8fr' }}>
                
                {/* Left Panel: NGO enlist form */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                  {currentUser && currentUser.role === 'ROLE_NGO' ? (
                    <div className="card glassmorphism">
                      <h3>REGISTERED NGO STATUS</h3>
                      <div className="user-badge-mini" style={{ margin: '12px 0' }}>
                        <div className="avatar">🏢</div>
                        <div>
                          <strong>NGO COORDINATOR</strong>
                          <span style={{ display: 'block', fontSize: '10px', color: 'var(--text-secondary)' }}>Access Authorized</span>
                        </div>
                      </div>
                      <p style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                        You have unlocked the NGO coordination console! You can now manage resource inventories and setup housing shelters.
                      </p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '16px' }}>
                        <button className="btn btn-primary btn-full" onClick={() => navigateTo('resources')}>
                          📦 RESOURCE CATALOG
                        </button>
                        <button className="btn btn-secondary btn-full" onClick={() => navigateTo('shelters')}>
                          🏨 SHELTER MONITOR
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="card glassmorphism">
                      <h3>ENLIST RELIEF ORGANIZATION</h3>
                      <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                        Register your NGO credentials to access resource stock levels control and shelter capacities update.
                      </p>
                      
                      {currentUser ? (
                        <form onSubmit={async (e) => {
                          e.preventDefault();
                          const form = e.target;
                          try {
                            await api.ngos.register(
                              form.ngoName.value,
                              form.regNumber.value,
                              form.contactEmail.value,
                              form.focusArea.value
                            );
                            alert("NGO registered successfully! Organization linkage active.");
                            loadDashboardData();
                          } catch (err) {
                            alert(err.message);
                          }
                        }}>
                          <div className="form-group">
                            <label>NGO Organization Name *</label>
                            <input type="text" name="ngoName" className="form-input" placeholder="e.g. Red Cross Emergency Unit" required />
                          </div>
                          <div className="form-group">
                            <label>Tax Registration License Number *</label>
                            <input type="text" name="regNumber" className="form-input" placeholder="e.g. NGO-109283-RC" required />
                          </div>
                          <div className="form-group">
                            <label>Primary Contact Email *</label>
                            <input type="email" name="contactEmail" className="form-input" placeholder="relief@redcross.org" required />
                          </div>
                          <div className="form-group">
                            <label>Operational Focus Areas</label>
                            <input type="text" name="focusArea" className="form-input" placeholder="e.g. Water Distribution, Emergency Medicine" />
                          </div>
                          <button type="submit" className="btn btn-primary btn-full">
                            🏢 ENLIST ORGANIZATION
                          </button>
                        </form>
                      ) : (
                        <div style={{ textAlign: 'center', padding: '16px 0' }}>
                          <p style={{ fontSize: '12px', color: 'var(--accent-red)', marginBottom: '12px' }}>Please log in to register an NGO profile.</p>
                          <button className="btn btn-secondary" onClick={() => navigateTo('auth')}>Log In Commander</button>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Distribution Quick Info */}
                  <div className="card">
                    <h3>NGO LINKAGE SUMMARY</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', fontSize: '13px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Registered Relief NGOs:</span>
                        <strong>{ngos.length}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Supplies Items Enlisted:</span>
                        <strong>{resources.length}</strong>
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <span>Coordinated Shelters:</span>
                        <strong>{shelters.length}</strong>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Registered NGO Catalog */}
                <div className="card">
                  <h3>PARTNER ORGANIZATIONS DIRECTORY</h3>
                  <div className="table-responsive">
                    <table className="tactical-table">
                      <thead>
                        <tr>
                          <th>Organization Name</th>
                          <th>Reg License</th>
                          <th>Focus Focus Areas</th>
                          <th>Official Email</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ngos.map(ngo => (
                          <tr key={ngo.id}>
                            <td><strong>{ngo.name}</strong></td>
                            <td style={{ fontFamily: 'var(--font-mono)' }}>{ngo.registrationNumber}</td>
                            <td>{ngo.focusArea}</td>
                            <td>{ngo.contactEmail}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SCREEN: RESOURCES INVENTORY DEPOT
              ========================================== */}
          {currentScreen === 'resources' && (
            <div className="fade-in">
              <div className="dashboard-split" style={{ gridTemplateColumns: '1.2fr 1.8fr' }}>
                
                {/* Left Panel: Register Resource supplies */}
                <div className="card glassmorphism">
                  <h3>REGISTER EMERGENCY SUPPLIES</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Add relief goods, medical accessories, water, or food packets. Ensure quantity corresponds to active depot stocks.
                  </p>
                  
                  {currentUser ? (
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.target;
                      try {
                        await api.resources.create(
                          form.resourceName.value,
                          form.resourceType.value,
                          form.quantity.value,
                          form.description.value,
                          form.location.value,
                          form.shelterId.value
                        );
                        alert("Emergency supplies logged successfully.");
                        form.reset();
                        loadDashboardData();
                      } catch (err) {
                        alert(err.message);
                      }
                    }}>
                      <div className="form-group">
                        <label>Item Name *</label>
                        <input type="text" name="resourceName" className="form-input" placeholder="e.g. Emergency Blankets (Woolen)" required />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Category *</label>
                          <select name="resourceType" className="form-input">
                            <option value="WATER">WATER</option>
                            <option value="FOOD">FOOD</option>
                            <option value="MEDICAL">MEDICAL SUPPLY</option>
                            <option value="BLANKETS">BLANKETS & UTILITY</option>
                          </select>
                        </div>
                        <div className="form-group">
                          <label>Initial Quantity *</label>
                          <input type="number" name="quantity" className="form-input" min="1" placeholder="100" required />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Storage Depot Location Name *</label>
                        <input type="text" name="location" className="form-input" placeholder="e.g. NGO Warehouse North" required />
                      </div>

                      <div className="form-group">
                        <label>Shelter Association (Optional)</label>
                        <select name="shelterId" className="form-input">
                          <option value="">-- No Shelter Association --</option>
                          {shelters.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                      </div>

                      <div className="form-group">
                        <label>Item Description / Specifications</label>
                        <textarea name="description" className="form-input" rows="3" placeholder="Specify brand, weight, sterile status, expiry information, etc."></textarea>
                      </div>

                      <button type="submit" className="btn btn-primary btn-full">
                        📦 STOCK RELIEF GOODS
                      </button>
                    </form>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                      <p style={{ fontSize: '12px', color: 'var(--accent-red)', marginBottom: '12px' }}>Please log in to add emergency resources.</p>
                      <button className="btn btn-secondary" onClick={() => navigateTo('auth')}>Log In Commander</button>
                    </div>
                  )}
                </div>

                {/* Right Panel: Inventory list and Adjust Quantities */}
                <div className="card">
                  <h3>DEPOT INVENTORY & LOGISTICS CONTROL</h3>
                  
                  <div className="table-responsive">
                    <table className="tactical-table">
                      <thead>
                        <tr>
                          <th>Supplies Item</th>
                          <th>Category</th>
                          <th>Stock Level</th>
                          <th>Depot Location</th>
                          <th>Status</th>
                          {currentUser && <th>Manage Stock</th>}
                        </tr>
                      </thead>
                      <tbody>
                        {resources.map(res => (
                          <tr key={res.id}>
                            <td>
                              <strong>{res.name}</strong>
                              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)' }}>{res.description}</span>
                            </td>
                            <td>{res.type}</td>
                            <td style={{ fontWeight: 'bold', fontSize: '14px', color: res.quantity === 0 ? 'var(--accent-red)' : 'inherit' }}>
                              {res.quantity} units
                            </td>
                            <td>{res.location}</td>
                            <td><span className={`badge ${res.status}`}>{res.status}</span></td>
                            {currentUser && (
                              <td>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                  <button
                                    className="btn btn-secondary"
                                    style={{ padding: '2px 8px', fontSize: '11px' }}
                                    onClick={async () => {
                                      const nextQty = Math.max(0, res.quantity - 10);
                                      await api.resources.updateQuantity(res.id, nextQty);
                                      loadDashboardData();
                                    }}
                                  >
                                    -10
                                  </button>
                                  <button
                                    className="btn btn-secondary"
                                    style={{ padding: '2px 8px', fontSize: '11px' }}
                                    onClick={async () => {
                                      const nextQty = res.quantity + 10;
                                      await api.resources.updateQuantity(res.id, nextQty);
                                      loadDashboardData();
                                    }}
                                  >
                                    +10
                                  </button>
                                </div>
                              </td>
                            )}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SCREEN: SHELTERS AND CAPACITY TRACKING
              ========================================== */}
          {currentScreen === 'shelters' && (
            <div className="fade-in">
              <div className="dashboard-split" style={{ gridTemplateColumns: '1.2fr 1.8fr' }}>
                
                {/* Left Panel: Create Shelter */}
                <div className="card glassmorphism">
                  <h3>SETUP RELIEF SHELTER</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '16px' }}>
                    Create temporary coordinates for refugee housing centers, municipal arenas, or school stadium locations.
                  </p>
                  
                  {currentUser ? (
                    <form onSubmit={async (e) => {
                      e.preventDefault();
                      const form = e.target;
                      try {
                        await api.shelters.create(
                          form.shelterName.value,
                          form.locationName.value,
                          form.capacity.value,
                          form.initialOcc.value,
                          form.contact.value,
                          form.lat.value,
                          form.lng.value
                        );
                        alert("Relief shelter registered successfully.");
                        form.reset();
                        loadDashboardData();
                      } catch (err) {
                        alert(err.message);
                      }
                    }}>
                      <div className="form-group">
                        <label>Shelter Name / Facility *</label>
                        <input type="text" name="shelterName" className="form-input" placeholder="e.g. Shelter Delta - Central Park" required />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Total Capacity *</label>
                          <input type="number" name="capacity" className="form-input" min="10" placeholder="200" required />
                        </div>
                        <div className="form-group">
                          <label>Occupied Initially</label>
                          <input type="number" name="initialOcc" className="form-input" min="0" defaultValue="0" />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Location Sector Name *</label>
                        <input type="text" name="locationName" className="form-input" placeholder="e.g. Downtown Central" required />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label>Latitude</label>
                          <input type="number" step="0.0001" name="lat" className="form-input" defaultValue="35.65" />
                        </div>
                        <div className="form-group">
                          <label>Longitude</label>
                          <input type="number" step="0.0001" name="lng" className="form-input" defaultValue="139.75" />
                        </div>
                      </div>

                      <div className="form-group">
                        <label>Emergency Contact Information *</label>
                        <input type="text" name="contact" className="form-input" placeholder="e.g. Captain Miller - +1 555-0810" required />
                      </div>

                      <button type="submit" className="btn btn-primary btn-full">
                        🏨 REGISTER TEMPORARY HOUSING
                      </button>
                    </form>
                  ) : (
                    <div style={{ textAlign: 'center', padding: '16px 0' }}>
                      <p style={{ fontSize: '12px', color: 'var(--accent-red)', marginBottom: '12px' }}>Please log in to set up shelters.</p>
                      <button className="btn btn-secondary" onClick={() => navigateTo('auth')}>Log In Commander</button>
                    </div>
                  )}
                </div>

                {/* Right Panel: Shelter occupancy meters */}
                <div className="card">
                  <h3>SHELTER DENSITY & STATUS MONITOR</h3>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '12px' }}>
                    {shelters.map(shelter => {
                      const occupancyRate = Math.round((shelter.occupiedCapacity / shelter.capacity) * 100);
                      return (
                        <div key={shelter.id} className="card glassmorphism" style={{ padding: '16px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                            <div>
                              <strong style={{ fontSize: '15px' }}>{shelter.name}</strong>
                              <span style={{ display: 'block', fontSize: '11px', color: 'var(--text-secondary)' }}>
                                Sector: <strong>{shelter.location}</strong> | Contact: {shelter.contactInfo}
                              </span>
                            </div>
                            <span className={`badge ${shelter.status}`}>{shelter.status}</span>
                          </div>

                          {/* Gauge meter bar */}
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                              <span>Occupancy Loading:</span>
                              <strong style={{ color: occupancyRate >= 90 ? 'var(--accent-red)' : 'inherit' }}>
                                {shelter.occupiedCapacity} / {shelter.capacity} Housed ({occupancyRate}%)
                              </strong>
                            </div>
                            <div style={{ height: '8px', background: 'rgba(255,255,255,0.06)', borderRadius: '4px', overflow: 'hidden' }}>
                              <div style={{
                                height: '100%',
                                background: occupancyRate >= 90 ? 'linear-gradient(90deg, #ff4e50, #d63031)' : 'linear-gradient(90deg, #11998e, #00b894)',
                                width: `${Math.min(100, occupancyRate)}%`,
                                transition: 'width 0.4s ease-in-out'
                              }}></div>
                            </div>
                          </div>

                          {/* Occupancy management controls for logged-in NGO/Admin */}
                          {currentUser && (
                            <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Update Housing:</span>
                              <input
                                type="range"
                                min="0"
                                max={shelter.capacity}
                                value={shelter.occupiedCapacity}
                                style={{ flex: 1, accentColor: 'var(--primary)', cursor: 'pointer' }}
                                onChange={async (e) => {
                                  const nextOcc = parseInt(e.target.value);
                                  await api.shelters.updateOccupancy(shelter.id, nextOcc);
                                  loadDashboardData();
                                }}
                              />
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button
                                  className="btn btn-secondary"
                                  style={{ padding: '2px 6px', fontSize: '10px' }}
                                  onClick={async () => {
                                    await api.shelters.updateStatus(shelter.id, 'ACTIVE');
                                    loadDashboardData();
                                  }}
                                >
                                  Set Open
                                </button>
                                <button
                                  className="btn btn-danger"
                                  style={{ padding: '2px 6px', fontSize: '10px' }}
                                  onClick={async () => {
                                    await api.shelters.updateStatus(shelter.id, 'CLOSED');
                                    loadDashboardData();
                                  }}
                                >
                                  Close
                                </button>
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ==========================================
              SCREEN: INSIGHTS ANALYTICS & AUDIT LOGS
              ========================================== */}
          {currentScreen === 'analytics' && (
            <div className="fade-in">
              
              {/* Premium Custom SVG Charts Row */}
              <div className="charts-row" style={{ marginBottom: '24px' }}>
                <TacticalBarChart
                  title="CRISIS SEVERITY DISTRIBUTION"
                  data={[
                    { label: 'CRITICAL', value: disasters.filter(d => d.severity === 'CRITICAL').length },
                    { label: 'HIGH', value: disasters.filter(d => d.severity === 'HIGH').length },
                    { label: 'MEDIUM', value: disasters.filter(d => d.severity === 'MEDIUM').length },
                    { label: 'LOW', value: disasters.filter(d => d.severity === 'LOW').length }
                  ]}
                />
                
                <TacticalDonutChart
                  title="RELIEF SUPPLIES STOCK"
                  data={resources.map(r => ({
                    label: r.name.substring(0, 14),
                    value: r.quantity
                  }))}
                />
                
                <TacticalLineChart
                  title="INCIDENT LOGS TIMELINE"
                  data={[
                    { label: '08:00', value: 1 },
                    { label: '10:00', value: 2 },
                    { label: '12:00', value: 4 },
                    { label: '14:00', value: 3 },
                    { label: '16:00', value: 5 }
                  ]}
                />
              </div>

              <div className="dashboard-split" style={{ gridTemplateColumns: currentUser && currentUser.role === 'ROLE_ADMIN' ? '1.5fr 1.5fr' : '1fr' }}>
                {/* System Audit Action Tracker logs */}
                <div className="card">
                  <h3>SECURITY AUDIT ACTION LOGGER</h3>
                  <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                    Trace administrator transactions, coordinator inventory stocks updates, and responder geodispatches:
                  </p>
                  
                  <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                    <table className="tactical-table">
                      <thead>
                        <tr>
                          <th>User Node</th>
                          <th>Action Performed</th>
                          <th>Source IP</th>
                          <th>Timestamp</th>
                        </tr>
                      </thead>
                      <tbody>
                        {auditLogs.map(log => (
                          <tr key={log.id}>
                            <td><strong style={{ color: 'var(--primary)' }}>{log.user}</strong></td>
                            <td>{log.action}</td>
                            <td style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>{log.ipAddress}</td>
                            <td style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                              {new Date(log.timestamp).toLocaleTimeString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* System Users Manager: ONLY FOR ROLE_ADMIN */}
                {currentUser && currentUser.role === 'ROLE_ADMIN' && (
                  <div className="card">
                    <h3>SYSTEM USERS PRIVILEGES</h3>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '12px' }}>
                      Control database credential roles, and enable/disable account nodes:
                    </p>

                    <div className="table-responsive" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                      <table className="tactical-table">
                        <thead>
                          <tr>
                            <th>User Name</th>
                            <th>Email Domain</th>
                            <th>Role Privilege</th>
                            <th>Node Status</th>
                            <th>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {usersList.map(u => (
                            <tr key={u.id}>
                              <td><strong>{u.username}</strong></td>
                              <td>{u.email}</td>
                              <td><span className="badge MEDIUM" style={{ fontSize: '9px' }}>{u.role.replace('ROLE_', '')}</span></td>
                              <td>
                                <span className={`badge ${u.enabled ? 'ACTIVE' : 'RESOLVED'}`}>
                                  {u.enabled ? 'ENABLED' : 'DISABLED'}
                                </span>
                              </td>
                              <td>
                                <button
                                  className={`btn ${u.enabled ? 'btn-danger' : 'btn-primary'}`}
                                  style={{ padding: '4px 8px', fontSize: '10px' }}
                                  onClick={async () => {
                                    await api.users.toggleStatus(u.id, !u.enabled);
                                    loadDashboardData();
                                  }}
                                >
                                  {u.enabled ? "Disable" : "Enable"}
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

        </section>

      </main>

    </div>
  );
}

export default App;

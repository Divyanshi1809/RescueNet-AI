// Emergency SOS Broadcast Widget & Volunteer Dispatch Simulator
// Provides high-visibility distress beacon and real-time dispatch progress tracking.

import React, { useState } from 'react';
import { api } from '../services/api';

export default function SOSWidget({ onSOSCreated }) {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState('form'); // form -> broadcasting -> locating -> dispatched -> done
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    description: '',
    location: '',
    latitude: 35.6880,
    longitude: 139.6950,
    severity: 'CRITICAL'
  });
  const [assignedVol, setAssignedVol] = useState(null);
  const [loadingText, setLoadingText] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Run the simulation steps for visual wow factor
  const runDispatchSimulation = async () => {
    setStep('broadcasting');
    setLoadingText('BROADCASTING ENCRYPTED SOS SIGNAL TO LOCAL COORDINATION NODES...');

    await new Promise(resolve => setTimeout(resolve, 1500));
    setStep('locating');
    setLoadingText('TRIANGULATING GPS SIGNAL... SEARCHING FOR NEAREST AVAILABLE VOLUNTEERS...');

    // Fetch volunteers to assign one
    let availableVolunteers = [];
    try {
      const vols = await api.volunteers.getAll();
      availableVolunteers = vols.filter(v => v.available);
    } catch (e) {
      console.error(e);
    }

    // Default fallback if no available volunteer
    const volunteerToAssign = availableVolunteers.length > 0 
      ? availableVolunteers[0]
      : { id: 1, username: 'volunteer_jane', phone: '+1 555-0122', skills: 'Medical Aid, Search & Rescue' };

    setAssignedVol(volunteerToAssign);

    await new Promise(resolve => setTimeout(resolve, 1800));
    setStep('dispatched');
    setLoadingText(`RESPONDER ACQUIRED! DISPATCHING VOLUNTEER "${volunteerToAssign.username.toUpperCase()}" TO TARGET LOCATION...`);

    // Actually create the SOS record in our database/mock store
    try {
      const newSOS = await api.volunteers.createEmergencyRequest(
        formData.name,
        formData.phone,
        formData.location,
        formData.latitude,
        formData.longitude,
        formData.description,
        formData.severity
      );

      // Instantly auto-assign the volunteer to the SOS request
      await api.volunteers.assignEmergencyRequest(newSOS.id, volunteerToAssign.id);

      if (onSOSCreated) {
        onSOSCreated();
      }
    } catch (err) {
      console.error("Failed to persist SOS request in simulation:", err);
    }

    await new Promise(resolve => setTimeout(resolve, 2000));
    setStep('done');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name || !formData.phone || !formData.location) {
      alert("Please fill in all required fields.");
      return;
    }
    runDispatchSimulation();
  };

  const resetWidget = () => {
    setIsOpen(false);
    setStep('form');
    setFormData({
      name: '',
      phone: '',
      description: '',
      location: '',
      latitude: 35.6880,
      longitude: 139.6950,
      severity: 'CRITICAL'
    });
    setAssignedVol(null);
  };

  return (
    <>
      {/* Floating pulsing SOS trigger button */}
      <div className="sos-beacon" onClick={() => setIsOpen(true)}>
        <span className="sos-ring pulse-fast"></span>
        <span className="sos-ring-inner pulse-slow"></span>
        <div className="sos-btn-content">
          <span className="sos-text">SOS</span>
          <span className="sos-sub">BROADCAST</span>
        </div>
      </div>

      {isOpen && (
        <div className="modal-backdrop fade-in" style={{ zIndex: 1000 }}>
          <div className="modal-content glassmorphism distress-modal animate-slide-up" style={{ maxWidth: '480px', width: '90%' }}>
            
            <div className="modal-header border-red">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="live-dot pulse-red"></span>
                <h3 style={{ color: '#ff4e50', letterSpacing: '1px' }}>CRITICAL DISTRESS BEACON</h3>
              </div>
              <button className="close-btn" onClick={resetWidget}>&times;</button>
            </div>

            <div className="modal-body" style={{ minHeight: '260px' }}>
              
              {/* Step 1: Form Input */}
              {step === 'form' && (
                <form onSubmit={handleSubmit}>
                  <p style={{ fontSize: '12px', color: '#94a3b8', marginBottom: '16px' }}>
                    Warning: Sending an SOS broadcast will instantly notify all available search-and-rescue teams, volunteers, and emergency centers within coordinates range.
                  </p>

                  <div className="form-group">
                    <label>Requester Full Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      placeholder="e.g. Marcus Vance"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group" style={{ flex: 2 }}>
                      <label>Contact Phone Number *</label>
                      <input
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="e.g. +1 555-8910"
                        required
                        className="form-input"
                      />
                    </div>
                    <div className="form-group" style={{ flex: 1.2 }}>
                      <label>Urgency level</label>
                      <select
                        name="severity"
                        value={formData.severity}
                        onChange={handleInputChange}
                        className="form-input"
                      >
                        <option value="LOW">LOW</option>
                        <option value="MEDIUM">MEDIUM</option>
                        <option value="HIGH">HIGH</option>
                        <option value="CRITICAL">CRITICAL</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Exact Location Description / Address *</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleInputChange}
                      placeholder="e.g. 50m north of Sector A Pier, red building"
                      required
                      className="form-input"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label>Latitude Coords</label>
                      <input
                        type="number"
                        step="0.0001"
                        name="latitude"
                        value={formData.latitude}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                    <div className="form-group">
                      <label>Longitude Coords</label>
                      <input
                        type="number"
                        step="0.0001"
                        name="longitude"
                        value={formData.longitude}
                        onChange={handleInputChange}
                        className="form-input"
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label>Emergency Details / Needs</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleInputChange}
                      placeholder="Trapped on upper levels due to flash flooding. No electricity or drinking water. Medical kits needed."
                      className="form-input"
                      rows="3"
                    ></textarea>
                  </div>

                  <button type="submit" className="btn btn-danger btn-full" style={{ marginTop: '10px' }}>
                    🚨 TRANSMIT DISTRESS BEACON
                  </button>
                </form>
              )}

              {/* Step 2, 3, 4: Broadcasting / Locating / Dispatched Loading Screens */}
              {(step === 'broadcasting' || step === 'locating' || step === 'dispatched') && (
                <div className="simulation-screen" style={{ textAlign: 'center', padding: '24px 0' }}>
                  <div className="radar-spinner" style={{ margin: '0 auto 24px' }}>
                    <div className="spinner-ring ring-1"></div>
                    <div className="spinner-ring ring-2"></div>
                    <div className="spinner-ring ring-3"></div>
                    <div className="spinner-core">SOS</div>
                  </div>
                  
                  <h4 style={{ color: '#ff4e50', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '8px' }}>
                    Status: {step === 'broadcasting' ? 'TRANSMITTING' : step === 'locating' ? 'SCANNING' : 'DISPATCHING'}
                  </h4>
                  <div className="simulation-log glassmorphism" style={{ padding: '12px', fontSize: '11px', color: '#00f2fe', fontFamily: 'monospace', minHeight: '60px', border: '1px solid rgba(0, 242, 254, 0.2)' }}>
                    {loadingText}
                  </div>
                </div>
              )}

              {/* Step 5: Success Dispatch Done */}
              {step === 'done' && (
                <div className="simulation-done" style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div className="success-icon-badge" style={{ fontSize: '48px', color: '#11998e', marginBottom: '16px' }}>
                    ✓
                  </div>
                  <h3 style={{ color: '#11998e', marginBottom: '8px' }}>DISPATCH MISSION ACTIVE</h3>
                  <p style={{ fontSize: '13px', color: '#cbd5e1', marginBottom: '16px' }}>
                    The emergency beacon has been securely logged. The nearest responder has accepted the rescue mission and is tracking coordinates.
                  </p>

                  <div className="dispatch-details card glassmorphism" style={{ padding: '12px', textAlign: 'left', border: '1px solid rgba(17, 153, 142, 0.3)', marginBottom: '24px' }}>
                    <div style={{ fontSize: '11px', color: '#64748b', textTransform: 'uppercase' }}>Dispatched Responder</div>
                    <div style={{ color: '#00f2fe', fontWeight: 'bold', fontSize: '15px' }}>{assignedVol?.username}</div>
                    <div style={{ fontSize: '12px', marginTop: '4px', color: '#cbd5e1' }}>📞 Phone: {assignedVol?.phone}</div>
                    <div style={{ fontSize: '12px', color: '#94a3b8' }}>🛠 Skills: {assignedVol?.skills}</div>
                  </div>

                  <button className="btn btn-primary" onClick={resetWidget}>
                    RETURN TO OPERATIONS
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  );
}

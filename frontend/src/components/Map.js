// High-tech, Command Center Interactive SVG Map for RescueNet-AI
// Allows viewing hotspots, pinning coordinates for reporting, and filtering incidents.

import React, { useState } from 'react';

export default function RescueNetMap({
  disasters = [],
  shelters = [],
  volunteers = [],
  emergencyRequests = [],
  onMapClick = null, // returns { lat, lng }
  selectedPoint = null
}) {
  const [filters, setFilters] = useState({
    disasters: true,
    shelters: true,
    volunteers: true,
    sos: true
  });
  const [hoveredItem, setHoveredItem] = useState(null);

  // Map bounding coordinates corresponding to our mock data locations:
  // Center of Toky/Mock grid: lat: ~35.60 to 35.78, lng: ~139.60 to 139.84
  const mapBounds = {
    minLat: 35.55,
    maxLat: 35.80,
    minLng: 139.55,
    maxLng: 139.90
  };

  // Convert GPS Coordinates to SVG X, Y percentage coordinates
  const getCoords = (lat, lng) => {
    const x = ((lng - mapBounds.minLng) / (mapBounds.maxLng - mapBounds.minLng)) * 100;
    // SVG Y starts from top, so we subtract from 100
    const y = 100 - (((lat - mapBounds.minLat) / (mapBounds.maxLat - mapBounds.minLat)) * 100);
    return {
      x: Math.max(5, Math.min(95, x)), // clamp to ensure visibility
      y: Math.max(5, Math.min(95, y))
    };
  };

  // Reverse mapping: SVG Click Coordinates to GPS
  const handleSvgClick = (e) => {
    if (!onMapClick) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = ((e.clientX - rect.left) / rect.width) * 100;
    const clickY = ((e.clientY - rect.top) / rect.height) * 100;

    const lng = mapBounds.minLng + (clickX / 100) * (mapBounds.maxLng - mapBounds.minLng);
    const lat = mapBounds.minLat + ((100 - clickY) / 100) * (mapBounds.maxLat - mapBounds.minLat);

    onMapClick({
      latitude: parseFloat(lat.toFixed(4)),
      longitude: parseFloat(lng.toFixed(4))
    });
  };

  return (
    <div className="map-container card">
      <div className="map-header">
        <div className="map-title-bar">
          <span className="live-dot pulse-red"></span>
          <h3>INTELLIGENT TACTICAL COMMAND MAP</h3>
        </div>
        <div className="map-filters">
          <button
            className={`filter-btn disaster ${filters.disasters ? 'active' : ''}`}
            onClick={() => setFilters(f => ({ ...f, disasters: !f.disasters }))}
          >
            Disasters
          </button>
          <button
            className={`filter-btn shelter ${filters.shelters ? 'active' : ''}`}
            onClick={() => setFilters(f => ({ ...f, shelters: !f.shelters }))}
          >
            Shelters
          </button>
          <button
            className={`filter-btn volunteer ${filters.volunteers ? 'active' : ''}`}
            onClick={() => setFilters(f => ({ ...f, volunteers: !f.volunteers }))}
          >
            Volunteers
          </button>
          <button
            className={`filter-btn sos ${filters.sos ? 'active' : ''}`}
            onClick={() => setFilters(f => ({ ...f, sos: !f.sos }))}
          >
            SOS Alerts
          </button>
        </div>
      </div>

      <div className="map-wrapper" style={{ position: 'relative' }}>
        {/* SVG Tactical Grid Layer */}
        <svg
          viewBox="0 0 100 100"
          className="tactical-map"
          onClick={handleSvgClick}
          style={{
            width: '100%',
            height: '420px',
            background: '#070a13',
            borderRadius: '8px',
            cursor: onMapClick ? 'crosshair' : 'default',
            border: '1px solid rgba(0, 242, 254, 0.15)'
          }}
        >
          {/* Grid lines */}
          <defs>
            <pattern id="grid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="rgba(0, 242, 254, 0.05)" strokeWidth="0.5" />
            </pattern>
            <radialGradient id="map-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(15, 23, 42, 0)" />
              <stop offset="100%" stopColor="rgba(0, 242, 254, 0.05)" />
            </radialGradient>
          </defs>
          <rect width="100" height="100" fill="url(#grid)" />
          <rect width="100" height="100" fill="url(#map-glow)" />

          {/* Tactical Boundaries / Sectors */}
          {/* Coastal Area */}
          <path d="M 0,100 L 40,75 L 60,65 L 100,50 L 100,100 Z" fill="rgba(0, 242, 254, 0.02)" stroke="rgba(0, 242, 254, 0.08)" strokeDasharray="2,2" />
          <text x="80" y="85" fill="rgba(0, 242, 254, 0.3)" fontSize="2.5" fontWeight="bold">COASTAL ZONE</text>
          
          {/* Industrial Park */}
          <rect x="5" y="5" width="30" height="25" fill="rgba(255, 78, 80, 0.01)" stroke="rgba(255, 78, 80, 0.05)" strokeDasharray="1,2" />
          <text x="8" y="10" fill="rgba(255, 78, 80, 0.25)" fontSize="2.5" fontWeight="bold">INDUSTRIAL PARK</text>

          {/* Downtown Core */}
          <circle cx="65" cy="35" r="15" fill="none" stroke="rgba(127, 0, 255, 0.1)" strokeDasharray="4,4" />
          <text x="58" y="36" fill="rgba(127, 0, 255, 0.3)" fontSize="2.5" fontWeight="bold">METRO CORE</text>

          {/* Crosshair guidelines on selection */}
          {selectedPoint && (
            (() => {
              const pt = getCoords(selectedPoint.latitude, selectedPoint.longitude);
              return (
                <g>
                  <line x1="0" y1={pt.y} x2="100" y2={pt.y} stroke="rgba(0, 242, 254, 0.4)" strokeWidth="0.3" strokeDasharray="1,1" />
                  <line x1={pt.x} y1="0" x2={pt.x} y2="100" stroke="rgba(0, 242, 254, 0.4)" strokeWidth="0.3" strokeDasharray="1,1" />
                  <circle cx={pt.x} cy={pt.y} r="2.5" fill="none" stroke="#00f2fe" strokeWidth="0.5" />
                  <circle cx={pt.x} cy={pt.y} r="1" fill="#00f2fe" />
                </g>
              );
            })()
          )}

          {/* Render Active Volunteers */}
          {filters.volunteers && volunteers.map(vol => {
            // Assign some mock coordinates near locations for mapping
            const seedOffset = (vol.id * 0.03) - 0.05;
            const pt = getCoords(35.6895 + seedOffset, 139.7300 - seedOffset);
            return (
              <g
                key={`vol-${vol.id}`}
                onMouseEnter={() => setHoveredItem({ type: 'Volunteer', ...vol })}
                onMouseLeave={() => setHoveredItem(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={pt.x} cy={pt.y} r="1.5" fill="#4facfe" opacity="0.6" />
                <circle cx={pt.x} cy={pt.y} r="0.8" fill="#00f2fe" />
                {vol.available && (
                  <circle cx={pt.x} cy={pt.y} r="2.5" fill="none" stroke="#00f2fe" strokeWidth="0.2" className="ping-circle" />
                )}
              </g>
            );
          })}

          {/* Render Shelters */}
          {filters.shelters && shelters.map(s => {
            const pt = getCoords(s.latitude, s.longitude);
            const size = 1.5 + (s.capacity / 250);
            const fillCol = s.status === 'FULL' ? 'rgba(255, 78, 80, 0.7)' : 'rgba(17, 153, 142, 0.7)';
            const strokeCol = s.status === 'FULL' ? '#ff4e50' : '#11998e';

            return (
              <g
                key={`shelter-${s.id}`}
                onMouseEnter={() => setHoveredItem({ type: 'Shelter', ...s })}
                onMouseLeave={() => setHoveredItem(null)}
                style={{ cursor: 'pointer' }}
              >
                <polygon
                  points={`${pt.x},${pt.y - size} ${pt.x + size},${pt.y} ${pt.x},${pt.y + size} ${pt.x - size},${pt.y}`}
                  fill={fillCol}
                  stroke={strokeCol}
                  strokeWidth="0.4"
                />
                <circle cx={pt.x} cy={pt.y} r="0.5" fill="#fff" />
              </g>
            );
          })}

          {/* Render Disaster Hotspots */}
          {filters.disasters && disasters.map(d => {
            const pt = getCoords(d.latitude, d.longitude);
            const color = d.severity === 'CRITICAL' ? '#ff4e50' : d.severity === 'HIGH' ? '#ff8c00' : '#ffd700';
            const size = d.severity === 'CRITICAL' ? 3 : d.severity === 'HIGH' ? 2.2 : 1.6;

            if (d.status === 'RESOLVED') return null;

            return (
              <g
                key={`disaster-${d.id}`}
                onMouseEnter={() => setHoveredItem({ type: 'Incident', ...d })}
                onMouseLeave={() => setHoveredItem(null)}
                style={{ cursor: 'pointer' }}
              >
                {/* Glowing ring */}
                <circle cx={pt.x} cy={pt.y} r={size * 1.8} fill="none" stroke={color} strokeWidth="0.3" opacity="0.3" className="ping-circle-slow" />
                <circle cx={pt.x} cy={pt.y} r={size * 0.9} fill="none" stroke={color} strokeWidth="0.5" opacity="0.7" />
                <path
                  d={`M ${pt.x},${pt.y - size} L ${pt.x - size},${pt.y + size} L ${pt.x + size},${pt.y + size} Z`}
                  fill={color}
                  opacity="0.9"
                />
                <circle cx={pt.x} cy={pt.y + (size * 0.4)} r="0.3" fill="#000" />
              </g>
            );
          })}

          {/* Render SOS Emergency Requests */}
          {filters.sos && emergencyRequests.map(sos => {
            const pt = getCoords(sos.latitude, sos.longitude);
            if (sos.status === 'COMPLETED') return null;

            return (
              <g
                key={`sos-${sos.id}`}
                onMouseEnter={() => setHoveredItem({ type: 'SOS Alert', ...sos })}
                onMouseLeave={() => setHoveredItem(null)}
                style={{ cursor: 'pointer' }}
              >
                <circle cx={pt.x} cy={pt.y} r="4" fill="none" stroke="#ff4e50" strokeWidth="0.4" className="ping-circle-fast" />
                <circle cx={pt.x} cy={pt.y} r="1.5" fill="#ff4e50" />
                <circle cx={pt.x} cy={pt.y} r="0.7" fill="#fff" />
              </g>
            );
          })}
        </svg>

        {/* Floating Tooltip/Detail Card */}
        {hoveredItem && (
          <div className="map-tooltip glassmorphism animate-fade-in" style={{
            position: 'absolute',
            bottom: '12px',
            left: '12px',
            right: '12px',
            padding: '12px',
            fontSize: '13px',
            border: '1px solid rgba(255, 255, 255, 0.15)',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
            zIndex: 10,
            pointerEvents: 'none'
          }}>
            <div className="tooltip-title" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <span className={`badge ${hoveredItem.severity || hoveredItem.status || 'INFO'}`} style={{ fontSize: '10px' }}>
                {hoveredItem.type.toUpperCase()}: {hoveredItem.severity || hoveredItem.status}
              </span>
              <strong style={{ color: '#00f2fe' }}>{hoveredItem.location}</strong>
            </div>
            <div style={{ color: '#e2e8f0', fontWeight: 'bold' }}>
              {hoveredItem.title || hoveredItem.name || hoveredItem.requesterName || hoveredItem.username}
            </div>
            {hoveredItem.description && (
              <div style={{ color: '#94a3b8', fontSize: '11px', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {hoveredItem.description}
              </div>
            )}
            {hoveredItem.skills && (
              <div style={{ color: '#4facfe', fontSize: '11px', marginTop: '4px' }}>
                Skills: {hoveredItem.skills}
              </div>
            )}
            {hoveredItem.capacity && (
              <div style={{ marginTop: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#cbd5e1' }}>
                  <span>Occupancy:</span>
                  <span>{hoveredItem.occupiedCapacity} / {hoveredItem.capacity}</span>
                </div>
                <div style={{ background: 'rgba(255,255,255,0.1)', height: '4px', borderRadius: '2px', marginTop: '2px', overflow: 'hidden' }}>
                  <div style={{
                    background: hoveredItem.status === 'FULL' ? '#ff4e50' : '#11998e',
                    height: '100%',
                    width: `${(hoveredItem.occupiedCapacity / hoveredItem.capacity) * 100}%`
                  }}></div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Map Click Instructions */}
        {onMapClick && (
          <div style={{
            position: 'absolute',
            top: '8px',
            right: '8px',
            background: 'rgba(7, 10, 19, 0.85)',
            border: '1px solid rgba(0, 242, 254, 0.3)',
            borderRadius: '4px',
            padding: '4px 8px',
            fontSize: '11px',
            color: '#00f2fe',
            fontWeight: 'bold',
            pointerEvents: 'none'
          }}>
            📍 Click Map to Select Coordinates
          </div>
        )}
      </div>

      <div className="map-footer" style={{ padding: '8px', display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: '#64748b' }}>
        <span>Bounds: SW 35.55°N, 139.55°E — NE 35.80°N, 139.90°E</span>
        {selectedPoint ? (
          <span style={{ color: '#00f2fe', fontWeight: 'bold' }}>
            Selected: {selectedPoint.latitude}, {selectedPoint.longitude}
          </span>
        ) : (
          <span>No Point Selected</span>
        )}
      </div>
    </div>
  );
}

// High-Tech Responsive SVG Charts for RescueNet-AI Dashboard
// Zero-dependency charting components with animations, custom gradients, and glowing overlays.

import React from 'react';

// ==========================================
// 1. BAR CHART: Disaster Severities / Types
// ==========================================
export function TacticalBarChart({ data = [], title = "BAR METRICS" }) {
  const chartHeight = 120;
  const chartWidth = 240;
  const paddingLeft = 35;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 20;

  const graphHeight = chartHeight - paddingTop - paddingBottom;
  const graphWidth = chartWidth - paddingLeft - paddingRight;

  const maxVal = Math.max(...data.map(d => d.value), 5);

  return (
    <div className="custom-chart card">
      <h4 className="chart-title">{title.toUpperCase()}</h4>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto' }}>
        <defs>
          <linearGradient id="barGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#00f2fe" />
            <stop offset="100%" stopColor="#4facfe" />
          </linearGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="1.5" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>

        {/* Horizontal grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
          const y = paddingTop + graphHeight * (1 - p);
          const gridVal = Math.round(maxVal * p);
          return (
            <g key={idx}>
              <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              <text x={paddingLeft - 6} y={y + 3} fill="rgba(255,255,255,0.4)" fontSize="6" textAnchor="end">{gridVal}</text>
            </g>
          );
        })}

        {/* Bars */}
        {data.map((item, index) => {
          const barWidth = graphWidth / (data.length * 1.6);
          const barSpacing = graphWidth / data.length;
          const x = paddingLeft + (index * barSpacing) + (barSpacing - barWidth) / 2;
          const h = (item.value / maxVal) * graphHeight;
          const y = chartHeight - paddingBottom - h;

          return (
            <g key={index} className="chart-bar-group">
              <rect
                x={x}
                y={y}
                width={barWidth}
                height={h}
                fill="url(#barGrad)"
                rx="1.5"
                filter="url(#glow)"
                opacity="0.85"
                style={{ transition: 'all 0.5s ease-in-out' }}
              />
              {/* Value label on hover */}
              <text x={x + barWidth / 2} y={y - 4} fill="#00f2fe" fontSize="6.5" fontWeight="bold" textAnchor="middle">{item.value}</text>
              {/* Category label */}
              <text x={x + barWidth / 2} y={chartHeight - paddingBottom + 10} fill="rgba(255,255,255,0.5)" fontSize="6.5" textAnchor="middle">{item.label}</text>
            </g>
          );
        })}
        
        {/* Base line */}
        <line x1={paddingLeft} y1={chartHeight - paddingBottom} x2={chartWidth - paddingRight} y2={chartHeight - paddingBottom} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      </svg>
    </div>
  );
}

// ==========================================
// 2. DONUT CHART: Resource Quantities
// ==========================================
export function TacticalDonutChart({ data = [], title = "DISTRIBUTION" }) {
  const size = 100;
  const radius = 32;
  const strokeWidth = 8;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  const total = data.reduce((acc, curr) => acc + curr.value, 0) || 1;

  // Track accumulated offsets for SVG stroke dash arrays
  let accumulatedAngle = 0;

  // Harmonious colors for matching keys
  const colors = ["#00f2fe", "#7f00ff", "#ff4e50", "#11998e", "#ffd700", "#ff007f"];

  return (
    <div className="custom-chart card">
      <h4 className="chart-title">{title.toUpperCase()}</h4>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-around', gap: '8px' }}>
        <svg viewBox={`0 0 ${size} ${size}`} style={{ width: '45%', height: 'auto' }}>
          <circle cx={center} cy={center} r={radius} fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth={strokeWidth} />
          {data.map((item, index) => {
            const percentage = item.value / total;
            const strokeLength = percentage * circumference;
            const strokeOffset = circumference - strokeLength + accumulatedAngle;
            accumulatedAngle -= strokeLength;
            const col = colors[index % colors.length];

            return (
              <circle
                key={index}
                cx={center}
                cy={center}
                r={radius}
                fill="none"
                stroke={col}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={strokeOffset}
                transform={`rotate(-90 ${center} ${center})`}
                style={{ transition: 'stroke-dashoffset 0.5s ease-out', cursor: 'pointer' }}
                title={`${item.label}: ${item.value}`}
              />
            );
          })}
          
          {/* Inner stats readout */}
          <text x={center} y={center + 2} fill="#fff" fontSize="7" fontWeight="bold" textAnchor="middle">
            {total} Total
          </text>
        </svg>

        {/* Legend */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', textAlign: 'left', width: '50%' }}>
          {data.map((item, index) => (
            <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '10px' }}>
              <span style={{ display: 'inline-block', width: '8px', height: '8px', borderRadius: '50%', background: colors[index % colors.length] }}></span>
              <span style={{ color: 'rgba(255,255,255,0.7)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '80px' }}>
                {item.label}
              </span>
              <strong style={{ color: '#fff', marginLeft: 'auto' }}>{item.value}</strong>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ==========================================
// 3. LINE CHART: Rescue Incidents Timeline
// ==========================================
export function TacticalLineChart({ data = [], title = "TIMELINE METRICS" }) {
  const chartHeight = 120;
  const chartWidth = 240;
  const paddingLeft = 35;
  const paddingRight = 10;
  const paddingTop = 15;
  const paddingBottom = 20;

  const graphHeight = chartHeight - paddingTop - paddingBottom;
  const graphWidth = chartWidth - paddingLeft - paddingRight;

  const maxVal = Math.max(...data.map(d => d.value), 5);

  // Generate SVG coordinates path
  const points = data.map((item, index) => {
    const x = paddingLeft + (index / (data.length - 1 || 1)) * graphWidth;
    const y = paddingTop + graphHeight * (1 - (item.value / maxVal));
    return { x, y };
  });

  const pathD = points.reduce((acc, p, idx) => {
    return idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`;
  }, "");

  // Generate filled area under path for a glowing gradient fill
  const areaD = points.length > 0
    ? `${pathD} L ${points[points.length - 1].x} ${chartHeight - paddingBottom} L ${points[0].x} ${chartHeight - paddingBottom} Z`
    : "";

  return (
    <div className="custom-chart card">
      <h4 className="chart-title">{title.toUpperCase()}</h4>
      <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} style={{ width: '100%', height: 'auto' }}>
        <defs>
          <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(127, 0, 255, 0.4)" />
            <stop offset="100%" stopColor="rgba(127, 0, 255, 0.0)" />
          </linearGradient>
          <linearGradient id="lineGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#7f00ff" />
            <stop offset="100%" stopColor="#00f2fe" />
          </linearGradient>
          <filter id="lineGlow">
            <feGaussianBlur stdDeviation="1" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Horizontal grids */}
        {[0, 0.25, 0.5, 0.75, 1].map((p, idx) => {
          const y = paddingTop + graphHeight * (1 - p);
          const gridVal = Math.round(maxVal * p);
          return (
            <g key={idx}>
              <line x1={paddingLeft} y1={y} x2={chartWidth - paddingRight} y2={y} stroke="rgba(255,255,255,0.06)" strokeWidth="0.5" />
              <text x={paddingLeft - 6} y={y + 3} fill="rgba(255,255,255,0.4)" fontSize="6" textAnchor="end">{gridVal}</text>
            </g>
          );
        })}

        {/* Filled glow area */}
        {areaD && <path d={areaD} fill="url(#areaGrad)" />}

        {/* Line */}
        {pathD && (
          <path
            d={pathD}
            fill="none"
            stroke="url(#lineGrad)"
            strokeWidth="1.5"
            filter="url(#lineGlow)"
          />
        )}

        {/* Node Points */}
        {points.map((p, idx) => (
          <g key={idx} className="chart-node">
            <circle cx={p.x} cy={p.y} r="2.5" fill="rgba(127, 0, 255, 0.3)" />
            <circle cx={p.x} cy={p.y} r="1.2" fill="#00f2fe" />
            {/* Value indicator tooltip */}
            <text x={p.x} y={p.y - 4} fill="#fff" fontSize="6.5" textAnchor="middle" fontWeight="bold">{data[idx].value}</text>
            {/* Horizontal Axis label */}
            <text x={p.x} y={chartHeight - paddingBottom + 10} fill="rgba(255,255,255,0.5)" fontSize="5.5" textAnchor="middle">{data[idx].label}</text>
          </g>
        ))}

        {/* Base axis lines */}
        <line x1={paddingLeft} y1={chartHeight - paddingBottom} x2={chartWidth - paddingRight} y2={chartHeight - paddingBottom} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
      </svg>
    </div>
  );
}

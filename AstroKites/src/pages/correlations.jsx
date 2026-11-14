import React, { useState, useEffect } from "react";
import "./correlations.css";
import {
  getVariables,
  getIndianStates,
  getBivariateCorrelation,
  getCorrelationMatrix,
  detectAnomalies
} from "../api/axios";

const CorrelationsPage = () => {
  const [variables, setVariables] = useState([
    { id: "temperature", label: "Temperature" },
    { id: "rainfall", label: "Rainfall" },
    { id: "soil_moisture", label: "Soil Moisture" },
    { id: "vegetation", label: "Vegetation (NDVI)" },
    { id: "wind_speed", label: "Wind Speed" },
    { id: "humidity", label: "Humidity" },
  ]);
  const [states, setStates] = useState([]);

  const [selectedState, setSelectedState] = useState("IN-MH");
  const [var1, setVar1] = useState("rainfall");
  const [var2, setVar2] = useState("vegetation");

  const [corrData, setCorrData] = useState(null);
  const [matrixData, setMatrixData] = useState(null);
  const [anomaliesData, setAnomaliesData] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    getVariables().then((res) => {
      if (res.ok && res.data?.variables) setVariables(res.data.variables);
    });
    getIndianStates().then((res) => {
      if (res.ok && res.data?.states) setStates(res.data.states);
    });
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [cRes, mRes, aRes] = await Promise.all([
      getBivariateCorrelation({ region_id: selectedState, variable_1: var1, variable_2: var2 }),
      getCorrelationMatrix(selectedState),
      detectAnomalies({ region_id: selectedState, variable: var1 })
    ]);

    if (cRes.ok && cRes.data?.correlation) setCorrData(cRes.data.correlation);
    if (mRes.ok && mRes.data?.data) setMatrixData(mRes.data.data);
    if (aRes.ok && aRes.data?.anomalies) setAnomaliesData(aRes.data);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedState, var1, var2]);

  // Scatter plot SVG renderer
  const renderScatter = () => {
    if (!corrData || !corrData.scatter_points || corrData.scatter_points.length === 0) {
      return <div className="chart-empty">No overlapping data points</div>;
    }

    const width = 500;
    const height = 300;
    const pad = 45;

    const xs = corrData.scatter_points.map((p) => p.x);
    const ys = corrData.scatter_points.map((p) => p.y);

    const minX = Math.min(...xs);
    const maxX = Math.max(...xs);
    const minY = Math.min(...ys);
    const maxY = Math.max(...ys);

    const rangeX = maxX - minX || 1.0;
    const rangeY = maxY - minY || 1.0;

    const getX = (val) => pad + ((val - minX) / rangeX) * (width - 2 * pad);
    const getY = (val) => height - pad - ((val - minY) / rangeY) * (height - 2 * pad);

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="scatter-svg" width="100%" height={height}>
        {/* Axes */}
        <line x1={pad} y1={height - pad} x2={width - pad} y2={height - pad} stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1={pad} y1={pad} x2={pad} y2={height - pad} stroke="#cbd5e1" strokeWidth="1.5" />

        {/* Scatter dots */}
        {corrData.scatter_points.map((pt, i) => (
          <circle
            key={i}
            cx={getX(pt.x)}
            cy={getY(pt.y)}
            r="4.5"
            fill="#3b82f6"
            fillOpacity="0.75"
            stroke="#1d4ed8"
            strokeWidth="1"
          >
            <title>{`${pt.date}: X=${pt.x.toFixed(2)}, Y=${pt.y.toFixed(2)}`}</title>
          </circle>
        ))}

        <text x={width / 2} y={height - 10} textAnchor="middle" fontSize="11" fill="#475569" fontWeight="600">
          {var1.toUpperCase()}
        </text>
        <text
          x={14}
          y={height / 2}
          textAnchor="middle"
          fontSize="11"
          fill="#475569"
          fontWeight="600"
          transform={`rotate(-90 14 ${height / 2})`}
        >
          {var2.toUpperCase()}
        </text>
      </svg>
    );
  };

  return (
    <div className="fs-container">
      <header className="fs-header">
        <div>
          <h1 className="page-title">
            Variable Relationships & <span className="highlight">Anomaly Detection</span>
          </h1>
          <p className="muted">
            Assess coupled land-atmosphere feedbacks, bivariate correlations, and climatological anomalies
          </p>
        </div>
        <div className="header-badge">
          <span className="badge-tag">Coupled Earth System</span>
          <span className="badge-sub">Pearson & Spearman Matrix</span>
        </div>
      </header>

      {/* Selectors */}
      <section className="fs-controls">
        <div className="controls-grid">
          <div className="selector-group">
            <label className="selector-label">Region</label>
            <select
              className="control-select"
              value={selectedState}
              onChange={(e) => setSelectedState(e.target.value)}
            >
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="selector-group">
            <label className="selector-label">Variable 1 (X Axis)</label>
            <select className="control-select" value={var1} onChange={(e) => setVar1(e.target.value)}>
              {variables.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>

          <div className="selector-group">
            <label className="selector-label">Variable 2 (Y Axis)</label>
            <select className="control-select" value={var2} onChange={(e) => setVar2(e.target.value)}>
              {variables.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Relationship Metrics & Scatter */}
      {corrData && (
        <div className="corr-metrics-grid">
          <div className="corr-card">
            <h3>Bivariate Correlation Results</h3>
            <div className="corr-stats-row">
              <span className="corr-stat-label">Pearson Linear r:</span>
              <span className="corr-stat-val bold">{corrData.pearson?.r > 0 ? "+" : ""}{corrData.pearson?.r.toFixed(3)}</span>
            </div>
            <div className="corr-stats-row">
              <span className="corr-stat-label">Pearson Significance:</span>
              <span className="corr-stat-val">p = {corrData.pearson?.p_value.toFixed(4)} ({corrData.pearson?.is_significant ? "Significant" : "Not Significant"})</span>
            </div>
            <div className="corr-stats-row">
              <span className="corr-stat-label">Spearman Rank rho:</span>
              <span className="corr-stat-val bold">{corrData.spearman?.rho > 0 ? "+" : ""}{corrData.spearman?.rho.toFixed(3)}</span>
            </div>
            <div className="corr-stats-row">
              <span className="corr-stat-label">Sample Size (n):</span>
              <span className="corr-stat-val">{corrData.sample_size} synchronized months</span>
            </div>
            <div className="interpretation-box">
              {corrData.interpretation}
            </div>
          </div>

          <div className="scatter-card">
            <h3>Synchronized Scatter Distribution</h3>
            {renderScatter()}
          </div>
        </div>
      )}

      {/* 6x6 Correlation Matrix Heatmap */}
      {matrixData && (
        <div className="matrix-card">
          <h3>Full 6x6 Environmental Correlation Matrix: {matrixData.region_id}</h3>
          <p className="muted" style={{ marginBottom: "16px" }}>
            Blue = Positive correlation | Red = Negative correlation
          </p>
          <div className="matrix-table-wrapper">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Variable</th>
                  {matrixData.variables.map((v, i) => (
                    <th key={i}>{v.replace("_", " ")}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matrixData.matrix.map((row, i) => (
                  <tr key={i}>
                    <td className="row-header">{matrixData.variables[i].replace("_", " ")}</td>
                    {row.map((cell, j) => {
                      const r = cell.r;
                      const bg =
                        r > 0
                          ? `rgba(59, 130, 246, ${Math.min(0.85, Math.abs(r))})`
                          : `rgba(239, 68, 68, ${Math.min(0.85, Math.abs(r))})`;
                      const textColor = Math.abs(r) > 0.4 ? "#ffffff" : "#1e293b";

                      return (
                        <td key={j} style={{ backgroundColor: bg, color: textColor }} className="matrix-cell">
                          {r > 0 ? "+" : ""}
                          {r.toFixed(2)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Anomaly Detection List */}
      {anomaliesData && (
        <div className="anomalies-card">
          <h3>Recent Climatological Anomalies (&gt; 2.0σ from Baseline)</h3>
          <p className="muted" style={{ marginBottom: "16px" }}>
            Identifies unusual extremes distinct from long-term monotonic trends
          </p>
          {anomaliesData.anomalies?.length > 0 ? (
            <div className="anomalies-list">
              {anomaliesData.anomalies.slice(-6).map((anom, i) => (
                <div key={i} className="anomaly-item">
                  <div className="anom-date">{anom.date}</div>
                  <div className="anom-desc">
                    Observed: <strong>{anom.value.toFixed(2)}</strong> (Baseline: {anom.baseline_mean.toFixed(2)})
                  </div>
                  <div className={`anom-badge ${anom.z_score > 0 ? "anom-pos" : "anom-neg"}`}>
                    {anom.z_score > 0 ? "+" : ""}{anom.z_score.toFixed(2)}σ ({anom.severity})
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="muted">No extreme deviations (&gt; 2σ) detected in this period.</div>
          )}
        </div>
      )}
    </div>
  );
};

export default CorrelationsPage;

import React, { useState, useEffect } from "react";
import "./compare.css";
import { getVariables, getIndianStates, compareRegions, getOppositeTrends } from "../api/axios";

const ComparePage = () => {
  const [variables, setVariables] = useState([
    { id: "temperature", label: "Temperature", unit: "°C" },
    { id: "rainfall", label: "Rainfall / Precipitation", unit: "mm/day" },
    { id: "soil_moisture", label: "Soil Moisture", unit: "m³/m³" },
    { id: "vegetation", label: "Vegetation (NDVI)", unit: "NDVI" },
    { id: "wind_speed", label: "Wind Speed", unit: "m/s" },
    { id: "humidity", label: "Relative Humidity", unit: "%" },
  ]);
  const [states, setStates] = useState([]);

  const [selectedVariable, setSelectedVariable] = useState("temperature");
  const [regionA, setRegionA] = useState("IN-MH"); // Maharashtra
  const [regionB, setRegionB] = useState("IN-RJ"); // Rajasthan

  const [loading, setLoading] = useState(false);
  const [compareData, setCompareData] = useState(null);
  const [oppositeTrendsData, setOppositeTrendsData] = useState(null);

  useEffect(() => {
    getVariables().then((res) => {
      if (res.ok && res.data?.variables) setVariables(res.data.variables);
    });
    getIndianStates().then((res) => {
      if (res.ok && res.data?.states) setStates(res.data.states);
    });
  }, []);

  const runComparison = async () => {
    setLoading(true);
    const res = await compareRegions({
      region_ids: [regionA, regionB],
      variable: selectedVariable,
    });
    if (res.ok && res.data?.comparison) {
      setCompareData(res.data.comparison);
    }
    setLoading(false);
  };

  const loadOppositeTrends = async () => {
    const res = await getOppositeTrends(selectedVariable);
    if (res.ok && res.data) {
      setOppositeTrendsData(res.data);
    }
  };

  useEffect(() => {
    runComparison();
    loadOppositeTrends();
  }, [selectedVariable, regionA, regionB]);

  const applyPair = (idA, idB) => {
    setRegionA(idA);
    setRegionB(idB);
  };

  return (
    <div className="fs-container">
      <header className="fs-header">
        <div>
          <h1 className="page-title">
            Regional & <span className="highlight">Opposite Trend Detective</span>
          </h1>
          <p className="muted">
            Identify and evaluate diverging environmental changes across Indian states and agricultural zones
          </p>
        </div>
        <div className="header-badge">
          <span className="badge-tag">Contrasting Dynamics</span>
          <span className="badge-sub">Statistically Verified</span>
        </div>
      </header>

      {/* Selectors */}
      <section className="fs-controls">
        <div className="controls-grid">
          <div className="selector-group">
            <label className="selector-label">Variable</label>
            <select
              className="control-select"
              value={selectedVariable}
              onChange={(e) => setSelectedVariable(e.target.value)}
            >
              {variables.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.label} ({v.unit})
                </option>
              ))}
            </select>
          </div>

          <div className="selector-group">
            <label className="selector-label">Region 1</label>
            <select
              className="control-select"
              value={regionA}
              onChange={(e) => setRegionA(e.target.value)}
            >
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>

          <div className="selector-group">
            <label className="selector-label">Region 2</label>
            <select
              className="control-select"
              value={regionB}
              onChange={(e) => setRegionB(e.target.value)}
            >
              {states.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Side by Side Comparison Cards */}
      {compareData && compareData.regions_compared && (
        <div className="comparison-cards-grid">
          {compareData.regions_compared.map((reg, idx) => {
            const tr = reg.trend;
            const isInc = tr.trend_direction === "Increasing";
            const isDec = tr.trend_direction === "Decreasing";
            const cardTheme = isInc ? "border-green" : isDec ? "border-red" : "border-slate";

            return (
              <div key={idx} className={`comparison-card ${cardTheme}`}>
                <div className="comp-badge">Region {idx + 1}</div>
                <h3 className="comp-region-title">{reg.region_name}</h3>
                <div className="comp-stat-row">
                  <span className="stat-label">Trend Verdict:</span>
                  <span className="stat-val bold">{tr.trend_direction}</span>
                </div>
                <div className="comp-stat-row">
                  <span className="stat-label">Annual Rate (Sen's Slope):</span>
                  <span className="stat-val">
                    {tr.annual_rate > 0 ? "+" : ""}
                    {tr.annual_rate.toFixed(4)} {reg.unit}/yr
                  </span>
                </div>
                <div className="comp-stat-row">
                  <span className="stat-label">Mann-Kendall p-value:</span>
                  <span className="stat-val">{tr.p_value < 0.0001 ? "< 0.0001" : tr.p_value.toFixed(4)}</span>
                </div>
                <div className="comp-stat-row">
                  <span className="stat-label">Statistical Status:</span>
                  <span className="stat-val">
                    {tr.is_significant ? "Statistically Significant (p < 0.05)" : "No Significant Trend"}
                  </span>
                </div>
                <div className="comp-stat-row">
                  <span className="stat-label">95% Confidence Interval:</span>
                  <span className="stat-val">
                    [{tr.confidence_interval_95?.lower.toFixed(4)}, {tr.confidence_interval_95?.upper.toFixed(4)}]
                  </span>
                </div>
                <div className="comp-stat-row">
                  <span className="stat-label">Dataset Source:</span>
                  <span className="stat-val muted-sm">{reg.source}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Opposite Trends Section */}
      {oppositeTrendsData && (
        <div className="opposite-trends-container">
          <div className="opposite-header">
            <h3>⚡ Automatically Detected Opposite & Diverging Trends in India</h3>
            <p className="muted">
              NASA challenge core focus: Identifying geographic regions exhibiting divergent environmental trajectories for {selectedVariable}
            </p>
          </div>

          <div className="pairs-grid">
            {oppositeTrendsData.top_contrasting_pairs &&
              oppositeTrendsData.top_contrasting_pairs.map((pair, i) => (
                <div key={i} className="pair-card">
                  <div className="pair-header">
                    <span className="divergence-tag">
                      Divergence Δ: {pair.divergence_delta.toFixed(4)}/yr
                    </span>
                    <button
                      className="inspect-btn"
                      onClick={() => applyPair(pair.positive_region.region_id, pair.negative_region.region_id)}
                    >
                      Compare These Two
                    </button>
                  </div>
                  <p className="pair-summary">{pair.summary}</p>
                </div>
              ))}
          </div>

          <div className="scientific-caveat-box">
            <strong>Scientific Caution:</strong> Regional divergence does not imply direct physical causation between the two areas. Differing trends arise from coupled microclimate regimes, atmospheric circulation patterns, land use changes, and orographic precipitation gradients.
          </div>
        </div>
      )}
    </div>
  );
};

export default ComparePage;

import { useState, useMemo } from "react";
import { Sparkles, ChevronDown, ChevronUp, Download, MessageSquare, AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { getChartAiInterpretation } from "../aiInsights.jsx";
import { downloadCsv } from "../dataUtils.js";

export default function ChartCard({
  id,
  title,
  caption,
  chartKey,
  data,
  extra = {},
  children,
  exportData,
  exportFilename,
  onAskAgent,
  style = {},
}) {
  const [showAi, setShowAi] = useState(true);

  const insight = useMemo(() => {
    return getChartAiInterpretation(chartKey, data, extra);
  }, [chartKey, data, extra]);

  const handleExport = () => {
    if (exportData && exportData.length > 0) {
      downloadCsv(exportData, exportFilename || `${chartKey}_data.csv`);
    } else if (data && data.length > 0) {
      downloadCsv(data, exportFilename || `${chartKey}_data.csv`);
    }
  };

  const handleAsk = () => {
    if (onAskAgent) {
      const prompt = `Can you provide a deeper analysis of ${title} based on the current filtered student population? ${insight.summary}`;
      onAskAgent(prompt);
    }
  };

  const getRiskStyle = (level) => {
    if (level === "high") {
      return {
        bg: "var(--danger-light)",
        border: "var(--danger-border)",
        text: "var(--danger)",
      };
    }
    if (level === "medium") {
      return {
        bg: "var(--warning-light)",
        border: "var(--warning-border)",
        text: "var(--warning)",
      };
    }
    return {
      bg: "var(--success-light)",
      border: "var(--success-border)",
      text: "var(--success)",
    };
  };

  const riskStyle = getRiskStyle(insight.riskLevel);

  return (
    <div className="chart-card" id={id} style={{ display: "flex", flexDirection: "column", ...style }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
        <div style={{ flex: 1, minWidth: 180 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
            <h3 style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{title}</h3>
            {insight.badge && (
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  padding: "1px 6px",
                  borderRadius: 10,
                  background: "var(--accent-light)",
                  border: "1px solid var(--accent-border)",
                  color: "var(--accent)",
                }}
              >
                {insight.badge}
              </span>
            )}
          </div>
          {caption && <div className="chart-caption" style={{ margin: "2px 0 0 0" }}>{caption}</div>}
        </div>

        {/* Card Controls */}
        <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
          <button
            type="button"
            onClick={() => setShowAi(!showAi)}
            title={showAi ? "Hide AI Interpretation" : "Show AI Interpretation"}
            className="btn-secondary"
            style={{
              padding: "4px 8px",
              fontSize: 11.5,
              background: showAi ? "var(--accent-light)" : "var(--surface)",
              borderColor: showAi ? "var(--accent-border)" : "var(--border)",
              color: showAi ? "var(--accent)" : "var(--text-secondary)",
            }}
          >
            <Sparkles size={12} style={{ color: showAi ? "var(--accent)" : "var(--text-muted)" }} />
            <span>AI Insights</span>
            {showAi ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
          </button>

          {(exportData || data) && (
            <button
              type="button"
              onClick={handleExport}
              title="Download CSV for this visual"
              className="btn-secondary"
              style={{ padding: "4px 7px", fontSize: 11.5 }}
            >
              <Download size={12} />
              <span className="hide-on-mobile">CSV</span>
            </button>
          )}

          {onAskAgent && (
            <button
              type="button"
              onClick={handleAsk}
              title="Ask AI Agent about this graph"
              className="btn-secondary"
              style={{ padding: "4px 8px", fontSize: 11.5, color: "var(--accent)" }}
            >
              <MessageSquare size={12} />
              <span className="hide-on-mobile">Ask</span>
            </button>
          )}
        </div>
      </div>

      {/* Chart visualization */}
      <div style={{ flex: 1, minHeight: 0 }}>
        {children}
      </div>

      {/* Embedded AI Interpretation Panel */}
      {showAi && (
        <div
          style={{
            marginTop: 12,
            padding: "10px 12px",
            background: "var(--surface-muted)",
            border: "1px solid var(--border)",
            borderLeft: "3px solid var(--accent)",
            borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
            fontSize: 12.5,
            lineHeight: 1.5,
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 5, flexWrap: "wrap", gap: 6 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 5, fontWeight: 600, color: "var(--accent)", fontSize: 11.5, textTransform: "uppercase", letterSpacing: 0.5 }}>
              <Sparkles size={12} />
              <span>AI Behavioral Interpretation: {insight.title}</span>
            </div>

            {insight.riskLevel && (
              <span
                style={{
                  fontSize: 10.5,
                  fontWeight: 600,
                  padding: "1px 6px",
                  borderRadius: 4,
                  backgroundColor: riskStyle.bg,
                  border: `1px solid ${riskStyle.border}`,
                  color: riskStyle.text,
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 3,
                }}
              >
                {insight.riskLevel === "high" ? <AlertTriangle size={10} /> : insight.riskLevel === "medium" ? <Info size={10} /> : <CheckCircle2 size={10} />}
                {insight.riskLevel === "high" ? "High Sensitivity" : insight.riskLevel === "medium" ? "Moderate Impact" : "Stable Indicator"}
              </span>
            )}
          </div>

          <p style={{ margin: "0 0 6px 0", color: "var(--text-primary)", fontWeight: 500 }}>
            {insight.summary}
          </p>

          {/* Statistical Evidence Points */}
          {insight.evidence && insight.evidence.length > 0 && (
            <div style={{ margin: "4px 0 6px 0", paddingLeft: 2 }}>
              <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 2 }}>
                Empirical Evidence:
              </div>
              <ul style={{ margin: 0, paddingLeft: 16, color: "var(--text-secondary)", fontSize: 12 }}>
                {insight.evidence.map((ev, idx) => (
                  <li key={idx} style={{ marginBottom: 1 }}>{ev}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Pedagogical Action Directive */}
          {insight.pedagogy && (
            <div
              style={{
                marginTop: 6,
                padding: "6px 8px",
                background: "var(--accent-light)",
                borderRadius: "var(--radius-xs)",
                border: "1px solid var(--accent-border)",
                color: "var(--text-primary)",
                fontSize: 11.5,
                display: "flex",
                alignItems: "flex-start",
                gap: 5,
              }}
            >
              <span style={{ fontWeight: 600, color: "var(--accent)", whiteSpace: "nowrap" }}>Recommendation:</span>
              <span>{insight.pedagogy}</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

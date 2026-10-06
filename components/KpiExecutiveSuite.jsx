import { useState } from "react";
import {
  GraduationCap,
  TrendingUp,
  AlertOctagon,
  CalendarX,
  Clock,
  BookOpen,
  Award,
  HeartHandshake,
  Download,
  Target,
  ShieldAlert,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";
import { downloadKpiSummaryCsv } from "../dataUtils.js";

export default function KpiExecutiveSuite({ kpis, data }) {
  const [targetFilters, setTargetFilters] = useState("all");

  const total = data.length || 1;

  // Additional micro-metrics
  const topQuartileGpa = (() => {
    const sorted = [...data].sort((a, b) => b.GPA - a.GPA);
    const q1Idx = Math.floor(sorted.length * 0.25);
    return sorted[q1Idx]?.GPA?.toFixed(2) || "N/A";
  })();

  const highAbsenceSevere = data.filter((d) => d.Absences >= 20).length;
  const highAbsenceSeverePct = ((highAbsenceSevere / total) * 100).toFixed(1);

  // Strategic Targets
  const targets = [
    {
      label: "A–C Passing Rate",
      current: kpis.acRate,
      target: 80.0,
      unit: "%",
      status: kpis.acRate >= 80 ? "Met" : "Below Target",
      color: kpis.acRate >= 80 ? "var(--success)" : "var(--warning)",
      desc: "Goal: Ensure at least 80% of students achieve grade C or higher.",
    },
    {
      label: "Chronic Absenteeism Rate",
      current: kpis.chronicAbsenceRate,
      target: 10.0,
      unit: "%",
      inverted: true,
      status: kpis.chronicAbsenceRate <= 10 ? "Optimal" : "High Risk",
      color: kpis.chronicAbsenceRate <= 10 ? "var(--success)" : "var(--danger)",
      desc: "Goal: Keep chronic absenteeism (>15 absences) strictly below 10%.",
    },
    {
      label: "Honor Roll Rate (GPA ≥ 3.5)",
      current: kpis.honorRollRate,
      target: 15.0,
      unit: "%",
      status: kpis.honorRollRate >= 15 ? "Met" : "Approaching",
      color: kpis.honorRollRate >= 15 ? "var(--success)" : "var(--accent)",
      desc: "Goal: Accelerate academic excellence to surpass 15% honor roll reach.",
    },
    {
      label: "Tutoring Program Coverage",
      current: kpis.tutoringRate,
      target: 35.0,
      unit: "%",
      status: kpis.tutoringRate >= 35 ? "Met" : "Capacity Needed",
      color: kpis.tutoringRate >= 35 ? "var(--success)" : "var(--accent)",
      desc: "Goal: Extend specialized academic tutoring support to 35% of student body.",
    },
  ];

  // Cohort Risk Stratification
  const cohorts = [
    {
      tier: "Advanced Honors",
      criteria: "GPA ≥ 3.5",
      count: kpis.honorRollCount,
      pct: kpis.honorRollRate.toFixed(1),
      avgStudy: `${kpis.avgStudy.toFixed(1)} hrs`,
      badgeColor: "var(--success)",
      bgColor: "var(--success-light)",
      action: "Enroll in AP/IB advanced placement and leadership pathways.",
    },
    {
      tier: "Core Competency",
      criteria: "2.5 ≤ GPA < 3.5",
      count: data.filter((d) => d.GPA >= 2.5 && d.GPA < 3.5).length,
      pct: (((data.filter((d) => d.GPA >= 2.5 && d.GPA < 3.5).length) / total) * 100).toFixed(1),
      avgStudy: "9.5 hrs",
      badgeColor: "var(--accent)",
      bgColor: "var(--accent-light)",
      action: "Maintain steady progress; focus on subject-specific mastery.",
    },
    {
      tier: "Moderate Caution",
      criteria: "2.0 ≤ GPA < 2.5",
      count: data.filter((d) => d.GPA >= 2.0 && d.GPA < 2.5).length,
      pct: (((data.filter((d) => d.GPA >= 2.0 && d.GPA < 2.5).length) / total) * 100).toFixed(1),
      avgStudy: "8.1 hrs",
      badgeColor: "var(--warning)",
      bgColor: "var(--warning-light)",
      action: "Assign peer study groups and monthly advisor check-ins.",
    },
    {
      tier: "Critical Intervention",
      criteria: "GPA < 2.0 or F Grade",
      count: kpis.atRiskCount,
      pct: kpis.atRiskRate.toFixed(1),
      avgStudy: "6.2 hrs",
      badgeColor: "var(--danger)",
      bgColor: "var(--danger-light)",
      action: "Mandate attendance recovery, counselor conference, and subsidized tutoring.",
    },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* Executive Header Banner */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "18px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 14,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 4 }}>
            <span
              style={{
                background: "var(--accent-light)",
                border: "1px solid var(--accent-border)",
                padding: "2px 8px",
                borderRadius: "var(--radius-xs)",
                fontSize: 11,
                fontWeight: 600,
                color: "var(--accent)",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <Target size={12} />
              Executive Scorecard
            </span>
          </div>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px 0", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
            Institutional Key Performance Indicators
          </h2>
          <p style={{ margin: 0, fontSize: 13, color: "var(--text-muted)" }}>
            Strategic benchmarks, cohort risk stratification, and attainment goals for {data.length.toLocaleString()} students.
          </p>
        </div>

        <button
          type="button"
          onClick={() => downloadKpiSummaryCsv(kpis)}
          className="btn-secondary"
          style={{ padding: "6px 12px", fontSize: 12.5 }}
        >
          <Download size={13} />
          Export KPI Summary (.csv)
        </button>
      </div>

      {/* 1. Academic Excellence Section */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <GraduationCap size={16} style={{ color: "var(--accent)" }} />
          <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: "var(--text-primary)" }}>
            1. Academic Excellence & Attainment
          </h3>
        </div>
        <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
          <div className="kpi-card" style={{ borderLeft: "3px solid var(--accent)" }}>
            <div className="kpi-label">Average Cohort GPA</div>
            <div className="kpi-value">{kpis.avgGpa.toFixed(2)}</div>
            <div className="kpi-help">Mean GPA (0.0–4.0 scale)</div>
          </div>
          <div className="kpi-card" style={{ borderLeft: "3px solid var(--accent)" }}>
            <div className="kpi-label">Median GPA</div>
            <div className="kpi-value">{kpis.medianGpa.toFixed(2)}</div>
            <div className="kpi-help">50th Percentile Middle Score</div>
          </div>
          <div className="kpi-card" style={{ borderLeft: "3px solid #0D9488" }}>
            <div className="kpi-label">Top Quartile GPA (75th %)</div>
            <div className="kpi-value">{topQuartileGpa}</div>
            <div className="kpi-help">Threshold for Upper 25%</div>
          </div>
          <div className="kpi-card" style={{ borderLeft: "3px solid var(--success)" }}>
            <div className="kpi-label">A–C Passing Rate</div>
            <div className="kpi-value">{kpis.acRate.toFixed(1)}%</div>
            <div className="kpi-help">Percent receiving passing grades</div>
          </div>
          <div className="kpi-card" style={{ borderLeft: "3px solid #7C3AED" }}>
            <div className="kpi-label">Honor Roll (GPA ≥ 3.5)</div>
            <div className="kpi-value">{kpis.honorRollRate.toFixed(1)}%</div>
            <div className="kpi-help">{kpis.honorRollCount.toLocaleString()} high achievers</div>
          </div>
        </div>
      </div>

      {/* 2. Attendance & Early-Warning Risk Section */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
          <ShieldAlert size={16} style={{ color: "var(--danger)" }} />
          <h3 style={{ margin: 0, fontSize: 14.5, fontWeight: 700, color: "var(--text-primary)" }}>
            2. Attendance Discipline & Early-Warning Risk
          </h3>
        </div>
        <div className="kpi-grid" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))" }}>
          <div className="kpi-card" style={{ borderLeft: "3px solid var(--danger)", background: "var(--danger-light)" }}>
            <div className="kpi-label" style={{ color: "var(--danger)" }}>At-Risk Headcount</div>
            <div className="kpi-value" style={{ color: "var(--danger)" }}>{kpis.atRiskCount.toLocaleString()}</div>
            <div className="kpi-help">GPA &lt; 2.0 or Grades D/F</div>
          </div>
          <div className="kpi-card" style={{ borderLeft: "3px solid var(--danger)", background: "var(--danger-light)" }}>
            <div className="kpi-label" style={{ color: "var(--danger)" }}>At-Risk Population %</div>
            <div className="kpi-value" style={{ color: "var(--danger)" }}>{kpis.atRiskRate.toFixed(1)}%</div>
            <div className="kpi-help">Share of active student population</div>
          </div>
          <div className="kpi-card" style={{ borderLeft: "3px solid var(--warning)" }}>
            <div className="kpi-label">Average Absences</div>
            <div className="kpi-value">{kpis.avgAbsences.toFixed(1)}</div>
            <div className="kpi-help">Days missed per student</div>
          </div>
          <div className="kpi-card" style={{ borderLeft: "3px solid var(--danger)" }}>
            <div className="kpi-label">Chronic Absenteeism (&gt;15 d)</div>
            <div className="kpi-value">{kpis.chronicAbsenceRate.toFixed(1)}%</div>
            <div className="kpi-help">{kpis.chronicAbsenceCount.toLocaleString()} chronically absent</div>
          </div>
          <div className="kpi-card" style={{ borderLeft: "3px solid var(--danger)" }}>
            <div className="kpi-label">Severe Absenteeism (≥20 d)</div>
            <div className="kpi-value">{highAbsenceSeverePct}%</div>
            <div className="kpi-help">{highAbsenceSevere.toLocaleString()} extreme cases</div>
          </div>
        </div>
      </div>

      {/* 3. Strategic Target Goals Progress Bars */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 20,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
              Strategic Attainment Goals & Thresholds
            </h3>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
              Progress tracking against district standards.
            </p>
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
          {targets.map((t, idx) => {
            return (
              <div
                key={idx}
                style={{
                  background: "var(--surface-muted)",
                  border: "1px solid var(--border)",
                  borderRadius: "var(--radius-sm)",
                  padding: "14px 16px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>{t.label}</span>
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      padding: "2px 6px",
                      borderRadius: "var(--radius-xs)",
                      background: "var(--surface)",
                      color: t.color,
                      border: "1px solid var(--border)",
                    }}
                  >
                    {t.status}
                  </span>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 6 }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: "var(--text-primary)" }}>
                    {t.current.toFixed(1)}
                    <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-muted)" }}>{t.unit}</span>
                  </span>
                  <span style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
                    Target: {t.target.toFixed(1)}{t.unit}
                  </span>
                </div>

                {/* Progress bar */}
                <div style={{ height: 6, background: "var(--border)", borderRadius: 3, overflow: "hidden", marginBottom: 6 }}>
                  <div
                    style={{
                      height: "100%",
                      width: `${Math.min(100, (t.current / (t.target * 1.25)) * 100)}%`,
                      background: t.color,
                      borderRadius: 3,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>

                <p style={{ margin: 0, fontSize: 11, color: "var(--text-muted)", lineHeight: 1.4 }}>{t.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Cohort Risk Stratification Matrix */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 20,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ marginBottom: 14 }}>
          <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
            Cohort Health & Risk Stratification Matrix
          </h3>
          <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
            Segmenting the population into actionable academic intervention tiers.
          </p>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: 12.5 }}>
            <thead>
              <tr style={{ background: "var(--surface-muted)", borderBottom: "1px solid var(--border)" }}>
                <th style={{ padding: "8px 12px", fontWeight: 600, color: "var(--text-muted)" }}>Intervention Tier</th>
                <th style={{ padding: "8px 12px", fontWeight: 600, color: "var(--text-muted)" }}>Criteria</th>
                <th style={{ padding: "8px 12px", fontWeight: 600, color: "var(--text-muted)" }}>Headcount</th>
                <th style={{ padding: "8px 12px", fontWeight: 600, color: "var(--text-muted)" }}>Cohort Share</th>
                <th style={{ padding: "8px 12px", fontWeight: 600, color: "var(--text-muted)" }}>Recommended Action</th>
              </tr>
            </thead>
            <tbody>
              {cohorts.map((c, i) => (
                <tr key={i} style={{ borderBottom: "1px solid var(--border)" }}>
                  <td style={{ padding: "10px 12px", fontWeight: 600 }}>
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "var(--radius-xs)",
                        fontSize: 11,
                        fontWeight: 600,
                        background: c.bgColor,
                        color: c.badgeColor,
                        border: "1px solid var(--border)",
                      }}
                    >
                      {c.tier}
                    </span>
                  </td>
                  <td style={{ padding: "10px 12px", color: "var(--text-secondary)", fontWeight: 500 }}>{c.criteria}</td>
                  <td style={{ padding: "10px 12px", fontWeight: 700, color: "var(--text-primary)" }}>
                    {c.count.toLocaleString()}
                  </td>
                  <td style={{ padding: "10px 12px", fontWeight: 600, color: "var(--text-primary)" }}>{c.pct}%</td>
                  <td style={{ padding: "10px 12px", color: "var(--text-secondary)" }}>{c.action}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

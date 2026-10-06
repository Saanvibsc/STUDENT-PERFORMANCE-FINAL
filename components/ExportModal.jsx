import { useState } from "react";
import { X, Download, FileSpreadsheet, FileCode, Check, Copy, ExternalLink, Sparkles, BookOpen } from "lucide-react";
import { downloadCsv, downloadPowerBiCsv, downloadPowerBiDax, downloadKpiSummaryCsv } from "../dataUtils.js";

export default function ExportModal({ isOpen, onClose, data, kpis }) {
  const [copiedDax, setCopiedDax] = useState(false);
  const [activeTab, setActiveTab] = useState("exports"); // 'exports' | 'guide'

  if (!isOpen) return null;

  const handleCopyDax = () => {
    const snippet = `// Power BI DAX Core Measures
[Total Students] = COUNTROWS('Student_Performance')
[Average GPA] = AVERAGE('Student_Performance'[Grade Point Average])
[Pass Rate %] = DIVIDE(CALCULATE(COUNTROWS('Student_Performance'), 'Student_Performance'[Letter Grade] IN {"A","B","C"}), [Total Students], 0)
[At Risk Students] = CALCULATE(COUNTROWS('Student_Performance'), 'Student_Performance'[Academic Standing] = "At-Risk")
[At Risk Rate %] = DIVIDE([At Risk Students], [Total Students], 0)
[Chronic Absenteeism Rate %] = DIVIDE(CALCULATE(COUNTROWS('Student_Performance'), 'Student_Performance'[Chronic Absence Flag] = 1), [Total Students], 0)
[Tutoring Penetration %] = DIVIDE(CALCULATE(COUNTROWS('Student_Performance'), 'Student_Performance'[Tutoring Status] = "Yes"), [Total Students], 0)`;

    navigator.clipboard.writeText(snippet);
    setCopiedDax(true);
    setTimeout(() => setCopiedDax(false), 2000);
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0, 0, 0, 0.45)",
        backdropFilter: "blur(2px)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--surface)",
          borderRadius: "var(--radius)",
          maxWidth: 640,
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          boxShadow: "var(--shadow-md)",
          border: "1px solid var(--border)",
          padding: 22,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 14, borderBottom: "1px solid var(--border)", paddingBottom: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div style={{ background: "var(--accent-light)", color: "var(--accent)", borderRadius: "var(--radius-xs)", padding: "4px 6px", display: "flex", alignItems: "center", justifyContent: "center", border: "1px solid var(--accent-border)" }}>
                <FileSpreadsheet size={16} />
              </div>
              <h2 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
                Export & Power BI Integration Hub
              </h2>
            </div>
            <p style={{ margin: "4px 0 0 0", fontSize: 12.5, color: "var(--text-muted)" }}>
              Export current slice of {data.length.toLocaleString()} students to CSV, Executive Reports, or Power BI Desktop.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "transparent", border: "none", color: "var(--text-muted)", cursor: "pointer", padding: 4 }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab switch */}
        <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
          <button
            onClick={() => setActiveTab("exports")}
            style={{
              padding: "5px 12px",
              borderRadius: "var(--radius-xs)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              border: activeTab === "exports" ? "1px solid var(--accent)" : "1px solid var(--border)",
              background: activeTab === "exports" ? "var(--accent)" : "var(--surface)",
              color: activeTab === "exports" ? "#FFFFFF" : "var(--text-secondary)",
              transition: "all 0.15s ease",
            }}
          >
            Download Export Files
          </button>
          <button
            onClick={() => setActiveTab("guide")}
            style={{
              padding: "5px 12px",
              borderRadius: "var(--radius-xs)",
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              border: activeTab === "guide" ? "1px solid var(--accent)" : "1px solid var(--border)",
              background: activeTab === "guide" ? "var(--accent)" : "var(--surface)",
              color: activeTab === "guide" ? "#FFFFFF" : "var(--text-secondary)",
              display: "flex",
              alignItems: "center",
              gap: 5,
              transition: "all 0.15s ease",
            }}
          >
            <BookOpen size={13} />
            Power BI Setup Guide
          </button>
        </div>

        {activeTab === "exports" ? (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {/* 1. Power BI Semantic Model CSV */}
            <div style={{ border: "1px solid var(--border)", background: "var(--surface-muted)", borderRadius: "var(--radius-sm)", padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <span style={{ fontSize: 10, fontWeight: 700, background: "var(--accent-light)", color: "var(--accent)", border: "1px solid var(--accent-border)", padding: "1px 5px", borderRadius: 3 }}>
                      RECOMMENDED
                    </span>
                    <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
                      Power BI Enriched Semantic Dataset (.csv)
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                    Pre-engineered with Power BI calculated dimensions: Academic Standing, Risk Priority Tier, Study Habit Tiers, and Attendance Flags.
                  </p>
                </div>
                <button
                  onClick={() => downloadPowerBiCsv(data)}
                  className="btn-primary"
                  style={{ padding: "6px 12px", fontSize: 12 }}
                >
                  <Download size={13} />
                  Download for Power BI
                </button>
              </div>
            </div>

            {/* 2. Power BI DAX Measures */}
            <div style={{ border: "1px solid var(--border)", background: "var(--surface-muted)", borderRadius: "var(--radius-sm)", padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <FileCode size={15} style={{ color: "var(--accent)" }} />
                    <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
                      Power BI DAX Measures Blueprint (.dax)
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                    Includes 12 pre-coded DAX formulas for Total Students, At-Risk %, Pass Rate, Attendance Rate, and Intervention Priorities.
                  </p>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={handleCopyDax}
                    className="btn-secondary"
                    style={{ padding: "5px 10px", fontSize: 11.5 }}
                  >
                    {copiedDax ? <Check size={13} style={{ color: "var(--success)" }} /> : <Copy size={13} />}
                    {copiedDax ? "Copied!" : "Copy"}
                  </button>
                  <button
                    onClick={() => downloadPowerBiDax()}
                    className="btn-secondary"
                    style={{ padding: "5px 10px", fontSize: 11.5 }}
                  >
                    <Download size={13} />
                    Download .dax
                  </button>
                </div>
              </div>
            </div>

            {/* 3. Executive KPI Summary Report */}
            <div style={{ border: "1px solid var(--border)", background: "var(--surface-muted)", borderRadius: "var(--radius-sm)", padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <Sparkles size={15} style={{ color: "var(--accent)" }} />
                    <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
                      Executive KPI & Benchmark Summary (.csv)
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                    High-level tabular snapshot of all 12 key performance metrics, institutional benchmarks, and percentages for administrative reporting.
                  </p>
                </div>
                <button
                  onClick={() => downloadKpiSummaryCsv(kpis)}
                  className="btn-secondary"
                  style={{ padding: "5px 10px", fontSize: 11.5 }}
                >
                  <Download size={13} />
                  Download Summary
                </button>
              </div>
            </div>

            {/* 4. Raw Filtered CSV */}
            <div style={{ border: "1px solid var(--border)", background: "var(--surface-muted)", borderRadius: "var(--radius-sm)", padding: 14 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 10, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 220 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 3 }}>
                    <FileSpreadsheet size={15} style={{ color: "var(--text-muted)" }} />
                    <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>
                      Raw Filtered Student Records (.csv)
                    </h4>
                  </div>
                  <p style={{ margin: 0, fontSize: 12, color: "var(--text-secondary)", lineHeight: 1.4 }}>
                    Standard schema containing exact columns matching active sidebar filters ({data.length.toLocaleString()} rows).
                  </p>
                </div>
                <button
                  onClick={() => downloadCsv(data, "filtered_student_performance.csv")}
                  className="btn-secondary"
                  style={{ padding: "5px 10px", fontSize: 11.5 }}
                >
                  <Download size={13} />
                  Download CSV
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Guide Tab */
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div style={{ background: "var(--surface-muted)", border: "1px solid var(--border)", padding: 12, borderRadius: "var(--radius-xs)", fontSize: 12.5, color: "var(--text-primary)" }}>
              <strong>Connecting this data into Microsoft Power BI Desktop in 3 steps:</strong>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 12.5, color: "var(--text-primary)" }}>
              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ background: "var(--accent)", color: "white", width: 22, height: 22, borderRadius: "var(--radius-xs)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11.5, flexShrink: 0 }}>
                  1
                </div>
                <div>
                  <strong>Download Enriched CSV</strong>
                  <div style={{ color: "var(--text-muted)", marginTop: 2 }}>
                    Click <em>Download for Power BI</em> above to download <code>PowerBI_Student_Performance_Model.csv</code>.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ background: "var(--accent)", color: "white", width: 22, height: 22, borderRadius: "var(--radius-xs)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11.5, flexShrink: 0 }}>
                  2
                </div>
                <div>
                  <strong>Import into Power BI Desktop</strong>
                  <div style={{ color: "var(--text-muted)", marginTop: 2 }}>
                    Open Power BI Desktop &rarr; Click <strong>Get data</strong> &rarr; Select <strong>Text/CSV</strong> &rarr; Select the downloaded file &rarr; Click <strong>Load</strong>.
                  </div>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <div style={{ background: "var(--accent)", color: "white", width: 22, height: 22, borderRadius: "var(--radius-xs)", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 11.5, flexShrink: 0 }}>
                  3
                </div>
                <div>
                  <strong>Add DAX Measures</strong>
                  <div style={{ color: "var(--text-muted)", marginTop: 2 }}>
                    Download the <code>.dax</code> measures file &rarr; Go to Modeling tab &rarr; Click <strong>New Measure</strong> and paste the measures to create automated KPI cards and gauges.
                  </div>
                </div>
              </div>
            </div>

            <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, display: "flex", justifyContent: "flex-end" }}>
              <button
                onClick={() => setActiveTab("exports")}
                className="btn-primary"
                style={{ padding: "6px 14px", fontSize: 12 }}
              >
                Go to Downloads
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

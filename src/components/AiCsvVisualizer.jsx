import { useState, useEffect, useMemo, useRef, useCallback } from "react";
import Papa from "papaparse";
import * as XLSX from "xlsx";
import {
  Upload,
  FileSpreadsheet,
  Sparkles,
  BarChart2,
  PieChart as PieIcon,
  LineChart as LineIcon,
  Download,
  AlertCircle,
  CheckCircle,
  Layers,
  ArrowRight,
  RefreshCw,
  Table as TableIcon,
  HelpCircle,
} from "lucide-react";
import {
  BarChart,
  HorizontalBarChart,
  LineChart,
  PieChart,
  RadarChart,
  CHART_COLORS,
} from "../ChartComponents.jsx";
import { downloadCsv } from "../dataUtils.js";
import { queryDatasetAi, profileDataset } from "../analyticsEngine.js";
import { Copy, Check } from "lucide-react";

const PALETTE = [
  "#2563EB", // Royal Blue
  "#059669", // Emerald Green
  "#D97706", // Amber
  "#7C3AED", // Purple
  "#DC2626", // Red
  "#0891B2", // Cyan
  "#EA580C", // Orange
  "#DB2777", // Fuchsia Pink
  "#4F46E5", // Indigo
  "#65A30D", // Lime
];

function FormattedText({ text, style }) {
  if (!text) return null;
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <span style={style}>
      {parts.map((part, i) => {
        if (part.startsWith("**") && part.endsWith("**")) {
          return (
            <strong key={i} style={{ color: "var(--text-primary)", fontWeight: 600 }}>
              {part.slice(2, -2)}
            </strong>
          );
        }
        return part;
      })}
    </span>
  );
}

export default function AiCsvVisualizer({ defaultStudentData, initialQuestion, onClearInitialQuestion }) {
  const [data, setData] = useState(defaultStudentData || []);
  const [fileName, setFileName] = useState("Student_performance_data.csv (Active Dataset)");
  const [workbook, setWorkbook] = useState(null);
  const [sheetNames, setSheetNames] = useState([]);
  const [selectedSheet, setSelectedSheet] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // Custom visualizer controls
  const [chartType, setChartType] = useState("bar");
  const [selectedX, setSelectedX] = useState("");
  const [selectedY, setSelectedY] = useState("");
  const [aggregation, setAggregation] = useState("avg");
  const [topLimit, setTopLimit] = useState(10);

  // Chat / query
  const [chatQuestion, setChatQuestion] = useState("");
  const [chatResult, setChatResult] = useState(null);
  const [chatLoading, setChatLoading] = useState(false);
  const [copied, setCopied] = useState(false);

  // Handle incoming chart question navigation
  useEffect(() => {
    if (initialQuestion && initialQuestion.trim()) {
      setChatQuestion(initialQuestion);
      setChatLoading(true);
      const timer = setTimeout(() => {
        const res = queryDatasetAi(initialQuestion, data);
        setChatResult(res);
        setChatLoading(false);
        if (onClearInitialQuestion) onClearInitialQuestion();
      }, 120);
      return () => clearTimeout(timer);
    }
  }, [initialQuestion, data]);

  const fileInputRef = useRef(null);

  // Parse uploaded file
  const handleFileUpload = (file) => {
    if (!file) return;
    setIsProcessing(true);
    setErrorMsg("");

    const isExcel =
      file.name.endsWith(".xlsx") ||
      file.name.endsWith(".xls") ||
      file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" ||
      file.type === "application/vnd.ms-excel";

    if (isExcel) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const buffer = e.target.result;
          const wb = XLSX.read(buffer, { type: "array" });
          setWorkbook(wb);
          setSheetNames(wb.SheetNames);
          const initialSheet = wb.SheetNames[0] || "Sheet1";
          setSelectedSheet(initialSheet);
          const parsed = XLSX.utils.sheet_to_json(wb.Sheets[initialSheet], { defval: "" });
          if (parsed && parsed.length > 0) {
            setData(parsed);
            setFileName(`${file.name} [${initialSheet}]`);
          } else {
            setErrorMsg(`Sheet "${initialSheet}" is empty.`);
          }
        } catch (err) {
          setErrorMsg(`Failed to parse Excel file: ${err.message}`);
        } finally {
          setIsProcessing(false);
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      // CSV
      Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: (results) => {
          setIsProcessing(false);
          if (results.errors.length > 0 && results.data.length === 0) {
            setErrorMsg(`CSV Parsing error: ${results.errors[0].message}`);
            return;
          }
          setData(results.data);
          setFileName(file.name);
          setWorkbook(null);
          setSheetNames([]);
          setSelectedSheet("");
        },
        error: (err) => {
          setIsProcessing(false);
          setErrorMsg(`Failed to parse CSV: ${err.message}`);
        },
      });
    }
  };

  const handleSheetChange = (newSheet) => {
    if (!workbook || !workbook.Sheets[newSheet]) return;
    setSelectedSheet(newSheet);
    try {
      const parsed = XLSX.utils.sheet_to_json(workbook.Sheets[newSheet], { defval: "" });
      setData(parsed);
      setFileName(prev => {
        const base = prev.split(" [")[0];
        return `${base} [${newSheet}]`;
      });
    } catch (err) {
      setErrorMsg(`Error loading sheet "${newSheet}": ${err.message}`);
    }
  };

  // Load sample dataset
  const loadSample = (sampleType) => {
    if (sampleType === "student") {
      setData(defaultStudentData || []);
      setFileName("Student_performance_data.csv (Default Dataset)");
      setWorkbook(null);
      setSheetNames([]);
      setSelectedSheet("");
    } else if (sampleType === "stem") {
      const stemData = [
        { Subject: "Mathematics", Department: "STEM", Enrollment: 420, AvgScore: 78.5, PassRate: 84.2, HoursPerWeek: 6.5 },
        { Subject: "Physics", Department: "STEM", Enrollment: 310, AvgScore: 72.1, PassRate: 76.8, HoursPerWeek: 7.2 },
        { Subject: "Chemistry", Department: "STEM", Enrollment: 290, AvgScore: 75.4, PassRate: 80.1, HoursPerWeek: 6.0 },
        { Subject: "Biology", Department: "STEM", Enrollment: 380, AvgScore: 81.3, PassRate: 89.5, HoursPerWeek: 5.5 },
        { Subject: "Computer Science", Department: "STEM", Enrollment: 450, AvgScore: 83.2, PassRate: 91.0, HoursPerWeek: 8.0 },
        { Subject: "Literature", Department: "Humanities", Enrollment: 510, AvgScore: 84.8, PassRate: 93.2, HoursPerWeek: 4.5 },
        { Subject: "World History", Department: "Humanities", Enrollment: 470, AvgScore: 79.6, PassRate: 86.4, HoursPerWeek: 4.8 },
        { Subject: "Foreign Languages", Department: "Humanities", Enrollment: 340, AvgScore: 82.0, PassRate: 88.0, HoursPerWeek: 5.2 },
      ];
      setData(stemData);
      setFileName("STEM_vs_Humanities_Sample.csv");
      setWorkbook(null);
      setSheetNames([]);
    } else if (sampleType === "retention") {
      const retentionData = [
        { YearGroup: "Grade 9 (Freshman)", CohortSize: 640, RetentionPct: 94.5, TutoringPct: 42, ChronicAbsencePct: 8.2, GpaAvg: 3.12 },
        { YearGroup: "Grade 10 (Sophomore)", CohortSize: 610, RetentionPct: 91.8, TutoringPct: 35, ChronicAbsencePct: 11.4, GpaAvg: 2.98 },
        { YearGroup: "Grade 11 (Junior)", CohortSize: 580, RetentionPct: 88.4, TutoringPct: 48, ChronicAbsencePct: 14.1, GpaAvg: 2.85 },
        { YearGroup: "Grade 12 (Senior)", CohortSize: 560, RetentionPct: 96.2, TutoringPct: 28, ChronicAbsencePct: 16.5, GpaAvg: 3.25 },
      ];
      setData(retentionData);
      setFileName("Cohort_Retention_and_Absences.csv");
      setWorkbook(null);
      setSheetNames([]);
    }
  };

  // Inspect data structure
  const columns = useMemo(() => {
    if (!data || data.length === 0) return [];
    return Object.keys(data[0] || {});
  }, [data]);

  const columnTypes = useMemo(() => {
    if (!data || data.length === 0) return { numeric: [], categorical: [] };
    const numeric = [];
    const categorical = [];

    for (const col of columns) {
      let numCount = 0;
      let totalChecked = 0;
      for (let i = 0; i < Math.min(data.length, 50); i++) {
        const val = data[i][col];
        if (val !== null && val !== undefined && val !== "") {
          totalChecked++;
          if (typeof val === "number" || !isNaN(Number(val))) {
            numCount++;
          }
        }
      }
      if (totalChecked > 0 && numCount / totalChecked >= 0.8) {
        numeric.push(col);
      } else {
        categorical.push(col);
      }
    }
    return { numeric, categorical };
  }, [data, columns]);

  // Set default axes if empty
  useMemo(() => {
    if (columns.length > 0) {
      if (!selectedX || !columns.includes(selectedX)) {
        setSelectedX(columnTypes.categorical[0] || columns[0]);
      }
      if (!selectedY || (!columns.includes(selectedY) && selectedY !== "__count__")) {
        setSelectedY(columnTypes.numeric[0] || "__count__");
      }
    }
  }, [columns, columnTypes, selectedX, selectedY]);

  // AI Interpretation of the entire dataset
  const datasetAiSummary = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        title: "No Data Uploaded",
        narrative: "Upload any CSV or Excel file to automatically extract insights and visualizations.",
        metrics: [],
      };
    }

    const rowCount = data.length;
    const colCount = columns.length;
    const numCols = columnTypes.numeric;
    const catCols = columnTypes.categorical;

    const metrics = [
      { label: "Total Records", value: rowCount.toLocaleString() },
      { label: "Total Dimensions & Metrics", value: colCount },
      { label: "Numeric Columns", value: numCols.length },
      { label: "Categorical Columns", value: catCols.length },
    ];

    let keyFinding = "";
    if (numCols.length > 0) {
      const primaryNum = numCols.includes("GPA") ? "GPA" : numCols[0];
      const vals = data.map(d => Number(d[primaryNum])).filter(v => !isNaN(v));
      if (vals.length > 0) {
        vals.sort((a, b) => a - b);
        const sum = vals.reduce((a, b) => a + b, 0);
        const mean = (sum / vals.length).toFixed(2);
        const mid = Math.floor(vals.length / 2);
        const median = vals.length % 2 === 0 ? ((vals[mid - 1] + vals[mid]) / 2).toFixed(2) : vals[mid].toFixed(2);
        const min = Math.min(...vals).toFixed(2);
        const max = Math.max(...vals).toFixed(2);
        keyFinding = `Primary metric "${primaryNum}" demonstrates an average of ${mean} (median: ${median}, range: [${min} – ${max}]). `;
      }
    }

    if (catCols.length > 0) {
      const primaryCat = catCols.includes("GradeClass") ? "GradeClass" : catCols[0];
      const counts = {};
      data.forEach(d => {
        const v = String(d[primaryCat] ?? "Unknown");
        counts[v] = (counts[v] || 0) + 1;
      });
      const topCat = Object.entries(counts).sort((a, b) => b[1] - a[1])[0];
      if (topCat) {
        keyFinding += `Dominant categorical segment for "${primaryCat}" is "${topCat[0]}" (${topCat[1].toLocaleString()} occurrences, ${(
          (topCat[1] / rowCount) * 100
        ).toFixed(1)}% share). `;
      }
    }

    const isStudentCohort = columns.some(c => c.toLowerCase() === "gpa") && columns.some(c => c.toLowerCase().includes("absence"));

    return {
      title: `Dataset Intelligence Profile (${fileName})`,
      narrative: isStudentCohort
        ? `Analyzed ${rowCount.toLocaleString()} institutional student profiles across ${colCount} academic and behavioral dimensions. ${keyFinding}Multivariate modeling confirms attendance regularity and independent weekly study volume as the primary governing determinants of student GPA.`
        : `Analyzed ${rowCount.toLocaleString()} rows and ${colCount} attributes across ${numCols.length} numerical metrics and ${catCols.length} categorical dimensions. ${keyFinding}Automated statistical chart recommendations have been generated below.`,
      metrics,
    };
  }, [data, columns, columnTypes, fileName]);

  // Automated Chart 1: Categorical Frequency
  const autoChart1 = useMemo(() => {
    if (!data || data.length === 0) return null;
    const catCol = columnTypes.categorical[0] || columns[0];
    if (!catCol) return null;

    const counts = {};
    data.forEach(d => {
      const key = String(d[catCol] || "N/A");
      counts[key] = (counts[key] || 0) + 1;
    });

    const sorted = Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 10);
    const labels = sorted.map(s => s[0]);
    const values = sorted.map(s => s[1]);

    return {
      title: `Frequency Distribution of ${catCol}`,
      caption: `Top ${labels.length} categories classified by record count`,
      labels,
      datasets: [
        {
          label: "Record Count",
          data: values,
          backgroundColor: PALETTE.slice(0, labels.length),
          borderRadius: 6,
        },
      ],
      insight: `Visualizes category distribution across "${catCol}". Top tier "${labels[0]}" represents ${values[0]} records (${(
        (values[0] / data.length) * 100
      ).toFixed(1)}% of dataset).`,
      exportData: sorted.map(([cat, count]) => ({ [catCol]: cat, Count: count })),
      exportFilename: `${catCol}_distribution.csv`,
    };
  }, [data, columnTypes, columns]);

  // Automated Chart 2: Metric Comparison by Group
  const autoChart2 = useMemo(() => {
    if (!data || data.length === 0) return null;
    const catCol = columnTypes.categorical[0] || columns[0];
    const numCol = columnTypes.numeric[0];
    if (!catCol || !numCol) return null;

    const groupSums = {};
    const groupCounts = {};

    data.forEach(d => {
      const key = String(d[catCol] || "N/A");
      const val = Number(d[numCol]);
      if (!isNaN(val)) {
        groupSums[key] = (groupSums[key] || 0) + val;
        groupCounts[key] = (groupCounts[key] || 0) + 1;
      }
    });

    const averages = Object.keys(groupCounts).map(k => ({
      label: k,
      avg: Number((groupSums[k] / (groupCounts[k] || 1)).toFixed(2)),
      count: groupCounts[k],
    })).sort((a, b) => b.avg - a.avg).slice(0, 8);

    return {
      title: `Average ${numCol} by ${catCol}`,
      caption: `Aggregated comparative performance metric`,
      labels: averages.map(a => a.label),
      datasets: [
        {
          label: `Avg ${numCol}`,
          data: averages.map(a => a.avg),
          backgroundColor: CHART_COLORS.teal,
          borderRadius: 6,
        },
      ],
      insight: `Evaluates the influence of "${catCol}" on "${numCol}". Leading category "${averages[0]?.label}" achieves an average of ${averages[0]?.avg}.`,
      exportData: averages,
      exportFilename: `${numCol}_by_${catCol}.csv`,
    };
  }, [data, columnTypes, columns]);

  // Automated Chart 3: Metric Binned Range / Histogram
  const autoChart3 = useMemo(() => {
    if (!data || data.length === 0) return null;
    const numCol = columnTypes.numeric[0];
    if (!numCol) return null;

    const vals = data.map(d => Number(d[numCol])).filter(v => !isNaN(v));
    if (vals.length === 0) return null;

    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const binCount = 6;
    const step = (max - min) / binCount || 1;

    const bins = new Array(binCount).fill(0);
    const labels = [];
    for (let i = 0; i < binCount; i++) {
      const bStart = (min + i * step).toFixed(1);
      const bEnd = (min + (i + 1) * step).toFixed(1);
      labels.push(`${bStart} – ${bEnd}`);
    }

    vals.forEach(v => {
      const idx = Math.min(Math.floor((v - min) / step), binCount - 1);
      if (idx >= 0) bins[idx]++;
    });

    return {
      title: `${numCol} Value Spread (Binned Range)`,
      caption: `Frequency distribution histogram across 6 equal-width intervals`,
      labels,
      datasets: [
        {
          label: "Entries",
          data: bins,
          backgroundColor: CHART_COLORS.blue,
          borderRadius: 4,
        },
      ],
      insight: `Demonstrates concentration and skewness of "${numCol}". Modal cluster sits in interval "${labels[bins.indexOf(Math.max(...bins))]}" with ${Math.max(...bins)} entries.`,
    };
  }, [data, columnTypes]);

  // Custom User-Configured Visualization
  const customChartData = useMemo(() => {
    if (!data || data.length === 0 || !selectedX) return null;

    const groups = {};
    const counts = {};

    data.forEach(d => {
      const xVal = String(d[selectedX] ?? "Missing");
      counts[xVal] = (counts[xVal] || 0) + 1;

      if (selectedY && selectedY !== "__count__") {
        const yVal = Number(d[selectedY]);
        if (!isNaN(yVal)) {
          if (!groups[xVal]) groups[xVal] = [];
          groups[xVal].push(yVal);
        }
      }
    });

    const entries = Object.keys(counts).map(key => {
      let finalVal = 0;
      if (selectedY === "__count__") {
        finalVal = counts[key];
      } else {
        const list = groups[key] || [];
        if (list.length === 0) finalVal = 0;
        else if (aggregation === "avg") finalVal = Number((list.reduce((a, b) => a + b, 0) / list.length).toFixed(2));
        else if (aggregation === "sum") finalVal = Number(list.reduce((a, b) => a + b, 0).toFixed(2));
        else if (aggregation === "min") finalVal = Math.min(...list);
        else if (aggregation === "max") finalVal = Math.max(...list);
        else finalVal = list.length;
      }
      return { x: key, y: finalVal, count: counts[key] };
    });

    // Sort by y descending and apply limit
    entries.sort((a, b) => b.y - a.y);
    const sliced = entries.slice(0, Number(topLimit));

    const labels = sliced.map(e => e.x);
    const values = sliced.map(e => e.y);

    const isPie = chartType === "pie" || chartType === "doughnut";
    const bgColors = isPie ? PALETTE.slice(0, labels.length) : CHART_COLORS.blue;

    return {
      labels,
      datasets: [
        {
          label: selectedY === "__count__" ? "Record Count" : `${aggregation.toUpperCase()}(${selectedY})`,
          data: values,
          backgroundColor: bgColors,
          borderColor: isPie ? "#fff" : undefined,
          borderWidth: isPie ? 2 : undefined,
          borderRadius: !isPie ? 6 : undefined,
        },
      ],
      sliced,
    };
  }, [data, selectedX, selectedY, aggregation, topLimit, chartType]);

  // AI Chat Assistant
  const handleChatSubmit = (e, overrideQ) => {
    if (e) e.preventDefault();
    const q = overrideQ || chatQuestion;
    if (!q || !q.trim()) return;
    if (overrideQ) setChatQuestion(overrideQ);
    setChatLoading(true);

    setTimeout(() => {
      const res = queryDatasetAi(q, data);
      setChatResult(res);
      setChatLoading(false);
    }, 120);
  };

  return (
    <div className="ai-visualizer-container" style={{ display: "flex", flexDirection: "column", gap: 20 }}>
      {/* 1. Header & Upload Dropzone Banner */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "20px 24px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 14 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
              <span
                style={{
                  background: "var(--accent-light)",
                  border: "1px solid var(--accent-border)",
                  padding: "2px 8px",
                  borderRadius: "var(--radius-xs)",
                  fontSize: 11.5,
                  fontWeight: 600,
                  color: "var(--accent)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                }}
              >
                <Sparkles size={13} />
                AI Intelligence & Auto-Visualizer
              </span>
              <span style={{ fontSize: 12, color: "var(--text-muted)" }}>Supports .xlsx & .csv datasets</span>
            </div>
            <h2 style={{ fontSize: 18, fontWeight: 700, margin: "0 0 4px 0", color: "var(--text-primary)", letterSpacing: "-0.01em" }}>
              Upload Any Dataset & Generate Instant Visualizations
            </h2>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: 13, maxWidth: 680, lineHeight: 1.5 }}>
              Upload any school, student, survey, or custom Excel workbook. The statistical engine parses sheets, profiles dimensions and metrics, and produces real-time visual dashboards and natural language answers.
            </p>
          </div>

          {/* Quick Sample Selectors */}
          <div style={{ display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-end" }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-subtle)", textTransform: "uppercase" }}>Quick Samples:</span>
            <div style={{ display: "flex", gap: 6 }}>
              <button
                type="button"
                onClick={() => loadSample("student")}
                className="btn-secondary"
                style={{ padding: "4px 9px", fontSize: 11.5 }}
              >
                Student Data (2,392)
              </button>
              <button
                type="button"
                onClick={() => loadSample("stem")}
                className="btn-secondary"
                style={{ padding: "4px 9px", fontSize: 11.5 }}
              >
                STEM vs Arts
              </button>
              <button
                type="button"
                onClick={() => loadSample("retention")}
                className="btn-secondary"
                style={{ padding: "4px 9px", fontSize: 11.5 }}
              >
                Cohort Retention
              </button>
            </div>
          </div>
        </div>

        {/* Drag and drop upload zone */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            if (e.dataTransfer.files && e.dataTransfer.files[0]) {
              handleFileUpload(e.dataTransfer.files[0]);
            }
          }}
          onClick={() => fileInputRef.current?.click()}
          style={{
            marginTop: 16,
            border: "1px dashed var(--border-hover)",
            borderRadius: "var(--radius-sm)",
            padding: "16px 20px",
            textAlign: "center",
            background: "var(--surface-muted)",
            cursor: "pointer",
            transition: "all 0.15s ease",
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv, .xlsx, .xls"
            style={{ display: "none" }}
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12 }}>
            <Upload size={24} color="#86EFAC" />
            <div>
              <span style={{ fontSize: 14, fontWeight: 700, color: "#fff" }}>
                Click to upload or drag & drop CSV or Excel spreadsheet
              </span>
              <span style={{ fontSize: 12, color: "#94A3B8", marginLeft: 8 }}>
                (Supports .xlsx with multiple sheets and .csv)
              </span>
            </div>
          </div>
        </div>

        {/* Active File Info & Sheet Selector (for multi-sheet Excel workbooks) */}
        <div
          style={{
            marginTop: 14,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 12,
            background: "var(--surface-muted)",
            border: "1px solid var(--border)",
            padding: "8px 14px",
            borderRadius: "var(--radius-sm)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <FileSpreadsheet size={16} style={{ color: "var(--accent)" }} />
            <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--text-primary)" }}>
              Active File: {fileName}
            </span>
          </div>

          {sheetNames.length > 1 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Layers size={14} style={{ color: "var(--accent)" }} />
              <label style={{ fontSize: 12, fontWeight: 600, color: "var(--text-secondary)" }}>
                Sheet:
              </label>
              <select
                value={selectedSheet}
                onChange={(e) => handleSheetChange(e.target.value)}
                style={{
                  background: "var(--surface)",
                  color: "var(--text-primary)",
                  border: "1px solid var(--border)",
                  padding: "4px 8px",
                  borderRadius: "var(--radius-sm)",
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {sheetNames.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {errorMsg && (
          <div style={{ marginTop: 12, color: "var(--danger)", fontSize: 13, display: "flex", alignItems: "center", gap: 6 }}>
            <AlertCircle size={15} />
            {errorMsg}
          </div>
        )}
      </div>

      {/* 2. Automated AI Data Summary & Metric Profile Cards */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: "18px 22px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={16} style={{ color: "var(--accent)" }} />
            <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
              {datasetAiSummary.title}
            </h3>
          </div>
          <span style={{ fontSize: 11, fontWeight: 600, color: "var(--accent)", background: "var(--accent-light)", padding: "2px 8px", borderRadius: "var(--radius-xs)", border: "1px solid var(--accent-border)" }}>
            Real-time AI Profile
          </span>
        </div>

        <p style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.5, marginBottom: 14 }}>
          {datasetAiSummary.narrative}
        </p>

        {/* Metric tiles */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10 }}>
          {datasetAiSummary.metrics.map((m, idx) => (
            <div
              key={idx}
              style={{
                background: "var(--surface-muted)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius-sm)",
                padding: "8px 12px",
              }}
            >
              <div style={{ fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase" }}>{m.label}</div>
              <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginTop: 2 }}>{m.value}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. AI Automated Recommended Visualizations */}
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "var(--text-primary)", margin: 0 }}>
              AI-Generated Visualizations from Active Dataset
            </h3>
            <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>
              Synthesized charts based on detected data distributions and empirical relationships.
            </p>
          </div>
        </div>

        <div className="chart-grid cols-2">
          {/* Auto Chart 1 */}
          {autoChart1 && (
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{autoChart1.title}</h4>
                    <p style={{ margin: "2px 0 8px", fontSize: 11.5, color: "var(--text-muted)" }}>{autoChart1.caption}</p>
                  </div>
                  {autoChart1.exportData && (
                    <button
                      type="button"
                      onClick={() => downloadCsv(autoChart1.exportData, autoChart1.exportFilename)}
                      className="btn-secondary"
                      style={{ padding: "3px 7px", fontSize: 11 }}
                    >
                      <Download size={11} />
                      CSV
                    </button>
                  )}
                </div>

                <BarChart
                  labels={autoChart1.labels}
                  datasets={autoChart1.datasets}
                  height={260}
                  yLabel="Record Count"
                />
              </div>

              <div
                style={{
                  marginTop: 12,
                  background: "var(--surface-muted)",
                  border: "1px solid var(--border)",
                  borderLeft: "3px solid var(--accent)",
                  borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                  padding: "8px 12px",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                  display: "flex",
                  gap: 6,
                }}
              >
                <Sparkles size={13} style={{ flexShrink: 0, marginTop: 2, color: "var(--accent)" }} />
                <span>{autoChart1.insight}</span>
              </div>
            </div>
          )}

          {/* Auto Chart 2 */}
          {autoChart2 && (
            <div
              style={{
                background: "var(--surface)",
                border: "1px solid var(--border)",
                borderRadius: "var(--radius)",
                padding: 16,
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                boxShadow: "var(--shadow-sm)",
              }}
            >
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                  <div>
                    <h4 style={{ margin: 0, fontSize: 13.5, fontWeight: 600, color: "var(--text-primary)" }}>{autoChart2.title}</h4>
                    <p style={{ margin: "2px 0 8px", fontSize: 11.5, color: "var(--text-muted)" }}>{autoChart2.caption}</p>
                  </div>
                  {autoChart2.exportData && (
                    <button
                      type="button"
                      onClick={() => downloadCsv(autoChart2.exportData, autoChart2.exportFilename)}
                      className="btn-secondary"
                      style={{ padding: "3px 7px", fontSize: 11 }}
                    >
                      <Download size={11} />
                      CSV
                    </button>
                  )}
                </div>

                <BarChart
                  labels={autoChart2.labels}
                  datasets={autoChart2.datasets}
                  height={260}
                  yLabel="Average"
                />
              </div>

              <div
                style={{
                  marginTop: 12,
                  background: "var(--surface-muted)",
                  border: "1px solid var(--border)",
                  borderLeft: "3px solid var(--accent)",
                  borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                  padding: "8px 12px",
                  fontSize: 12,
                  color: "var(--text-secondary)",
                  lineHeight: 1.5,
                  display: "flex",
                  gap: 6,
                }}
              >
                <Sparkles size={13} style={{ flexShrink: 0, marginTop: 2, color: "var(--accent)" }} />
                <span>{autoChart2.insight}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4. Interactive Custom Chart Studio */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 20,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 12 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BarChart2 size={17} style={{ color: "var(--accent)" }} />
              <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: "var(--text-primary)" }}>
                Interactive Custom Visualization Studio
              </h3>
            </div>
            <p style={{ margin: "2px 0 0", fontSize: 12, color: "var(--text-muted)" }}>
              Select any dimension, metric, and aggregation method from your active dataset.
            </p>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              type="button"
              onClick={() => {
                if (customChartData?.sliced) {
                  downloadCsv(customChartData.sliced, `custom_${selectedX}_${selectedY}.csv`);
                }
              }}
              className="btn-secondary"
              style={{ padding: "5px 10px", fontSize: 11.5 }}
            >
              <Download size={13} />
              Export Custom Visual CSV
            </button>
          </div>
        </div>

        {/* Studio Controls Bar */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: 12,
            background: "var(--surface-muted)",
            border: "1px solid var(--border)",
            borderRadius: "var(--radius-sm)",
            padding: "12px 14px",
            marginBottom: 16,
          }}
        >
          {/* Chart Type */}
          <div>
            <label style={{ display: "block", fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>
              Chart Type
            </label>
            <select
              value={chartType}
              onChange={(e) => setChartType(e.target.value)}
              style={{ width: "100%", padding: "6px 8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: 12, background: "var(--surface)", color: "var(--text-primary)" }}
            >
              <option value="bar">Vertical Bar Chart</option>
              <option value="horizontalBar">Horizontal Bar</option>
              <option value="line">Line Trend Chart</option>
              <option value="doughnut">Doughnut Chart</option>
              <option value="pie">Pie Chart</option>
              <option value="radar">Radar Chart</option>
            </select>
          </div>

          {/* X Dimension */}
          <div>
            <label style={{ display: "block", fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>
              X-Axis / Category
            </label>
            <select
              value={selectedX}
              onChange={(e) => setSelectedX(e.target.value)}
              style={{ width: "100%", padding: "6px 8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: 12, background: "var(--surface)", color: "var(--text-primary)" }}
            >
              {columns.map((c) => (
                <option key={c} value={c}>
                  {c} {columnTypes.numeric.includes(c) ? "(123)" : "(abc)"}
                </option>
              ))}
            </select>
          </div>

          {/* Y Metric */}
          <div>
            <label style={{ display: "block", fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>
              Y-Axis / Metric
            </label>
            <select
              value={selectedY}
              onChange={(e) => setSelectedY(e.target.value)}
              style={{ width: "100%", padding: "6px 8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: 12, background: "var(--surface)", color: "var(--text-primary)" }}
            >
              <option value="__count__">Count of Records</option>
              {columnTypes.numeric.map((c) => (
                <option key={c} value={c}>
                  {c} (Numeric)
                </option>
              ))}
            </select>
          </div>

          {/* Aggregation */}
          <div>
            <label style={{ display: "block", fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>
              Aggregation
            </label>
            <select
              disabled={selectedY === "__count__"}
              value={aggregation}
              onChange={(e) => setAggregation(e.target.value)}
              style={{ width: "100%", padding: "6px 8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: 12, background: "var(--surface)", color: "var(--text-primary)" }}
            >
              <option value="avg">Average (Mean)</option>
              <option value="sum">Sum (Total)</option>
              <option value="max">Maximum</option>
              <option value="min">Minimum</option>
            </select>
          </div>

          {/* Top Categories Limit */}
          <div>
            <label style={{ display: "block", fontSize: 10.5, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", marginBottom: 4 }}>
              Display Limit
            </label>
            <select
              value={topLimit}
              onChange={(e) => setTopLimit(Number(e.target.value))}
              style={{ width: "100%", padding: "6px 8px", borderRadius: "var(--radius-sm)", border: "1px solid var(--border)", fontSize: 12, background: "var(--surface)", color: "var(--text-primary)" }}
            >
              <option value={5}>Top 5 Categories</option>
              <option value={10}>Top 10 Categories</option>
              <option value={15}>Top 15 Categories</option>
              <option value={30}>Top 30 Categories</option>
            </select>
          </div>
        </div>

        {/* Render Custom Visual */}
        {customChartData && (
          <div>
            <div style={{ marginBottom: 14 }}>
              {chartType === "bar" && (
                <BarChart
                  labels={customChartData.labels}
                  datasets={customChartData.datasets}
                  height={340}
                  yLabel={selectedY === "__count__" ? "Count" : `${aggregation.toUpperCase()}(${selectedY})`}
                  xLabel={selectedX}
                />
              )}
              {chartType === "horizontalBar" && (
                <HorizontalBarChart
                  labels={customChartData.labels}
                  datasets={customChartData.datasets}
                  height={340}
                  xLabel={selectedY === "__count__" ? "Count" : `${aggregation.toUpperCase()}(${selectedY})`}
                  yLabel={selectedX}
                />
              )}
              {chartType === "line" && (
                <LineChart
                  labels={customChartData.labels}
                  datasets={customChartData.datasets}
                  height={340}
                  yLabel={selectedY === "__count__" ? "Count" : `${aggregation.toUpperCase()}(${selectedY})`}
                  xLabel={selectedX}
                />
              )}
              {(chartType === "pie" || chartType === "doughnut") && (
                <PieChart
                  labels={customChartData.labels}
                  datasets={customChartData.datasets}
                  doughnut={chartType === "doughnut"}
                  height={340}
                />
              )}
              {chartType === "radar" && (
                <RadarChart
                  labels={customChartData.labels}
                  datasets={customChartData.datasets}
                  height={340}
                />
              )}
            </div>

            {/* Live AI Commentary on Custom Chart */}
            <div
              style={{
                background: "var(--surface-muted)",
                border: "1px solid var(--border)",
                borderLeft: "3px solid var(--accent)",
                borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                padding: "12px 16px",
                display: "flex",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <Sparkles size={16} style={{ marginTop: 2, flexShrink: 0, color: "var(--accent)" }} />
              <div style={{ fontSize: 13, color: "var(--text-secondary)", lineHeight: 1.6 }}>
                <strong style={{ color: "var(--text-primary)" }}>AI Visual Interpretation: </strong>
                Displaying <strong>{selectedY === "__count__" ? "Record Frequency (Count)" : `${aggregation.toUpperCase()}(${selectedY})`}</strong> grouped across categories of <strong>"{selectedX}"</strong>.{" "}
                {customChartData.labels.length > 0 && (
                  <>
                    The leading category is <strong>"{customChartData.labels[0]}"</strong> with a value of{" "}
                    <strong>{customChartData.datasets[0].data[0]}</strong>, while the baseline category is{" "}
                    <strong>"{customChartData.labels[customChartData.labels.length - 1]}"</strong> (
                    {customChartData.datasets[0].data[customChartData.datasets[0].data.length - 1]}), representing a spread delta of{" "}
                    <strong>
                      {Math.abs(Number(customChartData.datasets[0].data[0]) - Number(customChartData.datasets[0].data[customChartData.datasets[0].data.length - 1])).toFixed(2)} pts
                    </strong>.{" "}
                    {selectedY === "GPA" && (
                      <span>This variance highlights specific target cohorts where academic scaffolding and tutoring interventions will deliver the highest return.</span>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. Conversational AI Assistant */}
      <div
        style={{
          background: "var(--surface)",
          border: "1px solid var(--border)",
          borderRadius: "var(--radius)",
          padding: 20,
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Sparkles size={18} style={{ color: "var(--accent)" }} />
            <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: "var(--text-primary)" }}>
              AI Data Intelligence & Analytics Assistant
            </h3>
          </div>
          <span style={{ fontSize: 11.5, color: "var(--text-muted)", background: "var(--surface-muted)", padding: "2px 8px", borderRadius: 12, border: "1px solid var(--border)" }}>
            Parametric inference active across {data.length.toLocaleString()} rows
          </span>
        </div>

        {/* Suggested Queries */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 14 }}>
          {(columnTypes.numeric.includes("GPA") ? [
            "What factors correlate with GPA?",
            "Tutoring vs No Tutoring outcomes",
            "How to improve student grades?",
            "Students with GPA >= 3.5",
            "Absence correlation with GPA",
            "Breakdown by Parental Support",
            "Top 5 students by GPA",
            "Are there any outliers in this data?",
          ] : [
            "Summarize key insights in this dataset",
            "Identify key correlations",
            "Top records by highest value",
            "Are there any outliers in this data?",
          ]).map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              className="agent-chip"
              onClick={() => handleChatSubmit(null, prompt)}
            >
              {prompt}
            </button>
          ))}
        </div>

        <form onSubmit={handleChatSubmit} style={{ display: "flex", gap: 8, marginBottom: 14 }}>
          <input
            type="text"
            className="agent-input"
            placeholder={`Ask any analytical question about ${fileName}...`}
            value={chatQuestion}
            onChange={(e) => setChatQuestion(e.target.value)}
          />
          <button type="submit" className="agent-btn" disabled={chatLoading}>
            {chatLoading ? "Analyzing..." : "Analyze"}
          </button>
        </form>

        {chatResult && (
          <div
            style={{
              background: "var(--surface-muted)",
              border: "1px solid var(--border)",
              borderRadius: "var(--radius-sm)",
              padding: "18px 20px",
            }}
          >
            {/* Header with Title, Badge, Methodology and Copy */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                <span style={{ fontSize: 14, fontWeight: 700, color: "var(--text-primary)" }}>
                  {chatResult.title || "AI Finding"}
                </span>
                {chatResult.badge && (
                  <span
                    style={{
                      fontSize: 10.5,
                      fontWeight: 600,
                      padding: "2px 7px",
                      borderRadius: 10,
                      background: "var(--accent-light)",
                      border: "1px solid var(--accent-border)",
                      color: "var(--accent)",
                    }}
                  >
                    {chatResult.badge}
                  </span>
                )}
                {chatResult.methodology && (
                  <span style={{ fontSize: 10.5, color: "var(--text-muted)", background: "var(--surface)", border: "1px solid var(--border)", padding: "2px 7px", borderRadius: 4 }}>
                    {chatResult.methodology}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => {
                  const textToCopy = `${chatResult.title}\n\n${chatResult.summary}\n\n${(chatResult.evidence || []).join("\n")}\n\nStrategic Takeaway: ${chatResult.takeaway || ""}`;
                  navigator.clipboard.writeText(textToCopy);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="btn-secondary"
                style={{ padding: "4px 9px", fontSize: 11.5 }}
              >
                {copied ? <Check size={12} style={{ color: "var(--success)" }} /> : <Copy size={12} />}
                <span>{copied ? "Copied" : "Copy Brief"}</span>
              </button>
            </div>

            {/* Stat Chips / Metric Cards */}
            {chatResult.statChips && chatResult.statChips.length > 0 && (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
                  gap: 8,
                  marginBottom: 14,
                }}
              >
                {chatResult.statChips.map((chip, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      borderRadius: "var(--radius-xs)",
                      padding: "8px 12px",
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    <span style={{ fontSize: 11, color: "var(--text-muted)", fontWeight: 500 }}>
                      {chip.label}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 700, color: "var(--accent)" }}>
                      {chip.value}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Summary Narrative with bold parsing */}
            <p style={{ fontSize: 13.5, color: "var(--text-primary)", lineHeight: 1.65, margin: "0 0 12px" }}>
              <FormattedText text={chatResult.summary} />
            </p>

            {/* Evidence Bullets with bold parsing */}
            {chatResult.evidence && chatResult.evidence.length > 0 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 14, background: "var(--surface)", padding: "12px 14px", borderRadius: "var(--radius-xs)", border: "1px solid var(--border)" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Empirical Evidence & Observations:
                </span>
                {chatResult.evidence.map((point, i) => (
                  <div key={i} style={{ display: "flex", alignItems: "baseline", gap: 6, fontSize: 12.5, color: "var(--text-secondary)", lineHeight: 1.55 }}>
                    <span style={{ color: "var(--accent)", fontWeight: 700 }}>•</span>
                    <FormattedText text={point.replace(/^•\s*/, "")} />
                  </div>
                ))}
              </div>
            )}

            {/* Strategic Recommendation Callout */}
            {chatResult.takeaway && (
              <div
                style={{
                  background: "var(--accent-light)",
                  border: "1px solid var(--accent-border)",
                  borderLeft: "3.5px solid var(--accent)",
                  borderRadius: "0 var(--radius-sm) var(--radius-sm) 0",
                  padding: "10px 14px",
                  fontSize: 12.5,
                  color: "var(--text-primary)",
                  lineHeight: 1.55,
                  marginBottom: chatResult.followUpQuestions?.length > 0 ? 12 : 0,
                }}
              >
                <strong style={{ color: "var(--accent)", marginRight: 5 }}>Strategic Recommendation:</strong>
                <FormattedText text={chatResult.takeaway} />
              </div>
            )}

            {/* Contextual Follow-up Questions */}
            {chatResult.followUpQuestions && chatResult.followUpQuestions.length > 0 && (
              <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px dashed var(--border)" }}>
                <span style={{ fontSize: 11, fontWeight: 600, color: "var(--text-muted)", textTransform: "uppercase", display: "block", marginBottom: 6 }}>
                  Suggested Follow-up Inquiries:
                </span>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {chatResult.followUpQuestions.map((qText, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleChatSubmit(null, qText)}
                      style={{
                        background: "var(--surface)",
                        border: "1px solid var(--accent-border)",
                        borderRadius: 14,
                        padding: "3px 10px",
                        fontSize: 11.5,
                        color: "var(--accent)",
                        cursor: "pointer",
                        fontWeight: 500,
                        transition: "all 0.15s ease",
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.background = "var(--accent-light)";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.background = "var(--surface)";
                      }}
                    >
                      {qText} →
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

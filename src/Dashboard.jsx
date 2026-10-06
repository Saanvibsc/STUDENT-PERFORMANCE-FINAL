import { useState, useMemo, useCallback, useEffect } from "react";
import {
  BarChart,
  LineChart,
  PieChart,
  ScatterChart,
  CorrelationChart,
  CHART_COLORS,
} from "./ChartComponents.jsx";
import ChartCard from "./components/ChartCard.jsx";
import ExportModal from "./components/ExportModal.jsx";
import VisualizationsHub from "./components/VisualizationsHub.jsx";
import KpiExecutiveSuite from "./components/KpiExecutiveSuite.jsx";
import AiCsvVisualizer from "./components/AiCsvVisualizer.jsx";
import ThemeToggle from "./components/ThemeToggle.jsx";
import AcademicSimulatorModal from "./components/AcademicSimulatorModal.jsx";
import StudentDossierDrawer from "./components/StudentDossierDrawer.jsx";
import CommandPalette from "./components/CommandPalette.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import {
  computeKpis,
  gpaByGrade,
  gradeDistribution,
  genderDistribution,
  gpaByStudyBand,
  gpaByAbsenceBand,
  gpaByParentalSupport,
  gpaByParentalEducation,
  gpaByTutoring,
  activityGpaComparison,
  ageDistribution,
  ethnicityDistribution,
  gradeByGender,
  correlationMatrix,
  scatterData,
  buildSummary,
  downloadCsv,
  downloadPowerBiCsv,
  downloadPowerBiDax,
  queryLocalAnalytics,
} from "./dataUtils.js";
import {
  GraduationCap,
  TrendingUp,
  AlertOctagon,
  Clock,
  Award,
  Users,
  CalendarX,
  BookOpen,
  HeartHandshake,
  Download,
  Sparkles,
  LayoutDashboard,
  Brain,
  SlidersHorizontal,
  Table,
  BarChart3,
  FileSpreadsheet,
  Target,
  Search,
} from "lucide-react";

const GRADE_COLORS = {
  A: "#059669", // Vivid Emerald Green
  B: "#0284C7", // Sky Azure
  C: "#D97706", // Marigold Amber
  D: "#EA580C", // Tangerine Orange
  F: "#DC2626", // Crimson Red
};

function KpiCard({ icon: Icon, label, value, help, status, tag }) {
  const getStatusColor = () => {
    if (status === "alert") return { border: "#FCA5A5", bg: "#FEF2F2", text: "#B91C1C" };
    if (status === "success") return { border: "#86EFAC", bg: "#F0FDF4", text: "#15803D" };
    if (status === "warning") return { border: "#FCD34D", bg: "#FFFBEB", text: "#B45309" };
    return { border: "#E2E8F0", bg: "#FFFFFF", text: "#2F6690" };
  };

  const statusStyle = getStatusColor();

  return (
    <div
      className="kpi-card"
      style={{
        position: "relative",
        borderLeft: `4px solid ${statusStyle.text}`,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
          <div className="kpi-label" style={{ margin: 0 }}>{label}</div>
          {Icon && <Icon size={16} color={statusStyle.text} />}
        </div>
        <div className="kpi-value">{value}</div>
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 6 }}>
        <div className="kpi-help">{help}</div>
        {tag && (
          <span
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "1px 6px",
              borderRadius: 4,
              backgroundColor: statusStyle.bg,
              border: `1px solid ${statusStyle.border}`,
              color: statusStyle.text,
            }}
          >
            {tag}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Dashboard({
  data,
  filtered,
  activeTab: propActiveTab,
  setActiveTab: propSetActiveTab,
  setFilters,
  onResetFilters,
}) {
  const [internalActiveTab, setInternalActiveTab] = useState("visualizations");
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [agentQuestion, setAgentQuestion] = useState("");

  const activeTab = propActiveTab || internalActiveTab;
  const setActiveTab = propSetActiveTab || setInternalActiveTab;

  const kpis = useMemo(() => computeKpis(filtered), [filtered]);

  // Global keyboard shortcut for Command Palette (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleAskAgentFromChart = (prompt) => {
    setAgentQuestion(prompt);
    setActiveTab("ai");
  };

  const tabs = [
    {
      id: "visualizations",
      label: "Visualizations Hub",
      icon: BarChart3,
      badge: "16 Charts",
    },
    {
      id: "kpis",
      label: "Executive KPIs",
      icon: Target,
      badge: "14 KPIs",
    },
    {
      id: "ai",
      label: "AI & CSV Visualizer",
      icon: Sparkles,
      badge: "Auto-AI",
    },
    {
      id: "explorer",
      label: "Data & Power BI",
      icon: Table,
      badge: "Power BI",
    },
  ];

  return (
    <>
      {/* Top Organization Header & Action Launchers */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 16,
          flexWrap: "wrap",
          gap: 12,
        }}
      >
        {/* Top Tab Bar (Mirrors Side Tabs for Maximum Accessibility) */}
        <div className="tabs" style={{ margin: 0, padding: "4px 6px" }}>
          {tabs.map((t) => {
            const TabIcon = t.icon;
            const isActive = activeTab === t.id;
            return (
              <button
                key={t.id}
                type="button"
                className={`tab-btn ${isActive ? "active" : ""}`}
                onClick={() => setActiveTab(t.id)}
                style={{ display: "inline-flex", alignItems: "center", gap: 6 }}
              >
                <TabIcon size={15} />
                <span>{t.label}</span>
                {t.badge && (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      padding: "1px 6px",
                      borderRadius: 10,
                      background: isActive
                        ? "rgba(255, 255, 255, 0.25)"
                        : "rgba(0, 0, 0, 0.06)",
                      color: isActive ? "#FFFFFF" : "#64748B",
                    }}
                  >
                    {t.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Action Controls: Search, What-If Simulator, Theme Toggle & Export Center */}
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          {/* Cmd+K Quick Search / Command Button */}
          <button
            type="button"
            onClick={() => setIsCommandPaletteOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "7px 12px",
              borderRadius: "var(--radius-sm)",
              background: "var(--surface-muted)",
              border: "1px solid var(--border)",
              color: "var(--text-secondary)",
              fontSize: 12.5,
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            <Search size={14} style={{ color: "var(--text-muted)" }} />
            <span>Search / Commands</span>
            <kbd
              style={{
                fontSize: 10,
                fontWeight: 700,
                padding: "1px 5px",
                borderRadius: 4,
                background: "var(--surface)",
                border: "1px solid var(--border)",
                color: "var(--text-muted)",
              }}
            >
              ⌘K
            </kbd>
          </button>

          {/* Interactive What-If Scenario Simulator Button */}
          <button
            type="button"
            onClick={() => setIsSimulatorOpen(true)}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 13px",
              borderRadius: "var(--radius-sm)",
              background: "var(--accent-light)",
              border: "1px solid var(--accent-border)",
              color: "var(--accent)",
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              transition: "all 0.15s ease",
            }}
          >
            <Sparkles size={14} />
            <span>What-If Simulator</span>
          </button>

          <ThemeToggle />

          <button
            type="button"
            onClick={() => setIsExportOpen(true)}
            className="btn-primary"
            style={{ padding: "7px 13px" }}
          >
            <FileSpreadsheet size={15} />
            <span>Export & Power BI</span>
          </button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="error-screen">
          <h2>No students match the selected filters</h2>
          <p>Try adjusting or resetting the filters in the sidebar.</p>
        </div>
      ) : (
        <ErrorBoundary key={activeTab} resetKey={activeTab}>
          {activeTab === "visualizations" && (
            <VisualizationsHub
              data={filtered}
              onAskAgent={handleAskAgentFromChart}
            />
          )}
          {activeTab === "kpis" && (
            <KpiExecutiveSuite kpis={kpis} data={filtered} />
          )}
          {(activeTab === "ai" || activeTab === "agent") && (
            <AiCsvVisualizer
              defaultStudentData={filtered}
              initialQuestion={agentQuestion}
              onClearInitialQuestion={() => setAgentQuestion("")}
            />
          )}
          {activeTab === "explorer" && (
            <ExplorerTab
              data={filtered}
              kpis={kpis}
              onOpenExport={() => setIsExportOpen(true)}
              onSelectStudent={(student) => setSelectedStudent(student)}
            />
          )}
        </ErrorBoundary>
      )}

      {/* Power BI & CSV Export Modal */}
      <ExportModal
        isOpen={isExportOpen}
        onClose={() => setIsExportOpen(false)}
        data={filtered}
        kpis={kpis}
      />

      {/* Interactive Academic Scenario Simulator Modal */}
      <AcademicSimulatorModal
        isOpen={isSimulatorOpen}
        onClose={() => setIsSimulatorOpen(false)}
        cohortData={filtered}
      />

      {/* 360° Student Profile Dossier Drawer */}
      <StudentDossierDrawer
        student={selectedStudent}
        cohortData={data}
        isOpen={Boolean(selectedStudent)}
        onClose={() => setSelectedStudent(null)}
      />

      {/* Universal Command & Quick Action Palette (Cmd+K) */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        setActiveTab={setActiveTab}
        onOpenSimulator={() => setIsSimulatorOpen(true)}
        onOpenExport={() => setIsExportOpen(true)}
        setFilters={setFilters}
        onResetFilters={onResetFilters}
      />
    </>
  );
}

function OverviewTab({ data, onAskAgent }) {
  const gradeDist = useMemo(() => gradeDistribution(data), [data]);
  const genderDist = useMemo(() => genderDistribution(data), [data]);

  return (
    <>
      <div className="section-title">Academic Performance Overview</div>
      <div className="section-caption">
        Macro-level distribution and demographic composition of the selected student population with integrated AI analysis.
      </div>

      <div className="chart-grid cols-2">
        <ChartCard
          title="GPA Distribution"
          caption="Histogram of GPA frequency across 0.2 score bins"
          chartKey="gpa_histogram"
          data={data}
          onAskAgent={onAskAgent}
        >
          <GpaHistogram data={data} />
        </ChartCard>

        <ChartCard
          title="Students by Grade Class"
          caption="Categorical distribution of letter grade cohorts"
          chartKey="grade_bar"
          data={data}
          exportData={gradeDist}
          exportFilename="grade_distribution.csv"
          onAskAgent={onAskAgent}
        >
          <BarChart
            labels={gradeDist.map((g) => g.label)}
            datasets={[
              {
                label: "Students",
                data: gradeDist.map((g) => g.count),
                backgroundColor: gradeDist.map((g) => GRADE_COLORS[g.label]),
                borderRadius: 6,
              },
            ]}
            yLabel="Number of Students"
            xLabel="Grade Class"
            height={320}
          />
        </ChartCard>
      </div>

      <div className="chart-grid cols-2">
        <ChartCard
          title="Gender Composition"
          caption="Gender representation breakdown within cohort"
          chartKey="gender_pie"
          data={data}
          exportData={genderDist}
          exportFilename="gender_distribution.csv"
          onAskAgent={onAskAgent}
        >
          <PieChart
            labels={genderDist.map((g) => g.label)}
            datasets={[
              {
                data: genderDist.map((g) => g.count),
                backgroundColor: [CHART_COLORS.blue, CHART_COLORS.teal],
                borderColor: "#fff",
                borderWidth: 2,
              },
            ]}
            height={320}
          />
        </ChartCard>

        <ChartCard
          title="Grade Composition Breakdown"
          caption="Proportional pie distribution of letter grades"
          chartKey="grade_pie"
          data={data}
          exportData={gradeDist}
          exportFilename="grade_proportions.csv"
          onAskAgent={onAskAgent}
        >
          <PieChart
            labels={gradeDist.map((g) => g.label)}
            datasets={[
              {
                data: gradeDist.map((g) => g.count),
                backgroundColor: gradeDist.map((g) => GRADE_COLORS[g.label]),
                borderColor: "#fff",
                borderWidth: 2,
              },
            ]}
            height={320}
          />
        </ChartCard>
      </div>
    </>
  );
}

function GpaHistogram({ data }) {
  const bins = useMemo(() => {
    const binSize = 0.2;
    const binCount = Math.ceil(4 / binSize);
    const counts = new Array(binCount).fill(0);
    const labels = [];
    for (let i = 0; i < binCount; i++) {
      labels.push(`${(i * binSize).toFixed(1)}–${((i + 1) * binSize).toFixed(1)}`);
    }
    for (const d of data) {
      const idx = Math.min(Math.floor(d.GPA / binSize), binCount - 1);
      counts[idx]++;
    }
    return { labels, counts };
  }, [data]);

  return (
    <BarChart
      labels={bins.labels}
      datasets={[
        {
          label: "Students",
          data: bins.counts,
          backgroundColor: CHART_COLORS.blue,
          borderRadius: 4,
        },
      ]}
      yLabel="Number of Students"
      xLabel="GPA Range"
      height={320}
    />
  );
}

function AcademicTab({ data, onAskAgent }) {
  const studyBands = useMemo(() => gpaByStudyBand(data), [data]);
  const absenceBands = useMemo(() => gpaByAbsenceBand(data), [data]);
  const tutoring = useMemo(() => gpaByTutoring(data), [data]);

  return (
    <>
      <div className="section-title">Academic Factors</div>
      <div className="section-caption">
        Evaluating the direct influence of study hours, absence frequency, and tutoring interventions.
      </div>

      <div className="chart-grid cols-2">
        <ChartCard
          title="Average GPA by Weekly Study-Time Band"
          caption="Comparative GPA performance across categorized study hours"
          chartKey="study_gpa_bar"
          data={data}
          exportData={studyBands}
          exportFilename="study_bands_gpa.csv"
          onAskAgent={onAskAgent}
        >
          <BarChart
            labels={studyBands.map((b) => b.label)}
            datasets={[
              {
                label: "Average GPA",
                data: studyBands.map((b) => b.value),
                backgroundColor: CHART_COLORS.blue,
                borderRadius: 6,
              },
            ]}
            yMax={4.2}
            yLabel="Average GPA"
            xLabel="Weekly Study Time"
            height={340}
          />
        </ChartCard>

        <ChartCard
          title="Average GPA by Absence Band"
          caption="Penalty gradient demonstrating how absences degrade GPA"
          chartKey="absence_gpa_bar"
          data={data}
          exportData={absenceBands}
          exportFilename="absence_bands_gpa.csv"
          onAskAgent={onAskAgent}
        >
          <BarChart
            labels={absenceBands.map((b) => b.label)}
            datasets={[
              {
                label: "Average GPA",
                data: absenceBands.map((b) => b.value),
                backgroundColor: CHART_COLORS.orange,
                borderRadius: 6,
              },
            ]}
            yMax={4.2}
            yLabel="Average GPA"
            xLabel="Number of Absences"
            height={340}
          />
        </ChartCard>
      </div>

      <div style={{ marginBottom: 18 }}>
        <ChartCard
          title="GPA Progression Curve Across Study Time"
          caption="Continuous line view highlighting absence of diminishing returns"
          chartKey="study_gpa_line"
          data={data}
          exportData={studyBands}
          exportFilename="study_progression.csv"
          onAskAgent={onAskAgent}
        >
          <LineChart
            labels={studyBands.map((b) => b.label)}
            datasets={[
              {
                label: "Average GPA",
                data: studyBands.map((b) => b.value),
                borderColor: CHART_COLORS.teal,
                backgroundColor: "rgba(58, 125, 124, 0.1)",
                fill: true,
                pointRadius: 6,
                pointBackgroundColor: CHART_COLORS.teal,
                borderWidth: 3,
              },
            ]}
            yMax={4.2}
            yLabel="Average GPA"
            xLabel="Weekly Study Time"
            height={300}
          />
        </ChartCard>
      </div>

      <ChartCard
        title="Average GPA: Tutoring vs No Tutoring"
        caption="Program efficacy comparison measuring intervention lift"
        chartKey="tutoring_bar"
        data={data}
        exportData={tutoring}
        exportFilename="tutoring_impact.csv"
        onAskAgent={onAskAgent}
      >
        <BarChart
          labels={tutoring.map((t) => t.label)}
          datasets={[
            {
              label: "Average GPA",
              data: tutoring.map((t) => t.value),
              backgroundColor: tutoring.map((t) =>
                t.label === "Tutoring" ? CHART_COLORS.teal : CHART_COLORS.muted
              ),
              borderRadius: 6,
            },
          ]}
          yMax={4.2}
          yLabel="Average GPA"
          xLabel="Tutoring Participation"
          height={300}
        />
      </ChartCard>
    </>
  );
}

function StudentTab({ data, onAskAgent }) {
  const supportGpa = useMemo(() => gpaByParentalSupport(data), [data]);
  const educationGpa = useMemo(() => gpaByParentalEducation(data), [data]);
  const activities = useMemo(() => activityGpaComparison(data), [data]);

  return (
    <>
      <div className="section-title">Student & Family Factors</div>
      <div className="section-caption">
        Evaluating the role of family environment, parental education, and extracurricular engagement.
      </div>

      <div className="chart-grid cols-2">
        <ChartCard
          title="Average GPA by Parental Education"
          caption="Comparative academic outcomes by parental educational attainment"
          chartKey="parental_education_bar"
          data={data}
          exportData={educationGpa}
          exportFilename="parental_education_gpa.csv"
          onAskAgent={onAskAgent}
        >
          <BarChart
            labels={educationGpa.map((e) => e.label)}
            datasets={[
              {
                label: "Average GPA",
                data: educationGpa.map((e) => e.value),
                backgroundColor: CHART_COLORS.purple,
                borderRadius: 6,
              },
            ]}
            yMax={4.2}
            yLabel="Average GPA"
            xLabel="Parental Education"
            height={340}
          />
        </ChartCard>

        <ChartCard
          title="Average GPA by Parental Support Level"
          caption="Correlation between active household encouragement and student grades"
          chartKey="parental_support_line"
          data={data}
          exportData={supportGpa}
          exportFilename="parental_support_gpa.csv"
          onAskAgent={onAskAgent}
        >
          <LineChart
            labels={supportGpa.map((s) => s.label)}
            datasets={[
              {
                label: "Average GPA",
                data: supportGpa.map((s) => s.value),
                borderColor: CHART_COLORS.blue,
                backgroundColor: "rgba(47, 102, 144, 0.1)",
                fill: true,
                pointRadius: 6,
                pointBackgroundColor: CHART_COLORS.blue,
                borderWidth: 3,
              },
            ]}
            yMax={4.2}
            yLabel="Average GPA"
            xLabel="Parental Support Level"
            height={340}
          />
        </ChartCard>
      </div>

      <ChartCard
        title="Average GPA by Activity Participation"
        caption="Paired comparison showing extracurriculars, sports, music, and volunteering"
        chartKey="activity_bar"
        data={data}
        exportData={activities}
        exportFilename="extracurricular_gpa.csv"
        onAskAgent={onAskAgent}
      >
        <BarChart
          labels={activities.map((a) => a.label)}
          datasets={[
            {
              label: "Participates",
              data: activities.map((a) => a.participates),
              backgroundColor: CHART_COLORS.teal,
              borderRadius: 6,
            },
            {
              label: "Does Not Participate",
              data: activities.map((a) => a.doesNot),
              backgroundColor: CHART_COLORS.muted,
              borderRadius: 6,
            },
          ]}
          yMax={4.2}
          yLabel="Average GPA"
          xLabel="Activity"
          showLegend={true}
          height={340}
        />
      </ChartCard>
    </>
  );
}

function DistributionsTab({ data, onAskAgent }) {
  const ageDist = useMemo(() => ageDistribution(data), [data]);
  const ethnicityDist = useMemo(() => ethnicityDistribution(data), [data]);
  const gradeGender = useMemo(() => gradeByGender(data), [data]);

  return (
    <>
      <div className="section-title">Demographic & Cohort Distributions</div>
      <div className="section-caption">
        Population balance across ages, ethnic backgrounds, and gender-stratified academic achievements.
      </div>

      <div className="chart-grid cols-2">
        <ChartCard
          title="Number of Students by Age"
          caption="High school cohort age distribution (15–18 years)"
          chartKey="age_bar"
          data={data}
          exportData={ageDist}
          exportFilename="age_distribution.csv"
          onAskAgent={onAskAgent}
        >
          <BarChart
            labels={ageDist.map((a) => a.label)}
            datasets={[
              {
                label: "Students",
                data: ageDist.map((a) => a.count),
                backgroundColor: CHART_COLORS.purple,
                borderRadius: 6,
              },
            ]}
            yLabel="Number of Students"
            xLabel="Age (years)"
            height={320}
          />
        </ChartCard>

        <ChartCard
          title="Ethnicity Composition"
          caption="Proportional diversity across recorded ethnic groups"
          chartKey="ethnicity_pie"
          data={data}
          exportData={ethnicityDist}
          exportFilename="ethnicity_distribution.csv"
          onAskAgent={onAskAgent}
        >
          <PieChart
            labels={ethnicityDist.map((e) => e.label)}
            datasets={[
              {
                data: ethnicityDist.map((e) => e.count),
                backgroundColor: [
                  CHART_COLORS.blue,
                  CHART_COLORS.orange,
                  CHART_COLORS.teal,
                  CHART_COLORS.purple,
                ],
                borderColor: "#fff",
                borderWidth: 2,
              },
            ]}
            height={320}
          />
        </ChartCard>
      </div>

      <ChartCard
        title="Grade Composition by Gender"
        caption="Stacked grade distribution comparing male and female performance tiers"
        chartKey="grade_by_gender_bar"
        data={data}
        exportData={gradeGender}
        exportFilename="grade_by_gender.csv"
        onAskAgent={onAskAgent}
      >
        <BarChart
          labels={["Male", "Female"]}
          datasets={["A", "B", "C", "D", "F"].map((grade) => ({
            label: `Grade ${grade}`,
            data: ["Male", "Female"].map(
              (gender) =>
                gradeGender.find((g) => g.gender === gender && g.grade === grade)
                  ?.count || 0
            ),
            backgroundColor: GRADE_COLORS[grade],
            borderRadius: 4,
          }))}
          yLabel="Number of Students"
          xLabel="Gender"
          showLegend={true}
          height={360}
        />
      </ChartCard>
    </>
  );
}

function CorrelationsTab({ data, onAskAgent }) {
  const [relationship, setRelationship] = useState("study");
  const corr = useMemo(() => correlationMatrix(data), [data]);

  const scatter = useMemo(() => {
    if (relationship === "study") {
      return scatterData(data, "StudyTimeWeekly", "GPA");
    }
    return scatterData(data, "Absences", "GPA");
  }, [data, relationship]);

  const maleData = scatter.filter((s) => s.gender === "Male");
  const femaleData = scatter.filter((s) => s.gender === "Female");

  const xLabel =
    relationship === "study"
      ? "Weekly Study Time (hours)"
      : "Number of Absences";

  return (
    <>
      <div className="section-title">Correlation & Regression Analysis</div>
      <div className="section-caption">
        Multivariate statistical evaluation of explanatory variables driving student GPA.
      </div>

      <div style={{ marginBottom: 18 }}>
        <ChartCard
          title="Numeric Variable Pearson Correlation Matrix"
          caption="Heatmap showing pairwise linear correlation coefficients (r)"
          chartKey="correlation_heatmap"
          data={data}
          onAskAgent={onAskAgent}
        >
          <CorrelationChart
            labels={corr.labels}
            matrix={corr.matrix}
            height={400}
          />
        </ChartCard>
      </div>

      <ChartCard
        title={relationship === "study" ? "Study Time vs GPA Dispersion" : "Absences vs GPA Regression"}
        caption="Scatter plot colored by gender with individual student records"
        chartKey="scatter_plot"
        data={data}
        extra={{ relationship }}
        onAskAgent={onAskAgent}
      >
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
          <select
            value={relationship}
            onChange={(e) => setRelationship(e.target.value)}
            style={{
              padding: "6px 12px",
              border: "1px solid #CBD5E1",
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              color: "#1E293B",
              background: "#F8FAFC",
              cursor: "pointer",
            }}
          >
            <option value="study">Weekly Study Time vs GPA</option>
            <option value="absences">Absence Count vs GPA</option>
          </select>
        </div>
        <ScatterChart
          datasets={[
            {
              label: "Male",
              data: maleData,
              backgroundColor: "rgba(47, 102, 144, 0.4)",
              pointRadius: 4,
            },
            {
              label: "Female",
              data: femaleData,
              backgroundColor: "rgba(58, 125, 124, 0.4)",
              pointRadius: 4,
            },
          ]}
          xLabel={xLabel}
          yLabel="Grade Point Average (GPA)"
          height={400}
        />
      </ChartCard>
    </>
  );
}

function AgentTab({ data, initialQuestion, onClearInitialQuestion }) {
  const [question, setQuestion] = useState(initialQuestion || "");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const summary = useMemo(() => buildSummary(data), [data]);

  const suggestions = [
    "What factors most influence student GPA in this filtered cohort?",
    "Compare tutoring vs non-tutoring outcomes and risk mitigation",
    "Which parental support tier delivers the highest average GPA?",
    "What is the correlation between absence count and student GPA?",
    "How many students have a GPA above 3.5 or fall into at-risk status?",
  ];

  const askAgent = useCallback(
    async (q) => {
      if (!q.trim()) return;
      setLoading(true);
      setError(false);
      setResponse("");
      try {
        if (import.meta.env.VITE_SUPABASE_URL) {
          const res = await fetch(
            import.meta.env.VITE_SUPABASE_URL +
              "/functions/v1/analytics-agent",
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
              },
              body: JSON.stringify({ question: q, summary }),
            }
          );
          if (res.ok) {
            const result = await res.json();
            if (result.answer) {
              setResponse(result.answer);
              return;
            }
          }
        }
        // Intelligent Local Analytics Engine
        await new Promise((r) => setTimeout(r, 250));
        const localAnswer = queryLocalAnalytics(q, data);
        setResponse(localAnswer);
      } catch (err) {
        const localAnswer = queryLocalAnalytics(q, data);
        setResponse(localAnswer);
      } finally {
        setLoading(false);
      }
    },
    [data, summary]
  );

  useEffect(() => {
    if (initialQuestion) {
      setQuestion(initialQuestion);
      askAgent(initialQuestion);
      if (onClearInitialQuestion) onClearInitialQuestion();
    }
  }, [initialQuestion, askAgent, onClearInitialQuestion]);

  const handleSubmit = (e) => {
    e.preventDefault();
    askAgent(question);
  };

  return (
    <>
      <div className="section-title">AI Student Performance Analytics Agent</div>
      <div className="section-caption">
        Ask natural language questions about the currently filtered student population to uncover hidden patterns and pedagogical takeaways.
      </div>

      <div className="agent-container">
        <div className="agent-suggestions">
          {suggestions.map((s) => (
            <span
              key={s}
              className="suggestion-chip"
              onClick={() => {
                setQuestion(s);
                askAgent(s);
              }}
            >
              {s}
            </span>
          ))}
        </div>

        <form className="agent-input-row" onSubmit={handleSubmit}>
          <input
            type="text"
            className="agent-input"
            placeholder="Ask anything about student performance, risks, tutoring, or study habits..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
          <button type="submit" className="agent-btn" disabled={loading}>
            {loading ? "Analyzing..." : "Ask AI"}
          </button>
        </form>

        <div
          className={`agent-response ${
            loading
              ? "loading"
              : error
              ? "error"
              : !response
              ? "placeholder"
              : ""
          }`}
        >
          {loading && (
            <>
              <div className="spinner" />
              <span>Analyzing the active student dataset...</span>
            </>
          )}
          {!loading && response}
          {!loading && !response &&
            "Select a question chip above or enter your query to receive AI-powered insights."}
        </div>
      </div>
    </>
  );
}

function ExplorerTab({ data, kpis, onOpenExport, onSelectStudent }) {
  const [searchTerm, setSearchTerm] = useState("");
  const columns = [
    "StudentID",
    "Age",
    "Gender",
    "Ethnicity",
    "ParentalEducation",
    "StudyTimeWeekly",
    "Absences",
    "Tutoring",
    "ParentalSupport",
    "Extracurricular",
    "Sports",
    "Music",
    "Volunteering",
    "GPA",
    "GradeClass",
  ];

  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const q = searchTerm.toLowerCase().trim();
    return data.filter(
      (r) =>
        String(r.StudentID).includes(q) ||
        String(r.GradeClass).toLowerCase().includes(q) ||
        String(r.Gender).toLowerCase().includes(q) ||
        String(r.Ethnicity).toLowerCase().includes(q)
    );
  }, [data, searchTerm]);

  return (
    <>
      <div className="section-title">Data Explorer & Student Dossier Hub</div>
      <div className="section-caption">
        Inspect granular micro-data records, view interactive 360° student dossiers, and export formatted models directly into Microsoft Power BI Desktop or CSV spreadsheets.
      </div>

      <div className="data-explorer">
        {/* Quick Action Toolbar with Search and Exports */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 14,
            flexWrap: "wrap",
            gap: 12,
            background: "var(--surface-muted)",
            padding: "12px 16px",
            borderRadius: 10,
            border: "1px solid var(--border)",
          }}
        >
          {/* Real-time Student Search Input */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flex: 1, minWidth: 260 }}>
            <div style={{ position: "relative", width: "100%", maxWidth: 360 }}>
              <Search
                size={14}
                style={{
                  position: "absolute",
                  left: 10,
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "var(--text-muted)",
                }}
              />
              <input
                type="text"
                placeholder="Search by Student ID, Grade (A-F), Gender..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{
                  width: "100%",
                  padding: "7px 10px 7px 30px",
                  borderRadius: 6,
                  border: "1px solid var(--border)",
                  background: "var(--surface)",
                  color: "var(--text-primary)",
                  fontSize: 12.5,
                  outline: "none",
                }}
              />
            </div>
            <div style={{ fontSize: 12, color: "var(--text-muted)", whiteSpace: "nowrap" }}>
              Showing <strong>{Math.min(500, filteredData.length).toLocaleString()}</strong> of{" "}
              <strong>{data.length.toLocaleString()}</strong> students
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <button
              type="button"
              className="download-btn"
              style={{ margin: 0 }}
              onClick={() => downloadCsv(filteredData, "filtered_student_performance.csv")}
            >
              <Download size={14} />
              Export Standard CSV
            </button>
            <button
              type="button"
              className="download-btn"
              style={{ margin: 0, background: "#D97706" }}
              onClick={() => downloadPowerBiCsv(filteredData)}
            >
              <FileSpreadsheet size={14} />
              Export Power BI Model (.csv)
            </button>
            <button
              type="button"
              className="download-btn"
              style={{ margin: 0, background: "#2F6690" }}
              onClick={onOpenExport}
            >
              <Sparkles size={14} />
              Power BI & DAX Guide
            </button>
          </div>
        </div>

        {/* Informative Interaction Callout */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "8px 12px",
            marginBottom: 12,
            background: "var(--surface-muted)",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontSize: 12,
            color: "var(--text-secondary)",
          }}
        >
          <Sparkles size={14} style={{ color: "var(--accent)", flexShrink: 0 }} />
          <span>
            <strong>Interactive Feature:</strong> Click any student row below to inspect their <strong>360° Profile Dossier</strong>, percentile ranking, risk diagnostics, and AI Counselor Action Plan.
          </span>
        </div>

        {/* Granular Data Table */}
        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
                <th style={{ textAlign: "center", minWidth: 100 }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.slice(0, 500).map((row, i) => (
                <tr
                  key={row.StudentID || i}
                  onClick={() => onSelectStudent && onSelectStudent(row)}
                  style={{ cursor: "pointer", transition: "background 0.15s ease" }}
                  className="table-student-row"
                >
                  {columns.map((col) => (
                    <td key={col}>
                      {col === "GradeClass" ? (
                        <span
                          style={{
                            fontWeight: 700,
                            padding: "2px 6px",
                            borderRadius: 4,
                            background:
                              row.GradeClass === "A"
                                ? "#ECFDF5"
                                : row.GradeClass === "B"
                                ? "#F0F9FF"
                                : row.GradeClass === "C"
                                ? "#FFFBEB"
                                : row.GradeClass === "D"
                                ? "#FFF7ED"
                                : "#FEF2F2",
                            color:
                              row.GradeClass === "A"
                                ? "#059669"
                                : row.GradeClass === "B"
                                ? "#0284C7"
                                : row.GradeClass === "C"
                                ? "#D97706"
                                : row.GradeClass === "D"
                                ? "#EA580C"
                                : "#DC2626",
                          }}
                        >
                          {row.GradeClass}
                        </span>
                      ) : typeof row[col] === "number" ? (
                        Number.isInteger(row[col]) ? (
                          row[col]
                        ) : (
                          row[col].toFixed(2)
                        )
                      ) : (
                        row[col]
                      )}
                    </td>
                  ))}
                  <td style={{ textAlign: "center" }}>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectStudent && onSelectStudent(row);
                      }}
                      style={{
                        padding: "3px 8px",
                        borderRadius: 4,
                        fontSize: 11,
                        fontWeight: 600,
                        background: "var(--accent-light)",
                        color: "var(--accent)",
                        border: "1px solid var(--accent-border)",
                        cursor: "pointer",
                        whiteSpace: "nowrap",
                      }}
                    >
                      360° Dossier ↗
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

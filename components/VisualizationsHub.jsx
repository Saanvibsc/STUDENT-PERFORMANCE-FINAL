import { useState, useMemo } from "react";
import {
  BarChart,
  HorizontalBarChart,
  LineChart,
  PieChart,
  RadarChart,
  PolarAreaChart,
  ScatterChart,
  CorrelationChart,
  CHART_COLORS,
} from "../ChartComponents.jsx";
import ChartCard from "./ChartCard.jsx";
import {
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
  radarCohortComparison,
  parentalEducationHonorRate,
  absenceDecileRisk,
  extracurricularPolarData,
} from "../dataUtils.js";
import {
  BarChart3,
  GraduationCap,
  ShieldAlert,
  Users,
  TrendingUp,
  Layers,
  Sparkles,
} from "lucide-react";

// Distinct contrasting colors for letter grades
const GRADE_COLORS = {
  A: "#059669", // Vivid Emerald Green
  B: "#0284C7", // Bright Sky Azure
  C: "#D97706", // Warm Marigold Amber
  D: "#EA580C", // Vivid Tangerine
  F: "#DC2626", // Deep Crimson Red
};

export default function VisualizationsHub({ data, onAskAgent }) {
  const [subCategory, setSubCategory] = useState("all");
  const [scatterVar, setScatterVar] = useState("study");

  // Precompute chart datasets
  const gradeDist = useMemo(() => gradeDistribution(data), [data]);
  const genderDist = useMemo(() => genderDistribution(data), [data]);
  const studyBands = useMemo(() => gpaByStudyBand(data), [data]);
  const absenceBands = useMemo(() => gpaByAbsenceBand(data), [data]);
  const tutoring = useMemo(() => gpaByTutoring(data), [data]);
  const supportGpa = useMemo(() => gpaByParentalSupport(data), [data]);
  const educationGpa = useMemo(() => gpaByParentalEducation(data), [data]);
  const activities = useMemo(() => activityGpaComparison(data), [data]);
  const ageDist = useMemo(() => ageDistribution(data), [data]);
  const ethnicityDist = useMemo(() => ethnicityDistribution(data), [data]);
  const gradeGender = useMemo(() => gradeByGender(data), [data]);
  const corr = useMemo(() => correlationMatrix(data), [data]);

  // Extra Visualizations
  const radarData = useMemo(() => radarCohortComparison(data), [data]);
  const parentalHonor = useMemo(() => parentalEducationHonorRate(data), [data]);
  const absenceDeciles = useMemo(() => absenceDecileRisk(data), [data]);
  const polarExtra = useMemo(() => extracurricularPolarData(data), [data]);

  const scatter = useMemo(() => {
    if (scatterVar === "study") {
      return scatterData(data, "StudyTimeWeekly", "GPA");
    }
    return scatterData(data, "Absences", "GPA");
  }, [data, scatterVar]);

  const maleScatter = scatter.filter((s) => s.gender === "Male");
  const femaleScatter = scatter.filter((s) => s.gender === "Female");

  const subCategories = [
    { id: "all", label: "All Visualizations (16)", icon: Layers },
    { id: "academic", label: "Academic Trajectories", icon: GraduationCap },
    { id: "behavioral", label: "Behavioral & Risk", icon: ShieldAlert },
    { id: "demographic", label: "Demographics & Equity", icon: Users },
    { id: "statistical", label: "Statistical & Regression", icon: TrendingUp },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      {/* Category Navigation Bar */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
          background: "var(--surface)",
          padding: "10px 14px",
          borderRadius: "var(--radius)",
          border: "1px solid var(--border)",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--text-muted)", textTransform: "uppercase" }}>
            Domain:
          </span>
          {subCategories.map((c) => {
            const Icon = c.icon;
            const active = subCategory === c.id;
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSubCategory(c.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: 5,
                  padding: "5px 10px",
                  borderRadius: "var(--radius-xs)",
                  fontSize: 12,
                  fontWeight: active ? 600 : 500,
                  cursor: "pointer",
                  border: active ? "1px solid var(--accent)" : "1px solid var(--border)",
                  background: active ? "var(--accent)" : "var(--surface)",
                  color: active ? "#FFFFFF" : "var(--text-secondary)",
                  transition: "all 0.15s ease",
                }}
              >
                <Icon size={13} />
                <span>{c.label}</span>
              </button>
            );
          })}
        </div>

        <div style={{ fontSize: 11.5, color: "var(--text-muted)" }}>
          Showing <strong>{data.length.toLocaleString()}</strong> filtered records
        </div>
      </div>

      {/* 1. Academic Trajectories */}
      {(subCategory === "all" || subCategory === "academic") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="section-title" style={{ margin: "4px 0 0" }}>
            Academic Trajectories & Attainment
          </div>

          <div className="chart-grid cols-2">
            {/* Chart 1: Electric Indigo */}
            <ChartCard
              title="GPA Distribution Histogram"
              caption="Continuous binned frequency of student GPA scores (0.2 step intervals)"
              chartKey="gpa_histogram"
              data={data}
              onAskAgent={onAskAgent}
            >
              <GpaHistogramLocal data={data} />
            </ChartCard>

            {/* Chart 2: 5-Color Grade Rainbow */}
            <ChartCard
              title="Students by Grade Class"
              caption="Categorical distribution of letter grade cohorts (A to F)"
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
                    borderColor: gradeDist.map((g) => GRADE_COLORS[g.label]),
                    borderWidth: 1,
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
            {/* Chart 3: Cobalt Sapphire Blue */}
            <ChartCard
              title="Weekly Study Time vs Average GPA"
              caption="Progression of mean academic performance across weekly study bands"
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
                    borderColor: "#1E40AF",
                    borderWidth: 1,
                    borderRadius: 6,
                  },
                ]}
                yMax={4.2}
                yLabel="Average GPA"
                xLabel="Weekly Study Time"
                height={320}
              />
            </ChartCard>

            {/* Chart 4: Persian Mint Teal */}
            <ChartCard
              title="Study Return Progression Curve"
              caption="Continuous curve revealing lack of diminishing returns for self-study"
              chartKey="study_gpa_line"
              data={data}
              exportData={studyBands}
              exportFilename="study_return_curve.csv"
              onAskAgent={onAskAgent}
            >
              <LineChart
                labels={studyBands.map((b) => b.label)}
                datasets={[
                  {
                    label: "Average GPA",
                    data: studyBands.map((b) => b.value),
                    borderColor: CHART_COLORS.teal,
                    backgroundColor: "rgba(13, 148, 136, 0.14)",
                    fill: true,
                    pointRadius: 6,
                    pointBackgroundColor: CHART_COLORS.teal,
                    borderWidth: 3,
                  },
                ]}
                yMax={4.2}
                yLabel="Average GPA"
                xLabel="Weekly Study Time"
                height={320}
              />
            </ChartCard>
          </div>
        </div>
      )}

      {/* 2. Behavioral & Risk Factors */}
      {(subCategory === "all" || subCategory === "behavioral") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="section-title" style={{ margin: "10px 0 0" }}>
            Behavioral, Attendance & Intervention Diagnostics
          </div>

          {/* Chart 5: Tri-Color Radar Synthesis (Jade, Sky Azure, Ruby Coral) */}
          <ChartCard
            title="Holistic Student Success & Risk Profile (Radar Synthesis)"
            caption="Multi-dimensional behavioral footprint comparing Honor Roll, Average, and At-Risk cohorts across 5 normalized axes"
            chartKey="cohort_radar"
            data={data}
            onAskAgent={onAskAgent}
          >
            <RadarChart
              labels={radarData.labels}
              datasets={radarData.datasets}
              height={380}
            />
          </ChartCard>

          <div className="chart-grid cols-2">
            {/* Chart 6: Warm Marigold Amber */}
            <ChartCard
              title="Absence Penalty Gradient"
              caption="Direct penalty curve showing how unexcused absences degrade student GPA"
              chartKey="absence_gpa_bar"
              data={data}
              exportData={absenceBands}
              exportFilename="absence_penalty.csv"
              onAskAgent={onAskAgent}
            >
              <BarChart
                labels={absenceBands.map((b) => b.label)}
                datasets={[
                  {
                    label: "Average GPA",
                    data: absenceBands.map((b) => b.value),
                    backgroundColor: CHART_COLORS.amber,
                    borderColor: "#B45309",
                    borderWidth: 1,
                    borderRadius: 6,
                  },
                ]}
                yMax={4.2}
                yLabel="Average GPA"
                xLabel="Absence Count"
                height={320}
              />
            </ChartCard>

            {/* Chart 7: Crimson Vermilion Flame */}
            <ChartCard
              title="Absence Severity Decile Progression"
              caption="Horizontal bracket evaluation showing non-linear failure risk cliffs"
              chartKey="absence_deciles_bar"
              data={data}
              exportData={absenceDeciles}
              exportFilename="absence_decile_risk.csv"
              onAskAgent={onAskAgent}
            >
              <HorizontalBarChart
                labels={absenceDeciles.map((d) => d.label)}
                datasets={[
                  {
                    label: "Average GPA",
                    data: absenceDeciles.map((d) => d.avgGpa),
                    backgroundColor: CHART_COLORS.crimson,
                    borderColor: "#9F1239",
                    borderWidth: 1,
                    borderRadius: 6,
                  },
                ]}
                xMax={4.2}
                xLabel="Average GPA"
                yLabel="Absence Deciles"
                height={320}
              />
            </ChartCard>
          </div>

          <div className="chart-grid cols-2">
            {/* Chart 8: Kelly Green vs Slate */}
            <ChartCard
              title="Tutoring Program Intervention Lift"
              caption="Statistically verified performance advantage of participating in tutoring"
              chartKey="tutoring_bar"
              data={data}
              exportData={tutoring}
              exportFilename="tutoring_lift.csv"
              onAskAgent={onAskAgent}
            >
              <BarChart
                labels={tutoring.map((t) => t.label)}
                datasets={[
                  {
                    label: "Average GPA",
                    data: tutoring.map((t) => t.value),
                    backgroundColor: tutoring.map((t) =>
                      t.label === "Tutoring" ? CHART_COLORS.green : CHART_COLORS.slate
                    ),
                    borderColor: tutoring.map((t) =>
                      t.label === "Tutoring" ? "#15803D" : "#475569"
                    ),
                    borderWidth: 1,
                    borderRadius: 6,
                  },
                ]}
                yMax={4.2}
                yLabel="Average GPA"
                height={320}
              />
            </ChartCard>

            {/* Chart 9: Polar Area with Orange, Orchid, Lime, Violet */}
            <ChartCard
              title="Extracurricular Involvement Balance (Polar Area)"
              caption="Participation density across sports, music, volunteering, and student clubs"
              chartKey="extracurricular_polar"
              data={data}
              onAskAgent={onAskAgent}
            >
              <PolarAreaChart
                labels={polarExtra.labels}
                datasets={[
                  {
                    data: polarExtra.percentages,
                    backgroundColor: [
                      "rgba(234, 88, 12, 0.78)",
                      "rgba(192, 38, 211, 0.78)",
                      "rgba(101, 163, 13, 0.78)",
                      "rgba(124, 58, 237, 0.78)",
                    ],
                    borderColor: "#FFFFFF",
                    borderWidth: 2,
                  },
                ]}
                height={320}
              />
            </ChartCard>
          </div>

          {/* Chart 10: Extracurricular Activity GPA Advantage (Pine Emerald vs Silver Slate) */}
          <ChartCard
            title="Activity Participation GPA Advantage (Grouped Comparison)"
            caption="Direct comparison of mean GPA between active participants and non-participants across domains"
            chartKey="activity_advantage_bar"
            data={data}
            exportData={activities}
            exportFilename="activity_gpa_advantage.csv"
            onAskAgent={onAskAgent}
          >
            <BarChart
              labels={activities.map((a) => a.label)}
              datasets={[
                {
                  label: "Participates",
                  data: activities.map((a) => Number(a.participates.toFixed(2))),
                  backgroundColor: "#047857", // Pine Emerald
                  borderColor: "#065F46",
                  borderWidth: 1,
                  borderRadius: 6,
                },
                {
                  label: "Does Not Participate",
                  data: activities.map((a) => Number(a.doesNot.toFixed(2))),
                  backgroundColor: "#94A3B8", // Cool Silver Slate
                  borderColor: "#64748B",
                  borderWidth: 1,
                  borderRadius: 6,
                },
              ]}
              showLegend={true}
              yMax={4.2}
              yLabel="Average GPA"
              xLabel="Domain Activity"
              height={320}
            />
          </ChartCard>
        </div>
      )}

      {/* 3. Demographics & Equity */}
      {(subCategory === "all" || subCategory === "demographic") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="section-title" style={{ margin: "10px 0 0" }}>
            Demographic Balance & Educational Equity
          </div>

          <div className="chart-grid cols-2">
            {/* Chart 11: Royal Amethyst Purple */}
            <ChartCard
              title="Parental Education vs Honor Roll Progression"
              caption="Horizontal benchmark comparing percent of students reaching GPA ≥ 3.5"
              chartKey="parental_honor_bar"
              data={data}
              exportData={parentalHonor}
              exportFilename="parental_honor_rates.csv"
              onAskAgent={onAskAgent}
            >
              <HorizontalBarChart
                labels={parentalHonor.map((p) => p.label)}
                datasets={[
                  {
                    label: "Honor Roll Rate (%)",
                    data: parentalHonor.map((p) => p.honorRate),
                    backgroundColor: CHART_COLORS.purple,
                    borderColor: "#6B21A8",
                    borderWidth: 1,
                    borderRadius: 6,
                  },
                ]}
                xMax={40}
                xLabel="Honor Roll Rate (%)"
                height={320}
              />
            </ChartCard>

            {/* Chart 12: Burnt Sienna Rust */}
            <ChartCard
              title="Average GPA by Parental Support Level"
              caption="Impact of home encouragement gradient on student GPA"
              chartKey="parental_support_line"
              data={data}
              exportData={supportGpa}
              exportFilename="parental_support_curve.csv"
              onAskAgent={onAskAgent}
            >
              <LineChart
                labels={supportGpa.map((s) => s.label)}
                datasets={[
                  {
                    label: "Average GPA",
                    data: supportGpa.map((s) => s.value),
                    borderColor: CHART_COLORS.rust,
                    backgroundColor: "rgba(194, 65, 12, 0.14)",
                    fill: true,
                    pointRadius: 6,
                    pointBackgroundColor: CHART_COLORS.rust,
                    borderWidth: 3,
                  },
                ]}
                yMax={4.2}
                yLabel="Average GPA"
                xLabel="Parental Support Level"
                height={320}
              />
            </ChartCard>
          </div>

          <div className="chart-grid cols-2">
            {/* Chart 13: Ocean Cyan */}
            <ChartCard
              title="Number of Students by Age"
              caption="Age distribution across high school cohorts (15–18 years)"
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
                    backgroundColor: CHART_COLORS.cyan,
                    borderColor: "#0E7490",
                    borderWidth: 1,
                    borderRadius: 6,
                  },
                ]}
                yLabel="Number of Students"
                xLabel="Age (years)"
                height={320}
              />
            </ChartCard>

            {/* Chart 14: 4 Ultra-Contrasting Sectors (Royal Blue, Emerald, Amber, Fuchsia) */}
            <ChartCard
              title="Ethnic Composition Diversity"
              caption="Proportional representation of student ethnic backgrounds"
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
                      "#2563EB", // Royal Blue (Caucasian)
                      "#059669", // Emerald Green (African American)
                      "#F59E0B", // Vivid Amber (Asian)
                      "#DB2777", // Deep Fuchsia Pink (Other)
                    ],
                    borderColor: "#FFFFFF",
                    borderWidth: 2,
                  },
                ]}
                height={320}
              />
            </ChartCard>
          </div>
        </div>
      )}

      {/* 4. Statistical Models & Regression */}
      {(subCategory === "all" || subCategory === "statistical") && (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="section-title" style={{ margin: "10px 0 0" }}>
            Statistical Models, Correlations & Scatter Regression
          </div>

          {/* Chart 15: Diverging Emerald-Crimson Heatmap Matrix */}
          <ChartCard
            title="Pearson Correlation Heatmap Matrix"
            caption="Pairwise linear correlation coefficients (r) demonstrating key performance drivers"
            chartKey="correlation_heatmap"
            data={data}
            onAskAgent={onAskAgent}
          >
            <CorrelationChart
              labels={corr.labels}
              matrix={corr.matrix}
              height={380}
            />
          </ChartCard>

          {/* Chart 16: High-Contrast Stratified Scatter (Cobalt Sapphire Male vs Crimson Rose Female) */}
          <ChartCard
            title={
              scatterVar === "study"
                ? "Study Time vs GPA Dispersion Regression"
                : "Absences vs GPA Degradation Regression"
            }
            caption="Student micro-data scatter plot stratified by gender"
            chartKey="scatter_plot"
            data={data}
            extra={{ relationship: scatterVar }}
            onAskAgent={onAskAgent}
          >
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 10 }}>
              <select
                value={scatterVar}
                onChange={(e) => setScatterVar(e.target.value)}
                style={{
                  padding: "5px 10px",
                  borderRadius: "var(--radius-xs)",
                  border: "1px solid var(--border)",
                  fontSize: 12,
                  fontWeight: 600,
                  background: "var(--surface)",
                  color: "var(--text-primary)",
                  cursor: "pointer",
                }}
              >
                <option value="study">Weekly Study Hours vs GPA</option>
                <option value="absences">Absence Count vs GPA</option>
              </select>
            </div>
            <ScatterChart
              datasets={[
                {
                  label: "Male",
                  data: maleScatter,
                  backgroundColor: "rgba(29, 78, 216, 0.75)", // Deep Cobalt Blue
                  borderColor: "#1E40AF",
                  borderWidth: 1,
                  pointRadius: 4,
                },
                {
                  label: "Female",
                  data: femaleScatter,
                  backgroundColor: "rgba(225, 29, 72, 0.75)", // Vivid Crimson Rose
                  borderColor: "#BE123C",
                  borderWidth: 1,
                  pointRadius: 4,
                },
              ]}
              xLabel={scatterVar === "study" ? "Weekly Study Time (hours)" : "Absences"}
              yLabel="GPA"
              height={400}
            />
          </ChartCard>
        </div>
      )}
    </div>
  );
}

function GpaHistogramLocal({ data }) {
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
          backgroundColor: CHART_COLORS.indigo, // Electric Indigo
          borderColor: "#3730A3",
          borderWidth: 1,
          borderRadius: 4,
        },
      ]}
      yLabel="Number of Students"
      xLabel="GPA Range"
      height={320}
    />
  );
}

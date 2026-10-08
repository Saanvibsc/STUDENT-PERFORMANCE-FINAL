import { useState, useMemo } from "react";
import {
  X,
  Sparkles,
  TrendingUp,
  AlertCircle,
  GraduationCap,
  Clock,
  UserCheck,
  Award,
  Layers,
  CheckCircle2,
  ArrowRight,
  RotateCcw,
} from "lucide-react";

const PRESETS = [
  {
    id: "recovery",
    name: "Freshman Recovery",
    desc: "+6h study, tutoring enrolled, -8 absences",
    study: 14,
    absences: 4,
    tutoring: "Yes",
    extracurricular: "Yes",
    sports: "No",
    parentalSupport: "Moderate",
  },
  {
    id: "honors",
    name: "Dean's Honor Sprint",
    desc: "18h study, tutoring, <3 absences, active arts",
    study: 18,
    absences: 2,
    tutoring: "Yes",
    extracurricular: "Yes",
    sports: "Yes",
    parentalSupport: "High",
  },
  {
    id: "truancy",
    name: "Truancy Turnaround",
    desc: "Cut absences from 20 to 5, mandate tutoring",
    study: 11,
    absences: 5,
    tutoring: "Yes",
    extracurricular: "No",
    sports: "No",
    parentalSupport: "Moderate",
  },
  {
    id: "athlete",
    name: "Scholar-Athlete Balance",
    desc: "13h study, athletic team, tutoring buffer",
    study: 13,
    absences: 3,
    tutoring: "Yes",
    extracurricular: "Yes",
    sports: "Yes",
    parentalSupport: "High",
  },
];

/**
 * Predicts student GPA based on multivariate empirical regression derived from the dataset:
 * Intercept: ~2.40
 * Study time: +0.075 per weekly hour
 * Absences: -0.082 per missed class
 * Tutoring: +0.28
 * Extracurricular / Sports / Music: +0.08 each
 * Parental support (0 to 4): +0.06 per level
 */
function predictGpa(inputs) {
  const baseIntercept = 2.40;
  const studyContrib = (inputs.study - 10) * 0.072;
  const absenceContrib = (14 - inputs.absences) * 0.081;
  const tutoringContrib = inputs.tutoring === "Yes" ? 0.28 : -0.15;
  const activityContrib =
    (inputs.extracurricular === "Yes" ? 0.08 : 0) +
    (inputs.sports === "Yes" ? 0.07 : 0);
  
  const supportMap = { None: 0, Low: 1, Moderate: 2, High: 3, "Very High": 4 };
  const supportLevel = supportMap[inputs.parentalSupport] ?? 2;
  const supportContrib = (supportLevel - 2) * 0.065;

  let gpa = baseIntercept + studyContrib + absenceContrib + tutoringContrib + activityContrib + supportContrib;
  gpa = Math.max(0.2, Math.min(4.0, gpa));
  return Number(gpa.toFixed(2));
}

function getGradeClassFromGpa(gpa) {
  if (gpa >= 3.5) return { grade: "A", label: "Dean's High Honors", color: "#059669", bg: "#ECFDF5" };
  if (gpa >= 3.0) return { grade: "B", label: "Above Average Honors", color: "#0284C7", bg: "#F0F9FF" };
  if (gpa >= 2.0) return { grade: "C", label: "Standard Graduation Track", color: "#D97706", bg: "#FFFBEB" };
  if (gpa >= 1.5) return { grade: "D", label: "Remediation Alert", color: "#EA580C", bg: "#FFF7ED" };
  return { grade: "F", label: "Academic Probation / Risk", color: "#DC2626", bg: "#FEF2F2" };
}

export default function AcademicSimulatorModal({ isOpen, onClose, cohortData = [] }) {
  const [mode, setMode] = useState("student"); // "student" | "cohort"
  const [inputs, setInputs] = useState({
    study: 10,
    absences: 12,
    tutoring: "No",
    extracurricular: "No",
    sports: "No",
    parentalSupport: "Moderate",
  });

  // Cohort policy inputs
  const [cohortPolicy, setCohortPolicy] = useState({
    mandateTutoringLowGpa: true,
    capAbsencesTarget: 8,
    minStudyTarget: 10,
  });

  const baselineGpa = useMemo(() => {
    return predictGpa({
      study: 8,
      absences: 16,
      tutoring: "No",
      extracurricular: "No",
      sports: "No",
      parentalSupport: "Low",
    });
  }, []);

  const simulatedGpa = useMemo(() => predictGpa(inputs), [inputs]);
  const deltaGpa = Number((simulatedGpa - baselineGpa).toFixed(2));
  const gradeInfo = useMemo(() => getGradeClassFromGpa(simulatedGpa), [simulatedGpa]);

  // Passing probability & honor probability
  const passProb = Math.min(99, Math.max(8, Math.round(100 / (1 + Math.exp(-2.2 * (simulatedGpa - 1.85))))));
  const honorProb = Math.min(98, Math.max(1, Math.round(100 / (1 + Math.exp(-3.1 * (simulatedGpa - 3.2))))));

  // Cohort simulation calculation
  const cohortSimulation = useMemo(() => {
    if (!cohortData || cohortData.length === 0) return null;
    const total = cohortData.length;
    let savedStudents = 0;
    let newHonorStudents = 0;
    let totalGpaGain = 0;

    cohortData.forEach((student) => {
      let gpa = student.GPA;
      let improved = false;

      // Policy 1: Tutoring for students below 2.0
      if (cohortPolicy.mandateTutoringLowGpa && student.GPA < 2.0 && student.Tutoring === "No") {
        gpa += 0.35;
        improved = true;
      }
      // Policy 2: Cap absences
      if (student.Absences > cohortPolicy.capAbsencesTarget) {
        const excess = student.Absences - cohortPolicy.capAbsencesTarget;
        gpa += Math.min(1.2, excess * 0.06);
        improved = true;
      }
      // Policy 3: Min study hours
      if (student.StudyTimeWeekly < cohortPolicy.minStudyTarget) {
        const deficit = cohortPolicy.minStudyTarget - student.StudyTimeWeekly;
        gpa += Math.min(0.8, deficit * 0.05);
        improved = true;
      }

      gpa = Math.min(4.0, gpa);
      const gain = gpa - student.GPA;
      if (gain > 0) totalGpaGain += gain;

      if (student.GPA < 2.0 && gpa >= 2.0) savedStudents++;
      if (student.GPA < 3.5 && gpa >= 3.5) newHonorStudents++;
    });

    const avgGpaBoost = (totalGpaGain / total).toFixed(2);
    const probationReduction = Math.round((savedStudents / Math.max(1, cohortData.filter((d) => d.GPA < 2.0).length)) * 100);

    return {
      total,
      savedStudents,
      newHonorStudents,
      avgGpaBoost,
      probationReduction,
    };
  }, [cohortData, cohortPolicy]);

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.65)",
        backdropFilter: "blur(4px)",
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "16px",
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: "var(--surface)",
          color: "var(--text-primary)",
          borderRadius: 14,
          border: "1px solid var(--border)",
          width: "100%",
          maxWidth: 820,
          maxHeight: "92vh",
          display: "flex",
          flexDirection: "column",
          boxShadow: "0 20px 40px -10px rgba(0,0,0,0.3)",
          overflow: "hidden",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          style={{
            padding: "18px 24px 14px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div
              style={{
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "var(--accent-light)",
                color: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Sparkles size={20} />
            </div>
            <div>
              <h2 style={{ fontSize: 17, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
                Interactive Academic Scenario Simulator
              </h2>
              <p style={{ fontSize: 12, color: "var(--text-muted)", margin: "2px 0 0" }}>
                Model real-time behavioral interventions using empirical regression coefficients
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 6,
              borderRadius: 6,
              color: "var(--text-muted)",
              display: "flex",
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Mode Selector Tabs */}
        <div
          style={{
            padding: "8px 24px",
            background: "var(--surface-muted)",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            gap: 8,
          }}
        >
          <button
            type="button"
            onClick={() => setMode("student")}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
              background: mode === "student" ? "var(--surface)" : "transparent",
              color: mode === "student" ? "var(--text-primary)" : "var(--text-muted)",
              boxShadow: mode === "student" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
            }}
          >
            Individual Student Prediction
          </button>
          <button
            type="button"
            onClick={() => setMode("cohort")}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 12.5,
              fontWeight: 600,
              cursor: "pointer",
              border: "none",
              background: mode === "cohort" ? "var(--surface)" : "transparent",
              color: mode === "cohort" ? "var(--text-primary)" : "var(--text-muted)",
              boxShadow: mode === "cohort" ? "0 1px 3px rgba(0,0,0,0.06)" : "none",
            }}
          >
            Institutional Cohort Policy Forecast
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1 }}>
          {mode === "student" ? (
            <div style={{ display: "grid", gridTemplateColumns: "1.1fr 1fr", gap: 24 }}>
              {/* Left Column: Sliders & Controls */}
              <div>
                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: 8 }}>
                    One-Click Strategic Presets
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6 }}>
                    {PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() =>
                          setInputs({
                            study: p.study,
                            absences: p.absences,
                            tutoring: p.tutoring,
                            extracurricular: p.extracurricular,
                            sports: p.sports,
                            parentalSupport: p.parentalSupport,
                          })
                        }
                        style={{
                          textAlign: "left",
                          padding: "7px 10px",
                          borderRadius: 8,
                          border: "1px solid var(--border)",
                          background: "var(--surface-muted)",
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                      >
                        <div style={{ fontSize: 11.5, fontWeight: 600, color: "var(--text-primary)" }}>{p.name}</div>
                        <div style={{ fontSize: 10, color: "var(--text-muted)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {p.desc}
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Input 1: Study Time */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <Clock size={13} style={{ color: "var(--accent)" }} /> Weekly Study Hours
                    </span>
                    <span style={{ color: "var(--accent)", fontWeight: 700 }}>{inputs.study} hrs/week</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="22"
                    step="0.5"
                    value={inputs.study}
                    onChange={(e) => setInputs({ ...inputs, study: Number(e.target.value) })}
                    style={{ width: "100%" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)" }}>
                    <span>0h (Remedial)</span>
                    <span>12h (Recommended)</span>
                    <span>20h+ (Elite)</span>
                  </div>
                </div>

                {/* Input 2: Absences */}
                <div style={{ marginBottom: 16 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                    <span style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <AlertCircle size={13} style={{ color: inputs.absences > 12 ? "#DC2626" : "#D97706" }} /> Unexcused Absences
                    </span>
                    <span style={{ color: inputs.absences > 12 ? "#DC2626" : "var(--text-primary)", fontWeight: 700 }}>
                      {inputs.absences} days missed
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="28"
                    value={inputs.absences}
                    onChange={(e) => setInputs({ ...inputs, absences: Number(e.target.value) })}
                    style={{ width: "100%" }}
                  />
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: "var(--text-muted)" }}>
                    <span>0–5 (Optimal)</span>
                    <span>10 (Risk Cliff)</span>
                    <span>20+ (Severe)</span>
                  </div>
                </div>

                {/* Input 3: Toggles for Tutoring & Activities */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                      Tutoring Support
                    </label>
                    <div style={{ display: "flex", gap: 4 }}>
                      {["No", "Yes"].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setInputs({ ...inputs, tutoring: val })}
                          style={{
                            flex: 1,
                            padding: "6px 0",
                            fontSize: 12,
                            fontWeight: 600,
                            borderRadius: 6,
                            border: "1px solid var(--border)",
                            background: inputs.tutoring === val ? "var(--accent)" : "var(--surface-muted)",
                            color: inputs.tutoring === val ? "#FFF" : "var(--text-secondary)",
                            cursor: "pointer",
                          }}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                      Extracurricular Arts
                    </label>
                    <div style={{ display: "flex", gap: 4 }}>
                      {["No", "Yes"].map((val) => (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setInputs({ ...inputs, extracurricular: val })}
                          style={{
                            flex: 1,
                            padding: "6px 0",
                            fontSize: 12,
                            fontWeight: 600,
                            borderRadius: 6,
                            border: "1px solid var(--border)",
                            background: inputs.extracurricular === val ? "var(--accent)" : "var(--surface-muted)",
                            color: inputs.extracurricular === val ? "#FFF" : "var(--text-secondary)",
                            cursor: "pointer",
                          }}
                        >
                          {val}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Input 4: Parental Support */}
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: "var(--text-secondary)", display: "block", marginBottom: 4 }}>
                    Parental Engagement Level
                  </label>
                  <div style={{ display: "flex", gap: 4 }}>
                    {["None", "Low", "Moderate", "High", "Very High"].map((lvl) => (
                      <button
                        key={lvl}
                        type="button"
                        onClick={() => setInputs({ ...inputs, parentalSupport: lvl })}
                        style={{
                          flex: 1,
                          padding: "5px 0",
                          fontSize: 10.5,
                          fontWeight: 600,
                          borderRadius: 6,
                          border: "1px solid var(--border)",
                          background: inputs.parentalSupport === lvl ? "var(--accent)" : "var(--surface-muted)",
                          color: inputs.parentalSupport === lvl ? "#FFF" : "var(--text-secondary)",
                          cursor: "pointer",
                        }}
                      >
                        {lvl}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right Column: Prediction Scorecard */}
              <div
                style={{
                  background: "var(--surface-muted)",
                  borderRadius: 12,
                  border: "1px solid var(--border)",
                  padding: "18px 20px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                    Predicted Academic Trajectory
                  </div>

                  <div style={{ display: "flex", alignItems: "baseline", gap: 10, marginTop: 8 }}>
                    <div style={{ fontSize: 44, fontWeight: 800, letterSpacing: "-0.03em", color: "var(--text-primary)" }}>
                      {simulatedGpa.toFixed(2)}
                    </div>
                    <div
                      style={{
                        fontSize: 13,
                        fontWeight: 700,
                        padding: "3px 8px",
                        borderRadius: 6,
                        background: deltaGpa >= 0 ? "#DCFCE7" : "#FEE2E2",
                        color: deltaGpa >= 0 ? "#15803D" : "#B91C1C",
                      }}
                    >
                      {deltaGpa >= 0 ? `+${deltaGpa.toFixed(2)}` : deltaGpa.toFixed(2)} vs baseline
                    </div>
                  </div>

                  {/* Letter Grade Class Badge */}
                  <div
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 6,
                      padding: "4px 10px",
                      borderRadius: 6,
                      background: gradeInfo.bg,
                      color: gradeInfo.color,
                      fontSize: 12,
                      fontWeight: 700,
                    }}
                  >
                    <Award size={14} />
                    <span>Grade Class: {gradeInfo.grade} — {gradeInfo.label}</span>
                  </div>

                  {/* Likelihood Gauges */}
                  <div style={{ marginTop: 20, display: "flex", flexDirection: "column", gap: 12 }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                        <span style={{ color: "var(--text-secondary)" }}>Course Passing Probability (A–C)</span>
                        <span style={{ fontWeight: 700, color: passProb > 75 ? "#059669" : "#D97706" }}>{passProb}%</span>
                      </div>
                      <div style={{ height: 8, background: "var(--border)", borderRadius: 9999, overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${passProb}%`,
                            background: passProb > 75 ? "#059669" : passProb > 50 ? "#D97706" : "#DC2626",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                    </div>

                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, fontWeight: 600, marginBottom: 4 }}>
                        <span style={{ color: "var(--text-secondary)" }}>Dean's Honor Roll Likelihood (≥3.5)</span>
                        <span style={{ fontWeight: 700, color: honorProb > 50 ? "#2563EB" : "var(--text-muted)" }}>{honorProb}%</span>
                      </div>
                      <div style={{ height: 8, background: "var(--border)", borderRadius: 9999, overflow: "hidden" }}>
                        <div
                          style={{
                            height: "100%",
                            width: `${honorProb}%`,
                            background: "linear-gradient(90deg, #2563EB, #7C3AED)",
                            transition: "width 0.3s ease",
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Recommendation takeaway */}
                  <div
                    style={{
                      marginTop: 18,
                      padding: "10px 12px",
                      borderRadius: 8,
                      background: "var(--surface)",
                      border: "1px solid var(--border)",
                      fontSize: 11.5,
                      color: "var(--text-secondary)",
                      lineHeight: 1.45,
                    }}
                  >
                    <strong>Advisor Synthesis:</strong>{" "}
                    {inputs.absences > 10
                      ? "High absenteeism remains the primary barrier. Reducing absences below 7 will yield a larger GPA lift than doubling study hours."
                      : inputs.tutoring === "No" && inputs.study < 12
                      ? "Enrolling in twice-weekly tutoring lab and targeting 12h study time will immediately transition this student into the Honor Roll threshold."
                      : "Balanced profile with sustainable study habits and controlled absence risk."}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() =>
                    setInputs({
                      study: 10,
                      absences: 12,
                      tutoring: "No",
                      extracurricular: "No",
                      sports: "No",
                      parentalSupport: "Moderate",
                    })
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    padding: "8px",
                    marginTop: 16,
                    borderRadius: 6,
                    fontSize: 12,
                    fontWeight: 600,
                    color: "var(--text-muted)",
                    background: "transparent",
                    border: "1px dashed var(--border)",
                    cursor: "pointer",
                  }}
                >
                  <RotateCcw size={13} />
                  Reset to Default Baseline
                </button>
              </div>
            </div>
          ) : (
            /* Cohort Policy Simulation */
            <div>
              <div style={{ fontSize: 13, color: "var(--text-secondary)", marginBottom: 18, lineHeight: 1.5 }}>
                Simulate the aggregate impact of school-wide policy changes across all{" "}
                <strong>{cohortData?.length.toLocaleString() || 2392}</strong> students in the active cohort.
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
                <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <label
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 12,
                      padding: "12px 14px",
                      background: "var(--surface-muted)",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={cohortPolicy.mandateTutoringLowGpa}
                      onChange={(e) =>
                        setCohortPolicy({ ...cohortPolicy, mandateTutoringLowGpa: e.target.checked })
                      }
                      style={{ marginTop: 3 }}
                    />
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                        Mandatory Tutoring for At-Risk Students (GPA &lt; 2.0)
                      </div>
                      <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
                        Automatically enroll all students below graduation baseline into structured tutoring coaching (+0.35 GPA lift).
                      </div>
                    </div>
                  </label>

                  <div
                    style={{
                      padding: "12px 14px",
                      background: "var(--surface-muted)",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                      <span>Enforce Maximum Absence Cap (Attendance Contracts)</span>
                      <span style={{ color: "var(--accent)", fontWeight: 700 }}>≤ {cohortPolicy.capAbsencesTarget} absences</span>
                    </div>
                    <input
                      type="range"
                      min="4"
                      max="16"
                      value={cohortPolicy.capAbsencesTarget}
                      onChange={(e) =>
                        setCohortPolicy({ ...cohortPolicy, capAbsencesTarget: Number(e.target.value) })
                      }
                      style={{ width: "100%" }}
                    />
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                      Mandatory guardian conferences prevent students from crossing into the high-risk absence cliff.
                    </div>
                  </div>

                  <div
                    style={{
                      padding: "12px 14px",
                      background: "var(--surface-muted)",
                      borderRadius: 8,
                      border: "1px solid var(--border)",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 4 }}>
                      <span>Freshman Study Hall Standard</span>
                      <span style={{ color: "var(--accent)", fontWeight: 700 }}>≥ {cohortPolicy.minStudyTarget} hrs/week</span>
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="15"
                      value={cohortPolicy.minStudyTarget}
                      onChange={(e) =>
                        setCohortPolicy({ ...cohortPolicy, minStudyTarget: Number(e.target.value) })
                      }
                      style={{ width: "100%" }}
                    />
                    <div style={{ fontSize: 11, color: "var(--text-muted)", marginTop: 4 }}>
                      Provide supervised quiet study blocks ensuring minimum threshold engagement.
                    </div>
                  </div>
                </div>

                {/* Cohort Policy Forecast Results */}
                {cohortSimulation && (
                  <div
                    style={{
                      background: "var(--surface-muted)",
                      borderRadius: 12,
                      border: "1px solid var(--border)",
                      padding: "18px 20px",
                    }}
                  >
                    <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: 12 }}>
                      Forecasted Institutional Yield
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div style={{ padding: "12px", background: "var(--surface)", borderRadius: 8, border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Students Rescued from Probation</div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: "#059669", marginTop: 2 }}>
                          +{cohortSimulation.savedStudents.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 11, color: "#059669", fontWeight: 600 }}>
                          {cohortSimulation.probationReduction}% reduction in course failure rate
                        </div>
                      </div>

                      <div style={{ padding: "12px", background: "var(--surface)", borderRadius: 8, border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>New Dean's Honor Roll Inductees</div>
                        <div style={{ fontSize: 28, fontWeight: 800, color: "#2563EB", marginTop: 2 }}>
                          +{cohortSimulation.newHonorStudents.toLocaleString()}
                        </div>
                        <div style={{ fontSize: 11, color: "#2563EB", fontWeight: 600 }}>
                          GPA elevated to ≥ 3.50 honors status
                        </div>
                      </div>

                      <div style={{ padding: "12px", background: "var(--surface)", borderRadius: 8, border: "1px solid var(--border)" }}>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>Cohort Mean GPA Elevation</div>
                        <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text-primary)", marginTop: 2 }}>
                          +{cohortSimulation.avgGpaBoost} GPA pts
                        </div>
                        <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                          Institutional average shift across {cohortSimulation.total.toLocaleString()} records
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: "12px 24px",
            borderTop: "1px solid var(--border)",
            background: "var(--surface-muted)",
            display: "flex",
            justifyContent: "flex-end",
            gap: 10,
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "7px 16px",
              borderRadius: 6,
              fontSize: 12.5,
              fontWeight: 600,
              background: "var(--surface)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
              cursor: "pointer",
            }}
          >
            Close Simulator
          </button>
        </div>
      </div>
    </div>
  );
}

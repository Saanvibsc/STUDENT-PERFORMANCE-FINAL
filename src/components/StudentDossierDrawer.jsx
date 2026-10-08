import { useState, useEffect } from "react";
import {
  X,
  User,
  GraduationCap,
  Calendar,
  Clock,
  AlertTriangle,
  CheckCircle,
  Award,
  Sparkles,
  BookOpen,
  HeartHandshake,
  Activity,
  FileText,
  Tag,
  Share2,
  Printer,
} from "lucide-react";

const GRADE_BADGES = {
  A: { color: "#059669", bg: "#ECFDF5", label: "Grade A — High Honors" },
  B: { color: "#0284C7", bg: "#F0F9FF", label: "Grade B — Commended" },
  C: { color: "#D97706", bg: "#FFFBEB", label: "Grade C — Standard Track" },
  D: { color: "#EA580C", bg: "#FFF7ED", label: "Grade D — Academic Warning" },
  F: { color: "#DC2626", bg: "#FEF2F2", label: "Grade F — Immediate Remediation" },
};

export default function StudentDossierDrawer({ student, cohortData = [], isOpen, onClose }) {
  const [counselorNote, setCounselorNote] = useState("");
  const [savedNotes, setSavedNotes] = useState([]);
  const [actionTag, setActionTag] = useState("Observation");

  useEffect(() => {
    if (student) {
      const key = `student_notes_${student.StudentID}`;
      try {
        const stored = localStorage.getItem(key);
        if (stored) setSavedNotes(JSON.parse(stored));
        else setSavedNotes([]);
      } catch (e) {
        setSavedNotes([]);
      }
    }
  }, [student]);

  if (!isOpen || !student) return null;

  const totalCohort = cohortData.length || 2392;
  // Calculate GPA percentile rank
  const studentsLowerGpa = cohortData.filter((d) => d.GPA < student.GPA).length;
  const percentile = Math.round((studentsLowerGpa / Math.max(1, totalCohort)) * 100);

  // Absence percentile rank (lower absences is better)
  const studentsMoreAbsences = cohortData.filter((d) => d.Absences > student.Absences).length;
  const attendancePercentile = Math.round((studentsMoreAbsences / Math.max(1, totalCohort)) * 100);

  const gradeClass = student.GradeClass || "C";
  const badgeInfo = GRADE_BADGES[gradeClass] || GRADE_BADGES.C;

  // Multi-attribute scores normalized to 100
  const studyScore = Math.min(100, Math.round((student.StudyTimeWeekly / 20) * 100));
  const attendanceScore = Math.max(0, Math.round(((30 - student.Absences) / 30) * 100));
  const supportScore = { None: 0, Low: 25, Moderate: 50, High: 75, "Very High": 100 }[student.ParentalSupport] ?? 50;

  // Active extracurricular count
  const activitiesCount =
    (student.Extracurricular === "Yes" ? 1 : 0) +
    (student.Sports === "Yes" ? 1 : 0) +
    (student.Music === "Yes" ? 1 : 0) +
    (student.Volunteering === "Yes" ? 1 : 0);

  const activityScore = Math.round((activitiesCount / 4) * 100);

  const handleAddNote = (e) => {
    e.preventDefault();
    if (!counselorNote.trim()) return;

    const newNote = {
      id: Date.now(),
      tag: actionTag,
      text: counselorNote.trim(),
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" }),
    };

    const updated = [newNote, ...savedNotes];
    setSavedNotes(updated);
    setCounselorNote("");
    try {
      localStorage.setItem(`student_notes_${student.StudentID}`, JSON.stringify(updated));
    } catch (e) {
      // ignore
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.5)",
        backdropFilter: "blur(3px)",
        zIndex: 9998,
        display: "flex",
        justifyContent: "flex-end",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 540,
          height: "100%",
          backgroundColor: "var(--surface)",
          color: "var(--text-primary)",
          borderLeft: "1px solid var(--border)",
          boxShadow: "-10px 0 30px rgba(0,0,0,0.15)",
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          animation: "slideInRight 0.25s ease-out",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drawer Header */}
        <div
          style={{
            padding: "18px 24px 14px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            background: "var(--surface)",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div
              style={{
                width: 44,
                height: 44,
                borderRadius: "50%",
                background: "var(--accent-light)",
                color: "var(--accent)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
                fontSize: 16,
                border: "2px solid var(--border)",
              }}
            >
              #{student.StudentID}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <h3 style={{ fontSize: 16, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
                  Student #{student.StudentID}
                </h3>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    padding: "2px 7px",
                    borderRadius: 4,
                    background: badgeInfo.bg,
                    color: badgeInfo.color,
                  }}
                >
                  {gradeClass} Class
                </span>
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text-muted)", marginTop: 2 }}>
                {student.Gender} · Age {student.Age} · {student.Ethnicity}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              padding: 6,
              borderRadius: 6,
              color: "var(--text-muted)",
              cursor: "pointer",
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Dossier Content */}
        <div style={{ padding: "20px 24px", overflowY: "auto", flex: 1, display: "flex", flexDirection: "column", gap: 20 }}>
          {/* Top Performance Banner */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: 12,
              padding: "16px",
              borderRadius: 12,
              background: "var(--surface-muted)",
              border: "1px solid var(--border)",
            }}
          >
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)" }}>
                Cumulative GPA
              </div>
              <div style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.02em", color: "var(--text-primary)", marginTop: 2 }}>
                {student.GPA.toFixed(2)}
              </div>
              <div style={{ fontSize: 11.5, color: "var(--text-secondary)", marginTop: 2 }}>
                Top <strong>{100 - percentile}%</strong> of institutional cohort
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", justifyContent: "center", gap: 6 }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 600 }}>
                <span style={{ color: "var(--text-muted)" }}>Cohort Percentile</span>
                <span style={{ color: "var(--accent)" }}>{percentile}th</span>
              </div>
              <div style={{ height: 6, background: "var(--border)", borderRadius: 9999, overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${percentile}%`, background: "var(--accent)" }} />
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, fontWeight: 600, marginTop: 4 }}>
                <span style={{ color: "var(--text-muted)" }}>Attendance Health</span>
                <span style={{ color: attendanceScore > 75 ? "#059669" : "#DC2626" }}>{attendanceScore}%</span>
              </div>
              <div style={{ height: 6, background: "var(--border)", borderRadius: 9999, overflow: "hidden" }}>
                <div
                  style={{
                    height: "100%",
                    width: `${attendanceScore}%`,
                    background: attendanceScore > 75 ? "#059669" : attendanceScore > 50 ? "#D97706" : "#DC2626",
                  }}
                />
              </div>
            </div>
          </div>

          {/* 4 Multi-Dimensional Attributes */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: 10 }}>
              Multi-Dimensional Profile Metrics
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={{ padding: "12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
                  <Clock size={13} style={{ color: "var(--accent)" }} /> Weekly Study Time
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginTop: 4 }}>
                  {student.StudyTimeWeekly} hrs/wk
                </div>
                <div style={{ fontSize: 10.5, color: student.StudyTimeWeekly >= 12 ? "#059669" : "#D97706", marginTop: 2 }}>
                  {student.StudyTimeWeekly >= 12 ? "Optimal self-study habit" : "Below 12h threshold"}
                </div>
              </div>

              <div style={{ padding: "12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
                  <Calendar size={13} style={{ color: student.Absences > 12 ? "#DC2626" : "#059669" }} /> Absences
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginTop: 4 }}>
                  {student.Absences} days
                </div>
                <div style={{ fontSize: 10.5, color: student.Absences > 15 ? "#DC2626" : student.Absences > 8 ? "#D97706" : "#059669", marginTop: 2 }}>
                  {student.Absences > 15 ? "Chronic truancy danger" : student.Absences > 8 ? "Moderate absence risk" : "Regular attendance"}
                </div>
              </div>

              <div style={{ padding: "12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
                  <BookOpen size={13} style={{ color: "var(--accent)" }} /> Tutoring Support
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginTop: 4 }}>
                  {student.Tutoring === "Yes" ? "Enrolled" : "No Tutoring"}
                </div>
                <div style={{ fontSize: 10.5, color: student.Tutoring === "Yes" ? "#059669" : "var(--text-muted)", marginTop: 2 }}>
                  {student.Tutoring === "Yes" ? "+0.35 GPA protection active" : "Eligible for coaching lab"}
                </div>
              </div>

              <div style={{ padding: "12px", borderRadius: 8, background: "var(--surface)", border: "1px solid var(--border)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11, color: "var(--text-muted)" }}>
                  <HeartHandshake size={13} style={{ color: "var(--accent)" }} /> Parental Support
                </div>
                <div style={{ fontSize: 17, fontWeight: 700, color: "var(--text-primary)", marginTop: 4 }}>
                  {student.ParentalSupport}
                </div>
                <div style={{ fontSize: 10.5, color: "var(--text-muted)", marginTop: 2 }}>
                  Parental Edu: {student.ParentalEducation}
                </div>
              </div>
            </div>
          </div>

          {/* Activities Badges */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: 8 }}>
              Co-Curricular Engagement ({activitiesCount}/4)
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {[
                { name: "Extracurricular Arts", active: student.Extracurricular === "Yes" },
                { name: "Athletics / Sports", active: student.Sports === "Yes" },
                { name: "Music Ensemble", active: student.Music === "Yes" },
                { name: "Community Service", active: student.Volunteering === "Yes" },
              ].map((act) => (
                <div
                  key={act.name}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 5,
                    padding: "4px 9px",
                    borderRadius: 6,
                    fontSize: 11.5,
                    fontWeight: 600,
                    background: act.active ? "var(--surface-muted)" : "transparent",
                    color: act.active ? "var(--text-primary)" : "var(--text-muted)",
                    border: `1px solid ${act.active ? "var(--border)" : "var(--border-subtle)"}`,
                    opacity: act.active ? 1 : 0.5,
                  }}
                >
                  <Activity size={12} style={{ color: act.active ? "var(--accent)" : "currentColor" }} />
                  <span>{act.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Tailored AI Counselor Action Plan */}
          <div
            style={{
              padding: "16px",
              borderRadius: 10,
              background: "var(--surface-muted)",
              border: "1px solid var(--border)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, fontWeight: 700, color: "var(--text-primary)", marginBottom: 6 }}>
              <Sparkles size={14} style={{ color: "var(--accent)" }} /> Tailored Counselor Action Plan
            </div>

            <div style={{ fontSize: 11.5, color: "var(--text-secondary)", lineHeight: 1.5 }}>
              {student.Absences > 12 ? (
                <span>
                  <strong>Priority 1: Attendance Truancy Intervention.</strong> With {student.Absences} absences, attendance is actively eroding this student's academic standing. Enact an automated attendance contract and schedule a mandatory guardian check-in.
                </span>
              ) : student.GPA < 2.5 && student.Tutoring === "No" ? (
                <span>
                  <strong>Priority 1: Structured Academic Coaching.</strong> Student is not currently utilizing tutoring. Assign to a peer-assisted study lab (PASS) for 2 hours weekly to cross above the 2.50 threshold.
                </span>
              ) : student.GPA >= 3.5 ? (
                <span>
                  <strong>Priority 1: Honors & Fellowship Acceleration.</strong> Student exhibits elite academic mastery. Nominate for Dean's Honors Society and advanced college-preparatory coursework.
                </span>
              ) : (
                <span>
                  <strong>Priority 1: Study Block Routine.</strong> Encourage establishing consistent 90-minute daily quiet study blocks to boost weekly independent hours toward the 14h target.
                </span>
              )}
            </div>
          </div>

          {/* Counselor Case Notes */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.05em", color: "var(--text-muted)", marginBottom: 8 }}>
              Counselor Case Notes & Action Logs
            </div>

            <form onSubmit={handleAddNote} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              <div style={{ display: "flex", gap: 6 }}>
                {["Observation", "Intervention", "Parent Call", "Honor List"].map((t) => (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setActionTag(t)}
                    style={{
                      padding: "4px 8px",
                      borderRadius: 4,
                      fontSize: 11,
                      fontWeight: 600,
                      border: "1px solid var(--border)",
                      background: actionTag === t ? "var(--accent)" : "var(--surface)",
                      color: actionTag === t ? "#FFF" : "var(--text-secondary)",
                      cursor: "pointer",
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>

              <div style={{ display: "flex", gap: 6 }}>
                <input
                  type="text"
                  placeholder="Add note for this student profile..."
                  value={counselorNote}
                  onChange={(e) => setCounselorNote(e.target.value)}
                  style={{
                    flex: 1,
                    padding: "7px 10px",
                    borderRadius: 6,
                    border: "1px solid var(--border)",
                    background: "var(--surface)",
                    color: "var(--text-primary)",
                    fontSize: 12,
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: "7px 14px",
                    borderRadius: 6,
                    border: "none",
                    background: "var(--accent)",
                    color: "#FFF",
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  Save Note
                </button>
              </div>
            </form>

            {/* Note History List */}
            <div style={{ display: "flex", flexDirection: "column", gap: 6, marginTop: 10 }}>
              {savedNotes.length === 0 ? (
                <div style={{ fontSize: 11, color: "var(--text-muted)", fontStyle: "italic", padding: "8px 0" }}>
                  No case notes recorded yet for this student.
                </div>
              ) : (
                savedNotes.map((note) => (
                  <div
                    key={note.id}
                    style={{
                      padding: "8px 10px",
                      borderRadius: 6,
                      background: "var(--surface-muted)",
                      border: "1px solid var(--border)",
                      fontSize: 11.5,
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10.5, color: "var(--text-muted)", marginBottom: 3 }}>
                      <span style={{ fontWeight: 700, color: "var(--accent)" }}>[{note.tag}]</span>
                      <span>{note.date}</span>
                    </div>
                    <div style={{ color: "var(--text-primary)" }}>{note.text}</div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Drawer Footer */}
        <div
          style={{
            padding: "12px 24px",
            borderTop: "1px solid var(--border)",
            background: "var(--surface-muted)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: 11, color: "var(--text-muted)" }}>
            Student #{student.StudentID} · AI Dossier
          </span>
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: "6px 14px",
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              background: "var(--surface)",
              color: "var(--text-secondary)",
              border: "1px solid var(--border)",
              cursor: "pointer",
            }}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}

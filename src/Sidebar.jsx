import { useState } from "react";
import { GRADE_ORDER, SUPPORT_ORDER, EDUCATION_ORDER } from "./dataUtils.js";
import {
  Target,
  BarChart3,
  Sparkles,
  Table,
  Filter,
  ChevronDown,
  ChevronUp,
  RotateCcw,
} from "lucide-react";
import ThemeToggle from "./components/ThemeToggle.jsx";

export default function Sidebar({
  filters,
  setFilters,
  totalCount,
  filteredCount,
  onReset,
  isOpen,
  onClose,
  activeTab,
  setActiveTab,
}) {
  const [filtersCollapsed, setFiltersCollapsed] = useState(false);

  const safeFilters = filters || {};
  const activeGradeClasses = Array.isArray(safeFilters.gradeClasses)
    ? safeFilters.gradeClasses
    : Array.isArray(safeFilters.grades)
    ? safeFilters.grades
    : GRADE_ORDER;

  const activeParentalSupports = Array.isArray(safeFilters.parentalSupports)
    ? safeFilters.parentalSupports
    : Array.isArray(safeFilters.parentalSupport)
    ? safeFilters.parentalSupport
    : SUPPORT_ORDER;

  const activeEthnicities = Array.isArray(safeFilters.ethnicities)
    ? safeFilters.ethnicities
    : ["Caucasian", "African American", "Asian", "Other"];

  const toggleArrayFilter = (key, value) => {
    setFilters((prev) => {
      const safePrev = prev || {};
      let currentArr = [];
      if (key === "gradeClasses") {
        currentArr = Array.isArray(safePrev.gradeClasses)
          ? safePrev.gradeClasses
          : Array.isArray(safePrev.grades)
          ? safePrev.grades
          : [...GRADE_ORDER];
      } else if (key === "parentalSupports") {
        currentArr = Array.isArray(safePrev.parentalSupports)
          ? safePrev.parentalSupports
          : Array.isArray(safePrev.parentalSupport)
          ? safePrev.parentalSupport
          : [...SUPPORT_ORDER];
      } else if (Array.isArray(safePrev[key])) {
        currentArr = safePrev[key];
      }

      const updated = currentArr.includes(value)
        ? currentArr.filter((v) => v !== value)
        : [...currentArr, value];

      const nextState = { ...safePrev, [key]: updated };
      if (key === "gradeClasses") {
        nextState.grades = updated;
      } else if (key === "parentalSupports") {
        nextState.parentalSupport = updated;
      }
      return nextState;
    });
  };

  const navItems = [
    {
      id: "visualizations",
      label: "Visualizations",
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
      label: "AI Studio & CSV",
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
      <div
        className={`sidebar-overlay ${isOpen ? "show" : ""}`}
        onClick={onClose}
      />
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <h1>Student Analytics</h1>
            <p>Institutional Performance Suite</p>
          </div>
        </div>

        {/* Side Navigation Tabs */}
        <div className="sidebar-nav">
          <div className="sidebar-nav-title">Navigation</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                className={`sidebar-nav-btn ${isActive ? "active" : ""}`}
                onClick={() => {
                  setActiveTab(item.id);
                  if (onClose) onClose();
                }}
              >
                <div className="sidebar-nav-left">
                  <Icon size={16} />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span className="sidebar-nav-badge">{item.badge}</span>
                )}
              </button>
            );
          })}
        </div>

        {/* Cohort Filters Section Header with Collapse Toggle */}
        <div
          style={{
            padding: "12px 18px",
            borderBottom: "1px solid var(--border)",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Filter size={13} style={{ color: "var(--text-muted)" }} />
            <span
              style={{
                fontSize: 11,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 0.5,
                color: "var(--text-muted)",
              }}
            >
              Cohort Filters
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: filteredCount === totalCount ? "var(--text-muted)" : "var(--accent)",
                background: "var(--surface-muted)",
                padding: "2px 6px",
                borderRadius: 4,
                border: "1px solid var(--border)",
              }}
            >
              {filteredCount.toLocaleString()} / {totalCount.toLocaleString()}
            </span>
            <button
              type="button"
              onClick={() => setFiltersCollapsed(!filtersCollapsed)}
              style={{
                background: "none",
                border: "none",
                color: "var(--text-muted)",
                cursor: "pointer",
                padding: 2,
                display: "flex",
                alignItems: "center",
              }}
              title={filtersCollapsed ? "Expand Filters" : "Collapse Filters"}
            >
              {filtersCollapsed ? <ChevronDown size={15} /> : <ChevronUp size={15} />}
            </button>
          </div>
        </div>

        {!filtersCollapsed && (
          <>
            <div className="sidebar-section">
              <h3>Demographics</h3>

              <div className="filter-group">
                <label>Gender</label>
                <select
                  value={safeFilters.gender || "all"}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, gender: e.target.value }))
                  }
                >
                  <option value="all">All Genders</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Age Range</label>
                <div className="range-display">
                  <span>{safeFilters.ageMin ?? 15} yrs</span>
                  <span>{safeFilters.ageMax ?? 18} yrs</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="18"
                  value={safeFilters.ageMin ?? 15}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      ageMin: Math.min(
                        Number(e.target.value),
                        prev.ageMax ?? 18
                      ),
                    }))
                  }
                />
                <input
                  type="range"
                  min="15"
                  max="18"
                  value={safeFilters.ageMax ?? 18}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      ageMax: Math.max(
                        Number(e.target.value),
                        prev.ageMin ?? 15
                      ),
                    }))
                  }
                />
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Academic & Support</h3>

              <div className="filter-group">
                <label>Tutoring Support</label>
                <select
                  value={safeFilters.tutoring || "all"}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, tutoring: e.target.value }))
                  }
                >
                  <option value="all">All Students</option>
                  <option value="Yes">Tutored</option>
                  <option value="No">Not Tutored</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Grade Class</label>
                <div className="checkbox-group">
                  {GRADE_ORDER.map((g) => (
                    <span
                      key={g}
                      className={`checkbox-chip ${
                        activeGradeClasses.includes(g) ? "active" : ""
                      }`}
                      onClick={() => toggleArrayFilter("gradeClasses", g)}
                    >
                      {g}
                    </span>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label>Parental Support</label>
                <div className="checkbox-group">
                  {SUPPORT_ORDER.map((s) => (
                    <span
                      key={s}
                      className={`checkbox-chip ${
                        activeParentalSupports.includes(s) ? "active" : ""
                      }`}
                      onClick={() => toggleArrayFilter("parentalSupports", s)}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              <div className="filter-group">
                <label>Parental Education</label>
                <select
                  value={
                    typeof safeFilters.parentalEducation === "string"
                      ? safeFilters.parentalEducation
                      : "all"
                  }
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      parentalEducation: e.target.value,
                    }))
                  }
                >
                  <option value="all">All Education Levels</option>
                  {EDUCATION_ORDER.map((ed) => (
                    <option key={ed} value={ed}>
                      {ed}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="sidebar-section">
              <h3>Engagement & Thresholds</h3>

              <div className="filter-group">
                <label>Extracurricular Activities</label>
                <select
                  value={safeFilters.extracurricular || "all"}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      extracurricular: e.target.value,
                    }))
                  }
                >
                  <option value="all">All</option>
                  <option value="Yes">Participating</option>
                  <option value="No">Non-participating</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Sports</label>
                <select
                  value={safeFilters.sports || "all"}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, sports: e.target.value }))
                  }
                >
                  <option value="all">All</option>
                  <option value="Yes">Plays Sports</option>
                  <option value="No">No Sports</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Music</label>
                <select
                  value={safeFilters.music || "all"}
                  onChange={(e) =>
                    setFilters((prev) => ({ ...prev, music: e.target.value }))
                  }
                >
                  <option value="all">All</option>
                  <option value="Yes">Plays Music</option>
                  <option value="No">No Music</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Volunteering</label>
                <select
                  value={safeFilters.volunteering || "all"}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      volunteering: e.target.value,
                    }))
                  }
                >
                  <option value="all">All</option>
                  <option value="Yes">Volunteers</option>
                  <option value="No">Does Not Volunteer</option>
                </select>
              </div>

              <div className="filter-group">
                <label>Weekly Study Time (hrs)</label>
                <div className="range-display">
                  <span>{safeFilters.studyTimeMin ?? 0}h</span>
                  <span>{safeFilters.studyTimeMax ?? 20}h</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={safeFilters.studyTimeMin ?? 0}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      studyTimeMin: Math.min(
                        Number(e.target.value),
                        prev.studyTimeMax ?? 20
                      ),
                    }))
                  }
                />
                <input
                  type="range"
                  min="0"
                  max="20"
                  step="0.5"
                  value={safeFilters.studyTimeMax ?? 20}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      studyTimeMax: Math.max(
                        Number(e.target.value),
                        prev.studyTimeMin ?? 0
                      ),
                    }))
                  }
                />
              </div>

              <div className="filter-group">
                <label>Absences (days missed)</label>
                <div className="range-display">
                  <span>{safeFilters.absencesMin ?? 0}d</span>
                  <span>{safeFilters.absencesMax ?? 30}d</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={safeFilters.absencesMin ?? 0}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      absencesMin: Math.min(
                        Number(e.target.value),
                        prev.absencesMax ?? 30
                      ),
                    }))
                  }
                />
                <input
                  type="range"
                  min="0"
                  max="30"
                  value={safeFilters.absencesMax ?? 30}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      absencesMax: Math.max(
                        Number(e.target.value),
                        prev.absencesMin ?? 0
                      ),
                    }))
                  }
                />
              </div>

              <div className="filter-group">
                <label>GPA Threshold</label>
                <div className="range-display">
                  <span>{(safeFilters.gpaMin ?? 0).toFixed(1)}</span>
                  <span>{(safeFilters.gpaMax ?? 4).toFixed(1)}</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  value={safeFilters.gpaMin ?? 0}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      gpaMin: Math.min(
                        Number(e.target.value),
                        prev.gpaMax ?? 4
                      ),
                    }))
                  }
                />
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="0.1"
                  value={safeFilters.gpaMax ?? 4}
                  onChange={(e) =>
                    setFilters((prev) => ({
                      ...prev,
                      gpaMax: Math.max(
                        Number(e.target.value),
                        prev.gpaMin ?? 0
                      ),
                    }))
                  }
                />
              </div>
            </div>

            <div className="sidebar-section">
              <div className="filter-group">
                <label>Ethnicity</label>
                <div className="checkbox-group">
                  {["Caucasian", "African American", "Asian", "Other"].map((e) => (
                    <span
                      key={e}
                      className={`checkbox-chip ${
                        activeEthnicities.includes(e) ? "active" : ""
                      }`}
                      onClick={() => toggleArrayFilter("ethnicities", e)}
                    >
                      {e}
                    </span>
                  ))}
                </div>
              </div>

              <button className="reset-btn" onClick={onReset} type="button">
                <RotateCcw size={13} />
                <span>Reset All Filters</span>
              </button>
            </div>
          </>
        )}

        <div className="sidebar-footer">
          <ThemeToggle className="w-full justify-center" />
          <div style={{ textAlign: "center", marginTop: 4 }}>
            Showing {filteredCount.toLocaleString()} of{" "}
            {totalCount.toLocaleString()} students
          </div>
        </div>
      </aside>
    </>
  );
}

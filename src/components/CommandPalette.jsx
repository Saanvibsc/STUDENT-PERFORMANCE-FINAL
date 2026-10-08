import { useState, useEffect, useRef } from "react";
import {
  Search,
  Sliders,
  FileSpreadsheet,
  Download,
  Moon,
  Sun,
  GraduationCap,
  Users,
  ShieldAlert,
  BarChart3,
  Bot,
  Filter,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Award,
} from "lucide-react";

export default function CommandPalette({
  isOpen,
  onClose,
  setActiveTab,
  onOpenSimulator,
  onOpenExport,
  setFilters,
  onResetFilters,
  theme,
  setTheme,
}) {
  const [query, setQuery] = useState("");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setQuery("");
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  const items = [
    // Navigation items
    {
      category: "Navigation",
      id: "tab_vis",
      title: "Visualizations Hub (16 Analytical Charts)",
      subtitle: "Academic, Behavioral, Demographic & Equity Charts",
      icon: BarChart3,
      action: () => setActiveTab("visualizations"),
    },
    {
      category: "Navigation",
      id: "tab_kpis",
      title: "Executive KPI Suite & Dean's Scorecards",
      subtitle: "Strategic macro performance indicators and benchmarks",
      icon: GraduationCap,
      action: () => setActiveTab("kpis"),
    },
    {
      category: "Navigation",
      id: "tab_ai",
      title: "AI Natural Language Visualizer & CSV Lab",
      subtitle: "Ask analytical questions or upload custom datasets",
      icon: Bot,
      action: () => setActiveTab("ai"),
    },
    {
      category: "Navigation",
      id: "tab_explorer",
      title: "Student Micro-Data Explorer & Records",
      subtitle: "Inspect granular student dossiers and case notes",
      icon: Users,
      action: () => setActiveTab("explorer"),
    },

    // Interactive Tools
    {
      category: "Interactive Tools",
      id: "tool_sim",
      title: "Launch What-If Academic Scenario Simulator",
      subtitle: "Predict GPA yield and model institutional policy interventions",
      icon: Sparkles,
      action: () => onOpenSimulator(),
    },
    {
      category: "Interactive Tools",
      id: "tool_export",
      title: "Power BI Desktop & CSV Export Center",
      subtitle: "Generate formatted data models and DAX calculation measures",
      icon: FileSpreadsheet,
      action: () => onOpenExport(),
    },
    {
      category: "Interactive Tools",
      id: "tool_theme",
      title: theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode",
      subtitle: "Toggle high-contrast executive visual appearance",
      icon: theme === "dark" ? Sun : Moon,
      action: () => setTheme(theme === "dark" ? "light" : "dark"),
    },

    // Quick Filter Presets
    {
      category: "Quick Cohort Filters",
      id: "filt_fail",
      title: "Filter: Critical Academic Risk (Grade F)",
      subtitle: "Isolate students currently in remediation or course failure",
      icon: ShieldAlert,
      action: () => {
        setFilters((prev) => ({ ...prev, gradeClasses: ["F"] }));
        setActiveTab("visualizations");
      },
    },
    {
      category: "Quick Cohort Filters",
      id: "filt_honor",
      title: "Filter: Dean's Honor Roll (GPA ≥ 3.50)",
      subtitle: "Exemplary academic performers and scholarship candidates",
      icon: Award,
      action: () => {
        setFilters((prev) => ({ ...prev, gpaMin: 3.5, gpaMax: 4.0 }));
        setActiveTab("visualizations");
      },
    },
    {
      category: "Quick Cohort Filters",
      id: "filt_truancy",
      title: "Filter: Chronic Absenteeism (> 15 Days)",
      subtitle: "Students facing critical attendance cliff degradation",
      icon: ShieldAlert,
      action: () => {
        setFilters((prev) => ({ ...prev, absencesMin: 15, absencesMax: 30 }));
        setActiveTab("visualizations");
      },
    },
    {
      category: "Quick Cohort Filters",
      id: "filt_tutoring",
      title: "Filter: Active Tutoring Participants",
      subtitle: "Evaluate academic gains of students receiving mentorship",
      icon: Filter,
      action: () => {
        setFilters((prev) => ({ ...prev, tutoring: "Yes" }));
        setActiveTab("visualizations");
      },
    },
    {
      category: "Quick Cohort Filters",
      id: "filt_reset",
      title: "Reset All Cohort Filters to Default",
      subtitle: "Restore full 2,392 student population sample",
      icon: RotateCcw,
      action: () => onResetFilters(),
    },
  ];

  const filtered = items.filter((item) => {
    if (!query) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  });

  const handleKeyDown = (e) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (filtered[selectedIndex]) {
        filtered[selectedIndex].action();
        onClose();
      }
    } else if (e.key === "Escape") {
      e.preventDefault();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(15, 23, 42, 0.6)",
        backdropFilter: "blur(4px)",
        zIndex: 10000,
        display: "flex",
        alignItems: "flex-start",
        justifyContent: "center",
        paddingTop: "12vh",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "100%",
          maxWidth: 600,
          backgroundColor: "var(--surface)",
          color: "var(--text-primary)",
          borderRadius: 12,
          border: "1px solid var(--border)",
          boxShadow: "0 25px 50px -12px rgba(0,0,0,0.35)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "14px 18px",
            borderBottom: "1px solid var(--border)",
          }}
        >
          <Search size={18} style={{ color: "var(--text-muted)" }} />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, search charts, or jump to view (e.g. 'simulator', 'failing', 'kpi')..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            style={{
              flex: 1,
              background: "transparent",
              border: "none",
              outline: "none",
              fontSize: 14,
              color: "var(--text-primary)",
            }}
          />
          <kbd
            style={{
              fontSize: 10,
              fontWeight: 700,
              padding: "2px 6px",
              borderRadius: 4,
              background: "var(--surface-muted)",
              border: "1px solid var(--border)",
              color: "var(--text-muted)",
            }}
          >
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div style={{ maxHeight: 360, overflowY: "auto", padding: "8px" }}>
          {filtered.length === 0 ? (
            <div style={{ padding: "24px", textAlign: "center", color: "var(--text-muted)", fontSize: 13 }}>
              No commands or views matching "{query}"
            </div>
          ) : (
            filtered.map((item, idx) => {
              const ItemIcon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "9px 12px",
                    borderRadius: 8,
                    cursor: "pointer",
                    background: isSelected ? "var(--surface-muted)" : "transparent",
                    transition: "background 0.1s ease",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div
                      style={{
                        width: 30,
                        height: 30,
                        borderRadius: 6,
                        background: isSelected ? "var(--surface)" : "var(--surface-muted)",
                        border: "1px solid var(--border)",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: isSelected ? "var(--accent)" : "var(--text-muted)",
                      }}
                    >
                      <ItemIcon size={15} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text-primary)" }}>
                        {item.title}
                      </div>
                      <div style={{ fontSize: 11, color: "var(--text-muted)" }}>
                        {item.subtitle}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <ArrowRight size={14} style={{ color: "var(--accent)" }} />
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Command Palette Footer */}
        <div
          style={{
            padding: "8px 16px",
            borderTop: "1px solid var(--border)",
            background: "var(--surface-muted)",
            display: "flex",
            justifyContent: "space-between",
            fontSize: 11,
            color: "var(--text-muted)",
          }}
        >
          <div style={{ display: "flex", gap: 12 }}>
            <span>↑↓ to navigate</span>
            <span>↵ to select</span>
            <span>esc to dismiss</span>
          </div>
          <span>Quick Actions</span>
        </div>
      </div>
    </div>
  );
}

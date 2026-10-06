import { useState, useEffect, useMemo, useCallback } from "react";
import Sidebar from "./Sidebar.jsx";
import Dashboard from "./Dashboard.jsx";
import ErrorBoundary from "./ErrorBoundary.jsx";
import { fetchCsvData, filterData } from "./dataUtils.js";

const DEFAULT_FILTERS = {
  gender: "all",
  ageMin: 15,
  ageMax: 18,
  ages: [15, 16, 17, 18],
  parentalSupports: ["None", "Low", "Moderate", "High", "Very High"],
  parentalSupport: ["None", "Low", "Moderate", "High", "Very High"],
  parentalEducation: "all",
  gradeClasses: ["A", "B", "C", "D", "F"],
  grades: ["A", "B", "C", "D", "F"],
  ethnicities: ["Caucasian", "African American", "Asian", "Other"],
  tutoring: "all",
  sports: "all",
  music: "all",
  volunteering: "all",
  extracurricular: "all",
  studyTimeMin: 0,
  studyTimeMax: 20,
  absencesMin: 0,
  absencesMax: 30,
  gpaMin: 0,
  gpaMax: 4,
};

export default function App() {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("visualizations");

  useEffect(() => {
    fetchCsvData()
      .then((d) => setData(d))
      .catch((e) => setError(e.message));
  }, []);

  const filtered = useMemo(() => {
    if (!data) return [];
    return filterData(data, filters);
  }, [data, filters]);

  const handleReset = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  if (error) {
    return (
      <div className="error-screen">
        <h2>Could not load the dataset</h2>
        <p>{error}</p>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="loading-screen">
        <div className="spinner-lg" />
        <p>Loading student performance data...</p>
      </div>
    );
  }

  return (
    <div className="app-container">
      <ErrorBoundary>
        <Sidebar
          filters={filters}
          setFilters={setFilters}
          totalCount={data.length}
          filteredCount={filtered.length}
          onReset={handleReset}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </ErrorBoundary>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="mobile-header">
          <div className="menu-toggle" onClick={() => setSidebarOpen(true)}>
            <span></span>
            <span></span>
            <span></span>
          </div>
          <h2>Student Analytics</h2>
          <div style={{ width: 34 }}></div>
        </div>
        <div className="main-content">
          <div className="hero">
            <h1>Student Performance Analytics Dashboard</h1>
            <p>
              Comprehensive analytical suite featuring AI pedagogical insights, multi-dimensional student profile radar, institutional scorecards, and custom CSV/Excel visualizer.
            </p>
          </div>
          <div className="info-bar">
            <span className="dot"></span>
            Showing {filtered.length.toLocaleString()} of{" "}
            {data.length.toLocaleString()} students. All charts update in
            real-time when cohort filters change.
          </div>
          <ErrorBoundary>
            <Dashboard
              data={data}
              filtered={filtered}
              activeTab={activeTab}
              setActiveTab={setActiveTab}
            />
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
}

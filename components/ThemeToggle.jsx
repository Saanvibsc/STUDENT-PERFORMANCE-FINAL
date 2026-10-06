import { useState, useEffect } from "react";
import { Sun, Moon } from "lucide-react";

export default function ThemeToggle({ showLabel = true, className = "" }) {
  const [theme, setTheme] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("dashboard_theme");
      if (saved) return saved;
      return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  });

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("dashboard_theme", theme);
    // Dispatch custom event for Chart.js and other components to react if needed
    window.dispatchEvent(new CustomEvent("themechange", { detail: { theme } }));
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const isDark = theme === "dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`theme-toggle-btn ${className}`}
      title={isDark ? "Switch to light mode" : "Switch to dark mode"}
      aria-label="Toggle theme"
    >
      <span className="theme-toggle-icon">
        {isDark ? <Sun size={15} /> : <Moon size={15} />}
      </span>
      {showLabel && (
        <span className="theme-toggle-text">
          {isDark ? "Light Mode" : "Dark Mode"}
        </span>
      )}
    </button>
  );
}

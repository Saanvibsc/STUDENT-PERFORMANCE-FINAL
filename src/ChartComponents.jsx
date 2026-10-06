import { useEffect, useRef, useState } from "react";
import { Chart as ChartJS, registerables } from "chart.js";

ChartJS.register(...registerables);

ChartJS.defaults.font.family = "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";
ChartJS.defaults.font.size = 12;

// High-contrast, distinctive multi-hue color palette
export const CHART_COLORS = {
  blue: "#1D4ED8", // Cobalt Sapphire (Study Time Bar)
  indigo: "#4F46E5", // Electric Indigo (GPA Histogram)
  teal: "#0D9488", // Persian Mint Teal (Study Return Curve)
  cyan: "#0891B2", // Ocean Cyan (Age Distribution)
  amber: "#D97706", // Warm Marigold Amber (Absence Penalty)
  orange: "#EA580C", // Blaze Orange
  rust: "#C2410C", // Burnt Sienna Rust (Parental Support Line)
  red: "#DC2626", // Crimson (Grade F)
  crimson: "#BE123C", // Rose Vermilion (Absence Deciles)
  emerald: "#059669", // Vivid Emerald (Grade A, Activity Advantage)
  green: "#16A34A", // Kelly Forest Green (Tutored Lift)
  purple: "#7E22CE", // Royal Amethyst (Parental Education)
  violet: "#7C3AED", // Vivid Violet
  magenta: "#C026D3", // Orchid Magenta
  pink: "#DB2777", // Deep Rose Pink (Ethnicity Other)
  lime: "#65A30D", // Fresh Lime
  slate: "#64748B", // Slate
  muted: "#94A3B8",
};

// Check if dark theme is currently active
function isThemeDark() {
  if (typeof document === "undefined") return false;
  return document.documentElement.getAttribute("data-theme") === "dark";
}

// Hook to trigger re-renders on theme change
function useActiveTheme() {
  const [dark, setDark] = useState(isThemeDark);

  useEffect(() => {
    const handler = (e) => {
      setDark(e?.detail?.theme === "dark" || isThemeDark());
    };
    window.addEventListener("themechange", handler);
    return () => window.removeEventListener("themechange", handler);
  }, []);

  return dark;
}

// Generate theme-aware base options
export function getBaseOptions(isDark = false) {
  const textColor = isDark ? "#F8FAFC" : "#0F172A";
  const mutedColor = isDark ? "#94A3B8" : "#64748B";
  const gridColor = isDark ? "rgba(255, 255, 255, 0.06)" : "#F1F5F9";
  const borderColor = isDark ? "#334155" : "#E2E8F0";
  const tooltipBg = isDark ? "#1E293B" : "#0F172A";
  const tooltipBorder = isDark ? "#334155" : "#1E293B";

  return {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        labels: { font: { size: 12, weight: "500" }, color: textColor, boxWidth: 12, padding: 12 },
      },
      tooltip: {
        backgroundColor: tooltipBg,
        titleColor: "#FFFFFF",
        bodyColor: isDark ? "#E2E8F0" : "#F8FAFC",
        borderColor: tooltipBorder,
        borderWidth: 1,
        padding: 9,
        cornerRadius: 6,
        titleFont: { size: 12, weight: "600" },
        bodyFont: { size: 12 },
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: mutedColor, font: { size: 11 } },
        border: { color: borderColor },
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: mutedColor, font: { size: 11 } },
        border: { color: borderColor },
      },
    },
  };
}

export const baseOptions = getBaseOptions(false);

export function BarChart({
  labels,
  datasets,
  height = 320,
  yMax,
  yLabel,
  xLabel,
  showLegend = false,
}) {
  const ref = useRef(null);
  const chartRef = useRef(null);
  const isDark = useActiveTheme();

  useEffect(() => {
    if (!ref.current) return;
    const currentBase = getBaseOptions(isDark);
    const options = {
      ...currentBase,
      plugins: {
        ...currentBase.plugins,
        legend: { display: showLegend, ...currentBase.plugins.legend },
      },
      scales: {
        ...currentBase.scales,
        y: {
          ...currentBase.scales.y,
          max: yMax,
          title: yLabel ? { display: true, text: yLabel, color: currentBase.scales.y.ticks.color } : undefined,
        },
        x: {
          ...currentBase.scales.x,
          title: xLabel ? { display: true, text: xLabel, color: currentBase.scales.x.ticks.color } : undefined,
        },
      },
    };

    const existing = ChartJS.getChart(ref.current);
    if (existing) existing.destroy();
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
    chartRef.current = new ChartJS(ref.current, {
      type: "bar",
      data: { labels, datasets },
      options,
    });
    return () => {
      const chart = chartRef.current || (ref.current && ChartJS.getChart(ref.current));
      if (chart) {
        chart.destroy();
        chartRef.current = null;
      }
    };
  }, [labels, datasets, height, yMax, yLabel, xLabel, showLegend, isDark]);

  return (
    <div className={`chart-wrapper h-${height}`}>
      <canvas ref={ref}></canvas>
    </div>
  );
}

export function LineChart({
  labels,
  datasets,
  height = 320,
  yMax,
  yLabel,
  xLabel,
  showLegend = false,
}) {
  const ref = useRef(null);
  const chartRef = useRef(null);
  const isDark = useActiveTheme();

  useEffect(() => {
    if (!ref.current) return;
    const currentBase = getBaseOptions(isDark);
    const options = {
      ...currentBase,
      plugins: {
        ...currentBase.plugins,
        legend: { display: showLegend, ...currentBase.plugins.legend },
      },
      scales: {
        ...currentBase.scales,
        y: {
          ...currentBase.scales.y,
          max: yMax,
          title: yLabel ? { display: true, text: yLabel, color: currentBase.scales.y.ticks.color } : undefined,
        },
        x: {
          ...currentBase.scales.x,
          title: xLabel ? { display: true, text: xLabel, color: currentBase.scales.x.ticks.color } : undefined,
        },
      },
      elements: {
        line: { tension: 0.25 },
      },
    };

    const existing = ChartJS.getChart(ref.current);
    if (existing) existing.destroy();
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
    chartRef.current = new ChartJS(ref.current, {
      type: "line",
      data: { labels, datasets },
      options,
    });
    return () => {
      const chart = chartRef.current || (ref.current && ChartJS.getChart(ref.current));
      if (chart) {
        chart.destroy();
        chartRef.current = null;
      }
    };
  }, [labels, datasets, height, yMax, yLabel, xLabel, showLegend, isDark]);

  return (
    <div className={`chart-wrapper h-${height}`}>
      <canvas ref={ref}></canvas>
    </div>
  );
}

export function PieChart({
  labels,
  datasets,
  height = 320,
  doughnut = true,
}) {
  const ref = useRef(null);
  const chartRef = useRef(null);
  const isDark = useActiveTheme();

  useEffect(() => {
    if (!ref.current) return;
    const textColor = isDark ? "#F8FAFC" : "#0F172A";
    const tooltipBg = isDark ? "#1E293B" : "#0F172A";

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: "right",
          labels: { font: { size: 12, weight: "500" }, color: textColor, padding: 10 },
        },
        tooltip: {
          backgroundColor: tooltipBg,
          titleColor: "#fff",
          bodyColor: isDark ? "#E2E8F0" : "#F8FAFC",
          padding: 9,
          cornerRadius: 6,
        },
      },
      cutout: doughnut ? "55%" : 0,
    };

    const existing = ChartJS.getChart(ref.current);
    if (existing) existing.destroy();
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
    chartRef.current = new ChartJS(ref.current, {
      type: doughnut ? "doughnut" : "pie",
      data: { labels, datasets },
      options,
    });
    return () => {
      const chart = chartRef.current || (ref.current && ChartJS.getChart(ref.current));
      if (chart) {
        chart.destroy();
        chartRef.current = null;
      }
    };
  }, [labels, datasets, height, doughnut, isDark]);

  return (
    <div className={`chart-wrapper h-${height}`}>
      <canvas ref={ref}></canvas>
    </div>
  );
}

export function ScatterChart({
  datasets,
  height = 420,
  xLabel,
  yLabel,
  showLegend = true,
}) {
  const ref = useRef(null);
  const chartRef = useRef(null);
  const isDark = useActiveTheme();

  useEffect(() => {
    if (!ref.current) return;
    const currentBase = getBaseOptions(isDark);
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: showLegend,
          labels: { font: { size: 12, weight: "500" }, color: currentBase.plugins.legend.labels.color },
        },
        tooltip: {
          ...currentBase.plugins.tooltip,
          callbacks: {
            label: (ctx) => {
              const d = ctx.raw;
              return [
                `${xLabel || "X"}: ${d.x?.toFixed ? d.x.toFixed(2) : d.x}`,
                `${yLabel || "Y"}: ${d.y?.toFixed ? d.y.toFixed(2) : d.y}`,
                d.studentId ? `Student ID: ${d.studentId}` : null,
                d.age ? `Age: ${d.age}` : null,
              ].filter(Boolean);
            },
          },
        },
      },
      scales: {
        x: {
          type: "linear",
          grid: { color: currentBase.scales.y.grid.color },
          ticks: { color: currentBase.scales.x.ticks.color, font: { size: 11 } },
          border: { color: currentBase.scales.x.border.color },
          title: xLabel
            ? { display: true, text: xLabel, color: currentBase.scales.x.ticks.color }
            : undefined,
        },
        y: {
          grid: { color: currentBase.scales.y.grid.color },
          ticks: { color: currentBase.scales.y.ticks.color, font: { size: 11 } },
          border: { color: currentBase.scales.y.border.color },
          title: yLabel
            ? { display: true, text: yLabel, color: currentBase.scales.y.ticks.color }
            : undefined,
          min: 0,
          max: 4,
        },
      },
    };

    const existing = ChartJS.getChart(ref.current);
    if (existing) existing.destroy();
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
    chartRef.current = new ChartJS(ref.current, {
      type: "scatter",
      data: { datasets },
      options,
    });
    return () => {
      const chart = chartRef.current || (ref.current && ChartJS.getChart(ref.current));
      if (chart) {
        chart.destroy();
        chartRef.current = null;
      }
    };
  }, [datasets, height, xLabel, yLabel, showLegend, isDark]);

  return (
    <div className={`chart-wrapper h-${height}`}>
      <canvas ref={ref}></canvas>
    </div>
  );
}

export function CorrelationChart({ labels, matrix, height = 420 }) {
  const ref = useRef(null);
  const chartRef = useRef(null);
  const isDark = useActiveTheme();

  useEffect(() => {
    if (!ref.current) return;
    const currentBase = getBaseOptions(isDark);
    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          ...currentBase.plugins.tooltip,
          callbacks: {
            title: (items) => `${labels[items[0].dataIndex]}`,
            label: (ctx) => `${labels[ctx.datasetIndex]}: ${ctx.raw.toFixed(2)}`,
          },
        },
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: currentBase.scales.x.ticks.color, font: { size: 11 } },
        },
        y: {
          grid: { display: false },
          ticks: { color: currentBase.scales.y.ticks.color, font: { size: 11 } },
          reverse: true,
        },
      },
    };

    const colorForValue = (v) => {
      const absV = Math.min(Math.abs(v), 1);
      if (Math.abs(v) < 0.05) {
        return isDark ? "rgba(51, 65, 85, 0.6)" : "rgba(226, 232, 240, 0.8)";
      }
      if (v > 0) {
        // High-contrast Emerald positive driver
        const alpha = Math.max(0.2, absV);
        return `rgba(5, 150, 105, ${alpha.toFixed(2)})`;
      }
      // High-contrast Crimson negative driver
      const alpha = Math.max(0.2, absV);
      return `rgba(220, 38, 38, ${alpha.toFixed(2)})`;
    };

    const datasets = labels.map((_, i) => ({
      label: labels[i],
      data: labels.map((_, j) => matrix[j][i]),
      backgroundColor: labels.map((_, j) => colorForValue(matrix[j][i])),
      borderColor: isDark ? "#111827" : "#FFFFFF",
      borderWidth: 2,
      barPercentage: 1.0,
      categoryPercentage: 1.0,
    }));

    const existing = ChartJS.getChart(ref.current);
    if (existing) existing.destroy();
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
    chartRef.current = new ChartJS(ref.current, {
      type: "bar",
      data: { labels, datasets },
      options,
    });
    return () => {
      const chart = chartRef.current || (ref.current && ChartJS.getChart(ref.current));
      if (chart) {
        chart.destroy();
        chartRef.current = null;
      }
    };
  }, [labels, matrix, height, isDark]);

  return (
    <div className={`chart-wrapper h-${height}`}>
      <canvas ref={ref}></canvas>
    </div>
  );
}

export function HorizontalBarChart({
  labels,
  datasets,
  height = 340,
  xMax,
  xLabel,
  yLabel,
  showLegend = false,
}) {
  const ref = useRef(null);
  const chartRef = useRef(null);
  const isDark = useActiveTheme();

  useEffect(() => {
    if (!ref.current) return;
    const currentBase = getBaseOptions(isDark);
    const options = {
      ...currentBase,
      indexAxis: "y",
      plugins: {
        ...currentBase.plugins,
        legend: { display: showLegend, ...currentBase.plugins.legend },
      },
      scales: {
        x: {
          ...currentBase.scales.y,
          max: xMax,
          title: xLabel ? { display: true, text: xLabel, color: currentBase.scales.x.ticks.color } : undefined,
        },
        y: {
          ...currentBase.scales.x,
          title: yLabel ? { display: true, text: yLabel, color: currentBase.scales.y.ticks.color } : undefined,
        },
      },
    };

    const existing = ChartJS.getChart(ref.current);
    if (existing) existing.destroy();
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
    chartRef.current = new ChartJS(ref.current, {
      type: "bar",
      data: { labels, datasets },
      options,
    });
    return () => {
      const chart = chartRef.current || (ref.current && ChartJS.getChart(ref.current));
      if (chart) {
        chart.destroy();
        chartRef.current = null;
      }
    };
  }, [labels, datasets, height, xMax, xLabel, yLabel, showLegend, isDark]);

  return (
    <div className={`chart-wrapper h-${height}`}>
      <canvas ref={ref}></canvas>
    </div>
  );
}

export function RadarChart({
  labels,
  datasets,
  height = 360,
  showLegend = true,
}) {
  const ref = useRef(null);
  const chartRef = useRef(null);
  const isDark = useActiveTheme();

  useEffect(() => {
    if (!ref.current) return;
    const currentBase = getBaseOptions(isDark);
    const borderColor = isDark ? "#334155" : "#E2E8F0";
    const textColor = isDark ? "#CBD5E1" : "#334155";

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: showLegend, labels: { font: { size: 12, weight: "500" }, color: textColor } },
        tooltip: currentBase.plugins.tooltip,
      },
      scales: {
        r: {
          angleLines: { color: borderColor },
          grid: { color: borderColor },
          pointLabels: { font: { size: 11, weight: "600" }, color: textColor },
          ticks: { backdropColor: "transparent", color: currentBase.scales.x.ticks.color, font: { size: 10 } },
        },
      },
    };

    const existing = ChartJS.getChart(ref.current);
    if (existing) existing.destroy();
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
    chartRef.current = new ChartJS(ref.current, {
      type: "radar",
      data: { labels, datasets },
      options,
    });
    return () => {
      const chart = chartRef.current || (ref.current && ChartJS.getChart(ref.current));
      if (chart) {
        chart.destroy();
        chartRef.current = null;
      }
    };
  }, [labels, datasets, height, showLegend, isDark]);

  return (
    <div className={`chart-wrapper h-${height}`}>
      <canvas ref={ref}></canvas>
    </div>
  );
}

export function PolarAreaChart({
  labels,
  datasets,
  height = 360,
  showLegend = true,
}) {
  const ref = useRef(null);
  const chartRef = useRef(null);
  const isDark = useActiveTheme();

  useEffect(() => {
    if (!ref.current) return;
    const currentBase = getBaseOptions(isDark);
    const borderColor = isDark ? "#334155" : "#E2E8F0";
    const textColor = isDark ? "#CBD5E1" : "#334155";

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { position: "right", labels: { font: { size: 12, weight: "500" }, color: textColor } },
        tooltip: currentBase.plugins.tooltip,
      },
      scales: {
        r: {
          grid: { color: borderColor },
          ticks: { backdropColor: "transparent", color: currentBase.scales.x.ticks.color },
        },
      },
    };

    const existing = ChartJS.getChart(ref.current);
    if (existing) existing.destroy();
    if (chartRef.current) {
      chartRef.current.destroy();
      chartRef.current = null;
    }
    chartRef.current = new ChartJS(ref.current, {
      type: "polarArea",
      data: { labels, datasets },
      options,
    });
    return () => {
      const chart = chartRef.current || (ref.current && ChartJS.getChart(ref.current));
      if (chart) {
        chart.destroy();
        chartRef.current = null;
      }
    };
  }, [labels, datasets, height, showLegend, isDark]);

  return (
    <div className={`chart-wrapper h-${height}`}>
      <canvas ref={ref}></canvas>
    </div>
  );
}

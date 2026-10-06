import Papa from "papaparse";
import { queryDatasetAi, profileDataset, computeNumericStats } from "./analyticsEngine.js";

const PARENTAL_EDUCATION_MAP = {
  0: "None",
  1: "High School",
  2: "Some College",
  3: "Bachelor's",
  4: "Higher Education",
};

const PARENTAL_SUPPORT_MAP = {
  0: "None",
  1: "Low",
  2: "Moderate",
  3: "High",
  4: "Very High",
};

const GRADE_MAP = {
  0: "A",
  1: "B",
  2: "C",
  3: "D",
  4: "F",
};

const ETHNICITY_MAP = {
  0: "Caucasian",
  1: "African American",
  2: "Asian",
  3: "Other",
};

const SUPPORT_ORDER = ["None", "Low", "Moderate", "High", "Very High"];
const EDUCATION_ORDER = [
  "None",
  "High School",
  "Some College",
  "Bachelor's",
  "Higher Education",
];
const GRADE_ORDER = ["A", "B", "C", "D", "F"];

export function transformRow(row) {
  return {
    StudentID: row.StudentID,
    Age: Number(row.Age),
    Gender: Number(row.Gender) === 1 ? "Female" : "Male",
    Ethnicity: ETHNICITY_MAP[Number(row.Ethnicity)] || "Other",
    ParentalEducation:
      PARENTAL_EDUCATION_MAP[Number(row.ParentalEducation)] || "None",
    StudyTimeWeekly: Number(row.StudyTimeWeekly),
    Absences: Number(row.Absences),
    Tutoring: Number(row.Tutoring) === 1 ? "Yes" : "No",
    ParentalSupport:
      PARENTAL_SUPPORT_MAP[Number(row.ParentalSupport)] || "None",
    Extracurricular: Number(row.Extracurricular) === 1 ? "Yes" : "No",
    Sports: Number(row.Sports) === 1 ? "Yes" : "No",
    Music: Number(row.Music) === 1 ? "Yes" : "No",
    Volunteering: Number(row.Volunteering) === 1 ? "Yes" : "No",
    GPA: Number(row.GPA),
    GradeClass: GRADE_MAP[Number(row.GradeClass)] || "F",
  };
}

export function loadData(csvText) {
  const parsed = Papa.parse(csvText, { header: true, skipEmptyLines: true });
  return parsed.data.map(transformRow);
}

export async function fetchCsvData() {
  const response = await fetch("/data/Student_performance_data.csv");
  if (!response.ok) {
    throw new Error(`Failed to load data: ${response.status}`);
  }
  const text = await response.text();
  return loadData(text);
}

export function filterData(data, filters) {
  if (!data || !Array.isArray(data)) return [];
  if (!filters) return data;

  const selectedGrades = Array.isArray(filters.gradeClasses)
    ? filters.gradeClasses
    : Array.isArray(filters.grades)
    ? filters.grades
    : GRADE_ORDER;

  const selectedParentalSupports = Array.isArray(filters.parentalSupports)
    ? filters.parentalSupports
    : Array.isArray(filters.parentalSupport)
    ? filters.parentalSupport
    : SUPPORT_ORDER;

  const selectedEthnicities = Array.isArray(filters.ethnicities)
    ? filters.ethnicities
    : ["Caucasian", "African American", "Asian", "Other"];

  const minAge = filters.ageMin !== undefined ? Number(filters.ageMin) : 15;
  const maxAge = filters.ageMax !== undefined ? Number(filters.ageMax) : 18;

  return data.filter((row) => {
    // Gender
    if (filters.gender && filters.gender.toLowerCase() !== "all" && row.Gender !== filters.gender) {
      return false;
    }
    // Age
    if (row.Age < minAge || row.Age > maxAge) {
      return false;
    }
    if (Array.isArray(filters.ages) && !filters.ages.includes(row.Age)) {
      return false;
    }
    // Parental Support
    if (!selectedParentalSupports.includes(row.ParentalSupport)) {
      return false;
    }
    // Parental Education
    if (Array.isArray(filters.parentalEducation)) {
      if (!filters.parentalEducation.includes(row.ParentalEducation)) return false;
    } else if (
      filters.parentalEducation &&
      filters.parentalEducation.toLowerCase() !== "all" &&
      row.ParentalEducation !== filters.parentalEducation
    ) {
      return false;
    }
    // Grade classes
    if (!selectedGrades.includes(row.GradeClass)) {
      return false;
    }
    // Ethnicity
    if (!selectedEthnicities.includes(row.Ethnicity)) {
      return false;
    }
    // Tutoring
    if (filters.tutoring && filters.tutoring.toLowerCase() !== "all" && row.Tutoring !== filters.tutoring) {
      return false;
    }
    // Sports
    if (filters.sports && filters.sports.toLowerCase() !== "all" && row.Sports !== filters.sports) {
      return false;
    }
    // Music
    if (filters.music && filters.music.toLowerCase() !== "all" && row.Music !== filters.music) {
      return false;
    }
    // Volunteering
    if (filters.volunteering && filters.volunteering.toLowerCase() !== "all" && row.Volunteering !== filters.volunteering) {
      return false;
    }
    // Extracurricular
    if (filters.extracurricular && filters.extracurricular.toLowerCase() !== "all" && row.Extracurricular !== filters.extracurricular) {
      return false;
    }
    // Study Time
    if (filters.studyTimeMin !== undefined && row.StudyTimeWeekly < filters.studyTimeMin) return false;
    if (filters.studyTimeMax !== undefined && row.StudyTimeWeekly > filters.studyTimeMax) return false;
    // Absences
    if (filters.absencesMin !== undefined && row.Absences < filters.absencesMin) return false;
    if (filters.absencesMax !== undefined && row.Absences > filters.absencesMax) return false;
    // GPA
    if (filters.gpaMin !== undefined && row.GPA < filters.gpaMin) return false;
    if (filters.gpaMax !== undefined && row.GPA > filters.gpaMax) return false;

    return true;
  });
}

export function computeKpis(data) {
  if (data.length === 0) {
    return {
      count: 0,
      avgGpa: 0,
      medianGpa: 0,
      avgStudy: 0,
      acRate: 0,
      atRiskCount: 0,
      atRiskRate: 0,
      honorRollCount: 0,
      honorRollRate: 0,
      avgAbsences: 0,
      chronicAbsenceCount: 0,
      chronicAbsenceRate: 0,
      tutoringCount: 0,
      tutoringRate: 0,
      extracurricularRate: 0,
      highSupportRate: 0,
    };
  }
  const sortedGpa = [...data].map((d) => d.GPA).sort((a, b) => a - b);
  const mid = Math.floor(sortedGpa.length / 2);
  const median =
    sortedGpa.length % 2 === 0
      ? (sortedGpa[mid - 1] + sortedGpa[mid]) / 2
      : sortedGpa[mid];

  const acCount = data.filter((d) =>
    ["A", "B", "C"].includes(d.GradeClass)
  ).length;

  const atRiskCount = data.filter(
    (d) => d.GPA < 2.0 || ["D", "F"].includes(d.GradeClass)
  ).length;

  const honorRollCount = data.filter((d) => d.GPA >= 3.5).length;

  const chronicAbsenceCount = data.filter((d) => d.Absences > 15).length;

  const tutoringCount = data.filter((d) => d.Tutoring === "Yes").length;

  const extracurricularCount = data.filter(
    (d) =>
      d.Extracurricular === "Yes" ||
      d.Sports === "Yes" ||
      d.Music === "Yes" ||
      d.Volunteering === "Yes"
  ).length;

  const highSupportCount = data.filter((d) =>
    ["High", "Very High"].includes(d.ParentalSupport)
  ).length;

  return {
    count: data.length,
    avgGpa: data.reduce((s, d) => s + d.GPA, 0) / data.length,
    medianGpa: median,
    avgStudy: data.reduce((s, d) => s + d.StudyTimeWeekly, 0) / data.length,
    acRate: (acCount / data.length) * 100,
    atRiskCount,
    atRiskRate: (atRiskCount / data.length) * 100,
    honorRollCount,
    honorRollRate: (honorRollCount / data.length) * 100,
    avgAbsences: data.reduce((s, d) => s + d.Absences, 0) / data.length,
    chronicAbsenceCount,
    chronicAbsenceRate: (chronicAbsenceCount / data.length) * 100,
    tutoringCount,
    tutoringRate: (tutoringCount / data.length) * 100,
    extracurricularRate: (extracurricularCount / data.length) * 100,
    highSupportRate: (highSupportCount / data.length) * 100,
  };
}

function groupAverage(data, keyFn, valueKey) {
  const groups = {};
  for (const row of data) {
    const key = keyFn(row);
    if (!groups[key]) groups[key] = { sum: 0, count: 0 };
    groups[key].sum += row[valueKey];
    groups[key].count += 1;
  }
  return Object.entries(groups)
    .map(([key, { sum, count }]) => ({
      label: key,
      value: count > 0 ? sum / count : 0,
      count,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function gpaByGrade(data) {
  const order = GRADE_ORDER;
  const result = order.map((grade) => {
    const subset = data.filter((d) => d.GradeClass === grade);
    return {
      label: grade,
      count: subset.length,
      value:
        subset.length > 0
          ? subset.reduce((s, d) => s + d.GPA, 0) / subset.length
          : 0,
    };
  });
  return result;
}

export function gradeDistribution(data) {
  return GRADE_ORDER.map((grade) => ({
    label: grade,
    count: data.filter((d) => d.GradeClass === grade).length,
  }));
}

export function genderDistribution(data) {
  const males = data.filter((d) => d.Gender === "Male").length;
  const females = data.filter((d) => d.Gender === "Female").length;
  return [
    { label: "Male", count: males },
    { label: "Female", count: females },
  ];
}

export function gpaByStudyBand(data) {
  const bands = [
    { label: "0–5 hrs", min: 0, max: 5 },
    { label: "6–10 hrs", min: 5.01, max: 10 },
    { label: "11–15 hrs", min: 10.01, max: 15 },
    { label: "16+ hrs", min: 15.01, max: 100 },
  ];
  return bands.map((band) => {
    const subset = data.filter(
      (d) => d.StudyTimeWeekly >= band.min && d.StudyTimeWeekly <= band.max
    );
    return {
      label: band.label,
      value:
        subset.length > 0
          ? subset.reduce((s, d) => s + d.GPA, 0) / subset.length
          : 0,
      count: subset.length,
    };
  });
}

export function gpaByAbsenceBand(data) {
  const bands = [
    { label: "0–5", min: 0, max: 5 },
    { label: "6–10", min: 6, max: 10 },
    { label: "11–15", min: 11, max: 15 },
    { label: "16–20", min: 16, max: 20 },
    { label: "21+", min: 21, max: 100 },
  ];
  return bands.map((band) => {
    const subset = data.filter(
      (d) => d.Absences >= band.min && d.Absences <= band.max
    );
    return {
      label: band.label,
      value:
        subset.length > 0
          ? subset.reduce((s, d) => s + d.GPA, 0) / subset.length
          : 0,
      count: subset.length,
    };
  });
}

export function gpaByParentalSupport(data) {
  return SUPPORT_ORDER.map((level) => {
    const subset = data.filter((d) => d.ParentalSupport === level);
    return {
      label: level,
      value:
        subset.length > 0
          ? subset.reduce((s, d) => s + d.GPA, 0) / subset.length
          : 0,
      count: subset.length,
    };
  });
}

export function gpaByParentalEducation(data) {
  return EDUCATION_ORDER.map((level) => {
    const subset = data.filter((d) => d.ParentalEducation === level);
    return {
      label: level,
      value:
        subset.length > 0
          ? subset.reduce((s, d) => s + d.GPA, 0) / subset.length
          : 0,
      count: subset.length,
    };
  });
}

export function gpaByTutoring(data) {
  return ["Yes", "No"].map((status) => {
    const subset = data.filter((d) => d.Tutoring === status);
    return {
      label: status === "Yes" ? "Tutoring" : "No Tutoring",
      value:
        subset.length > 0
          ? subset.reduce((s, d) => s + d.GPA, 0) / subset.length
          : 0,
      count: subset.length,
    };
  });
}

export function activityGpaComparison(data) {
  const activities = ["Sports", "Music", "Extracurricular", "Volunteering"];
  return activities.map((activity) => {
    const yes = data.filter((d) => d[activity] === "Yes");
    const no = data.filter((d) => d[activity] === "No");
    return {
      label: activity,
      participates:
        yes.length > 0 ? yes.reduce((s, d) => s + d.GPA, 0) / yes.length : 0,
      doesNot:
        no.length > 0 ? no.reduce((s, d) => s + d.GPA, 0) / no.length : 0,
      yesCount: yes.length,
      noCount: no.length,
    };
  });
}

export function ageDistribution(data) {
  const ages = [...new Set(data.map((d) => d.Age))].sort((a, b) => a - b);
  return ages.map((age) => ({
    label: String(age),
    count: data.filter((d) => d.Age === age).length,
  }));
}

export function ethnicityDistribution(data) {
  const groups = {};
  for (const row of data) {
    groups[row.Ethnicity] = (groups[row.Ethnicity] || 0) + 1;
  }
  return Object.entries(groups).map(([label, count]) => ({ label, count }));
}

export function gradeByGender(data) {
  const result = [];
  for (const gender of ["Male", "Female"]) {
    for (const grade of GRADE_ORDER) {
      const count = data.filter(
        (d) => d.Gender === gender && d.GradeClass === grade
      ).length;
      result.push({ gender, grade, count });
    }
  }
  return result;
}

export function correlationMatrix(data) {
  const vars = ["Age", "StudyTimeWeekly", "Absences", "GPA"];
  const n = data.length;
  if (n === 0) return { labels: vars, matrix: vars.map(() => vars.map(() => 0)) };

  const means = {};
  for (const v of vars) {
    means[v] = data.reduce((s, d) => s + d[v], 0) / n;
  }

  const matrix = vars.map((v1) =>
    vars.map((v2) => {
      let cov = 0;
      let var1 = 0;
      let var2 = 0;
      for (const row of data) {
        const d1 = row[v1] - means[v1];
        const d2 = row[v2] - means[v2];
        cov += d1 * d2;
        var1 += d1 * d1;
        var2 += d2 * d2;
      }
      const denom = Math.sqrt(var1 * var2);
      return denom === 0 ? 0 : cov / denom;
    })
  );

  return { labels: vars, matrix };
}

export function scatterData(data, xKey, yKey) {
  return data.map((d) => ({
    x: d[xKey],
    y: d[yKey],
    gender: d.Gender,
    studentId: d.StudentID,
    age: d.Age,
    studyTime: d.StudyTimeWeekly,
    absences: d.Absences,
    gpa: d.GPA,
  }));
}

export function buildSummary(data) {
  if (data.length === 0) return "No students match the current filters.";
  const kpis = computeKpis(data);
  const gradeDist = gradeDistribution(data);
  const supportGpa = gpaByParentalSupport(data);
  const studyBands = gpaByStudyBand(data);
  const absenceBands = gpaByAbsenceBand(data);
  const tutoring = gpaByTutoring(data);
  const corr = correlationMatrix(data);

  const lines = [];
  lines.push(`DATASET SUMMARY (${kpis.count} students)`);
  lines.push(`- Average GPA: ${kpis.avgGpa.toFixed(2)}`);
  lines.push(`- Median GPA: ${kpis.medianGpa.toFixed(2)}`);
  lines.push(`- Average weekly study time: ${kpis.avgStudy.toFixed(2)} hours`);
  lines.push(`- A–C rate: ${kpis.acRate.toFixed(1)}%`);
  lines.push("");
  lines.push("GRADE DISTRIBUTION:");
  for (const g of gradeDist) {
    lines.push(`  Grade ${g.label}: ${g.count} students`);
  }
  lines.push("");
  lines.push("AVERAGE GPA BY PARENTAL SUPPORT:");
  for (const s of supportGpa) {
    lines.push(`  ${s.label}: ${s.value.toFixed(2)} (${s.count} students)`);
  }
  lines.push("");
  lines.push("AVERAGE GPA BY STUDY TIME BAND:");
  for (const b of studyBands) {
    lines.push(`  ${b.label}: ${b.value.toFixed(2)} (${b.count} students)`);
  }
  lines.push("");
  lines.push("AVERAGE GPA BY ABSENCE BAND:");
  for (const b of absenceBands) {
    lines.push(`  ${b.label}: ${b.value.toFixed(2)} (${b.count} students)`);
  }
  lines.push("");
  lines.push("TUTORING:");
  for (const t of tutoring) {
    lines.push(`  ${t.label}: ${t.value.toFixed(2)} (${t.count} students)`);
  }
  lines.push("");
  lines.push("CORRELATIONS WITH GPA:");
  lines.push(`  Study Time: ${corr.matrix[1][3].toFixed(2)}`);
  lines.push(`  Absences: ${corr.matrix[2][3].toFixed(2)}`);
  lines.push(`  Age: ${corr.matrix[0][3].toFixed(2)}`);

  return lines.join("\n");
}

export function downloadCsv(data, filename) {
  if (!data || data.length === 0) return;
  const keys = Object.keys(data[0]);
  const csvLines = [keys.join(",")];
  for (const row of data) {
    csvLines.push(
      keys
        .map((k) => {
          const val = row[k];
          if (typeof val === "string" && val.includes(",")) {
            return `"${val}"`;
          }
          return val !== undefined && val !== null ? val : "";
        })
        .join(",")
    );
  }
  const blob = new Blob([csvLines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadPowerBiCsv(data, filename = "PowerBI_Student_Performance_Model.csv") {
  if (!data || data.length === 0) return;

  const enrichedData = data.map((row) => {
    const actCount =
      (row.Extracurricular === "Yes" ? 1 : 0) +
      (row.Sports === "Yes" ? 1 : 0) +
      (row.Music === "Yes" ? 1 : 0) +
      (row.Volunteering === "Yes" ? 1 : 0);

    const riskCategory =
      row.GPA < 2.0 || ["D", "F"].includes(row.GradeClass)
        ? "At-Risk"
        : row.GPA >= 3.5
        ? "Honor Roll"
        : "Good Standing";

    const attendanceTier =
      row.Absences > 15
        ? "Chronic Absenteeism (>15 days)"
        : row.Absences > 8
        ? "Moderate Risk (9-15 days)"
        : "Regular Attendance (0-8 days)";

    const studyTier =
      row.StudyTimeWeekly >= 15
        ? "High (15+ hrs/wk)"
        : row.StudyTimeWeekly >= 10
        ? "Moderate (10-14 hrs/wk)"
        : row.StudyTimeWeekly >= 5
        ? "Developing (5-9 hrs/wk)"
        : "Minimal (<5 hrs/wk)";

    const interventionPriority =
      row.Absences > 15 && row.GPA < 2.0
        ? "Urgent: Academic & Attendance"
        : row.GPA < 2.0
        ? "Academic Remediation Required"
        : row.Absences > 15
        ? "Attendance Counseling Required"
        : "On Track";

    return {
      "Student ID": row.StudentID,
      "Age": row.Age,
      "Gender": row.Gender,
      "Ethnicity": row.Ethnicity,
      "Parental Education": row.ParentalEducation,
      "Weekly Study Hours": row.StudyTimeWeekly,
      "Study Habit Tier": studyTier,
      "Absences Count": row.Absences,
      "Attendance Status": attendanceTier,
      "Tutoring Status": row.Tutoring,
      "Parental Support Level": row.ParentalSupport,
      "Extracurricular": row.Extracurricular,
      "Sports": row.Sports,
      "Music": row.Music,
      "Volunteering": row.Volunteering,
      "Active Activities Count": actCount,
      "Grade Point Average": row.GPA.toFixed(2),
      "Letter Grade": row.GradeClass,
      "Academic Standing": riskCategory,
      "Intervention Priority": interventionPriority,
      "Pass Flag": ["A", "B", "C"].includes(row.GradeClass) ? 1 : 0,
      "At Risk Flag": row.GPA < 2.0 ? 1 : 0,
      "Chronic Absence Flag": row.Absences > 15 ? 1 : 0,
    };
  });

  downloadCsv(enrichedData, filename);
}

export function downloadPowerBiDax(filename = "Student_Performance_Measures.dax") {
  const daxContent = `// ========================================================
// POWER BI DAX MEASURES: STUDENT PERFORMANCE ANALYTICS
// Designed for Table: 'Student_Performance'
// Paste these directly into Power BI Desktop Model -> New Measure
// ========================================================

// 1. VOLUME & COHORT METRICS
[Total Students] = COUNTROWS('Student_Performance')

[Passing Students (A-C)] = 
CALCULATE(
    COUNTROWS('Student_Performance'),
    'Student_Performance'[Letter Grade] IN {"A", "B", "C"}
)

[Pass Rate %] = 
DIVIDE([Passing Students (A-C)], [Total Students], 0)

// 2. ACADEMIC GRADE METRICS
[Average GPA] = 
AVERAGE('Student_Performance'[Grade Point Average])

[Median GPA] = 
MEDIAN('Student_Performance'[Grade Point Average])

[Honor Roll Students] = 
CALCULATE(
    COUNTROWS('Student_Performance'),
    'Student_Performance'[Academic Standing] = "Honor Roll"
)

[Honor Roll Rate %] = 
DIVIDE([Honor Roll Students], [Total Students], 0)

// 3. AT-RISK & EARLY WARNING METRICS
[At Risk Students] = 
CALCULATE(
    COUNTROWS('Student_Performance'),
    'Student_Performance'[Academic Standing] = "At-Risk"
)

[At Risk Rate %] = 
DIVIDE([At Risk Students], [Total Students], 0)

[Urgent Intervention Count] = 
CALCULATE(
    COUNTROWS('Student_Performance'),
    'Student_Performance'[Intervention Priority] = "Urgent: Academic & Attendance"
)

// 4. BEHAVIORAL & ATTENDANCE METRICS
[Average Weekly Study Hours] = 
AVERAGE('Student_Performance'[Weekly Study Hours])

[Average Absences] = 
AVERAGE('Student_Performance'[Absences Count])

[Chronic Absenteeism Count] = 
CALCULATE(
    COUNTROWS('Student_Performance'),
    'Student_Performance'[Chronic Absence Flag] = 1
)

[Chronic Absenteeism Rate %] = 
DIVIDE([Chronic Absenteeism Count], [Total Students], 0)

// 5. INTERVENTION PENETRATION METRICS
[Tutoring Participation Rate %] = 
DIVIDE(
    CALCULATE(COUNTROWS('Student_Performance'), 'Student_Performance'[Tutoring Status] = "Yes"),
    [Total Students],
    0
)

[High Parental Support Rate %] = 
DIVIDE(
    CALCULATE(
        COUNTROWS('Student_Performance'),
        'Student_Performance'[Parental Support Level] IN {"High", "Very High"}
    ),
    [Total Students],
    0
)

[Extracurricular Activity Rate %] = 
DIVIDE(
    CALCULATE(COUNTROWS('Student_Performance'), 'Student_Performance'[Active Activities Count] > 0),
    [Total Students],
    0
)
`;

  const blob = new Blob([daxContent], { type: "text/plain;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadKpiSummaryCsv(kpis, filename = "Executive_KPI_Summary.csv") {
  const summaryRows = [
    { Metric: "Total Enrolled Students", Value: kpis.count.toLocaleString(), Benchmark: "Full Cohort" },
    { Metric: "Average GPA", Value: kpis.avgGpa.toFixed(2), Benchmark: "3.00 Scale Target" },
    { Metric: "Median GPA", Value: kpis.medianGpa.toFixed(2), Benchmark: "Middle Grade" },
    { Metric: "A-C Passing Rate (%)", Value: `${kpis.acRate.toFixed(1)}%`, Benchmark: "≥ 75.0% Goal" },
    { Metric: "Honor Roll Rate (GPA ≥ 3.5)", Value: `${kpis.honorRollRate.toFixed(1)}% (${kpis.honorRollCount} students)`, Benchmark: "≥ 20.0% Goal" },
    { Metric: "At-Risk Student Count (GPA < 2.0)", Value: `${kpis.atRiskCount.toLocaleString()} (${kpis.atRiskRate.toFixed(1)}%)`, Benchmark: "Intervention Priority" },
    { Metric: "Average Weekly Study Time (Hours)", Value: `${kpis.avgStudy.toFixed(2)} hrs`, Benchmark: "10.0+ hrs Target" },
    { Metric: "Average Absences", Value: kpis.avgAbsences.toFixed(1), Benchmark: "< 5.0 Ideal" },
    { Metric: "Chronic Absenteeism (>15 Days)", Value: `${kpis.chronicAbsenceCount.toLocaleString()} (${kpis.chronicAbsenceRate.toFixed(1)}%)`, Benchmark: "< 10.0% Goal" },
    { Metric: "Tutoring Program Coverage", Value: `${kpis.tutoringRate.toFixed(1)}% (${kpis.tutoringCount} students)`, Benchmark: "Support Service Reach" },
    { Metric: "Extracurricular Participation", Value: `${kpis.extracurricularRate.toFixed(1)}%`, Benchmark: "Engagement Measure" },
    { Metric: "High/Very High Parental Support", Value: `${kpis.highSupportRate.toFixed(1)}%`, Benchmark: "Family Engagement" },
  ];

  downloadCsv(summaryRows, filename);
}

export function queryLocalAnalytics(question, data) {
  if (!data || data.length === 0) {
    return "No records are currently available in the dataset.";
  }

  const result = queryDatasetAi(question, data);
  if (typeof result === "string") return result;

  const parts = [];
  if (result.title) parts.push(`📊 ${result.title.toUpperCase()}\n`);
  if (result.summary) parts.push(`${result.summary}\n`);
  if (result.evidence && result.evidence.length > 0) {
    parts.push(`Key Evidence:\n${result.evidence.join("\n")}\n`);
  }
  if (result.methodology) parts.push(`Methodology: ${result.methodology}`);
  if (result.takeaway) parts.push(`\n💡 Strategic Takeaway: ${result.takeaway}`);

  return parts.join("\n");
}

export function radarCohortComparison(data) {
  if (!data || data.length === 0) {
    return {
      labels: ["Study Time", "Attendance", "Parental Support", "Tutoring Reach", "Extracurriculars"],
      datasets: [],
    };
  }

  const high = data.filter((d) => d.GPA >= 3.5);
  const mid = data.filter((d) => d.GPA >= 2.0 && d.GPA < 3.5);
  const risk = data.filter((d) => d.GPA < 2.0);

  const getMetrics = (subset) => {
    if (subset.length === 0) return [0, 0, 0, 0, 0];
    const n = subset.length;
    // 1. Study time normalized (0 to 20 hrs -> 0 to 100%)
    const avgStudy = subset.reduce((s, d) => s + (d.StudyTimeWeekly || 0), 0) / n;
    const studyScore = Math.min(100, Math.round((avgStudy / 20) * 100));

    // 2. Attendance regularity (0 to 30 absences -> inverted 0 to 100%)
    const avgAbs = subset.reduce((s, d) => s + (d.Absences || 0), 0) / n;
    const attendanceScore = Math.max(0, Math.round((1 - avgAbs / 30) * 100));

    // 3. Parental Support index (0=None to 4=Very High -> 0 to 100%)
    const supMap = { None: 0, Low: 1, Moderate: 2, High: 3, "Very High": 4 };
    const avgSup = subset.reduce((s, d) => s + (supMap[d.ParentalSupport] ?? 2), 0) / n;
    const supScore = Math.round((avgSup / 4) * 100);

    // 4. Tutoring penetration %
    const tutCount = subset.filter((d) => d.Tutoring === "Yes" || d.Tutoring === 1).length;
    const tutScore = Math.round((tutCount / n) * 100);

    // 5. Extracurricular participation %
    const extraCount = subset.filter((d) => d.Extracurricular === "Yes" || d.Extracurricular === 1).length;
    const extraScore = Math.round((extraCount / n) * 100);

    return [studyScore, attendanceScore, supScore, tutScore, extraScore];
  };

  return {
    labels: [
      "Weekly Study (hrs)",
      "Attendance Regularity",
      "Parental Support",
      "Tutoring Enrolled %",
      "Extracurricular %",
    ],
    datasets: [
      {
        label: `Honor Roll (GPA ≥ 3.5, n=${high.length})`,
        data: getMetrics(high),
        borderColor: "#10B981",
        backgroundColor: "rgba(16, 185, 129, 0.25)",
        pointBackgroundColor: "#10B981",
        borderWidth: 2.5,
      },
      {
        label: `Average Cohort (2.0–3.49, n=${mid.length})`,
        data: getMetrics(mid),
        borderColor: "#0284C7",
        backgroundColor: "rgba(2, 132, 199, 0.22)",
        pointBackgroundColor: "#0284C7",
        borderWidth: 2.5,
      },
      {
        label: `At-Risk Cohort (GPA < 2.0, n=${risk.length})`,
        data: getMetrics(risk),
        borderColor: "#F43F5E",
        backgroundColor: "rgba(244, 63, 94, 0.28)",
        pointBackgroundColor: "#F43F5E",
        borderWidth: 2.5,
      },
    ],
  };
}

export function parentalEducationHonorRate(data) {
  return EDUCATION_ORDER.map((edu) => {
    const subset = data.filter((d) => d.ParentalEducation === edu);
    const n = subset.length;
    if (n === 0) return { label: edu, count: 0, honorRate: 0, avgGpa: 0 };
    const honors = subset.filter((d) => d.GPA >= 3.5).length;
    const avgGpa = subset.reduce((s, d) => s + d.GPA, 0) / n;
    return {
      label: edu,
      count: n,
      honorRate: Number(((honors / n) * 100).toFixed(1)),
      avgGpa: Number(avgGpa.toFixed(2)),
    };
  });
}

export function absenceDecileRisk(data) {
  const brackets = [
    { label: "0–4 days", min: 0, max: 4 },
    { label: "5–9 days", min: 5, max: 9 },
    { label: "10–14 days", min: 10, max: 14 },
    { label: "15–19 days", min: 15, max: 19 },
    { label: "20–24 days", min: 20, max: 24 },
    { label: "25+ days", min: 25, max: 100 },
  ];

  return brackets.map((b) => {
    const subset = data.filter((d) => d.Absences >= b.min && d.Absences <= b.max);
    const n = subset.length;
    if (n === 0) return { label: b.label, count: 0, avgGpa: 0, failRate: 0 };
    const avgGpa = subset.reduce((s, d) => s + d.GPA, 0) / n;
    const fails = subset.filter((d) => d.GradeClass === "F" || d.GPA < 2.0).length;
    return {
      label: b.label,
      count: n,
      avgGpa: Number(avgGpa.toFixed(2)),
      failRate: Number(((fails / n) * 100).toFixed(1)),
    };
  });
}

export function extracurricularPolarData(data) {
  const n = data.length || 1;
  const activities = [
    { key: "Sports", label: "Athletics & Sports", color: "#EA580C" },
    { key: "Music", label: "Music & Performing Arts", color: "#C026D3" },
    { key: "Volunteering", label: "Community Volunteering", color: "#65A30D" },
    { key: "Extracurricular", label: "Academic & Club Orgs", color: "#7C3AED" },
  ];

  return {
    labels: activities.map((a) => a.label),
    counts: activities.map(
      (a) => data.filter((d) => d[a.key] === "Yes" || d[a.key] === 1).length
    ),
    percentages: activities.map((a) =>
      Number(
        (
          (data.filter((d) => d[a.key] === "Yes" || d[a.key] === 1).length / n) *
          100
        ).toFixed(1)
      )
    ),
    colors: activities.map((a) => a.color),
  };
}

export {
  SUPPORT_ORDER,
  EDUCATION_ORDER,
  GRADE_ORDER,
};

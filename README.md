# Student Performance Analytics Dashboard

## Project Description

The Student Performance Analytics Dashboard is an open-source interactive web application designed to analyze and visualize student academic performance.

The dashboard transforms raw student data into meaningful visual insights using interactive charts, KPIs, filters, student-level analysis, AI-assisted insights, and academic scenario simulation.

The project is built using React, Vite, JavaScript, Docker, and Nginx, providing a portable and reproducible environment for deployment.

## Key Features

- Interactive student performance visualizations
- Executive KPI dashboard
- Dynamic filtering and cohort-level analysis
- Academic performance analysis
- Behavioural and risk analysis
- Demographic analysis
- Student-level analysis
- AI-assisted insights
- Academic scenario simulation
- CSV and Excel data support
- Data export functionality
- Docker containerization
- Nginx production deployment

## Technologies Used

- React
- Vite
- JavaScript
- HTML
- CSS
- Docker
- Docker Compose
- Nginx
- CSV / Excel
- Git and GitHub

## Project Structure

STUDENT-PERFORMANCE-FINAL/
│
├── components/
├── data/
├── src/
├── .dockerignore
├── .env.example
├── .gitignore
├── docker-compose.yml
├── Dockerfile
├── index.html
├── package.json
├── vite.config.js
├── bun.lock
├── LICENSE
└── README.md

# Getting Started
1. Clone the Repository
git clone https://github.com/Saanvibsc/STUDENT-PERFORMANCE-FINAL.git
2. Navigate to the Project Directory
cd STUDENT-PERFORMANCE-FINAL
# Running with Docker

Docker is the recommended method for running the application because it provides a consistent environment across different systems.

Build the Docker Image
docker build -t student-performance-dashboard .
Run the Docker Container
docker run -p 8080:80 student-performance-dashboard

Open the application in your browser:

http://localhost:8080
Running with Docker Compose

The project also supports Docker Compose.

Build and Start the Application
docker compose up --build

Open the application:

http://localhost:8080
Run in the Background
docker compose up --build -d
Stop the Application
docker compose down
Rebuild the Application
docker compose up --build
Local Development

If you want to run the application without Docker, install the required dependencies:

npm install

Start the development server:

npm run dev

The application will normally be available at:

http://localhost:5173
Environment Variables

If environment variables are required, create a .env file using the provided example:

cp .env.example .env

Add the required environment variables to the .env file.

Do not commit API keys, passwords, or other sensitive information to GitHub.

# Usage
Open the dashboard in your browser.
Explore the executive KPI section.
Use the available filters to select student groups or cohorts.
Analyze academic performance using the interactive charts.
Explore behavioural and demographic patterns.
Examine student-level information.
Use AI-assisted insights to interpret important patterns.
Use the scenario simulator to explore possible academic outcomes.
Upload supported CSV or Excel datasets when required.
Export analytical results for further analysis.
Dashboard Analytics
Academic Analysis

The dashboard analyzes academic performance using variables such as GPA, study time, attendance, and other academic indicators.

Behavioural and Risk Analysis

The dashboard helps identify patterns related to attendance, absences, tutoring, study habits, and other behavioural factors.

Demographic Analysis

The dashboard provides comparisons across demographic and educational characteristics.

Statistical Analysis

Statistical and regression-oriented visualizations are provided to explore relationships between different student performance variables.

# Data Processing Workflow
RAW STUDENT DATA
       ↓
     PARSE
       ↓
     FILTER
       ↓
    ANALYSE
       ↓
   VISUALISE
       ↓
 ACTIONABLE INSIGHTS
# Applications
Teachers can monitor student academic performance.
Academic teams can compare student cohorts.
Administrators can track institutional performance indicators.
Educational institutions can identify performance and attendance patterns.
Researchers can explore relationships within educational datasets.
Students can understand factors associated with academic performance.
# Live Demo

Student Performance Dashboard:

https://student-performance-dashboard-1-cvcx.onrender.com/

# Data Privacy

This project is intended for educational and analytical purposes.

Users should avoid uploading personally identifiable or confidential student information unless appropriate privacy and security controls are in place.

Contributing

Contributions are welcome.

Create a New Branch
git checkout -b feature/your-feature
Make Changes and Commit
git add .
git commit -m "feat: add new dashboard feature"
Push the Branch
git push origin feature/your-feature

Then create a Pull Request on GitHub.

# License

This project is licensed under the MIT License.

See the LICENSE file for more information.

# Project

Student Performance Analytics Dashboard

An open-source data visualization and analytics project for exploring student performance and educational trends.
The Student Performance Analytics Dashboard is an open-source data analytics project designed to transform raw educational records into an interactive environment for exploring academic performance and student-related factors. The project focuses on factors such as GPA, weekly study time, attendance/absences, tutoring support, parental support, parental education, demographics and extracurricular participation. The current dashboard works with 2,392 student records and exposes multiple analytical views, including academic trajectories, behavioural and risk analysis, demographic/equity analysis, and statistical/regression-oriented views.

The system provides an interactive visualization hub containing 16 charts and an executive KPI suite containing 14 KPIs. It also includes a student micro-data explorer, CSV/Excel data visualization functionality, Power BI/CSV export features, an AI-oriented analytical assistant, and an academic scenario simulator. The dashboard is designed so that cohort filters can update the analytical views dynamically. The project also emphasizes reproducibility through containerization with Docker, allowing the application environment and dependencies to be packaged for consistent execution across systems.

The main outcome is a decision-support dashboard that makes educational data easier to inspect, compare and interpret. The dashboard reports an average GPA of 1.91, median GPA of 1.89, an A-C passing rate of 32.1%, and an honor-roll rate of 3.2% for the current dataset. These outputs demonstrate how an interactive open-source tool can support exploratory educational analysis rather than relying on static tables or manually interpreted raw data.

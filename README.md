# 📊 ScoreDude — Student Evaluation & Scoring

<p align="center">
  <a href="https://scoredude.vercel.app/">
    <img src="https://img.shields.io/badge/Live%20Demo-Visit%20App-000000?style=for-the-badge&logo=vercel" alt="Live Demo">
  </a>
  <img src="https://img.shields.io/badge/React-Vite-646CFF?logo=react&logoColor=white" alt="React + Vite">
  <img src="https://img.shields.io/badge/Node.js-Backend-339933?logo=nodedotjs&logoColor=white" alt="Node.js">
  <img src="https://img.shields.io/badge/SQLite-Database-003B57?logo=sqlite&logoColor=white" alt="SQLite">
</p>

> 🎯 A student/candidate evaluation platform with configurable scoring criteria, automatic grades, evaluation history, and data persistence.

## 🌟 Overview

**ScoreDude** is a web application for evaluating candidates or students across scoring categories. It calculates totals and grades, stores evaluation data, and provides tools to manage candidate records and review previous assessments.

🚀 **Live Demo:** https://scoredude.vercel.app/

## ✨ Features

- 📝 **Configurable evaluation pillars** — score categories on a 0–10 scale
- 🧮 **Automatic calculations** — weighted totals, percentages, and letter grades
- 👥 **Candidate management** — create, view, update, and delete records
- 🗂️ **Scoring category management** — maintain evaluation criteria
- 📚 **Evaluation history** — review past assessments and filter records
- 📤 **CSV export** — export evaluation data
- 🖨️ **Printable scorecards** — prepare a printable evaluation summary
- 💾 **SQLite persistence** — save data through the application's database layer
- ✨ **Animated interface** — responsive UI and interaction feedback

## 🛠️ Tech Stack

| Layer | Technologies |
| --- | --- |
| 🎨 Frontend | React, Vite, Tailwind CSS, Framer Motion, Lucide Icons |
| ⚙️ Backend | Node.js, Express.js |
| 🗃️ Data | SQLite / sqlite3 |
| 🎉 UI feedback | Canvas Confetti |

## 🚀 Run Locally

### 1️⃣ Clone the repository

```bash
git clone https://github.com/Pareshprajapati-777/Scoredude.git
cd Scoredude
```

### 2️⃣ Install dependencies

```bash
npm install
```

### 3️⃣ Start the development server

```bash
npm run dev
```

Open the local URL printed by Vite. If the project separates frontend and backend into different folders, follow the package scripts in the relevant `package.json` files and start each service as configured.

## 📂 Project Structure

The app uses a React/Vite frontend and an Express/SQLite backend. Check the repository's `package.json` files for the exact entry points and scripts.

## 🔐 Data & Deployment Notes

- 🗃️ The README describes SQLite persistence using `score.db`; local database files may not persist on some serverless deployment platforms.
- 🔒 Do not store real student or candidate personal information in a public demo without appropriate access controls.
- 🌐 Live-demo availability depends on the deployment and its configured backend.

## 🔮 Future Improvements

- 🔑 Add role-based authentication and permissions
- ☁️ Use a persistent hosted database for production deployment
- 🧪 Add frontend and backend automated tests
- 📈 Add reporting dashboards and evaluation trends
- 📄 Improve export options and report templates

## 👨‍💻 Author

**Paresh Prajapati**

🔗 [GitHub Profile](https://github.com/Pareshprajapati-777)

---

📊 **Evaluate consistently. Track progress. Make decisions with clearer scoring.**

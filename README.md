<div align="center">

#SpendWise

#Smart Expense Tracker with AI-powered insights

A full-stack web application that tracks daily expenses, understands them using machine learning, forecasts next month's spending and helps users reach their savings goals.

[Node.js](https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white)
[SQLite](https://img.shields.io/badge/Database-SQLite-003B57?logo=sqlite&logoColor=white)
[JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens&logoColor=white)
[JavaScript](https://img.shields.io/badge/Frontend-Vanilla%20JS-F7DF1E?logo=javascript&logoColor=black)
[Status](https://img.shields.io/badge/Status-Working%20Prototype-success)

</div>

## About the Project

Most students and young professionals do not know where their money goes each month. Notebooks and spreadsheets are slow to update and give no insight.

SpendWise solves this with a clean web app where users log expenses in seconds. The app then does the thinking: it automatically detects the category, predicts next month's spending, flags unusual expenses and shows beautiful charts.

> B.Tech CSE Minor Project

---

## Features

| Area | What it does |
|---|---|
| Authentication | Register and login with bcrypt-hashed passwords and JWT sessions. Every user sees only their own data. |
| AI auto-categorization | Type "Dominos pizza" and the app picks *Food*. Works across 8 categories, understands Indian brands and Hinglish, and survives typos. |
| Expense prediction | Linear regression on monthly totals forecasts next month's spending. |
| Anomaly detection | Z-score analysis flags unusually large expenses for each category. |
| Savings goals | Create goals and add savings. Animated progress rings and a celebration on completion. |
| Recurring expenses | Rent and subscriptions are added automatically every month. |
| Search, filters, export | Filter by text, category and month. Export the result to CSV. |
| Visual analytics | Category donut chart, 6-month bar chart, spending calendar heatmap and a budget ring. |
| Engagement | Logging streaks and achievement badges. |
| Modern UI | 4 colour palettes, light and dark mode, animated login page, confetti and 3D-tilt cards. |

---

## How the AI Works

All machine learning is written from scratch in `ml.js` with no external ML library, so every step can be explained.

1. Category detection (hybrid text classifier)
- A Naive Bayes classifier trained on word features and character trigrams. Trigrams let it recognise misspelt or unseen words such as `dominoz`, `swigy` or `netflx`.
- A keyword lexicon of Indian brands and everyday words boosts accurate predictions.
- The model learns from each user's own history, so it improves with use.
- The top 3 suggestions are shown with confidence scores.

2. Spending forecast
Simple linear regression on the last few months of totals predicts next month's spending and shows the trend direction.

3. Anomaly detection
For each category, the z-score of every expense is calculated. Expenses two or more standard deviations above the category average are flagged.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express |
| Database | SQLite (better-sqlite3) |
| Authentication | JWT, bcryptjs |
| Frontend | HTML5, CSS3, JavaScript (no framework) |
| Charts | Custom SVG |
| Machine Learning | Naive Bayes, Linear Regression, Z-score (from scratch) |

---

## Architecture

```
 Browser (public/index.html)
        │   REST + JSON (JWT in Authorization header)
        ▼
 Express server (server.js) ──► ml.js  (categorize, predict, anomalies, tips)
        │
        ▼
 SQLite database (db.js): users, expenses, recurring, goals
```

---

## Getting Started

### Prerequisites
- [Node.js](https://nodejs.org) (LTS version)

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/aakifhasan16/spendwise-pro.git

# 2. Go into the project folder
cd spendwise-pro

# 3. Install dependencies
npm install

# 4. Start the server
npm start
```

Open http://localhost:3000 in your browser, create an account and click Load sample data to see the charts and AI insights in action.

### Run the tests

```bash
npm test
```

This runs the API tests (authentication, expenses, goals, recurring expenses, insights) and an accuracy test of the categorizer on 106 sample phrases.

---

## REST API

| Method | Endpoint | Description |
|---|---|---|
| POST | `/api/register` | Create an account |
| POST | `/api/login` | Login and receive a JWT |
| GET | `/api/me` | Current user profile |
| PUT | `/api/budget` | Set monthly budget |
| GET / POST | `/api/expenses` | List or add expenses |
| DELETE | `/api/expenses/:id` | Delete an expense |
| GET | `/api/categorize?title=` | AI category prediction |
| GET | `/api/insights` | Forecast, anomalies and tips |
| GET / POST | `/api/goals` | List or create savings goals |
| POST | `/api/goals/:id/add` | Add savings to a goal |
| DELETE | `/api/goals/:id` | Delete a goal |
| GET / POST | `/api/recurring` | List or create recurring expenses |
| DELETE | `/api/recurring/:id` | Delete a recurring expense |

All endpoints except register and login require a valid JWT.

---

## Project Structure

```
spendwise-pro/
├── server.js      Express API and authentication
├── db.js          SQLite schema
├── ml.js          Classifier, regression and anomaly detection
├── test.js        Automated API tests
├── ml-test.js     Categorizer accuracy test
├── public/
│   └── index.html Complete frontend
├── package.json
└── README.md
```

---

## Future Scope

- Group expense splitting (Splitwise-style)
- Receipt scanning with OCR
- Cloud deployment with a hosted database
- Email and push notifications for budget alerts
- Export of monthly reports as PDF
- Mobile app version


GitHub: [@aakifhasan16](https://github.com/aakifhasan16)

---

<div align="center">

If you like this project, please give it a Star.

</div>

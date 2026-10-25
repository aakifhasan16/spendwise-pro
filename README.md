# 💸 SpendWise – Smart Expense Tracker

Full-stack web app with user login and machine-learning insights. B.Tech CSE Minor Project.

## Features
- Register / login (bcrypt password hashing + JWT authentication), per-user data in SQLite
- **AI auto-categorization (8 categories):** hybrid classifier = Naive Bayes on word + character-trigram features, boosted by a keyword lexicon. Understands Indian brands and Hinglish (zomato, kirana, bijli, irctc...), survives typos ("dominoz", "netflx"), shows top-3 suggestions with confidence and learns from the user's own history
- **Expense prediction:** linear regression on monthly totals forecasts next month
- **Anomaly detection:** z-score flags unusually large expenses per category
- **Savings goals** with animated progress rings and celebration on completion
- **Recurring expenses** (rent, subscriptions) auto-added every month
- Search, category and month filters, CSV export
- Spending calendar heatmap, donut and bar charts, budget ring, streak and achievement badges
- 4 colour palettes + light/dark mode, animated login, confetti, 3D-tilt cards

## Tech Stack
Node.js, Express, SQLite (better-sqlite3), JWT, bcryptjs, HTML/CSS/JavaScript (no framework), SVG charts.
ML is implemented from scratch in `ml.js` (no external ML library).

## Run locally
1. Install Node.js (LTS) from https://nodejs.org
2. In this folder run:
```
npm install
npm start
```
3. Open http://localhost:3000
4. Run the automated tests (API tests + 106-phrase categorizer accuracy test) with `npm test`

## REST API
| Method | Endpoint | Purpose |
|---|---|---|
| POST | /api/register, /api/login | Create account / get JWT |
| GET/POST | /api/expenses | List / add expenses |
| DELETE | /api/expenses/:id | Delete an expense |
| PUT | /api/budget | Set monthly budget |
| GET | /api/categorize?title= | AI category prediction |
| GET | /api/insights | Forecast, anomalies, tips |
| GET/POST/DELETE | /api/goals, /api/goals/:id/add | Savings goals |
| GET/POST/DELETE | /api/recurring | Recurring expenses |

## Project structure
```
server.js   Express API + auth
db.js       SQLite schema
ml.js       Hybrid classifier, regression, anomaly detection
test.js     Automated API tests
ml-test.js  Categorizer accuracy test
public/     Frontend (index.html)
```

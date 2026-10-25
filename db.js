const Database = require('better-sqlite3');
const db = new Database(process.env.DB_PATH || 'spendwise.db');
db.pragma('journal_mode = WAL');
db.exec(`
CREATE TABLE IF NOT EXISTS users(id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, email TEXT UNIQUE, hash TEXT, budget REAL DEFAULT 0);
CREATE TABLE IF NOT EXISTS expenses(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT, amount REAL, category TEXT, date TEXT, FOREIGN KEY(user_id) REFERENCES users(id));
CREATE TABLE IF NOT EXISTS recurring(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, title TEXT, amount REAL, category TEXT, day INTEGER, last_run TEXT);
CREATE TABLE IF NOT EXISTS goals(id INTEGER PRIMARY KEY AUTOINCREMENT, user_id INTEGER, name TEXT, target REAL, saved REAL DEFAULT 0, emoji TEXT);
CREATE INDEX IF NOT EXISTS ix_user_date ON expenses(user_id, date);`);
module.exports = db;

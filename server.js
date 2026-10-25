const express = require('express'), bcrypt = require('bcryptjs'), jwt = require('jsonwebtoken'), path = require('path');
const db = require('./db'), ml = require('./ml');
const SECRET = process.env.JWT_SECRET || 'dev-secret-change-me';
const CATS = ['Food', 'Travel', 'Shopping', 'Bills', 'Study', 'Health', 'Entertainment', 'Other'];
const app = express();
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const sign = id => jwt.sign({ uid: id }, SECRET, { expiresIn: '7d' });
function auth(req, res, next) {
  try { req.uid = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), SECRET).uid; next(); }
  catch (e) { res.status(401).json({ error: 'Please login again' }); }
}
const rowsOf = uid => db.prepare('SELECT id,title,amount,category,date FROM expenses WHERE user_id=? ORDER BY date DESC,id DESC').all(uid);

app.post('/api/register', (q, r) => {
  const { name, email, password } = q.body || {};
  if (!name || !email || !password || password.length < 6) return r.status(400).json({ error: 'Name, email and a password of 6+ characters are required' });
  try {
    const i = db.prepare('INSERT INTO users(name,email,hash) VALUES(?,?,?)').run(name.trim(), email.toLowerCase().trim(), bcrypt.hashSync(password, 10));
    r.json({ token: sign(i.lastInsertRowid), name: name.trim() });
  } catch (e) { r.status(409).json({ error: 'Email already registered' }); }
});
app.post('/api/login', (q, r) => {
  const { email, password } = q.body || {};
  const u = db.prepare('SELECT * FROM users WHERE email=?').get(String(email || '').toLowerCase().trim());
  if (!u || !bcrypt.compareSync(String(password || ''), u.hash)) return r.status(401).json({ error: 'Wrong email or password' });
  r.json({ token: sign(u.id), name: u.name });
});
app.get('/api/me', auth, (q, r) => r.json(db.prepare('SELECT name,email,budget FROM users WHERE id=?').get(q.uid)));
app.put('/api/budget', auth, (q, r) => {
  const b = Number(q.body.budget); if (!(b >= 0)) return r.status(400).json({ error: 'Invalid budget' });
  db.prepare('UPDATE users SET budget=? WHERE id=?').run(b, q.uid); r.json({ budget: b });
});
const ymOf = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
function runRecurring(uid) {   // auto-adds monthly recurring expenses (rent, subscriptions) once their day has come
  const now = new Date(), ym = ymOf(now);
  db.prepare('SELECT * FROM recurring WHERE user_id=?').all(uid).forEach(x => {
    if (x.last_run !== ym && now.getDate() >= x.day) {
      db.prepare('INSERT INTO expenses(user_id,title,amount,category,date) VALUES(?,?,?,?,?)').run(uid, x.title, x.amount, x.category, ym + '-' + String(x.day).padStart(2, '0'));
      db.prepare('UPDATE recurring SET last_run=? WHERE id=?').run(ym, x.id);
    }
  });
}
app.get('/api/expenses', auth, (q, r) => { runRecurring(q.uid); r.json(rowsOf(q.uid)); });
app.get('/api/recurring', auth, (q, r) => r.json(db.prepare('SELECT id,title,amount,category,day FROM recurring WHERE user_id=?').all(q.uid)));
app.post('/api/recurring', auth, (q, r) => {
  let { title, amount, category, day } = q.body || {}; amount = Number(amount); day = Math.min(28, Math.max(1, parseInt(day) || 1)); title = String(title || '').trim();
  if (!title || !(amount > 0)) return r.status(400).json({ error: 'Title and positive amount required' });
  if (!CATS.includes(category)) category = ml.categorize(ml.train(rowsOf(q.uid)), title).category;
  const i = db.prepare('INSERT INTO recurring(user_id,title,amount,category,day) VALUES(?,?,?,?,?)').run(q.uid, title, amount, category, day);
  r.json({ id: i.lastInsertRowid });
});
app.delete('/api/recurring/:id', auth, (q, r) => { db.prepare('DELETE FROM recurring WHERE id=? AND user_id=?').run(q.params.id, q.uid); r.json({ ok: true }); });
app.get('/api/goals', auth, (q, r) => r.json(db.prepare('SELECT id,name,target,saved,emoji FROM goals WHERE user_id=? ORDER BY id DESC').all(q.uid)));
app.post('/api/goals', auth, (q, r) => {
  const { name, target, emoji } = q.body || {};
  if (!String(name || '').trim() || !(Number(target) > 0)) return r.status(400).json({ error: 'Goal name and positive target required' });
  const i = db.prepare('INSERT INTO goals(user_id,name,target,emoji) VALUES(?,?,?,?)').run(q.uid, String(name).trim(), Number(target), emoji || '🎯');
  r.json({ id: i.lastInsertRowid });
});
app.post('/api/goals/:id/add', auth, (q, r) => {
  const a = Number(q.body.amount); if (!(a > 0)) return r.status(400).json({ error: 'Enter a positive amount' });
  db.prepare('UPDATE goals SET saved=saved+? WHERE id=? AND user_id=?').run(a, q.params.id, q.uid);
  r.json(db.prepare('SELECT id,name,target,saved,emoji FROM goals WHERE id=? AND user_id=?').get(q.params.id, q.uid) || {});
});
app.delete('/api/goals/:id', auth, (q, r) => { db.prepare('DELETE FROM goals WHERE id=? AND user_id=?').run(q.params.id, q.uid); r.json({ ok: true }); });
app.post('/api/expenses', auth, (q, r) => {
  let { title, amount, category, date } = q.body || {};
  amount = Number(amount); title = String(title || '').trim();
  if (!title || !(amount > 0) || !/^\d{4}-\d{2}-\d{2}$/.test(date || '')) return r.status(400).json({ error: 'Title, positive amount and date are required' });
  if (!CATS.includes(category)) category = ml.categorize(ml.train(rowsOf(q.uid)), title).category;
  const i = db.prepare('INSERT INTO expenses(user_id,title,amount,category,date) VALUES(?,?,?,?,?)').run(q.uid, title, amount, category, date);
  r.json({ id: i.lastInsertRowid, title, amount, category, date });
});
app.delete('/api/expenses/:id', auth, (q, r) => {
  db.prepare('DELETE FROM expenses WHERE id=? AND user_id=?').run(q.params.id, q.uid); r.json({ ok: true });
});
app.get('/api/categorize', auth, (q, r) => r.json(ml.categorize(ml.train(rowsOf(q.uid)), q.query.title || '')));
app.get('/api/insights', auth, (q, r) => {
  const rows = rowsOf(q.uid);
  r.json({ prediction: ml.predict(rows), anomalies: ml.anomalies(rows), tips: ml.tips(rows) });
});
app.post('/api/seed-demo', auth, (q, r) => {
  const items = [['Zomato dinner', 450, 'Food'], ['Metro card', 300, 'Travel'], ['Amazon headphones', 1800, 'Shopping'], ['Jio recharge', 299, 'Bills'], ['Udemy course', 650, 'Study'], ['Swiggy lunch', 280, 'Food'], ['Uber ride', 220, 'Travel'], ['Canteen snacks', 120, 'Food'], ['Notebook and pens', 180, 'Study'], ['Movie night', 500, 'Entertainment'], ['Pharmacy medicines', 340, 'Health']];
  const ins = db.prepare('INSERT INTO expenses(user_id,title,amount,category,date) VALUES(?,?,?,?,?)');
  const now = new Date(); let k = 0;
  db.transaction(() => {
    for (let m = 5; m >= 0; m--) for (let i = 0; i < 11; i++) {
      const [t, a, c] = items[i], d = new Date(now.getFullYear(), now.getMonth() - m, 2 + i * 2);
      if (m === 0 && d > now) continue;
      ins.run(q.uid, t, Math.round(a * (0.8 + ((k++ * 37) % 50) / 100) * (1 + (5 - m) * 0.04)), c, d.toISOString().slice(0, 10));
    }
    ins.run(q.uid, 'Birthday party biryani', 4800, 'Food', new Date(now.getFullYear(), now.getMonth(), 1).toISOString().slice(0, 10));
  })();
  r.json({ ok: true });
});
module.exports = app;
if (require.main === module) { const P = process.env.PORT || 3000; app.listen(P, () => console.log('SpendWise running on http://localhost:' + P)); }

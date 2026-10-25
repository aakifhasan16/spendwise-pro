// Small ML toolkit written from scratch (easy to explain in viva)
// 1) Hybrid text classifier: Naive Bayes on word + character-trigram features, boosted by a keyword lexicon
//    (character trigrams let it handle typos and unseen spellings: "dominoz", "swigy", "netflx")
// 2) Linear regression forecast  3) Z-score anomaly detection
const LEX = {
  Food: 'zomato swiggy zepto blinkit instamart lunch dinner breakfast brunch pizza burger biryani coffee tea chai cafe restaurant dhaba snacks snack grocery groceries kirana sabzi vegetables fruits milk curd paneer bread eggs canteen mess tiffin momos maggi noodles juice shake icecream dessert cake samosa kachori chaat golgappa paratha thali dosa idli sandwich roll shawarma kebab dominos mcdonalds kfc subway starbucks sutta tapri bakery sweets mithai namkeen chips biscuits pepsi coke haldirams foodpanda nashta chole bhature pasta fries wrap lassi ice cream',
  Travel: 'uber ola rapido bus metro auto rickshaw taxi cab petrol diesel fuel cng train irctc flight indigo airindia spicejet makemytrip goibibo redbus toll fastag parking bike scooter ride commute travel trip hotel airport railway bhada boarding',
  Shopping: 'amazon flipkart myntra ajio meesho nykaa shoes sneakers shirt tshirt jeans kurta saree dress clothes jacket hoodie mall bag backpack watch sunglasses headphones earbuds airpods charger cable case cover gift perfume cosmetics makeup decathlon croma zudio westside shopping electronics laptop mouse keyboard',
  Bills: 'electricity bill bills recharge wifi broadband internet rent pg hostel water gas cylinder lpg mobile jio airtel vi postpaid prepaid insurance emi loan sip dth tatasky maintenance society laundry dhobi maid bijli paani',
  Study: 'book books notebook notebooks pen pens pencil course udemy coursera unacademy byjus fees tuition exam xerox photocopy print printout stationery coaching library college semester project notes lab record calculator gate ielts toefl gre certification internship',
  Health: 'medicine medicines pharmacy chemist apollo medplus pharmeasy doctor clinic hospital checkup dentist dental eye specs glasses lens gym protein supplement vitamin vitamins fitness yoga physio therapy tablet tablets blood',
  Entertainment: 'movie movies cinema pvr inox bookmyshow netflix prime hotstar spotify gaana youtube game gaming steam pubg bgmi freefire uc playstation xbox concert show event club pub outing bowling arcade ott music',
  Other: 'misc other donation charity haircut salon barber spa tip fine penalty courier postage repair'
};
const tok = s => (String(s).toLowerCase().match(/[a-z]+/g) || []);
const tri = w => { const p = '^' + w + '$', o = []; for (let i = 0; i < p.length - 2; i++) o.push(p.slice(i, i + 3)); return o; };
const feats = text => { const f = []; tok(text).forEach(w => { f.push('w:' + w); tri(w).forEach(t => f.push('t:' + t)); }); return f; };
const LEXSET = {}; for (const [c, t] of Object.entries(LEX)) t.split(' ').forEach(w => { LEXSET[w] = LEXSET[w] || c; });

function train(history = []) {
  const cls = {}, vocab = new Set();
  const add = (text, c, wt) => {
    cls[c] = cls[c] || { w: {}, t: 0 };
    feats(text).forEach(f => { cls[c].w[f] = (cls[c].w[f] || 0) + wt; cls[c].t += wt; vocab.add(f); });
  };
  for (const c of Object.keys(LEX)) { cls[c] = { w: {}, t: 0 }; LEX[c].split(' ').forEach(w => add(w, c, 1)); }
  history.forEach(e => { if (LEX[e.category]) add(e.title, e.category, 2); });   // learns from the user's own data
  return { cls, V: vocab.size, vocab };
}

function categorize(model, title) {
  const ws = tok(title), f = feats(title).filter(x => model.vocab.has(x));
  if (!ws.length || !f.length) return { category: 'Other', confidence: 0, top: [] };
  const sc = {};
  for (const [c, m] of Object.entries(model.cls)) {
    let s = 0;
    f.forEach(x => { s += Math.log(((m.w[x] || 0) + 0.05) / (m.t + 0.05 * model.V)) * (x[0] === 'w' ? 2 : 1); });
    ws.forEach(w => { if (LEXSET[w] === c) s += 6; });
    sc[c] = s;
  }
  const mx = Math.max(...Object.values(sc));
  const ex = Object.entries(sc).map(([c, s]) => [c, Math.exp((s - mx) / Math.max(1, f.length / 3))]);
  const sum = ex.reduce((a, b) => a + b[1], 0);
  const top = ex.map(([c, v]) => ({ category: c, p: +(v / sum).toFixed(2) })).sort((a, b) => b.p - a.p).slice(0, 3);
  return { category: top[0].category, confidence: top[0].p, top };
}

function monthTotals(rows) {
  const m = {}; rows.forEach(r => { const k = r.date.slice(0, 7); m[k] = (m[k] || 0) + r.amount; }); return m;
}

function predict(rows) {
  const m = monthTotals(rows), keys = Object.keys(m).sort(), cur = new Date().toISOString().slice(0, 7);
  let ks = keys.filter(k => k < cur).slice(-6); if (ks.length < 2) ks = keys.slice(-6);
  const y = ks.map(k => m[k]), n = y.length, history = ks.map((k, i) => ({ month: k, total: Math.round(y[i]) }));
  if (!n) return { next: 0, method: 'not enough data', history };
  if (n < 2) return { next: Math.round(y[0]), method: 'average', history };
  const xm = (n - 1) / 2, ym = y.reduce((a, b) => a + b) / n; let num = 0, den = 0;
  y.forEach((v, i) => { num += (i - xm) * (v - ym); den += (i - xm) ** 2; });
  const b = num / den, a = ym - b * xm;
  return { next: Math.max(0, Math.round(a + b * n)), method: 'linear regression', trend: b >= 0 ? 'up' : 'down', history };
}

function anomalies(rows) {
  const by = {}; rows.forEach(r => (by[r.category] = by[r.category] || []).push(r));
  const out = [];
  for (const [c, l] of Object.entries(by)) {
    if (l.length < 5) continue;
    const mu = l.reduce((a, r) => a + r.amount, 0) / l.length;
    const sd = Math.sqrt(l.reduce((a, r) => a + (r.amount - mu) ** 2, 0) / l.length);
    if (!sd) continue;
    l.forEach(r => { const z = (r.amount - mu) / sd; if (z >= 2) out.push({ id: r.id, title: r.title, amount: r.amount, category: c, date: r.date, z: +z.toFixed(1), usual: Math.round(mu) }); });
  }
  return out.sort((a, b) => b.z - a.z).slice(0, 5);
}

function tips(rows) {
  const now = new Date(), cur = now.toISOString().slice(0, 7), prev = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().slice(0, 7);
  const a = {}, b = {};
  rows.forEach(r => { const k = r.date.slice(0, 7); if (k === cur) a[r.category] = (a[r.category] || 0) + r.amount; if (k === prev) b[r.category] = (b[r.category] || 0) + r.amount; });
  const out = [];
  for (const c of Object.keys(a)) if (b[c] > 0) { const p = Math.round((a[c] - b[c]) / b[c] * 100); if (Math.abs(p) >= 30) out.push(`${c} spending is ${Math.abs(p)}% ${p > 0 ? 'higher' : 'lower'} than last month`); }
  return out;
}
module.exports = { train, categorize, predict, anomalies, tips };

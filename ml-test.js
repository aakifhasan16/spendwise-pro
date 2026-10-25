const ml = require('./ml'); const m = ml.train();
const T = { Food: ['dominos pizza','dominoz','zomato order','swiggy instamart','samosa','chai sutta','canteen lunch','birthday cake','maggi and coffee','kirana saman','sabzi mandi','mcdonalds burger','starbuks coffee','biryani party','momos','haldirams snacks','milk packets','dinner at dhaba','ice cream','blinkit groceries','zepto','swigy lunch','chai nashta','pizzas'],
 Travel: ['ola to airport','uber ride','rapido bike','metro card','petrol','auto rickshaw','irctc train ticket','redbus ticket','flight to delhi','fastag toll','cab','goa trip hotel','bus pass','diesel'],
 Shopping: ['amazon order','myntra shirt','flipkart headphones','new shoes','ajio kurta','nykaa makeup','birthday gift','phone cover','zudio jeans','laptop bag','earbuds','amzon order','sneakers'],
 Bills: ['electricity bill','jio recharge','wifi bill','airtel postpaid','room rent','pg rent','gas cylinder','insurance premium','emi payment','dth recharge','water bill','maid','bijli bill','broadband'],
 Study: ['udemy course','notebook and pens','xerox notes','college fees','coursera','exam fees','printout','stationery','gate coaching','semester fees','books','project print'],
 Health: ['apollo pharmacy','medicines','doctor consultation','dentist','gym membership','protein powder','blood test','eye checkup','vitamin tablets','hospital','pharmeasy order'],
 Entertainment: ['movie tickets','bookmyshow','netflix','netflx','spotify premium','pubg uc','steam game','concert','hotstar subscription','pvr','youtube premium','gaming'],
 Other: ['haircut','salon','donation','courier charges','tip','repair'] };
let ok = 0, n = 0; const bad = [];
for (const [c, l] of Object.entries(T)) for (const t of l) { n++; const r = ml.categorize(m, t); if (r.category === c) ok++; else bad.push(`${t} -> ${r.category} (expected ${c})`); }
console.log(`Categorizer accuracy: ${ok}/${n} = ${(ok / n * 100).toFixed(1)}%`); bad.forEach(b => console.log('  miss:', b));
if (ok / n < 0.9) { console.error('accuracy below 90%'); process.exit(1); }

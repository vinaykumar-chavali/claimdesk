const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('../database/claimdesk.sqlite');

db.serialize(() => {
  // Fix any claims where status was set to a currency code or currency was set to submitted
  db.run("UPDATE claims SET status = 'submitted' WHERE status NOT IN ('submitted', 'under_review', 'approved', 'rejected', 'closed')");
  db.run("UPDATE claims SET currency = 'USD' WHERE length(currency) != 3 OR currency = 'submitted'");
  
  db.all('SELECT id, claim_number, status, currency, claim_amount, title FROM claims', (err, rows) => {
    if (err) console.error(err);
    else console.log('Cleaned claims in database:', rows);
  });
});

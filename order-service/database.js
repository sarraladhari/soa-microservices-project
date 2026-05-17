const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./orders.db', (err) => {
  if (err) {
    console.error('Erreur de connexion SQLite :', err.message);
  } else {
    console.log('Connexion à orders.db réussie.');
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    customer_id INTEGER NOT NULL,
    product_id INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    total_price REAL NOT NULL,
    status TEXT NOT NULL
  )
`, (err) => {
  if (err) {
    console.error('Erreur création table orders :', err.message);
  } else {
    console.log('Table orders prête.');
  }
});

module.exports = db;
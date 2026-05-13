const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./products.db', (err) => {
  if (err) {
    console.error('Erreur de connexion à SQLite :', err.message);
  } else {
    console.log('Connexion à la base products.db réussie.');
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    brand TEXT NOT NULL,
    price REAL NOT NULL,
    description TEXT
  )
`, (err) => {
  if (err) {
    console.error('Erreur création table products :', err.message);
  } else {
    console.log('Table products prête.');
  }
});

module.exports = db;
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./customers.db', (err) => {
  if (err) {
    console.error('Erreur de connexion à SQLite :', err.message);
  } else {
    console.log('Connexion à la base customers.db réussie.');
  }
});

db.run(`
  CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT
  )
`, (err) => {
  if (err) {
    console.error('Erreur création table customers :', err.message);
  } else {
    console.log('Table customers prête.');
  }
});

module.exports = db;
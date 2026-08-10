const sqlite3 = require('sqlite3').verbose();

const dbSource = process.env.NODE_ENV === 'test'
  ? ':memory:'
  : 'banco.sqlite';

const db = new sqlite3.Database(dbSource, (err) => {
  if (err) console.error(err.message);

  db.run(`
    CREATE TABLE IF NOT EXISTS alunos (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      nome TEXT,
      matricula TEXT UNIQUE
    )
  `);
});

module.exports = db;


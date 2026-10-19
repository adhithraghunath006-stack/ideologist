const path = require('path');
const fs = require('fs');

const dbPath = path.resolve(__dirname, '../database.sqlite');

let dbInstance = null;

function getDb() {
  if (dbInstance) return dbInstance;

  try {
    const { DatabaseSync } = require('node:sqlite');
    const rawDb = new DatabaseSync(dbPath);

    // Enable foreign keys and WAL mode for high performance and integrity
    rawDb.exec('PRAGMA foreign_keys = ON;');
    rawDb.exec('PRAGMA journal_mode = WAL;');

    dbInstance = {
      prepare(sql) {
        const stmt = rawDb.prepare(sql);
        return {
          all(...params) {
            return stmt.all(...params);
          },
          get(...params) {
            return stmt.get(...params);
          },
          run(...params) {
            return stmt.run(...params);
          }
        };
      },
      exec(sql) {
        return rawDb.exec(sql);
      },
      raw: rawDb
    };

    console.log('[Database] SQLite connected successfully at:', dbPath);
    return dbInstance;
  } catch (err) {
    console.error('[Database] Failed to connect to SQLite:', err);
    throw err;
  }
}

module.exports = getDb();

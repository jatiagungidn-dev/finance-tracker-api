import Database, { type Database as DatabaseType } from "better-sqlite3";

const db: DatabaseType = new Database("finance.db");

db.pragma("foreign_keys = ON");
db.pragma("journal_mode = WAL");

export default db;

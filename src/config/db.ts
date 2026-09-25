import Database, { type Database as DatabaseType } from "better-sqlite3";

const db: DatabaseType = new Database("finance.db");

db.pragma("foreign_keys = ON");

export const initDatabase = () => {
  db.exec(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            email TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENCT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS accounts (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            user_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            balance REAL DEFAULT 0,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS categories (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT CHECK(type IN('income', 'expense')) NOT NULL
        );
        
        CREATE TABLE IF NOT EXISTS transactions (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            account_id INTEGER NOT NULL,
            category_id INTEGER NOT NULL,
            type TEXT CHECK(type IN('income', 'expense')) NOT NULL,
            amount REAL DEFAULT 0,
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (account_id) REFERENCES accounts(id) ON DELETE CASCADE,
            FOREIGN KEY (category_id) REFERENCES categories(id)
        );
    `);

  console.log("Database & Tables initialized successfully");
};

export default db;

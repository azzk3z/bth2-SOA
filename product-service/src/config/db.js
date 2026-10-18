// Co so du lieu RIENG cua Product Service (SQLite) - khong dung chung voi Auth Service
const path = require("path");
const fs = require("fs");
const Database = require("better-sqlite3");

const DB_FILE = path.resolve(process.env.DB_FILE || path.join(__dirname, "../../data/products.db"));
fs.mkdirSync(path.dirname(DB_FILE), { recursive: true });

const db = new Database(DB_FILE);
db.pragma("journal_mode = WAL");

// Bang products theo phu luc de bai
db.exec(`
CREATE TABLE IF NOT EXISTS products (
    id          INTEGER PRIMARY KEY AUTOINCREMENT,
    name        VARCHAR(255) NOT NULL,
    description TEXT,
    price       DECIMAL(10, 2) NOT NULL DEFAULT 0,
    quantity    INT NOT NULL DEFAULT 0,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
`);

module.exports = db;

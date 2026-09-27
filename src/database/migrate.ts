import fs from "node:fs";
import path from "node:path";
import db from "../config/db.js";

const dir = path.join(process.cwd(), "src/database/migrations");

export const runMigration = () => {
  db.exec("CREATE TABLE IF NOT EXISTS _migrations (name TEXT PRIMARY KEY)");

  const done = db.prepare("SELECT 1 FROM _migrations WHERE name = ?");
  const mark = db.prepare("INSERT INTO _migrations (name) VALUES (?)");

  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith(".sql"))
    .sort();

  for (const file of files) {
    if (done.get(file)) continue;

    const migrate = db.transaction(() => {
      const sql = fs.readFileSync(path.join(dir, file), "utf-8");

      db.exec(sql);
      mark.run(file);
    });

    migrate();

    console.log(`${file}`);
  }
};

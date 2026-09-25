import { Router } from "express";
import db from "../config/db.js";
import type { Transaction } from "../types/index.js";

const router = Router();

router.get("/", (_req, res) => {
  const stmt = db.prepare(`
        SELECT 
            t.id, t.type, t.amount, t.description, t.created_at,
            a.name AS account_name,
            c.name AS category_name
        FROM transaction t
        JOIN accounts a ON t.account_id = a.id
        JOIN categories c ON t.category_id = c.id
        ORDER BY t.created_at DESC
    `);

  res.json({ data: stmt.all() });
});

router.post("/", (req, res) => {
  const { account_id, category_id, type, amount, description } =
    req.body as Transaction;

  if (!account_id || !category_id || !type || !amount) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const createTransaction = db.transaction(() => {
    const insertStmt = db.prepare(`
        INSERT INTO transactions (account_id, category_id, type, amount, description)
        VALUES (?, ?, ?, ?, ?)
    `);
    const info = insertStmt.run(
      account_id,
      category_id,
      type,
      amount,
      description || "",
    );

    const balanceOperator = type === "income" ? "+" : "-";
    const updateBalanceStmt = db.prepare(`
        UPDATE accounts
        SET balance = balance ${balanceOperator} ?
        WHERE id = ?
    `);
    updateBalanceStmt.run(amount, account_id);

    return info.lastInsertRowid;
  });

  try {
    const newId = createTransaction();
    res.status(201).json({
      message: "Transaction created successfully",
      transaction_id: newId,
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;

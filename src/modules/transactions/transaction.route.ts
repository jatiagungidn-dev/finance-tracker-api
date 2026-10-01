import { Router } from "express";
import db from "../../config/db.js";
import type { Transaction } from "../../types/index.js";

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
  try {
    const { account_id, category_id, type, amount, description } = req.body;

    if (
      !Number.isInteger(account_id) ||
      account_id <= 0 ||
      !Number.isInteger(category_id) ||
      category_id <= 0
    ) {
      return res.status(400).json({
        status: "fail",
        message: "account_id and category_id must be valid positive integer",
      });
    }

    if (type !== "income" && type !== "expense") {
      return res.status(400).json({
        status: "fail",
        message: "Type can only be 'income' or 'expense'",
      });
    }

    if (typeof amount !== "number" || amount <= 0) {
      return res
        .status(400)
        .json({ status: "fail", message: "Amount must be a positive number" });
    }

    const account = db
      .prepare("SELECT id FROM accounts WHERE id = ?")
      .get(account_id);

    if (!account) {
      return res
        .status(400)
        .json({ status: "fail", message: "Account not found" });
    }

    const category = db
      .prepare("SELECT id FROM categories WHERE id = ?")
      .get(category_id);

    if (!category) {
      return res
        .status(400)
        .json({ status: "fail", message: "Category not found" });
    }

    const createTransaction = db.transaction(() => {
      const transaction = db
        .prepare(
          `
        INSERT INTO transactions (account_id, category_id, type, amount, description)
        VALUES (?, ?, ?, ?, ?)
        RETURNING id, account_id, category_id, type, amount, description, created_at
      `,
        )
        .get(account_id, category_id, type, amount, description || "");

      const balanceOperator = type === "income" ? "+" : "-";

      db.prepare(
        `
        UPDATE accounts
        SET balance = balance ${balanceOperator} ?
        WHERE id = ?
      `,
      ).run(amount, account_id);

      return transaction;
    });

    const data = createTransaction();

    res.status(201).json({
      status: "success",
      message: "Transaction created successfully",
      data,
    });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;

import { Router } from "express";
import db from "../../config/db.js";

const router = Router();

router.get("/", (_req, res) => {
  try {
    const stmt = db.prepare(`
        SELECT
          a.id, a.name, a.balance, a.created_at, a.user_id,
          u.name AS user_name
        FROM accounts a
        JOIN users u ON a.user_id = u.id
    `);

    res.status(200).json({ status: "success", data: stmt.all() });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

router.get("/:id", (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid id request" });
    }

    const getStmt = db.prepare(`
      SELECT
        a.id, a.name, a.balance, a.created_at, a.user_id,
        u.name AS user_name
      FROM accounts a
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `);

    const account = getStmt.get(id);

    if (!account) {
      return res
        .status(404)
        .json({ status: "fail", message: "Account not found" });
    }

    res.status(200).json({ status: "success", data: account });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

router.post("/", (req, res) => {
  try {
    const { user_id, name, balance } = req.body;

    if (!user_id || !name || !balance) {
      return res
        .status(400)
        .json({ status: "fail", message: "Missing required fields" });
    }

    const user = db.prepare("SELECT * FROM users WHERE id = ?").get(user_id);

    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "user not found" });
    }

    const account = db
      .prepare(
        "INSERT INTO accounts (user_id, name, balance) VALUES (?, ?, ?) RETURNING id, user_id, name, balance, created_at",
      )
      .get(user_id, name, balance);

    res.status(201).json({
      status: "success",
      message: "Account created successfully",
      data: account,
    });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

router.patch("/:id", (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid id request" });
    }

    const updateStmt = db.prepare(`
      SELECT *
      FROM accounts
      WHERE id = ?
    `);

    const account = updateStmt.get(id);

    if (!account) {
      return res
        .status(404)
        .json({ status: "fail", message: "Account not found" });
    }

    const { name, balance } = req.body;

    if (name === undefined && balance === undefined) {
      return res.status(400).json({
        status: "fail",
        message: "'name' or 'balance' are required for update",
      });
    }

    if (
      balance !== undefined &&
      (typeof balance !== "number" || balance <= 0)
    ) {
      return res
        .status(400)
        .json({ status: "fail", message: "Balance must be a positive number" });
    }

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }

    if (balance !== undefined) {
      updates.push("balance = ?");
      values.push(balance);
    }

    values.push(id);

    db.prepare(
      `
      UPDATE accounts
      SET ${updates.join(", ")}
      WHERE id = ?
    `,
    ).run(...values);

    const data = db
      .prepare(
        `
      SELECT
        a.id, a.name, a.balance, a.created_at, a.user_id,
        u.name AS user_name
      FROM accounts a
      JOIN users u ON a.user_id = u.id
      WHERE a.id = ?
    `,
      )
      .get(id);

    res.status(200).json({
      status: "success",
      message: "Account updated successfully",
      data: data,
    });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

router.delete("/:id", (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid id request" });
    }

    const account = db
      .prepare(
        `
        SELECT *
        FROM accounts
        WHERE id = ?
    `,
      )
      .get(id);

    if (!account) {
      return res
        .status(404)
        .json({ status: "fail", message: "Account not found" });
    }

    const deleteStmt = db
      .prepare(
        `
       DELETE FROM accounts
       WHERE id = ?
    `,
      )
      .run(id);

    res.status(200).json({
      status: "success",
      message: "Account deleted successfully",
      changes: deleteStmt.changes,
    });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;

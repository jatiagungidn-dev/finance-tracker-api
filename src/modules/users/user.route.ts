import { Router } from "express";
import db from "../../config/db.js";
import type { User } from "../../types/index.js";

const router = Router();

router.get("/", (_req, res) => {
  const stmt = db.prepare(`
        SELECT * 
        FROM users
    `);

  res.status(200).json({ status: "success", data: stmt.all() });
});

router.get("/:id", (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid id request" });
    }

    const getStmt = db.prepare(
      "SELECT id, name, email, created_at FROM users WHERE id = ?",
    );

    const user = getStmt.get(id);

    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }

    res.status(200).json({ status: "success", data: user });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

router.post("/", (req, res) => {
  try {
    const { name, email } = req.body as User;

    if (!name || !email) {
      return res
        .status(400)
        .json({ status: "fail", message: "Missing required fields" });
    }

    const insertStmt = db.prepare(`
              INSERT INTO users (name, email)
              VALUES (?, ?)
          `);

    const info = insertStmt.run(name, email);

    const newId = info.lastInsertRowid;

    const user = db
      .prepare("SELECT id, name, email, created_at FROM users WHERE id = ?")
      .get(newId);

    res.status(201).json({
      status: "success",
      message: "User created successfully",
      id: newId,
      data: user,
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

    const getStmt = db.prepare("SELECT * FROM users WHERE id = ?");

    const user = getStmt.get(id);

    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }

    const { name, email } = req.body as Partial<User>;

    if (name === undefined && email === undefined) {
      return res.status(400).json({
        status: "fail",
        message: "'name' or 'email' are required to update",
      });
    }

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name);
    }
    if (email !== undefined) {
      updates.push("email = ?");
      values.push(email);
    }

    values.push(id);

    db.prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`).run(
      ...values,
    );

    const userData = db.prepare("SELECT * FROM users where id = ?").get(id);

    res.status(200).json({
      status: "success",
      message: "User updated successfully",
      data: userData,
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

    const getStmt = db.prepare(
      "SELECT id, name, email, created_at FROM users WHERE id = ?",
    );

    const user = getStmt.get(id);

    if (!user) {
      return res
        .status(404)
        .json({ status: "fail", message: "User not found" });
    }

    db.prepare("DELETE FROM users WHERE id = ?").run(id);

    res
      .status(200)
      .json({ status: "success", message: "User deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;

import { Router } from "express";
import db from "../../config/db.js";

const router = Router();

router.get("/", (_req, res) => {
  try {
    const stmt = db.prepare(`
        SELECT *
        FROM categories
    `);

    const data = stmt.all();

    res.status(200).json({ status: "success", count: data.length, data: data });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

router.get("/:id", (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid id request" });
    }

    const category = db
      .prepare(
        `
        SELECT *
        FROM categories
        WHERE id = ?
    `,
      )
      .get(id);

    if (!category) {
      return res
        .status(404)
        .json({ status: "fail", message: "Category not found" });
    }

    res.status(200).json({ status: "success", data: category });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

router.post("/", (req, res) => {
  try {
    const { name, type } = req.body;

    if (!name || !type) {
      return res
        .status(400)
        .json({ status: "fail", message: "Missing required fields" });
    }

    if (type !== "income" && type !== "expense") {
      return res.status(400).json({
        status: "fail",
        message: "Type can only be 'income' or 'expense'",
      });
    }

    const insertStmt = db.prepare(`
        INSERT INTO categories (name, type)
        VALUES (?, ?)
        RETURNING id, name, type
    `);

    const category = insertStmt.get(name, type);

    res.status(201).json({
      status: "success",
      message: "Category created successfully",
      data: category,
    });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

router.patch("/:id", (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid id request" });
    }

    const { name, type } = req.body;

    if (name === undefined && type === undefined) {
      return res.status(400).json({
        status: "fail",
        message: "'name' or 'type' are required for update",
      });
    }

    if (name !== undefined && typeof name !== "string" && name.trim() === "") {
      return res
        .status(400)
        .json({ status: "fail", message: "Name cannot be empty" });
    }

    if (type !== undefined && type !== "income" && type !== "expense") {
      return res.status(400).json({
        status: "fail",
        message: "Type can only be 'income' or 'expense'",
      });
    }

    const updates = [];
    const values = [];

    if (name !== undefined) {
      updates.push("name = ?");
      values.push(name.trim());
    }

    if (type !== undefined) {
      updates.push("type = ?");
      values.push(type);
    }

    values.push(id);

    const update = db
      .prepare(
        `
        UPDATE categories
        SET ${updates.join(", ")}
        WHERE id = ?
        RETURNING id, name, type
    `,
      )
      .get(...values);

    if (!update) {
      return res
        .status(404)
        .json({ status: "fail", message: "Category not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Category updated successfully",
      data: update,
    });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

router.delete("/:id", (req, res) => {
  try {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res
        .status(400)
        .json({ status: "fail", message: "Invalid id request" });
    }

    const deleteCategory = db
      .prepare(
        `
        DELETE FROM categories
        WHERE id = ?
    `,
      )
      .run(id);

    if (deleteCategory.changes === 0) {
      return res
        .status(404)
        .json({ status: "fail", message: "Category not found" });
    }

    res.status(200).json({
      status: "success",
      message: "Category deleted successfully",
      changes: deleteCategory.changes,
    });
  } catch (err: any) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

export default router;

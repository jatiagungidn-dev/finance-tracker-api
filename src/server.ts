import express from "express";
import { initDatabase } from "./config/db.js";
import transactionRoutes from "./routes/transactions.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

initDatabase();

app.use("/api/transaction", transactionRoutes);

app.get("/", (req, res) => {
  res.json({ message: "Finance Tracker is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

import express from "express";
import { runMigration } from "./database/migrate.js";
import userRoutes from "./modules/users/user.route.js";
import transactionRoutes from "./modules/transactions/transaction.route.js";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

runMigration();

app.use("/api/users", userRoutes);
app.use("/api/transactions", transactionRoutes);

app.get("/", (_req, res) => {
  res.json({ message: "Finance Tracker is running" });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

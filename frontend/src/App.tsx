import "./App.css";
import { useEffect, useState } from "react";
import AccountCard from "./components/AccountCard";
import TransactionForm from "./components/TransactionForm";
import TransactionItem from "./components/TransactionItem";
import type { Transaction } from "./types";

function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log("Transaction changed");
  }, [transactions]);

  useEffect(() => {
    document.title = `Transactions: ${transactions.length}`;
  }, [transactions]);

  useEffect(() => {
    async function getTransactions() {
      try {
        const response = await fetch("http://localhost:3000/api/transactions");

        if (!response.ok) {
          throw new Error("Failed to fetch transactions");
        }

        const result = await response.json();

        setTransactions(result.data);
      } catch (error) {
        setError("Failed to load transactions");
      } finally {
        setIsLoading(false);
      }
    }

    getTransactions();
  }, []);

  return (
    <div>
      <h1>Finance Tracker</h1>

      <AccountCard name="BCA" balance={2500000} />

      <h2>Transactions</h2>

      {isLoading ? (
        <p>Loading transactions...</p>
      ) : error ? (
        <p>{error}</p>
      ) : (
        transactions.map((transaction, index) => (
          <TransactionItem key={index} transaction={transaction} />
        ))
      )}
    </div>
  );
}

export default App;

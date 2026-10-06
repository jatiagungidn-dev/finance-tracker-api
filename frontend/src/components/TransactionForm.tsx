import { useState } from "react";
import type { Transaction } from "../types";

interface TransactionFormProps {
  onAddTransaction: (transaction: Transaction) => void;
}

function TransactionForm() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const response = await fetch("http://localhost:3000/api/transactions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        account_id: 1,
        category_id: 1,
        type: "expense",
        amount: Number(amount),
        description,
      }),
    });

    const result = await response.json();

    console.log(result);
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label>Description</label>

        <input
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </div>

      <div>
        <label>Amount</label>

        <input
          type="number"
          value={amount}
          onChange={(event) => setAmount(event.target.value)}
        />
      </div>

      <button type="submit">Add Transaction</button>
    </form>
  );
}

export default TransactionForm;

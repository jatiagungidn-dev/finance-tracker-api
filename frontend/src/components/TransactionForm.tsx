import { useState } from "react";

function TransactionForm() {
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    console.log({ description, amount });
  }

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <h2>{description}</h2>
        <p>Rp{amount}</p>
      </div>
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

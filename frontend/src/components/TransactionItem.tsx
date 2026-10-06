import type { Transaction } from "../types";

interface TransactionItemProps {
  transaction: Transaction;
}

function TransactionItem({ transaction }: TransactionItemProps) {
  return (
    <div>
      <p>{transaction.description}</p>
      <p>{transaction.category_name}</p>
      <p>{transaction.account_name}</p>
      <p>Rp{transaction.amount}</p>
    </div>
  );
}

export default TransactionItem;

import { useState } from "react";

interface AccountCardProps {
  name: string;
  balance: number;
}

function AccountCard({ name, balance }: AccountCardProps) {
  const [currentBalance, setCurrentBalance] = useState(balance);

  return (
    <div>
      <h2>{name}</h2>
      <p>Rp{currentBalance}</p>

      <button onClick={() => setCurrentBalance(currentBalance + 50000)}>
        + Rp50.000
      </button>
    </div>
  );
}

export default AccountCard;

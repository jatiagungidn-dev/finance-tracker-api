export interface Transaction {
  id: number;
  type: "income" | "expense";
  amount: number;
  description: string;
  created_at: string;
  account_name: string;
  category_name: string;
}

export interface User {
  id?: number;
  name: string;
  email: string;
  created_at?: string;
}

export interface Account {
  id?: number;
  user_id: number;
  name: string;
  balance: number;
  created_at?: string;
}

export interface Category {
  id?: number;
  name: string;
  type: "income" | "expense";
}

export interface Transaction {
  id?: number;
  account_id: number;
  category_id: number;
  type: "income" | "expense";
  amount: number;
  description?: string;
  created_at?: string;
}

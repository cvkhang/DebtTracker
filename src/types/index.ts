export interface DebtEntry {
  id: string;
  person: string;
  amount: number;
  description?: string;
  date: string;
  startDate?: string;
  endDate?: string;
  status: 'active' | 'paid' | 'partial';
  paymentHistory: PaymentRecord[];
}

export type PaymentRecord = {
  id: string;
  personId: string;
  amount: number;
  type: 'debt' | 'payment';
  description: string;
  date: string;
};

export type Person = {
  id: string;
  name: string;
  totalDebt: number;
}; 
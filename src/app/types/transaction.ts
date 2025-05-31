export interface Transaction {
  action: 'send' | 'pay' | 'transfer';
  amount: string;
  token: string;
  to: string;
  note: string;
}

export type TransactionMappings = {
  [key: string]: Transaction;
}; 
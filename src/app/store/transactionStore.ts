import { create } from 'zustand';
import { Transaction } from '../types/transaction';

interface TransactionState {
  currentTransaction: Transaction | null;
  setTransaction: (transaction: Transaction | null) => void;
}

export const useTransactionStore = create<TransactionState>((set) => ({
  currentTransaction: null,
  setTransaction: (transaction) => set({ currentTransaction: transaction }),
})); 
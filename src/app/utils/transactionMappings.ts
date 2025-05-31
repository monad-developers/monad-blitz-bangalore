import { TransactionMappings } from "../types/transaction";

export const transactionMappings: TransactionMappings = {
  "Send 0.01 ETH to Gokul for lunch.": {
    action: "send",
    amount: "0.01",
    token: "MON",
    to: "Gokul",
    note: "for lunch"
  },

  "Pay 5 USDT to Riya for coffee.": {
    action: "pay",
    amount: "5",
    token: "MON",
    to: "Riya",
    note: "for coffee"
  },

  "Transfer 0.25 MATIC to yash.eth for last week's work.": {
    action: "transfer",
    amount: "0.25",
    token: "MON",
    to: "yash.eth",
    note: "for last week's work"
  },

  "Send 10 DAI to Sarah for groceries.": {
    action: "send",
    amount: "10",
    token: "MON",
    to: "Sarah",
    note: "for groceries"
  },

  "Pay 0.005 ETH to Arjun for snacks.": {
    action: "pay",
    amount: "0.005",
    token: "MON",
    to: "Arjun",
    note: "for snacks"
  }
}; 
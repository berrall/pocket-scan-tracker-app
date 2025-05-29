
import { useState, useEffect } from 'react';
import { Transaction } from '@/types';

export const useTransactions = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);

  // Charger les transactions depuis le localStorage
  useEffect(() => {
    const stored = localStorage.getItem('family-expenses-transactions');
    if (stored) {
      const parsedTransactions = JSON.parse(stored).map((t: any) => ({
        ...t,
        date: new Date(t.date)
      }));
      setTransactions(parsedTransactions);
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('family-expenses-transactions', JSON.stringify(transactions));
  }, [transactions]);

  const addTransaction = (transaction: Omit<Transaction, 'id'>) => {
    const newTransaction: Transaction = {
      ...transaction,
      id: Date.now().toString(),
    };
    setTransactions(prev => [newTransaction, ...prev]);
    console.log('Transaction ajoutée:', newTransaction);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
    console.log('Transaction supprimée:', id);
  };

  const getTotalIncome = () => {
    return transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getTotalExpenses = () => {
    return transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);
  };

  const getBalance = () => {
    return getTotalIncome() - getTotalExpenses();
  };

  const getExpensesByCategory = () => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const byCategory: Record<string, number> = {};
    
    expenses.forEach(expense => {
      byCategory[expense.category] = (byCategory[expense.category] || 0) + expense.amount;
    });
    
    return byCategory;
  };

  return {
    transactions,
    addTransaction,
    deleteTransaction,
    getTotalIncome,
    getTotalExpenses,
    getBalance,
    getExpensesByCategory,
  };
};

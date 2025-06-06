
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface Transaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  description: string;
  date: Date;
  bank_account_type?: string;
  bank_institution?: string;
}

export const useSupabaseTransactions = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && session) {
      loadTransactions();
    } else {
      setLoading(false);
    }
  }, [user, session]);

  const loadTransactions = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading transactions:', error);
        return;
      }

      const formattedTransactions = (data || []).map(t => ({
        id: t.id,
        type: t.type as 'expense' | 'income',
        amount: t.amount,
        category: t.category,
        description: t.description,
        date: new Date(t.date),
        bank_account_type: t.bank_account_type || undefined,
        bank_institution: t.bank_institution || undefined
      }));

      setTransactions(formattedTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des transactions",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('transactions')
      .insert([{
        user_id: user.id,
        type: transaction.type,
        amount: transaction.amount,
        category: transaction.category,
        description: transaction.description,
        bank_account_type: transaction.bank_account_type,
        bank_institution: transaction.bank_institution,
        date: transaction.date.toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }

    const newTransaction: Transaction = {
      id: data.id,
      type: data.type as 'expense' | 'income',
      amount: data.amount,
      category: data.category,
      description: data.description,
      date: new Date(data.date),
      bank_account_type: data.bank_account_type || undefined,
      bank_institution: data.bank_institution || undefined
    };

    setTransactions(prev => [newTransaction, ...prev]);
    return newTransaction;
  };

  const deleteTransaction = async (id: string) => {
    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }

    setTransactions(prev => prev.filter(t => t.id !== id));
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
    loading,
    addTransaction,
    deleteTransaction,
    getTotalIncome,
    getTotalExpenses,
    getBalance,
    getExpensesByCategory,
    refreshTransactions: loadTransactions
  };
};

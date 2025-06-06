
import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'expense' | 'income';
}

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

interface BankAccountType {
  id: string;
  name: string;
}

interface BankInstitution {
  id: string;
  name: string;
}

export const useSupabaseData = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [bankAccountTypes, setBankAccountTypes] = useState<BankAccountType[]>([]);
  const [bankInstitutions, setBankInstitutions] = useState<BankInstitution[]>([]);

  // Load data when user is authenticated
  useEffect(() => {
    if (user && session) {
      loadAllData();
    } else {
      setLoading(false);
    }
  }, [user, session]);

  const loadAllData = async () => {
    try {
      await Promise.all([
        loadCategories(),
        loadTransactions(),
        loadBankAccountTypes(),
        loadBankInstitutions()
      ]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des données",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading categories:', error);
      return;
    }

    const formattedCategories = (data || []).map(cat => ({
      id: cat.id,
      name: cat.name,
      icon: cat.icon,
      color: cat.color,
      type: cat.type as 'expense' | 'income'
    }));

    setCategories(formattedCategories);
  };

  const loadTransactions = async () => {
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
  };

  const loadBankAccountTypes = async () => {
    const { data, error } = await supabase
      .from('bank_account_types')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading bank account types:', error);
      return;
    }

    setBankAccountTypes(data || []);
  };

  const loadBankInstitutions = async () => {
    const { data, error } = await supabase
      .from('bank_institutions')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error loading bank institutions:', error);
      return;
    }

    setBankInstitutions(data || []);
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

  // Bank Account Types methods
  const addBankAccountType = async (bankAccountType: Omit<BankAccountType, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('bank_account_types')
      .insert([{
        user_id: user.id,
        name: bankAccountType.name
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding bank account type:', error);
      throw error;
    }

    setBankAccountTypes(prev => [...prev, data]);
    return data;
  };

  const updateBankAccountType = async (id: string, updates: Partial<BankAccountType>) => {
    const { error } = await supabase
      .from('bank_account_types')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating bank account type:', error);
      throw error;
    }

    setBankAccountTypes(prev =>
      prev.map(type => type.id === id ? { ...type, ...updates } : type)
    );
  };

  const deleteBankAccountType = async (id: string) => {
    const { error } = await supabase
      .from('bank_account_types')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting bank account type:', error);
      throw error;
    }

    setBankAccountTypes(prev => prev.filter(type => type.id !== id));
  };

  // Bank Institutions methods
  const addBankInstitution = async (bankInstitution: Omit<BankInstitution, 'id'>) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('bank_institutions')
      .insert([{
        user_id: user.id,
        name: bankInstitution.name
      }])
      .select()
      .single();

    if (error) {
      console.error('Error adding bank institution:', error);
      throw error;
    }

    setBankInstitutions(prev => [...prev, data]);
    return data;
  };

  const updateBankInstitution = async (id: string, updates: Partial<BankInstitution>) => {
    const { error } = await supabase
      .from('bank_institutions')
      .update(updates)
      .eq('id', id);

    if (error) {
      console.error('Error updating bank institution:', error);
      throw error;
    }

    setBankInstitutions(prev =>
      prev.map(institution => institution.id === id ? { ...institution, ...updates } : institution)
    );
  };

  const deleteBankInstitution = async (id: string) => {
    const { error } = await supabase
      .from('bank_institutions')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting bank institution:', error);
      throw error;
    }

    setBankInstitutions(prev => prev.filter(institution => institution.id !== id));
  };

  // Calculated values
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
    loading,
    categories,
    transactions,
    bankAccountTypes,
    bankInstitutions,
    addTransaction,
    deleteTransaction,
    addBankAccountType,
    updateBankAccountType,
    deleteBankAccountType,
    addBankInstitution,
    updateBankInstitution,
    deleteBankInstitution,
    getTotalIncome,
    getTotalExpenses,
    getBalance,
    getExpensesByCategory,
    refreshData: loadAllData
  };
};

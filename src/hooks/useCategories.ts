
import { useState, useEffect } from 'react';
import { Category, DEFAULT_EXPENSE_CATEGORIES, DEFAULT_INCOME_CATEGORIES } from '@/types';

export const useCategories = () => {
  const [expenseCategories, setExpenseCategories] = useState<Category[]>(DEFAULT_EXPENSE_CATEGORIES);
  const [incomeCategories, setIncomeCategories] = useState<Category[]>(DEFAULT_INCOME_CATEGORIES);

  // Charger les catégories depuis le localStorage
  useEffect(() => {
    const storedExpense = localStorage.getItem('family-expenses-expense-categories');
    const storedIncome = localStorage.getItem('family-expenses-income-categories');
    
    if (storedExpense) {
      setExpenseCategories(JSON.parse(storedExpense));
    }
    if (storedIncome) {
      setIncomeCategories(JSON.parse(storedIncome));
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('family-expenses-expense-categories', JSON.stringify(expenseCategories));
  }, [expenseCategories]);

  useEffect(() => {
    localStorage.setItem('family-expenses-income-categories', JSON.stringify(incomeCategories));
  }, [incomeCategories]);

  const addCategory = (type: 'expense' | 'income', category: Omit<Category, 'id'>) => {
    const newCategory: Category = {
      ...category,
      id: Date.now().toString(),
    };

    if (type === 'expense') {
      setExpenseCategories(prev => [...prev, newCategory]);
    } else {
      setIncomeCategories(prev => [...prev, newCategory]);
    }
    console.log('Catégorie ajoutée:', newCategory);
  };

  const updateCategory = (type: 'expense' | 'income', id: string, updates: Partial<Category>) => {
    if (type === 'expense') {
      setExpenseCategories(prev => 
        prev.map(cat => cat.id === id ? { ...cat, ...updates } : cat)
      );
    } else {
      setIncomeCategories(prev => 
        prev.map(cat => cat.id === id ? { ...cat, ...updates } : cat)
      );
    }
    console.log('Catégorie mise à jour:', id, updates);
  };

  const deleteCategory = (type: 'expense' | 'income', id: string) => {
    if (type === 'expense') {
      setExpenseCategories(prev => prev.filter(cat => cat.id !== id));
    } else {
      setIncomeCategories(prev => prev.filter(cat => cat.id !== id));
    }
    console.log('Catégorie supprimée:', id);
  };

  return {
    expenseCategories,
    incomeCategories,
    addCategory,
    updateCategory,
    deleteCategory,
  };
};

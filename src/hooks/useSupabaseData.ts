
import { useSupabaseCategories } from './useSupabaseCategories';
import { useSupabaseTransactions } from './useSupabaseTransactions';
import { useSupabaseBankData } from './useSupabaseBankData';

export const useSupabaseData = () => {
  const {
    categories,
    loading: categoriesLoading,
    refreshCategories
  } = useSupabaseCategories();

  const {
    transactions,
    loading: transactionsLoading,
    addTransaction,
    deleteTransaction,
    getTotalIncome,
    getTotalExpenses,
    getBalance,
    getExpensesByCategory,
    refreshTransactions
  } = useSupabaseTransactions();

  const {
    bankAccountTypes,
    bankInstitutions,
    loading: bankDataLoading,
    addBankAccountType,
    updateBankAccountType,
    deleteBankAccountType,
    addBankInstitution,
    updateBankInstitution,
    deleteBankInstitution,
    refreshBankData
  } = useSupabaseBankData();

  const loading = categoriesLoading || transactionsLoading || bankDataLoading;

  const refreshData = async () => {
    await Promise.all([
      refreshCategories(),
      refreshTransactions(),
      refreshBankData()
    ]);
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
    refreshData
  };
};

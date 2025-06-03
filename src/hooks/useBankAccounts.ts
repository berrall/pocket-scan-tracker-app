
import { useState, useEffect } from 'react';
import { BankAccountType, DEFAULT_BANK_ACCOUNT_TYPES } from '@/types';

export const useBankAccounts = () => {
  const [bankAccountTypes, setBankAccountTypes] = useState<BankAccountType[]>(DEFAULT_BANK_ACCOUNT_TYPES);

  // Charger depuis le localStorage
  useEffect(() => {
    const stored = localStorage.getItem('family-expenses-bank-account-types');
    if (stored) {
      setBankAccountTypes(JSON.parse(stored));
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('family-expenses-bank-account-types', JSON.stringify(bankAccountTypes));
  }, [bankAccountTypes]);

  const addBankAccountType = (bankAccountType: Omit<BankAccountType, 'id'>) => {
    const newBankAccountType: BankAccountType = {
      ...bankAccountType,
      id: Date.now().toString(),
    };
    setBankAccountTypes(prev => [...prev, newBankAccountType]);
    console.log('Type de compte bancaire ajouté:', newBankAccountType);
  };

  const updateBankAccountType = (id: string, updates: Partial<BankAccountType>) => {
    setBankAccountTypes(prev =>
      prev.map(type => type.id === id ? { ...type, ...updates } : type)
    );
    console.log('Type de compte bancaire modifié:', id, updates);
  };

  const deleteBankAccountType = (id: string) => {
    setBankAccountTypes(prev => prev.filter(type => type.id !== id));
    console.log('Type de compte bancaire supprimé:', id);
  };

  return {
    bankAccountTypes,
    addBankAccountType,
    updateBankAccountType,
    deleteBankAccountType,
  };
};

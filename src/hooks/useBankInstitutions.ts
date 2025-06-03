
import { useState, useEffect } from 'react';
import { BankInstitution, DEFAULT_BANK_INSTITUTIONS } from '@/types';

export const useBankInstitutions = () => {
  const [bankInstitutions, setBankInstitutions] = useState<BankInstitution[]>(DEFAULT_BANK_INSTITUTIONS);

  // Charger depuis le localStorage
  useEffect(() => {
    const stored = localStorage.getItem('family-expenses-bank-institutions');
    if (stored) {
      setBankInstitutions(JSON.parse(stored));
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('family-expenses-bank-institutions', JSON.stringify(bankInstitutions));
  }, [bankInstitutions]);

  const addBankInstitution = (bankInstitution: Omit<BankInstitution, 'id'>) => {
    const newBankInstitution: BankInstitution = {
      ...bankInstitution,
      id: Date.now().toString(),
    };
    setBankInstitutions(prev => [...prev, newBankInstitution]);
    console.log('Institution bancaire ajoutée:', newBankInstitution);
  };

  const updateBankInstitution = (id: string, updates: Partial<BankInstitution>) => {
    setBankInstitutions(prev =>
      prev.map(institution => institution.id === id ? { ...institution, ...updates } : institution)
    );
    console.log('Institution bancaire modifiée:', id, updates);
  };

  const deleteBankInstitution = (id: string) => {
    setBankInstitutions(prev => prev.filter(institution => institution.id !== id));
    console.log('Institution bancaire supprimée:', id);
  };

  return {
    bankInstitutions,
    addBankInstitution,
    updateBankInstitution,
    deleteBankInstitution,
  };
};


import { useState, useEffect } from 'react';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

interface BankAccountType {
  id: string;
  name: string;
}

interface BankInstitution {
  id: string;
  name: string;
}

export const useSupabaseBankData = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [bankAccountTypes, setBankAccountTypes] = useState<BankAccountType[]>([]);
  const [bankInstitutions, setBankInstitutions] = useState<BankInstitution[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && session) {
      loadBankData();
    } else {
      setLoading(false);
    }
  }, [user, session]);

  const loadBankData = async () => {
    try {
      await Promise.all([
        loadBankAccountTypes(),
        loadBankInstitutions()
      ]);
    } catch (error) {
      console.error('Error loading bank data:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des données bancaires",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
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

  return {
    bankAccountTypes,
    bankInstitutions,
    loading,
    addBankAccountType,
    updateBankAccountType,
    deleteBankAccountType,
    addBankInstitution,
    updateBankInstitution,
    deleteBankInstitution,
    refreshBankData: loadBankData
  };
};

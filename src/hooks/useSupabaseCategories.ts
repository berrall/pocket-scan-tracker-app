
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

export const useSupabaseCategories = () => {
  const { user, session } = useAuth();
  const { toast } = useToast();
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && session) {
      loadCategories();
    } else {
      setLoading(false);
    }
  }, [user, session]);

  const loadCategories = async () => {
    try {
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
    } catch (error) {
      console.error('Error loading categories:', error);
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement des catégories",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    categories,
    loading,
    refreshCategories: loadCategories
  };
};

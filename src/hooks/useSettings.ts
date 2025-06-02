
import { useState, useEffect } from 'react';
import { Settings, DEFAULT_SETTINGS } from '@/types';

export const useSettings = () => {
  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // Charger les paramètres depuis le localStorage
  useEffect(() => {
    const stored = localStorage.getItem('family-expenses-settings');
    if (stored) {
      setSettings(JSON.parse(stored));
    }
  }, []);

  // Sauvegarder dans localStorage à chaque changement
  useEffect(() => {
    localStorage.setItem('family-expenses-settings', JSON.stringify(settings));
  }, [settings]);

  const updateSettings = (newSettings: Partial<Settings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
    console.log('Paramètres mis à jour:', newSettings);
  };

  return {
    settings,
    updateSettings,
  };
};

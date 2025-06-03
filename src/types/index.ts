
export interface Transaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  description: string;
  date: Date;
  receipt?: string; // base64 image data
  bankAccountType?: string;
  bankInstitution?: string;
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface BankAccountType {
  id: string;
  name: string;
}

export interface BankInstitution {
  id: string;
  name: string;
}

export interface Settings {
  currency: string;
  currencySymbol: string;
}

export const DEFAULT_SETTINGS: Settings = {
  currency: 'EUR',
  currencySymbol: '€'
};

export const CURRENCY_OPTIONS = [
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'USD', symbol: '$', name: 'Dollar américain' },
  { code: 'GBP', symbol: '£', name: 'Livre sterling' },
  { code: 'CHF', symbol: 'CHF', name: 'Franc suisse' },
  { code: 'CAD', symbol: 'C$', name: 'Dollar canadien' },
  { code: 'JPY', symbol: '¥', name: 'Yen japonais' },
];

export const DEFAULT_BANK_ACCOUNT_TYPES: BankAccountType[] = [
  { id: 'checking', name: 'Compte courant' },
  { id: 'savings', name: 'Compte épargne' },
  { id: 'credit', name: 'Carte de crédit' },
  { id: 'debit', name: 'Carte de débit' },
  { id: 'business', name: 'Compte professionnel' },
  { id: 'investment', name: 'Compte d\'investissement' },
  { id: 'other', name: 'Autre' },
];

export const DEFAULT_BANK_INSTITUTIONS: BankInstitution[] = [
  { id: 'bnp', name: 'BNP Paribas' },
  { id: 'credit_agricole', name: 'Crédit Agricole' },
  { id: 'societe_generale', name: 'Société Générale' },
  { id: 'lcl', name: 'LCL' },
  { id: 'credit_mutuel', name: 'Crédit Mutuel' },
  { id: 'la_banque_postale', name: 'La Banque Postale' },
  { id: 'caisse_depargne', name: 'Caisse d\'Épargne' },
  { id: 'boursorama', name: 'Boursorama Banque' },
  { id: 'ing', name: 'ING Direct' },
  { id: 'revolut', name: 'Revolut' },
  { id: 'n26', name: 'N26' },
  { id: 'other', name: 'Autre' },
];

export const DEFAULT_EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Alimentation', icon: '🍕', color: 'bg-orange-100 text-orange-700' },
  { id: 'transport', name: 'Transport', icon: '🚗', color: 'bg-blue-100 text-blue-700' },
  { id: 'housing', name: 'Logement', icon: '🏠', color: 'bg-green-100 text-green-700' },
  { id: 'entertainment', name: 'Loisirs', icon: '🎬', color: 'bg-purple-100 text-purple-700' },
  { id: 'health', name: 'Santé', icon: '💊', color: 'bg-red-100 text-red-700' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: 'bg-pink-100 text-pink-700' },
  { id: 'other', name: 'Autres', icon: '📝', color: 'bg-gray-100 text-gray-700' },
];

export const DEFAULT_INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salaire', icon: '💼', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'bonus', name: 'Prime', icon: '💰', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'investment', name: 'Investissement', icon: '📈', color: 'bg-teal-100 text-teal-700' },
  { id: 'gift', name: 'Cadeau', icon: '🎁', color: 'bg-rose-100 text-rose-700' },
  { id: 'other', name: 'Autres', icon: '📝', color: 'bg-gray-100 text-gray-700' },
];

// Exports pour compatibilité
export const EXPENSE_CATEGORIES = DEFAULT_EXPENSE_CATEGORIES;
export const INCOME_CATEGORIES = DEFAULT_INCOME_CATEGORIES;
export const BANK_ACCOUNT_TYPES = DEFAULT_BANK_ACCOUNT_TYPES;
export const BANK_INSTITUTIONS = DEFAULT_BANK_INSTITUTIONS;

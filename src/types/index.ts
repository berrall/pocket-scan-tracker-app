
export interface Transaction {
  id: string;
  type: 'expense' | 'income';
  amount: number;
  category: string;
  description: string;
  date: Date;
  receipt?: string; // base64 image data
}

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export const EXPENSE_CATEGORIES: Category[] = [
  { id: 'food', name: 'Alimentation', icon: '🍕', color: 'bg-orange-100 text-orange-700' },
  { id: 'transport', name: 'Transport', icon: '🚗', color: 'bg-blue-100 text-blue-700' },
  { id: 'housing', name: 'Logement', icon: '🏠', color: 'bg-green-100 text-green-700' },
  { id: 'entertainment', name: 'Loisirs', icon: '🎬', color: 'bg-purple-100 text-purple-700' },
  { id: 'health', name: 'Santé', icon: '💊', color: 'bg-red-100 text-red-700' },
  { id: 'shopping', name: 'Shopping', icon: '🛍️', color: 'bg-pink-100 text-pink-700' },
  { id: 'other', name: 'Autres', icon: '📝', color: 'bg-gray-100 text-gray-700' },
];

export const INCOME_CATEGORIES: Category[] = [
  { id: 'salary', name: 'Salaire', icon: '💼', color: 'bg-emerald-100 text-emerald-700' },
  { id: 'bonus', name: 'Prime', icon: '💰', color: 'bg-yellow-100 text-yellow-700' },
  { id: 'investment', name: 'Investissement', icon: '📈', color: 'bg-teal-100 text-teal-700' },
  { id: 'gift', name: 'Cadeau', icon: '🎁', color: 'bg-rose-100 text-rose-700' },
  { id: 'other', name: 'Autres', icon: '📝', color: 'bg-gray-100 text-gray-700' },
];

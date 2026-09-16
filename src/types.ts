export type TransactionType = 'expense' | 'income';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: TransactionType;
}

export interface Transaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  type: TransactionType;
  categoryId: string;
  categoryName: string;
  categoryIcon: string;
  categoryColor: string;
  timestamp: number; // Unix timestamp ms
  note?: string;
  paymentMethod: 'Cash' | 'Credit Card' | 'Debit Card' | 'Bank Transfer' | 'Crypto';
  syncedToCloud?: boolean;
}

export interface BudgetGoal {
  id: string;
  userId: string;
  categoryId: string;
  categoryName: string;
  monthlyLimit: number;
  month: string; // YYYY-MM
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  currency: string;
  isAnonymous?: boolean;
}

export interface FilterOptions {
  period: 'week' | 'month' | 'quarter' | 'year' | 'all';
  type: 'all' | 'expense' | 'income';
  categoryId?: string;
  searchQuery: string;
}

export interface RoomInspectionState {
  table: string;
  schemaVersion: number;
  recordCount: number;
  lastMigration: string;
  status: 'OPEN' | 'SYNCHRONIZED' | 'INDEXED';
}

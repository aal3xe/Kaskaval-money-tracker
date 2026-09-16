import { Category, Transaction } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_groceries', name: 'Food & Dining', icon: 'Utensils', color: '#F97316', type: 'expense' },
  { id: 'cat_transport', name: 'Transport & Auto', icon: 'Car', color: '#3B82F6', type: 'expense' },
  { id: 'cat_housing', name: 'Rent & Utilities', icon: 'Home', color: '#8B5CF6', type: 'expense' },
  { id: 'cat_entertainment', name: 'Entertainment', icon: 'Tv', color: '#EC4899', type: 'expense' },
  { id: 'cat_shopping', name: 'Shopping & Gear', icon: 'ShoppingBag', color: '#10B981', type: 'expense' },
  { id: 'cat_health', name: 'Health & Wellness', icon: 'HeartPulse', color: '#EF4444', type: 'expense' },
  { id: 'cat_education', name: 'Learning & Dev', icon: 'GraduationCap', color: '#6366F1', type: 'expense' },
  { id: 'cat_tech', name: 'Electronics & Gadgets', icon: 'Smartphone', color: '#06B6D4', type: 'expense' },
  // Income
  { id: 'cat_salary', name: 'Salary & Payroll', icon: 'Briefcase', color: '#10B981', type: 'income' },
  { id: 'cat_freelance', name: 'Freelance & Contract', icon: 'Laptop', color: '#3B82F6', type: 'income' },
  { id: 'cat_investments', name: 'Dividends & Crypto', icon: 'TrendingUp', color: '#8B5CF6', type: 'income' },
  { id: 'cat_gift', name: 'Gifts & Bonuses', icon: 'Gift', color: '#F59E0B', type: 'income' },
  { id: 'cat_business', name: 'Business & Sales', icon: 'Store', color: '#059669', type: 'income' },
  { id: 'cat_rental', name: 'Rental Income', icon: 'Building', color: '#0284C7', type: 'income' },
  { id: 'cat_refunds', name: 'Refunds & Cashback', icon: 'RotateCcw', color: '#6366F1', type: 'income' },
  { id: 'cat_other_income', name: 'Other Income', icon: 'PiggyBank', color: '#D97706', type: 'income' },
];

// Empty initial transactions list so user starts with a clean slate at 0.00
export const INITIAL_ROOM_TRANSACTIONS: Transaction[] = [];

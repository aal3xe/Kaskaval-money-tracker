import { Category, Transaction } from '../types';

export const DEFAULT_CATEGORIES: Category[] = [
  { id: 'cat_housing', name: 'Rent & Utilities', icon: 'Home', color: '#38BDF8', type: 'expense' },
  { id: 'cat_groceries', name: 'Food & Dining', icon: 'Utensils', color: '#F3C77C', type: 'expense' },
  { id: 'cat_entertainment', name: 'Entertainment', icon: 'Tv', color: '#FB7185', type: 'expense' },
  { id: 'cat_shopping', name: 'Savings & Investments', icon: 'PiggyBank', color: '#2DD4BF', type: 'expense' },
  { id: 'cat_health', name: 'Health & Wellness', icon: 'HeartPulse', color: '#14B8A6', type: 'expense' },
  { id: 'cat_transport', name: 'Transport & Auto', icon: 'Car', color: '#818CF8', type: 'expense' },
  { id: 'cat_tech', name: 'Electronics & Tech', icon: 'Smartphone', color: '#A78BFA', type: 'expense' },
  { id: 'cat_other', name: 'Other Expenses', icon: 'ShoppingBag', color: '#94A3B8', type: 'expense' },
  // Income
  { id: 'cat_salary', name: 'Salary & Payroll', icon: 'Briefcase', color: '#F3C77C', type: 'income' },
  { id: 'cat_freelance', name: 'Freelance & Contract', icon: 'Laptop', color: '#38BDF8', type: 'income' },
  { id: 'cat_investments', name: 'Dividends & Crypto', icon: 'TrendingUp', color: '#2DD4BF', type: 'income' },
  { id: 'cat_gift', name: 'Gifts & Bonuses', icon: 'Gift', color: '#FB7185', type: 'income' },
  { id: 'cat_business', name: 'Business & Sales', icon: 'Store', color: '#E5B869', type: 'income' },
  { id: 'cat_rental', name: 'Rental Income', icon: 'Building', color: '#0284C7', type: 'income' },
  { id: 'cat_refunds', name: 'Refunds & Cashback', icon: 'RotateCcw', color: '#818CF8', type: 'income' },
  { id: 'cat_other_income', name: 'Other Income', icon: 'Coins', color: '#D4AF37', type: 'income' },
];

// Empty initial transactions list so user starts with a clean slate at 0.00
export const INITIAL_ROOM_TRANSACTIONS: Transaction[] = [];

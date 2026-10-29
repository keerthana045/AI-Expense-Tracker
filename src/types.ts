export type ScreenId = 'onboarding' | 'home' | 'history' | 'insights' | 'profile' | 'scan';

export type ExpenseCategoryName = 'Food' | 'Travel' | 'Shopping' | 'Bills' | 'Entertainment' | 'Other';

export interface ExpenseItem {
  id: string;
  title: string;
  category: ExpenseCategoryName;
  emoji: string;
  paymentMode: string;
  amount: number;
  time: string;
  dateGroup: string;
  tags?: string[];
  note?: string;
}

export interface CategorySpend {
  name: ExpenseCategoryName;
  emoji: string;
  amount: number;
  percentage: number;
  barWidthPercent: number;
  colorClass: string;
  bgIconClass: string;
}

export interface ReceiptLineItem {
  id: string;
  qty: string;
  name: string;
  desc: string;
  receiptText: string;
  price: string;
}

export interface ReceiptSample {
  id: string;
  storeName: string;
  storeFullTitle: string;
  billMeta: string;
  location: string;
  totalAmount: string;
  dateTime: string;
  paymentMode: string;
  category: string;
  subCategory: string;
  emoji: string;
  icon: string;
  tags: string[];
  lineItems: ReceiptLineItem[];
}

export interface UserSettings {
  userName: string;
  userEmail: string;
  plan: string;
  monthlyBudget: number;
  currencyCode: 'INR' | 'USD' | 'EUR';
  currencySymbol: string;
  currencyLabel: string;
  spendingAlerts: boolean;
  weeklyAiSummary: boolean;
  smartCategorization: boolean;
  diningGoalLimit: number;
  goalActive: boolean;
}

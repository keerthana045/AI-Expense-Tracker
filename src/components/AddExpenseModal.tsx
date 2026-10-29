import React, { useState } from 'react';
import { ExpenseItem, ExpenseCategoryName, UserSettings } from '../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: UserSettings;
  onSaveExpense: (item: ExpenseItem) => void;
  onOpenScanner: () => void;
}

const CATEGORIES: { name: ExpenseCategoryName; emoji: string }[] = [
  { name: 'Food', emoji: '🍔' },
  { name: 'Travel', emoji: '🚕' },
  { name: 'Shopping', emoji: '🛍' },
  { name: 'Bills', emoji: '📱' },
  { name: 'Entertainment', emoji: '🍿' },
];

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  settings,
  onSaveExpense,
  onOpenScanner,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategoryName>('Food');
  const [paymentMode, setPaymentMode] = useState('UPI');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

    const catObj = CATEGORIES.find((c) => c.name === selectedCategory) || CATEGORIES[0];

    const newItem: ExpenseItem = {
      id: `exp-manual-${Date.now()}`,
      title: title.trim(),
      category: selectedCategory,
      emoji: catObj.emoji,
      paymentMode,
      amount: numAmount,
      time: 'Just now',
      dateGroup: 'October 8 (Today)',
    };

    onSaveExpense(newItem);
    setTitle('');
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-on-surface/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl p-5 shadow-xl border border-surface-container space-y-4">
        <div className="flex items-center justify-between border-b border-surface-container pb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary-fixed text-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">add_card</span>
            </div>
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">
              Add New Expense
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* AI Receipt Scan Banner Shortcut */}
        <button
          type="button"
          onClick={() => {
            onClose();
            onOpenScanner();
          }}
          className="w-full p-3 rounded-2xl bg-surface-container-low hover:bg-surface-container border border-primary-fixed flex items-center justify-between transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary-container text-on-primary flex items-center justify-center">
              <span className="material-symbols-outlined text-[18px]">
                document_scanner
              </span>
            </div>
            <div className="text-left">
              <span className="font-label-md text-label-md font-bold text-primary block">
                Scan Bill with SpendAI Vision
              </span>
              <span className="font-body-sm text-[11px] text-on-surface-variant">
                Auto-extract merchant, GST &amp; line items
              </span>
            </div>
          </div>
          <span className="material-symbols-outlined text-primary text-[18px]">
            arrow_forward
          </span>
        </button>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
              Amount ({settings.currencySymbol})
            </label>
            <input
              type="number"
              required
              placeholder="e.g. 450"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full h-12 px-3.5 rounded-xl bg-surface border border-outline-variant/60 font-headline-md text-headline-md text-on-surface focus:border-primary focus:outline-none tabular-nums"
            />
          </div>

          <div>
            <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
              Merchant or Description
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Zomato Lunch, Metro Recharge"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-surface border border-outline-variant/60 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                Category (NLP Auto)
              </label>
              <select
                value={selectedCategory}
                onChange={(e) =>
                  setSelectedCategory(e.target.value as ExpenseCategoryName)
                }
                className="w-full h-11 px-3 rounded-xl bg-surface border border-outline-variant/60 font-body-sm text-body-sm text-on-surface focus:border-primary focus:outline-none"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.emoji} {c.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                Payment Mode
              </label>
              <select
                value={paymentMode}
                onChange={(e) => setPaymentMode(e.target.value)}
                className="w-full h-11 px-3 rounded-xl bg-surface border border-outline-variant/60 font-body-sm text-body-sm text-on-surface focus:border-primary focus:outline-none"
              >
                <option value="UPI">UPI</option>
                <option value="Card">Card</option>
                <option value="Auto-pay">Auto-pay</option>
                <option value="Cash">Cash</option>
              </select>
            </div>
          </div>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-label-md font-semibold cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 h-11 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-bold shadow-sm cursor-pointer"
            >
              Save Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

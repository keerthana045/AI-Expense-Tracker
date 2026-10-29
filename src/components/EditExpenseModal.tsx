import React, { useState, useEffect } from 'react';
import { ExpenseItem, ExpenseCategoryName, UserSettings } from '../types';

interface EditExpenseModalProps {
  expense: ExpenseItem | null;
  onClose: () => void;
  settings: UserSettings;
  onUpdateExpense: (updated: ExpenseItem) => void;
  onDeleteExpense: (id: string) => void;
}

const CATEGORIES: { name: ExpenseCategoryName; emoji: string }[] = [
  { name: 'Food', emoji: '🍔' },
  { name: 'Travel', emoji: '🚕' },
  { name: 'Shopping', emoji: '🛍' },
  { name: 'Bills', emoji: '📱' },
  { name: 'Entertainment', emoji: '🍿' },
  { name: 'Other', emoji: '●' },
];

export const EditExpenseModal: React.FC<EditExpenseModalProps> = ({
  expense,
  onClose,
  settings,
  onUpdateExpense,
  onDeleteExpense,
}) => {
  const [title, setTitle] = useState('');
  const [amount, setAmount] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ExpenseCategoryName>('Food');
  const [paymentMode, setPaymentMode] = useState('UPI');
  const [time, setTime] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);

  useEffect(() => {
    if (expense) {
      setTitle(expense.title);
      setAmount(String(expense.amount));
      setSelectedCategory(expense.category);
      setPaymentMode(expense.paymentMode);
      setTime(expense.time);
      setConfirmDelete(false);
    }
  }, [expense]);

  if (!expense) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10);
    if (!title.trim() || isNaN(numAmount) || numAmount <= 0) return;

    const catObj =
      CATEGORIES.find((c) => c.name === selectedCategory) || CATEGORIES[0];

    onUpdateExpense({
      ...expense,
      title: title.trim(),
      amount: numAmount,
      category: selectedCategory,
      emoji: catObj.emoji === '●' ? expense.emoji : catObj.emoji,
      paymentMode,
      time: time.trim() || expense.time,
    });
    onClose();
  };

  const handleDelete = () => {
    onDeleteExpense(expense.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-on-surface/50 backdrop-blur-sm p-0 sm:p-4">
      <div className="w-full max-w-md bg-surface-container-lowest rounded-t-3xl sm:rounded-3xl p-5 shadow-xl border border-surface-container space-y-4">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-surface-container pb-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-lg">
              {expense.emoji}
            </div>
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight">
                Edit Expense
              </h2>
              <p className="font-body-sm text-[11px] text-outline">
                {expense.dateGroup}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-full flex items-center justify-center text-outline hover:bg-surface-container cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Edit Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
              Amount ({settings.currencySymbol})
            </label>
            <input
              type="number"
              required
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
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full h-11 px-3.5 rounded-xl bg-surface border border-outline-variant/60 font-body-md text-body-md text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
                Category
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

          <div>
            <label className="font-label-sm text-label-sm text-on-surface-variant block mb-1">
              Time
            </label>
            <input
              type="text"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full h-10 px-3.5 rounded-xl bg-surface border border-outline-variant/60 font-body-sm text-body-sm text-on-surface focus:border-primary focus:outline-none"
            />
          </div>

          {/* Delete Confirmation or Action Buttons */}
          {confirmDelete ? (
            <div className="p-3.5 rounded-2xl bg-error-container/40 border border-error/20 space-y-2.5">
              <p className="font-body-sm text-body-sm text-on-error-container font-medium">
                Delete &ldquo;{expense.title}&rdquo; ({settings.currencySymbol}
                {expense.amount}) permanently?
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setConfirmDelete(false)}
                  className="flex-1 h-9 rounded-xl bg-surface-container-lowest text-on-surface font-label-sm text-label-sm cursor-pointer"
                >
                  Keep Expense
                </button>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="flex-1 h-9 rounded-xl bg-error text-on-error font-label-sm text-label-sm font-bold cursor-pointer flex items-center justify-center gap-1"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    delete
                  </span>
                  Confirm Delete
                </button>
              </div>
            </div>
          ) : (
            <div className="pt-2 flex items-center gap-2">
              <button
                type="button"
                onClick={() => setConfirmDelete(true)}
                aria-label="Delete Expense"
                className="h-11 px-3.5 rounded-xl bg-error-container/40 hover:bg-error-container/70 text-error font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px]">
                  delete
                </span>
                <span>Delete</span>
              </button>

              <button
                type="button"
                onClick={onClose}
                className="flex-1 h-11 rounded-xl bg-surface-container text-on-surface-variant font-label-md text-label-md font-semibold cursor-pointer"
              >
                Cancel
              </button>

              <button
                type="submit"
                className="flex-1 h-11 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-bold shadow-sm cursor-pointer flex items-center justify-center gap-1.5"
              >
                <span className="material-symbols-outlined text-[18px]">
                  check
                </span>
                <span>Save</span>
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
};

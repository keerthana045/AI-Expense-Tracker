import React, { useState } from 'react';
import { ScreenId, ExpenseItem, UserSettings } from '../types';
import { USER_AVATAR } from '../data';
import { BottomNavBar } from './BottomNavBar';

interface ExpensesHistoryScreenProps {
  onNavigate: (screen: ScreenId) => void;
  expenses: ExpenseItem[];
  settings: UserSettings;
  selectedCategory: string;
  onSelectCategory: (cat: string) => void;
  onExportCsv: () => void;
  onEditExpense: (item: ExpenseItem) => void;
  onDeleteExpense: (id: string) => void;
  onShowToast: (msg: string) => void;
}

const FILTER_CHIPS = [
  { label: 'All', emoji: '' },
  { label: 'Food', emoji: '🍔' },
  { label: 'Travel', emoji: '🚕' },
  { label: 'Shopping', emoji: '🛍' },
  { label: 'Bills', emoji: '📱' },
];

export const ExpensesHistoryScreen: React.FC<ExpensesHistoryScreenProps> = ({
  onNavigate,
  expenses,
  settings,
  selectedCategory,
  onSelectCategory,
  onExportCsv,
  onEditExpense,
  onDeleteExpense,
  onShowToast,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortHighToLow, setSortHighToLow] = useState(false);

  const filteredExpenses = expenses
    .filter((item) => {
      const matchesCat =
        selectedCategory === 'All' || item.category === selectedCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        item.title.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q) ||
        item.paymentMode.toLowerCase().includes(q) ||
        (item.tags && item.tags.some((t) => t.toLowerCase().includes(q)));
      return matchesCat && matchesQuery;
    })
    .sort((a, b) => (sortHighToLow ? b.amount - a.amount : 0));

  const todayExpenses = filteredExpenses.filter(
    (e) => e.dateGroup === 'October 8 (Today)'
  );
  const oct7Expenses = filteredExpenses.filter(
    (e) => e.dateGroup === 'October 7'
  );

  const todayTotal = expenses
    .filter((e) => e.dateGroup === 'October 8 (Today)')
    .reduce((sum, e) => sum + e.amount, 0);
  const todayCount = expenses.filter(
    (e) => e.dateGroup === 'October 8 (Today)'
  ).length;

  const renderExpenseCard = (item: ExpenseItem) => (
    <div
      key={item.id}
      onClick={() => onEditExpense(item)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onEditExpense(item)}
      className="bg-surface-container-lowest p-3.5 rounded-2xl border border-outline-variant/30 shadow-sm flex items-center justify-between hover:bg-surface-container-low transition-colors cursor-pointer group"
    >
      <div className="flex items-center gap-3 min-w-0">
        <div className="w-11 h-11 rounded-2xl bg-surface-container flex items-center justify-center text-xl shrink-0">
          {item.emoji}
        </div>
        <div className="flex flex-col min-w-0">
          <span className="text-headline-sm font-headline-sm text-on-surface text-sm font-semibold leading-snug truncate">
            {item.title}
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-body-sm font-body-sm text-outline">
              {item.category}
            </span>
            <span className="w-1 h-1 rounded-full bg-outline-variant"></span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface font-label-sm text-[10px] leading-tight">
              {item.paymentMode}
            </span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <div className="text-right">
          <span className="text-currency-tabular font-currency-tabular text-on-surface font-bold text-base block tabular-nums">
            -{settings.currencySymbol}
            {item.amount.toLocaleString('en-IN')}
          </span>
          <span className="text-[11px] font-body-sm text-outline">
            {item.time}
          </span>
        </div>

        {/* Inline Edit & Delete Action Triggers */}
        <div className="flex items-center gap-0.5 pl-1 border-l border-surface-container">
          <button
            type="button"
            title="Edit expense"
            aria-label={`Edit ${item.title}`}
            onClick={(e) => {
              e.stopPropagation();
              onEditExpense(item);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-primary hover:bg-surface-container transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">edit</span>
          </button>
          <button
            type="button"
            title="Delete expense"
            aria-label={`Delete ${item.title}`}
            onClick={(e) => {
              e.stopPropagation();
              onDeleteExpense(item.id);
            }}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-outline hover:text-error hover:bg-error-container/40 transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[17px]">
              delete
            </span>
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="w-full max-w-md mx-auto flex flex-col justify-between min-h-[840px] bg-background relative shadow-sm">
      {/* Top Bar Component */}
      <header className="bg-surface sticky top-0 z-30 shadow-sm">
        <div className="flex justify-between items-center w-full px-4 pt-4 pb-3 max-w-md mx-auto">
          <div
            onClick={() => onNavigate('home')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('home')}
            className="flex items-center gap-3 cursor-pointer"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden ring-2 ring-surface-container bg-surface-container-high flex items-center justify-center shrink-0">
              <img
                src={USER_AVATAR}
                alt="Keerthana profile portrait"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <span className="text-headline-sm font-headline-sm font-bold text-primary block leading-none">
                SpendAI
              </span>
              <span className="text-body-sm font-body-sm text-outline">
                Smart Ledger
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Notifications"
              onClick={() =>
                onShowToast('Tap any expense or use the edit/trash icons to modify it.')
              }
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface hover:bg-surface-container transition-colors active:scale-95 duration-150 cursor-pointer"
            >
              <span className="material-symbols-outlined text-outline">
                notifications
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="px-4 flex-1 flex flex-col gap-5 pt-2 pb-6">
        {/* Screen Title & Export Action Header */}
        <section className="flex items-center justify-between mt-1">
          <div>
            <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight">
              Expenses
            </h1>
            <p className="text-body-sm font-body-sm text-on-surface-variant">
              Track, filter, edit, or remove your monthly cash outflow
            </p>
          </div>
          <button
            type="button"
            onClick={onExportCsv}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md transition-colors active:scale-95 duration-150 border border-outline-variant/30 shadow-sm cursor-pointer shrink-0"
          >
            <span className="material-symbols-outlined text-base">ios_share</span>
            <span>Export</span>
          </button>
        </section>

        {/* Search Input Container */}
        <section className="relative w-full">
          <div className="relative flex items-center">
            <span className="material-symbols-outlined absolute left-3.5 text-outline pointer-events-none">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search expenses, merchants, tags..."
              className="w-full h-12 pl-11 pr-10 bg-surface-container-lowest border border-outline-variant/50 rounded-xl text-body-md font-body-md text-on-surface placeholder:text-outline focus:outline-none focus:border-primary-container focus:ring-2 focus:ring-primary-container/20 transition-all shadow-sm"
            />
            <button
              type="button"
              onClick={() => {
                setSortHighToLow((prev) => !prev);
                onShowToast(
                  !sortHighToLow
                    ? 'Sorted expenses: Highest amount first'
                    : 'Sorted expenses: Chronological order'
                );
              }}
              title="Toggle amount sort"
              className={`absolute right-3 w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer ${
                sortHighToLow
                  ? 'bg-primary-fixed text-primary'
                  : 'text-outline hover:text-on-surface'
              }`}
            >
              <span className="material-symbols-outlined text-sm">tune</span>
            </button>
          </div>
        </section>

        {/* Filter Chips Horizontal Scroll */}
        <section className="w-full overflow-x-auto no-scrollbar -mx-4 px-4 flex items-center gap-2 py-1">
          {FILTER_CHIPS.map((chip) => {
            const isSelected = selectedCategory === chip.label;
            return (
              <button
                key={chip.label}
                type="button"
                onClick={() => onSelectCategory(chip.label)}
                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-label-sm text-label-sm shrink-0 active:scale-95 transition-all cursor-pointer ${
                  isSelected
                    ? 'px-4 bg-primary-container text-surface-container-lowest shadow-sm'
                    : 'bg-surface-container-lowest border border-outline-variant/40 hover:bg-surface-container text-on-surface'
                }`}
              >
                {chip.emoji && <span>{chip.emoji}</span>}
                <span>{chip.label}</span>
              </button>
            );
          })}
        </section>

        {/* AI Summary Bento Snippet */}
        <div
          onClick={() => onNavigate('insights')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('insights')}
          className="bg-surface-container-lowest p-4 rounded-2xl border border-outline-variant/30 flex items-center justify-between shadow-sm relative overflow-hidden cursor-pointer hover:border-primary/40 transition-colors"
        >
          <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary"></div>
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-surface-container flex items-center justify-center text-primary shrink-0">
              <span className="material-symbols-outlined text-lg">insights</span>
            </div>
            <div>
              <div className="text-label-sm font-label-sm text-primary uppercase tracking-wide">
                Daily Velocity
              </div>
              <div className="text-body-sm font-body-sm text-on-surface">
                You spent{' '}
                <strong className="text-on-surface font-semibold tabular-nums">
                  {settings.currencySymbol}
                  {todayTotal.toLocaleString('en-IN')}
                </strong>{' '}
                today across {todayCount} orders.
              </div>
            </div>
          </div>
          <span className="material-symbols-outlined text-outline text-lg">
            chevron_right
          </span>
        </div>

        {/* Date-grouped Expense List */}
        <div className="flex flex-col gap-6 mt-1">
          {filteredExpenses.length === 0 ? (
            <div className="bg-surface-container-lowest rounded-2xl p-8 text-center border border-outline-variant/30">
              <p className="font-headline-sm text-headline-sm text-on-surface">
                No matching transactions
              </p>
              <p className="font-body-sm text-body-sm text-outline mt-1">
                Try clearing your search query or switching category filters.
              </p>
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  onSelectCategory('All');
                }}
                className="mt-3 px-4 py-2 rounded-xl bg-primary-container text-on-primary font-label-sm text-label-sm cursor-pointer"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <>
              {/* Group: October 8 (Today) */}
              {todayExpenses.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-label-md font-label-md text-on-surface-variant font-semibold">
                      October 8 (Today)
                    </h2>
                    <span className="text-body-sm font-body-sm text-outline">
                      {todayExpenses.length} transactions
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {todayExpenses.map(renderExpenseCard)}
                  </div>
                </div>
              )}

              {/* Group: October 7 */}
              {oct7Expenses.length > 0 && (
                <div className="flex flex-col gap-2.5">
                  <div className="flex items-center justify-between px-1">
                    <h2 className="text-label-md font-label-md text-on-surface-variant font-semibold">
                      October 7
                    </h2>
                    <span className="text-body-sm font-body-sm text-outline">
                      {oct7Expenses.length} transactions
                    </span>
                  </div>
                  <div className="flex flex-col gap-2">
                    {oct7Expenses.map(renderExpenseCard)}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNavBar activeScreen="history" onNavigate={onNavigate} />
    </div>
  );
};

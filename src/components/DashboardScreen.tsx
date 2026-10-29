import React, { useState } from 'react';
import { ScreenId, CategorySpend, ExpenseItem, UserSettings } from '../types';
import { USER_AVATAR } from '../data';
import { BottomNavBar } from './BottomNavBar';

interface DashboardScreenProps {
  onNavigate: (screen: ScreenId) => void;
  categories: CategorySpend[];
  expenses: ExpenseItem[];
  totalSpent: number;
  todaySpent: number;
  settings: UserSettings;
  onAddQuickExpense: () => void;
  onEditExpense: (item: ExpenseItem) => void;
  onDeleteExpense: (id: string) => void;
  onSelectCategoryFilter: (cat: string) => void;
  onShowToast: (msg: string) => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  onNavigate,
  categories,
  expenses,
  totalSpent,
  todaySpent,
  settings,
  onAddQuickExpense,
  onEditExpense,
  onDeleteExpense,
  onSelectCategoryFilter,
  onShowToast,
}) => {
  const [hasUnreadNotif, setHasUnreadNotif] = useState(true);

  const monthlyBudget = settings.monthlyBudget;
  const leftAmount = Math.max(0, monthlyBudget - totalSpent);
  const spentPercent = Math.min(
    100,
    Math.round((totalSpent / monthlyBudget) * 100)
  );

  // Newly added expenses (any added beyond the initial 6 or top recent items)
  const recentAddedExpenses = expenses.filter(
    (e) => e.id.startsWith('exp-manual-') || e.id.startsWith('exp-scan-')
  );

  return (
    <div className="w-full max-w-md mx-auto min-h-[840px] flex flex-col justify-between relative bg-background text-on-surface select-none">
      {/* Top App Bar */}
      <header className="sticky top-0 z-30 bg-surface shadow-sm transition-colors">
        <div className="flex justify-between items-center w-full px-4 pt-3 pb-3 max-w-md mx-auto">
          <div
            onClick={() => onNavigate('profile')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('profile')}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="relative w-10 h-10 rounded-full overflow-hidden ring-2 ring-surface-container bg-primary-fixed shrink-0">
              <img
                src={USER_AVATAR}
                alt="Keerthana profile portrait"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover"
              />
            </div>
            <div>
              <div className="flex items-center space-x-1">
                <h1 className="font-headline-sm text-headline-sm text-on-surface font-bold">
                  Good morning, Keerthana
                </h1>
                <span className="text-headline-sm">👋</span>
              </div>
              <p className="font-label-sm text-label-sm text-outline">
                October 2026
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="Notifications"
            onClick={() => {
              setHasUnreadNotif(false);
              onShowToast(
                `AI Alert: You are within ${spentPercent}% of your October budget.`
              );
            }}
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors active:scale-95 duration-150 relative cursor-pointer"
          >
            <span className="material-symbols-outlined">notifications</span>
            {hasUnreadNotif && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-error ring-2 ring-surface"></span>
            )}
          </button>
        </div>
      </header>

      {/* Main Dashboard Content Canvas */}
      <main className="flex-1 px-4 pt-3 pb-6 space-y-4">
        {/* Hero Spending Card */}
        <section className="bg-surface-container-lowest rounded-2xl p-5 shadow-[0px_2px_8px_-2px_rgba(15,23,42,0.04),0px_1px_2px_0px_rgba(15,23,42,0.02)] border border-[#F1F5F9] relative overflow-hidden">
          <div className="flex justify-between items-start mb-1">
            <span className="font-label-md text-label-md text-outline">
              Total spent this month
            </span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full font-label-sm text-label-sm bg-[#ECFDF5] text-[#065F46]">
              On Budget
            </span>
          </div>

          <div className="flex items-baseline space-x-1 mb-5">
            <span className="font-display-currency-mobile text-display-currency-mobile text-on-surface tracking-tight tabular-nums">
              {settings.currencySymbol}
              {totalSpent.toLocaleString('en-IN')}
            </span>
            <span className="font-label-sm text-label-sm text-outline">.00</span>
          </div>

          {/* Progress Metrics & Bar */}
          <div className="space-y-2">
            <div className="flex justify-between items-center font-label-md text-label-md">
              <span className="text-on-surface-variant font-medium tabular-nums">
                {settings.currencySymbol}
                {totalSpent.toLocaleString('en-IN')}{' '}
                <span className="text-outline font-normal">
                  / {settings.currencySymbol}
                  {monthlyBudget.toLocaleString('en-IN')}
                </span>
              </span>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full font-label-sm text-label-sm bg-[#EEF2FF] text-primary-container font-semibold tabular-nums">
                {settings.currencySymbol}
                {leftAmount.toLocaleString('en-IN')} left
              </span>
            </div>

            {/* Progress Bar Container */}
            <div className="w-full bg-[#F1F5F9] rounded-full h-2.5 overflow-hidden p-[1px]">
              <div
                className="bg-primary-container h-full rounded-full transition-all duration-500 ease-out"
                style={{ width: `${spentPercent}%` }}
              ></div>
            </div>

            <div className="flex justify-between items-center text-outline font-label-sm text-label-sm pt-0.5">
              <span>{spentPercent}% of monthly limit</span>
              <span>22 days elapsed</span>
            </div>
          </div>
        </section>

        {/* Quick Stats Grid (2 Columns) */}
        <section className="grid grid-cols-2 gap-3">
          {/* Card 1: Today */}
          <div
            onClick={() => onNavigate('history')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('history')}
            className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0px_2px_8px_-2px_rgba(15,23,42,0.04)] border border-[#F1F5F9] flex flex-col justify-between hover:border-primary/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-label-sm text-outline">
                Today
              </span>
              <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[16px]">
                  today
                </span>
              </div>
            </div>
            <div>
              <div className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight tabular-nums">
                {settings.currencySymbol}
                {todaySpent.toLocaleString('en-IN')}
              </div>
              <div className="font-label-sm text-label-sm text-secondary font-medium mt-0.5 flex items-center space-x-0.5">
                <span className="material-symbols-outlined text-[13px]">
                  trending_down
                </span>
                <span>12% less</span>
              </div>
            </div>
          </div>

          {/* Card 2: Daily Average */}
          <div
            onClick={() => onNavigate('insights')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('insights')}
            className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0px_2px_8px_-2px_rgba(15,23,42,0.04)] border border-[#F1F5F9] flex flex-col justify-between hover:border-primary/30 transition-colors cursor-pointer"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="font-label-sm text-label-sm text-outline">
                Daily Average
              </span>
              <div className="w-7 h-7 rounded-full bg-surface-container flex items-center justify-center text-primary-container">
                <span className="material-symbols-outlined text-[16px]">
                  query_stats
                </span>
              </div>
            </div>
            <div>
              <div className="font-headline-md text-headline-md text-on-surface font-bold tracking-tight tabular-nums">
                {settings.currencySymbol}
                {Math.round(totalSpent / 30).toLocaleString('en-IN')}
              </div>
              <div className="font-label-sm text-label-sm text-outline mt-0.5">
                Target: {settings.currencySymbol}806/day
              </div>
            </div>
          </div>
        </section>

        {/* Recently Added Expenses Card (Appears when user adds/scans new expenses so they can immediately Edit or Delete) */}
        {recentAddedExpenses.length > 0 && (
          <section className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0px_2px_8px_-2px_rgba(15,23,42,0.04)] border border-primary-fixed space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="font-label-md text-label-md font-bold text-primary">
                Recently Added Expenses
              </span>
              <button
                type="button"
                onClick={() => onNavigate('history')}
                className="font-label-sm text-label-sm text-outline hover:text-primary cursor-pointer"
              >
                Manage All →
              </button>
            </div>
            <div className="space-y-2">
              {recentAddedExpenses.map((item) => (
                <div
                  key={item.id}
                  onClick={() => onEditExpense(item)}
                  className="p-2.5 rounded-xl bg-surface-container-low/60 border border-surface-container flex items-center justify-between cursor-pointer hover:bg-surface-container-low transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-base">{item.emoji}</span>
                    <div className="min-w-0">
                      <p className="font-label-md text-label-md font-semibold text-on-surface truncate">
                        {item.title}
                      </p>
                      <p className="font-body-sm text-[11px] text-outline">
                        {item.category} • {item.paymentMode}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="font-currency-tabular text-currency-tabular font-bold text-on-surface tabular-nums mr-1">
                      -{settings.currencySymbol}
                      {item.amount.toLocaleString('en-IN')}
                    </span>
                    <button
                      type="button"
                      title="Edit expense"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditExpense(item);
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-primary hover:bg-surface-container cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        edit
                      </span>
                    </button>
                    <button
                      type="button"
                      title="Delete expense"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteExpense(item.id);
                      }}
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-error hover:bg-error-container/50 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        delete
                      </span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* AI Insight Card */}
        <section
          onClick={() => onNavigate('insights')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('insights')}
          className="bg-surface-container-lowest rounded-2xl p-4 border border-indigo-100 shadow-[0px_4px_16px_-4px_rgba(67,56,202,0.08)] relative overflow-hidden cursor-pointer hover:border-primary/40 transition-colors"
        >
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary-fixed opacity-40 rounded-full blur-2xl pointer-events-none"></div>
          <div className="flex items-center justify-between mb-2">
            <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-primary-fixed text-primary font-label-sm text-label-sm font-semibold">
              <span
                className="material-symbols-outlined filled text-[14px]"
                data-weight="fill"
              >
                auto_awesome
              </span>
              <span>AI Insight</span>
            </div>
            <span className="font-label-sm text-label-sm text-outline">
              Just now
            </span>
          </div>
          <p className="font-body-md text-body-md text-on-surface leading-relaxed mt-1">
            You&apos;re spending{' '}
            <strong className="text-primary-container font-semibold">
              32% more
            </strong>{' '}
            on food this month. Reducing dining expenses could save{' '}
            <span className="font-currency-tabular text-currency-tabular font-semibold text-secondary">
              ~{settings.currencySymbol}1,200
            </span>
            .
          </p>
        </section>

        {/* Spending by Category List */}
        <section className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0px_2px_8px_-2px_rgba(15,23,42,0.04)] border border-[#F1F5F9]">
          <div className="flex justify-between items-center mb-3">
            <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">
              Spending by Category
            </h2>
            <button
              type="button"
              onClick={() => {
                onSelectCategoryFilter('All');
                onNavigate('history');
              }}
              className="font-label-sm text-label-sm text-primary hover:underline cursor-pointer"
            >
              View All
            </button>
          </div>

          <div className="space-y-3.5">
            {categories.slice(0, 4).map((cat) => (
              <div
                key={cat.name}
                onClick={() => {
                  onSelectCategoryFilter(cat.name);
                  onNavigate('history');
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSelectCategoryFilter(cat.name);
                    onNavigate('history');
                  }
                }}
                className="cursor-pointer group"
              >
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center space-x-2.5">
                    <span
                      className={`w-8 h-8 rounded-full ${cat.bgIconClass} flex items-center justify-center text-sm group-hover:scale-105 transition-transform`}
                    >
                      {cat.emoji}
                    </span>
                    <span className="font-label-md text-label-md font-semibold text-on-surface group-hover:text-primary transition-colors">
                      {cat.name}
                    </span>
                  </div>
                  <span className="font-currency-tabular text-currency-tabular text-on-surface font-semibold">
                    {settings.currencySymbol}
                    {cat.amount.toLocaleString('en-IN')}
                  </span>
                </div>
                <div className="w-full bg-[#F1F5F9] rounded-full h-1.5 overflow-hidden">
                  <div
                    className={`${cat.colorClass} h-full rounded-full transition-all duration-500`}
                    style={{ width: `${cat.barWidthPercent}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Prominent Elevated Action Button: + Add Expense */}
        <section className="pt-1 pb-2 flex gap-2.5">
          <button
            type="button"
            onClick={onAddQuickExpense}
            className="flex-1 h-12 bg-primary-container text-on-primary rounded-[14px] font-label-md text-label-md font-bold flex items-center justify-center space-x-2 shadow-[0px_4px_14px_rgba(67,56,202,0.35)] hover:bg-[#3730A3] active:scale-[0.98] transition-all duration-150 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">add</span>
            <span>Add Expense</span>
          </button>

          <button
            type="button"
            onClick={() => onNavigate('scan')}
            title="Scan Receipt with SpendAI Vision"
            className="h-12 px-4 bg-surface-container-low hover:bg-surface-container text-primary border border-primary-fixed-dim rounded-[14px] font-label-md text-label-md font-bold flex items-center justify-center space-x-1.5 active:scale-[0.98] transition-all duration-150 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">
              document_scanner
            </span>
            <span className="hidden sm:inline">Scan</span>
          </button>
        </section>
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNavBar activeScreen="home" onNavigate={onNavigate} />
    </div>
  );
};

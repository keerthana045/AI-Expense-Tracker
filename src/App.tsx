import React, { useState, useMemo } from 'react';
import { ScreenId, ExpenseItem, CategorySpend, UserSettings } from './types';
import {
  INITIAL_EXPENSES,
  INITIAL_CATEGORIES,
  INITIAL_SETTINGS,
  SCREEN_METADATA,
} from './data';
import { OnboardingScreen } from './components/OnboardingScreen';
import { DashboardScreen } from './components/DashboardScreen';
import { ExpensesHistoryScreen } from './components/ExpensesHistoryScreen';
import { InsightsScreen } from './components/InsightsScreen';
import { ProfileSettingsScreen } from './components/ProfileSettingsScreen';
import { ScanReceiptScreen } from './components/ScanReceiptScreen';
import { AddExpenseModal } from './components/AddExpenseModal';
import { EditExpenseModal } from './components/EditExpenseModal';

const INITIAL_SUM_BY_CAT: Record<string, number> = {
  Food: 370, // 250 + 120 in initial list
  Travel: 180,
  Shopping: 899,
  Bills: 1099,
  Entertainment: 450,
  Other: 0,
};

const INITIAL_TOTAL_LIST_SUM = 2998; // Sum of the 6 initial items
const BASELINE_MONTH_TOTAL = 18450; // Screenshot baseline
const INITIAL_TODAY_LIST_SUM = 1329; // 250 + 180 + 899
const BASELINE_TODAY_TOTAL = 850; // Screenshot baseline

export default function App() {
  const [activeScreen, setActiveScreen] = useState<ScreenId>('home');
  const [viewMode, setViewMode] = useState<'single' | 'gallery'>('single');
  const [expenses, setExpenses] = useState<ExpenseItem[]>(INITIAL_EXPENSES);
  const [settings, setSettings] = useState<UserSettings>(INITIAL_SETTINGS);
  const [selectedHistoryCategory, setSelectedHistoryCategory] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<ExpenseItem | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((current) => (current === msg ? null : current));
    }, 3200);
  };

  // Dynamically compute category totals & percentages whenever expenses are added, edited, or deleted
  const categories: CategorySpend[] = useMemo(() => {
    const currentSumByCat: Record<string, number> = {
      Food: 0,
      Travel: 0,
      Shopping: 0,
      Bills: 0,
      Entertainment: 0,
      Other: 0,
    };

    expenses.forEach((e) => {
      currentSumByCat[e.category] = (currentSumByCat[e.category] || 0) + e.amount;
    });

    const updatedCats = INITIAL_CATEGORIES.map((baseCat) => {
      let delta = 0;
      if (baseCat.name === 'Other') {
        const entDelta =
          (currentSumByCat.Entertainment || 0) -
          (INITIAL_SUM_BY_CAT.Entertainment || 0);
        const otherDelta =
          (currentSumByCat.Other || 0) - (INITIAL_SUM_BY_CAT.Other || 0);
        delta = entDelta + otherDelta;
      } else {
        delta =
          (currentSumByCat[baseCat.name] || 0) -
          (INITIAL_SUM_BY_CAT[baseCat.name] || 0);
      }
      const newAmount = Math.max(0, baseCat.amount + delta);
      return {
        ...baseCat,
        amount: newAmount,
      };
    });

    const grandTotal =
      updatedCats.reduce((acc, c) => acc + c.amount, 0) || 1;

    return updatedCats.map((c) => {
      const pct = Math.round((c.amount / grandTotal) * 100);
      return {
        ...c,
        percentage: pct,
        barWidthPercent: Math.min(100, Math.max(8, Math.round((c.amount / 8000) * 100))),
      };
    });
  }, [expenses]);

  const totalSpent = useMemo(() => {
    const currentListSum = expenses.reduce((sum, e) => sum + e.amount, 0);
    return Math.max(0, BASELINE_MONTH_TOTAL + (currentListSum - INITIAL_TOTAL_LIST_SUM));
  }, [expenses]);

  const todaySpent = useMemo(() => {
    const currentTodaySum = expenses
      .filter((e) => e.dateGroup === 'October 8 (Today)')
      .reduce((sum, e) => sum + e.amount, 0);
    return Math.max(0, BASELINE_TODAY_TOTAL + (currentTodaySum - INITIAL_TODAY_LIST_SUM));
  }, [expenses]);

  const handleAddExpense = (newExpense: ExpenseItem) => {
    setExpenses((prev) => [newExpense, ...prev]);
    showToast(
      `Added "${newExpense.title}" (${settings.currencySymbol}${newExpense.amount}) — tap to edit or delete anytime.`
    );
  };

  const handleUpdateExpense = (updated: ExpenseItem) => {
    setExpenses((prev) =>
      prev.map((item) => (item.id === updated.id ? updated : item))
    );
    showToast(
      `Updated "${updated.title}" (${settings.currencySymbol}${updated.amount})`
    );
  };

  const handleDeleteExpense = (id: string) => {
    const target = expenses.find((e) => e.id === id);
    setExpenses((prev) => prev.filter((item) => item.id !== id));
    if (target) {
      showToast(
        `Deleted "${target.title}" (${settings.currencySymbol}${target.amount})`
      );
    }
  };

  const handleUpdateSettings = (partial: Partial<UserSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const handleToggleGoal = () => {
    const nextState = !settings.goalActive;
    setSettings((prev) => ({ ...prev, goalActive: nextState }));
    showToast(
      nextState
        ? `AI Goal Set: Keep dining expenses under ${settings.currencySymbol}${settings.diningGoalLimit.toLocaleString('en-IN')}/mo`
        : 'Dining spending goal paused.'
    );
  };

  const handleExportCsv = () => {
    const headers = ['Date,Title,Category,PaymentMode,Amount'];
    const rows = expenses.map(
      (e) =>
        `"${e.dateGroup}","${e.title}","${e.category}","${e.paymentMode}",${e.amount}`
    );
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'SpendAI_October_2026_Statement.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Exported SpendAI_October_2026_Statement.csv');
  };

  const renderScreen = (screenId: ScreenId, isGalleryPreview = false) => {
    const navigateHandler = (target: ScreenId) => {
      setActiveScreen(target);
      if (isGalleryPreview) {
        setViewMode('single');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    };

    switch (screenId) {
      case 'onboarding':
        return (
          <OnboardingScreen
            onNavigate={navigateHandler}
            onShowToast={showToast}
          />
        );
      case 'home':
        return (
          <DashboardScreen
            onNavigate={navigateHandler}
            categories={categories}
            expenses={expenses}
            totalSpent={totalSpent}
            todaySpent={todaySpent}
            settings={settings}
            onAddQuickExpense={() => setIsAddModalOpen(true)}
            onEditExpense={(item) => setEditingExpense(item)}
            onDeleteExpense={handleDeleteExpense}
            onSelectCategoryFilter={setSelectedHistoryCategory}
            onShowToast={showToast}
          />
        );
      case 'history':
        return (
          <ExpensesHistoryScreen
            onNavigate={navigateHandler}
            expenses={expenses}
            settings={settings}
            selectedCategory={selectedHistoryCategory}
            onSelectCategory={setSelectedHistoryCategory}
            onExportCsv={handleExportCsv}
            onEditExpense={(item) => setEditingExpense(item)}
            onDeleteExpense={handleDeleteExpense}
            onShowToast={showToast}
          />
        );
      case 'insights':
        return (
          <InsightsScreen
            onNavigate={navigateHandler}
            categories={categories}
            settings={settings}
            onToggleGoal={handleToggleGoal}
            onSelectCategoryFilter={setSelectedHistoryCategory}
            onShowToast={showToast}
          />
        );
      case 'profile':
        return (
          <ProfileSettingsScreen
            onNavigate={navigateHandler}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onExportCsv={handleExportCsv}
            onShowToast={showToast}
          />
        );
      case 'scan':
        return (
          <ScanReceiptScreen
            onNavigate={navigateHandler}
            settings={settings}
            onAddScannedExpense={handleAddExpense}
            onShowToast={showToast}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-[#EEF2FF]/60 text-on-surface flex flex-col">
      {/* Desktop Top Studio Bar (Follows 3-Zone Top Bar Contract on Desktop) */}
      <header className="hidden lg:flex items-center justify-between gap-8 px-8 py-3 bg-surface-container-lowest border-b border-surface-container-high sticky top-0 z-50">
        {/* Zone 1: Brand Wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveScreen('home');
            setViewMode('single');
          }}
          className="font-headline-md text-headline-md font-bold tracking-tight text-primary whitespace-nowrap shrink-0"
        >
          SpendAI
        </a>

        {/* Zone 2: Concise Single-Line Screen Navigation Links */}
        <nav className="flex items-center gap-6 text-body-md font-medium text-on-surface-variant">
          {SCREEN_METADATA.map((item) => {
            const isCurrent = viewMode === 'single' && activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setActiveScreen(item.id);
                  setViewMode('single');
                }}
                className={`py-1 transition-colors whitespace-nowrap shrink-0 cursor-pointer border-b-2 ${
                  isCurrent
                    ? 'text-primary font-semibold border-primary'
                    : 'border-transparent hover:text-primary'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Action (Toggle All 6 Screens Gallery vs Interactive Phone View) */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={() =>
              setViewMode((prev) => (prev === 'single' ? 'gallery' : 'single'))
            }
            className="px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-semibold transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
          >
            {viewMode === 'single' ? 'View All 6 Screens' : 'Single Screen View'}
          </button>
        </div>
      </header>

      {/* Mobile / Tablet Quick Screen Switcher Strip */}
      <div className="lg:hidden bg-surface-container-lowest border-b border-surface-container px-3 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
        {SCREEN_METADATA.map((item) => {
          const isCurrent = viewMode === 'single' && activeScreen === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setActiveScreen(item.id);
                setViewMode('single');
              }}
              className={`px-3 py-1.5 rounded-full font-label-sm text-label-sm whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                isCurrent
                  ? 'bg-primary-container text-on-primary font-semibold'
                  : 'bg-surface-container-low text-on-surface-variant'
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {/* Main Workspace Area */}
      {viewMode === 'single' ? (
        <div className="flex-1 w-full max-w-7xl mx-auto lg:py-8 lg:px-8 flex flex-col lg:flex-row items-center lg:items-start justify-center gap-10">
          {/* Interactive Mobile Viewport Shell */}
          <div className="w-full max-w-md bg-background lg:rounded-[36px] lg:shadow-[0_24px_60px_-15px_rgba(42,20,180,0.14)] lg:border-[6px] lg:border-surface-container-lowest overflow-hidden relative">
            {renderScreen(activeScreen)}
          </div>

          {/* Desktop Companion Context & Interactive Screen Switcher Card */}
          <aside className="hidden lg:flex flex-col w-80 shrink-0 space-y-5 pt-2">
            <div className="bg-surface-container-lowest rounded-3xl p-5 border border-surface-container-high shadow-xs space-y-4">
              <div>
                <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider">
                  Interactive Prototype
                </span>
                <h2 className="font-headline-md text-headline-md text-on-surface font-bold mt-1">
                  SpendAI Suite
                </h2>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1 leading-relaxed">
                  Explore all 6 interconnected screens with live expense tracking,
                  edit/delete controls, Google Vision receipt OCR, and budget guardrails.
                </p>
              </div>

              <div className="space-y-1.5">
                {SCREEN_METADATA.map((scr) => {
                  const active = activeScreen === scr.id;
                  return (
                    <button
                      key={scr.id}
                      type="button"
                      onClick={() => setActiveScreen(scr.id)}
                      className={`w-full px-3.5 py-2.5 rounded-2xl flex items-center justify-between text-left transition-all cursor-pointer ${
                        active
                          ? 'bg-primary-container text-on-primary font-semibold shadow-xs'
                          : 'hover:bg-surface-container-low text-on-surface'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="material-symbols-outlined text-[18px]">
                          {scr.icon}
                        </span>
                        <span className="font-label-md text-label-md">
                          {scr.label}
                        </span>
                      </div>
                      <span
                        className={`font-label-sm text-[10px] px-2 py-0.5 rounded-full ${
                          active
                            ? 'bg-white/20 text-white'
                            : 'bg-surface-container text-on-surface-variant'
                        }`}
                      >
                        {scr.badge}
                      </span>
                    </button>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-surface-container flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="w-full h-10 rounded-xl bg-surface-container-low hover:bg-surface-container text-primary font-label-md text-label-md font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    add_circle
                  </span>
                  <span>Quick Add Expense</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('gallery')}
                  className="w-full h-10 rounded-xl border border-outline-variant/50 hover:bg-surface-container-low text-on-surface-variant font-label-md text-label-md font-medium flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">
                    grid_view
                  </span>
                  <span>Compare All 6 Screens</span>
                </button>
              </div>
            </div>
          </aside>
        </div>
      ) : (
        /* All 6 Screens Gallery View */
        <div className="flex-1 w-full max-w-[1440px] mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="font-headline-lg text-headline-lg text-on-surface font-bold">
                All 6 SpendAI Screens
              </h2>
              <p className="font-body-md text-body-md text-on-surface-variant">
                Every screen below is live and interactive. Click any control or
                select &quot;Focus Screen&quot; to inspect in single-screen mode.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className="px-4 py-2.5 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold cursor-pointer"
            >
              Return to Single View
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8 items-start">
            {SCREEN_METADATA.map((scr) => (
              <div key={scr.id} className="flex flex-col items-center space-y-3">
                <div className="w-full max-w-md flex items-center justify-between px-2">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary text-[20px]">
                      {scr.icon}
                    </span>
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold">
                      {scr.label}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setActiveScreen(scr.id);
                      setViewMode('single');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="font-label-sm text-label-sm text-primary hover:underline cursor-pointer"
                  >
                    Focus Screen →
                  </button>
                </div>
                <div className="w-full max-w-md bg-background rounded-[32px] shadow-[0_16px_40px_-12px_rgba(42,20,180,0.12)] border-4 border-surface-container-lowest overflow-hidden">
                  {renderScreen(scr.id, true)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Add Expense Modal */}
      <AddExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        settings={settings}
        onSaveExpense={handleAddExpense}
        onOpenScanner={() => setActiveScreen('scan')}
      />

      {/* Edit / Delete Expense Modal */}
      <EditExpenseModal
        expense={editingExpense}
        onClose={() => setEditingExpense(null)}
        settings={settings}
        onUpdateExpense={handleUpdateExpense}
        onDeleteExpense={handleDeleteExpense}
      />

      {/* Global Toast Notification Overlay */}
      <div
        className={`fixed top-16 left-1/2 -translate-x-1/2 max-w-xs w-full px-4 py-2.5 bg-inverse-surface text-inverse-on-surface rounded-xl shadow-lg flex items-center space-x-2.5 transition-all duration-300 z-50 ${
          toastMsg
            ? 'opacity-100 translate-y-2'
            : 'opacity-0 pointer-events-none -translate-y-2'
        }`}
      >
        <span className="material-symbols-outlined text-secondary-fixed text-[20px]">
          check_circle
        </span>
        <span className="font-body-sm text-body-sm flex-1 font-medium">
          {toastMsg}
        </span>
      </div>
    </div>
  );
}

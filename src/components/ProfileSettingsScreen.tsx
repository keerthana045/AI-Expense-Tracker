import React, { useState } from 'react';
import { ScreenId, UserSettings } from '../types';
import { USER_AVATAR } from '../data';
import { BottomNavBar } from './BottomNavBar';

interface ProfileSettingsScreenProps {
  onNavigate: (screen: ScreenId) => void;
  settings: UserSettings;
  onUpdateSettings: (partial: Partial<UserSettings>) => void;
  onExportCsv: () => void;
  onShowToast: (msg: string) => void;
}

const CURRENCIES: {
  code: 'INR' | 'USD' | 'EUR';
  symbol: string;
  label: string;
}[] = [
  { code: 'INR', symbol: '₹', label: '₹ INR (Indian Rupee)' },
  { code: 'USD', symbol: '$', label: '$ USD (US Dollar)' },
  { code: 'EUR', symbol: '€', label: '€ EUR (Euro)' },
];

export const ProfileSettingsScreen: React.FC<ProfileSettingsScreenProps> = ({
  onNavigate,
  settings,
  onUpdateSettings,
  onExportCsv,
  onShowToast,
}) => {
  const [isEditingBudget, setIsEditingBudget] = useState(false);
  const [budgetDraft, setBudgetDraft] = useState(String(settings.monthlyBudget));

  const handleSaveBudget = () => {
    const parsed = parseInt(budgetDraft.replace(/[^0-9]/g, ''), 10);
    if (!isNaN(parsed) && parsed >= 1000) {
      onUpdateSettings({ monthlyBudget: parsed });
      onShowToast(
        `Monthly budget updated to ${settings.currencySymbol}${parsed.toLocaleString('en-IN')}`
      );
    }
    setIsEditingBudget(false);
  };

  const handleCycleCurrency = () => {
    const idx = CURRENCIES.findIndex((c) => c.code === settings.currencyCode);
    const next = CURRENCIES[(idx + 1) % CURRENCIES.length];
    onUpdateSettings({
      currencyCode: next.code,
      currencySymbol: next.symbol,
      currencyLabel: next.label,
    });
    onShowToast(`Primary currency switched to ${next.label}`);
  };

  const spentSample = 14280;
  const spentPct = Math.round((spentSample / settings.monthlyBudget) * 100);

  return (
    <div className="w-full max-w-md mx-auto min-h-[840px] flex flex-col justify-between bg-background relative text-on-surface">
      {/* Top App Bar */}
      <header className="bg-surface shadow-sm flex justify-between items-center w-full px-4 pt-3 pb-3 max-w-md mx-auto sticky top-0 z-30 backdrop-blur-md">
        <div
          onClick={() => onNavigate('home')}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && onNavigate('home')}
          className="flex items-center space-x-3 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-full overflow-hidden border border-outline-variant/40 flex-shrink-0">
            <img
              src={USER_AVATAR}
              alt="Keerthana profile portrait"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <span className="text-headline-sm font-headline-sm font-bold text-primary tracking-tight">
            SpendAI
          </span>
        </div>

        <div className="flex items-center space-x-1">
          <button
            type="button"
            aria-label="Notifications"
            onClick={() =>
              onShowToast('All AI guardrails and budget rules are active.')
            }
            className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container transition-colors active:scale-95 duration-150 cursor-pointer"
          >
            <span className="material-symbols-outlined">notifications</span>
          </button>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="px-4 pt-4 pb-6 space-y-6 flex-1">
        {/* Section Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight">
              Settings &amp; Budget
            </h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
              Customize your financial guardrails &amp; AI automation
            </p>
          </div>
        </div>

        {/* Bento Item 1: User Profile Snippet Card */}
        <section
          onClick={() =>
            onShowToast(
              `Signed in as ${settings.userName} (${settings.userEmail})`
            )
          }
          className="bg-surface-container-lowest rounded-2xl p-4 card-ambient-shadow border border-surface-container flex items-center justify-between cursor-pointer hover:border-primary/30 transition-colors"
        >
          <div className="flex items-center space-x-3.5">
            <div className="w-13 h-13 rounded-2xl p-0.5 bg-surface-container-low flex-shrink-0 border border-outline-variant/30 overflow-hidden">
              <img
                src={USER_AVATAR}
                alt="Keerthana profile portrait"
                referrerPolicy="no-referrer"
                className="w-12 h-12 rounded-xl object-cover"
              />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="font-headline-sm text-headline-sm text-on-surface leading-tight">
                  {settings.userName}
                </h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-label-sm font-label-sm bg-surface-container text-primary font-semibold border border-primary/10">
                  {settings.plan}
                </span>
              </div>
              <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5">
                {settings.userEmail}
              </p>
            </div>
          </div>

          <button
            type="button"
            aria-label="View Account Details"
            className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container-low transition-colors active:scale-95"
          >
            <span className="material-symbols-outlined">chevron_right</span>
          </button>
        </section>

        {/* Budget Management Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase font-semibold">
              Budget Management
            </h3>
            <span className="font-label-sm text-label-sm text-secondary font-semibold flex items-center gap-1">
              <span
                className="material-symbols-outlined filled text-[14px]"
                data-weight="fill"
              >
                check_circle
              </span>
              Active Cycle
            </span>
          </div>

          {/* Monthly Budget Hero Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-5 card-ambient-shadow border border-surface-container relative overflow-hidden">
            <div className="absolute -right-8 -top-8 w-32 h-32 bg-primary-container/5 rounded-full blur-2xl pointer-events-none"></div>
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-label-md text-label-md text-on-surface-variant font-medium">
                  Monthly Budget
                </p>
                {isEditingBudget ? (
                  <div className="mt-2 flex items-center space-x-2">
                    <span className="font-display-currency-mobile text-display-currency-mobile text-primary">
                      {settings.currencySymbol}
                    </span>
                    <input
                      type="number"
                      value={budgetDraft}
                      onChange={(e) => setBudgetDraft(e.target.value)}
                      className="w-32 h-10 px-2.5 rounded-xl bg-surface border border-primary font-headline-md text-headline-md text-on-surface focus:outline-none"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div className="mt-2 flex items-baseline space-x-1.5">
                    <span className="font-display-currency-mobile text-display-currency-mobile text-on-surface tracking-tight tabular-nums">
                      {settings.currencySymbol}
                      {settings.monthlyBudget.toLocaleString('en-IN')}
                    </span>
                    <span className="font-body-sm text-body-sm text-on-surface-variant font-medium">
                      / month
                    </span>
                  </div>
                )}
              </div>

              {isEditingBudget ? (
                <button
                  type="button"
                  onClick={handleSaveBudget}
                  className="h-9 px-3.5 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md font-semibold active:scale-95 transition-all shadow-sm flex items-center space-x-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    check
                  </span>
                  <span>Save</span>
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setBudgetDraft(String(settings.monthlyBudget));
                    setIsEditingBudget(true);
                  }}
                  className="h-9 px-3.5 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md font-semibold active:scale-95 transition-all shadow-sm hover:opacity-90 flex items-center space-x-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">
                    edit
                  </span>
                  <span>Edit Budget</span>
                </button>
              )}
            </div>

            {/* Mini Budget Progress Meta */}
            <div className="mt-4 pt-3.5 border-t border-surface-container flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-secondary"></div>
                <span className="font-body-sm text-body-sm text-on-surface-variant">
                  Spent:{' '}
                  <strong className="text-on-surface font-currency-tabular text-currency-tabular tabular-nums">
                    {settings.currencySymbol}
                    {spentSample.toLocaleString('en-IN')}
                  </strong>{' '}
                  ({spentPct}%)
                </span>
              </div>
              <span className="font-label-sm text-label-sm text-secondary font-semibold bg-surface-container-low px-2 py-0.5 rounded-md">
                Healthy
              </span>
            </div>
          </div>

          {/* Currency Selector Card */}
          <div className="bg-surface-container-lowest rounded-2xl p-4 card-ambient-shadow border border-surface-container flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container-low flex items-center justify-center text-primary">
                <span className="material-symbols-outlined">payments</span>
              </div>
              <div>
                <p className="font-label-md text-label-md font-semibold text-on-surface">
                  Primary Currency
                </p>
                <p className="font-body-sm text-body-sm text-on-surface-variant">
                  {settings.currencyLabel}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleCycleCurrency}
              aria-label="Change Currency"
              className="flex items-center space-x-1 text-primary font-label-md text-label-md font-semibold py-1.5 px-3 rounded-lg hover:bg-surface-container-low transition-colors cursor-pointer"
            >
              <span>Change</span>
              <span className="material-symbols-outlined text-[18px]">
                arrow_forward_ios
              </span>
            </button>
          </div>
        </section>

        {/* Preferences & AI Toggles Section */}
        <section className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <h3 className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase font-semibold">
              Preferences &amp; AI Intelligence
            </h3>
            <span className="text-label-sm font-label-sm px-2 py-0.5 rounded-full bg-primary-container text-on-primary font-semibold flex items-center gap-1">
              <span
                className="material-symbols-outlined filled text-[13px]"
                data-weight="fill"
              >
                auto_awesome
              </span>
              AI Active
            </span>
          </div>

          <div className="bg-surface-container-lowest rounded-2xl card-ambient-shadow border border-surface-container divide-y divide-surface-container overflow-hidden">
            {/* Spending Alerts Toggle */}
            <div className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-start space-x-3.5 pr-2">
                <div className="w-9 h-9 mt-0.5 rounded-xl bg-surface-container-low flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">
                    notifications_active
                  </span>
                </div>
                <div>
                  <p className="font-label-md text-label-md font-semibold text-on-surface">
                    Spending Alerts
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-snug">
                    Notify when spending reaches 80% of budget
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  aria-label="Toggle Spending Alerts"
                  checked={settings.spendingAlerts}
                  onChange={(e) => {
                    onUpdateSettings({ spendingAlerts: e.target.checked });
                    onShowToast(
                      `Spending Alerts ${e.target.checked ? 'enabled' : 'paused'}`
                    );
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:border-outline-variant/40 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
              </label>
            </div>

            {/* Weekly AI Summary Toggle */}
            <div className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-start space-x-3.5 pr-2">
                <div className="w-9 h-9 mt-0.5 rounded-xl bg-surface-container-low flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">
                    insights
                  </span>
                </div>
                <div>
                  <p className="font-label-md text-label-md font-semibold text-on-surface">
                    Weekly AI Summary
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-snug">
                    Receive spending insights every Sunday
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  aria-label="Toggle Weekly AI Summary"
                  checked={settings.weeklyAiSummary}
                  onChange={(e) => {
                    onUpdateSettings({ weeklyAiSummary: e.target.checked });
                    onShowToast(
                      `Weekly AI Summary ${e.target.checked ? 'enabled' : 'disabled'}`
                    );
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:border-outline-variant/40 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
              </label>
            </div>

            {/* Smart Categorization Toggle */}
            <div className="p-4 flex items-center justify-between gap-3">
              <div className="flex items-start space-x-3.5 pr-2">
                <div className="w-9 h-9 mt-0.5 rounded-xl bg-surface-container-low flex items-center justify-center text-primary flex-shrink-0">
                  <span className="material-symbols-outlined text-[20px]">
                    category
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <p className="font-label-md text-label-md font-semibold text-on-surface">
                      Smart Categorization
                    </p>
                    <span className="text-[10px] font-label-sm px-1.5 py-0.5 rounded bg-surface-container text-primary font-bold">
                      NLP
                    </span>
                  </div>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-0.5 leading-snug">
                    Auto-detect merchant &amp; category via NLP
                  </p>
                </div>
              </div>

              <label className="relative inline-flex items-center cursor-pointer flex-shrink-0">
                <input
                  type="checkbox"
                  aria-label="Toggle Smart Categorization"
                  checked={settings.smartCategorization}
                  onChange={(e) => {
                    onUpdateSettings({ smartCategorization: e.target.checked });
                    onShowToast(
                      `Smart Categorization NLP ${
                        e.target.checked ? 'enabled' : 'disabled'
                      }`
                    );
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-surface-container peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-surface-container-lowest after:border-outline-variant/40 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-container"></div>
              </label>
            </div>
          </div>
        </section>

        {/* Data & Account Section */}
        <section className="space-y-3">
          <h3 className="font-label-md text-label-md text-on-surface-variant tracking-wider uppercase font-semibold px-1">
            Data &amp; Account
          </h3>
          <div className="bg-surface-container-lowest rounded-2xl card-ambient-shadow border border-surface-container overflow-hidden">
            {/* Export Expenses Action */}
            <button
              type="button"
              onClick={onExportCsv}
              className="w-full p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors text-left border-b border-surface-container active:bg-surface-container cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">
                    file_download
                  </span>
                </div>
                <div>
                  <p className="font-label-md text-label-md font-semibold text-on-surface">
                    Export Expenses
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    CSV or PDF statements
                  </p>
                </div>
              </div>
              <div className="flex items-center space-x-1.5 text-on-surface-variant">
                <span className="font-label-sm text-label-sm bg-surface-container-high px-2 py-0.5 rounded text-on-surface font-semibold">
                  CSV / PDF
                </span>
                <span className="material-symbols-outlined text-[18px]">
                  chevron_right
                </span>
              </div>
            </button>

            {/* Help & Feedback Action */}
            <button
              type="button"
              onClick={() =>
                onShowToast('SpendAI Support Center: 24/7 AI Concierge ready.')
              }
              className="w-full p-4 flex items-center justify-between hover:bg-surface-container-low transition-colors text-left border-b border-surface-container active:bg-surface-container cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-surface-container-low flex items-center justify-center text-on-surface-variant">
                  <span className="material-symbols-outlined text-[20px]">
                    help_outline
                  </span>
                </div>
                <div>
                  <p className="font-label-md text-label-md font-semibold text-on-surface">
                    Help &amp; Feedback
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    FAQ, guides, support ticket
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
                chevron_right
              </span>
            </button>

            {/* Logout Action */}
            <button
              type="button"
              onClick={() => {
                onShowToast('Signed out of SpendAI.');
                onNavigate('onboarding');
              }}
              className="w-full p-4 flex items-center justify-between hover:bg-error-container/20 transition-colors text-left active:bg-error-container/30 cursor-pointer"
            >
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-error-container/40 flex items-center justify-center text-error">
                  <span className="material-symbols-outlined text-[20px]">
                    logout
                  </span>
                </div>
                <div>
                  <p className="font-label-md text-label-md font-semibold text-error">
                    Logout
                  </p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    Sign out from this device
                  </p>
                </div>
              </div>
              <span className="material-symbols-outlined text-[18px] text-error">
                arrow_forward
              </span>
            </button>
          </div>
        </section>

        {/* App Version & Footnote */}
        <div className="text-center pt-2 pb-4">
          <p className="font-body-sm text-body-sm text-outline">
            SpendAI v2.4.1 (Clean Build)
          </p>
          <p className="text-[11px] font-label-sm text-outline mt-0.5">
            End-to-end encrypted financial storage
          </p>
        </div>
      </main>

      {/* BottomNavBar */}
      <BottomNavBar activeScreen="profile" onNavigate={onNavigate} />
    </div>
  );
};

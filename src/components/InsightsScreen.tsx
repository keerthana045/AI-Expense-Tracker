import React from 'react';
import { ScreenId, CategorySpend, UserSettings } from '../types';
import { USER_AVATAR } from '../data';
import { BottomNavBar } from './BottomNavBar';

interface InsightsScreenProps {
  onNavigate: (screen: ScreenId) => void;
  categories: CategorySpend[];
  settings: UserSettings;
  onToggleGoal: () => void;
  onSelectCategoryFilter: (cat: string) => void;
  onShowToast: (msg: string) => void;
}

export const InsightsScreen: React.FC<InsightsScreenProps> = ({
  onNavigate,
  categories,
  settings,
  onToggleGoal,
  onSelectCategoryFilter,
  onShowToast,
}) => {
  return (
    <div className="w-full max-w-md mx-auto min-h-[840px] bg-surface flex flex-col justify-between relative text-on-surface font-body-md">
      {/* Top App Bar */}
      <header className="bg-surface shadow-sm sticky top-0 z-30">
        <div className="flex justify-between items-center w-full px-4 pt-3 pb-3 max-w-md mx-auto">
          {/* Leading Avatar / Brand Profile */}
          <div
            onClick={() => onNavigate('home')}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && onNavigate('home')}
            className="flex items-center space-x-3 cursor-pointer"
          >
            <div className="w-10 h-10 rounded-full bg-primary-fixed flex items-center justify-center p-0.5 ring-2 ring-surface-container overflow-hidden active:scale-95 transition-transform duration-150 shrink-0">
              <img
                src={USER_AVATAR}
                alt="Keerthana profile portrait"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover rounded-full"
              />
            </div>
            <span className="text-headline-sm font-headline-sm font-bold text-primary tracking-tight">
              SpendAI
            </span>
          </div>

          {/* Trailing Action Icon */}
          <button
            type="button"
            aria-label="Notifications"
            onClick={() =>
              onShowToast('Weekly AI Insights updated for October 2026.')
            }
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:bg-surface-container transition-colors active:scale-95 duration-150 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">
              notifications
            </span>
          </button>
        </div>
      </header>

      {/* Main Content Canvas */}
      <main className="px-4 pt-3 pb-6 space-y-4 flex-1">
        {/* Top Header Context */}
        <section className="space-y-1">
          <div className="flex items-center space-x-1.5">
            <h1 className="text-headline-lg font-headline-lg text-on-surface">
              ✨ AI Financial Insights
            </h1>
          </div>
          <p className="text-body-sm font-body-sm text-on-surface-variant">
            Personalized analysis for October
          </p>
        </section>

        {/* Key Metric Banner Card */}
        <section className="bg-surface-container-lowest rounded-2xl p-4 shadow-[0px_2px_8px_-2px_rgba(15,23,42,0.04),0px_1px_2px_0px_rgba(15,23,42,0.02)] border border-outline-variant/30 flex flex-col justify-between relative overflow-hidden">
          <div className="flex items-center justify-between">
            <span className="text-label-md font-label-md text-on-surface-variant">
              October Spending
            </span>
            {/* Amber MoM Indicator Badge */}
            <div className="inline-flex items-center px-2 py-0.5 rounded-full bg-tertiary-fixed text-tertiary font-label-sm text-label-sm border border-tertiary-container/20">
              <span className="material-symbols-outlined text-[14px] mr-1">
                trending_up
              </span>
              <span>↑ 12% vs September</span>
            </div>
          </div>

          <div className="mt-2.5 flex items-baseline space-x-1.5">
            <span className="text-display-currency-mobile font-display-currency-mobile text-on-surface tracking-tight tabular-nums">
              {settings.currencySymbol}18,450
            </span>
            <span className="text-body-sm font-body-sm text-outline">
              total outgoing
            </span>
          </div>

          {/* Ambient decorative pulse gradient */}
          <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-primary-fixed/40 rounded-full blur-2xl pointer-events-none"></div>
        </section>

        {/* AI Recommendation Highlight Card */}
        <section className="relative rounded-2xl p-4 bg-surface-container-lowest border border-primary/20 shadow-[0px_4px_16px_rgba(67,56,202,0.08)] overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-fixed/20 via-surface-container-low to-transparent pointer-events-none"></div>
          <div className="relative z-10 space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-7 h-7 rounded-lg bg-primary-container text-on-primary flex items-center justify-center shadow-sm shrink-0">
                  <span className="material-symbols-outlined text-[18px]">
                    auto_awesome
                  </span>
                </div>
                <h2 className="text-headline-sm font-headline-sm text-primary">
                  💡 Smart Recommendation
                </h2>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-primary-fixed text-on-primary-fixed-variant text-label-sm font-label-sm">
                AI Insight
              </span>
            </div>
            <p className="text-body-md font-body-md text-on-surface leading-relaxed">
              You spent{' '}
              <span className="font-currency-tabular text-currency-tabular font-bold text-on-surface">
                {settings.currencySymbol}2,100
              </span>{' '}
              more on food this month. Reducing food spending by{' '}
              <span className="font-semibold text-primary">20%</span> could save
              approximately{' '}
              <span className="font-currency-tabular text-currency-tabular font-bold text-secondary">
                {settings.currencySymbol}1,040
              </span>{' '}
              this month.
            </p>
          </div>
        </section>

        {/* Spending Patterns Breakdown Section */}
        <section className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 shadow-[0px_2px_8px_-2px_rgba(15,23,42,0.04)] space-y-3.5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-headline-sm font-headline-sm text-on-surface">
                Spending Patterns
              </h3>
              <p className="text-body-sm font-body-sm text-outline">
                Categorized allocation
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                onSelectCategoryFilter('All');
                onNavigate('history');
              }}
              className="text-label-md font-label-md text-primary hover:text-primary-container transition-colors cursor-pointer"
            >
              Details
            </button>
          </div>

          {/* Segmented Stacked Progress Bar */}
          <div className="w-full h-3 rounded-full bg-surface-container overflow-hidden flex shadow-inner">
            <div
              className="h-full bg-primary"
              style={{ width: '32%' }}
              title="Food: 32%"
            ></div>
            <div
              className="h-full bg-surface-tint"
              style={{ width: '24%' }}
              title="Shopping: 24%"
            ></div>
            <div
              className="h-full bg-primary-fixed-dim"
              style={{ width: '17%' }}
              title="Travel: 17%"
            ></div>
            <div
              className="h-full bg-secondary"
              style={{ width: '15%' }}
              title="Bills: 15%"
            ></div>
            <div
              className="h-full bg-outline-variant"
              style={{ width: '12%' }}
              title="Other: 12%"
            ></div>
          </div>

          {/* Breakdown List Items */}
          <div className="space-y-2.5 pt-1">
            {categories.map((cat) => (
              <div
                key={cat.name}
                onClick={() => {
                  onSelectCategoryFilter(cat.name === 'Other' ? 'All' : cat.name);
                  onNavigate('history');
                }}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    onSelectCategoryFilter(cat.name === 'Other' ? 'All' : cat.name);
                    onNavigate('history');
                  }
                }}
                className="flex items-center justify-between py-1 hover:bg-surface-container-low px-2 rounded-xl transition-colors cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  {cat.name === 'Other' ? (
                    <div className="w-5 h-5 rounded-full bg-outline-variant/40 flex items-center justify-center text-on-surface-variant text-[11px] font-bold">
                      ●
                    </div>
                  ) : (
                    <span className="text-base">{cat.emoji}</span>
                  )}
                  <div>
                    <span className="text-body-md font-body-md text-on-surface block font-medium">
                      {cat.name}
                    </span>
                    <span className="text-body-sm font-body-sm text-outline">
                      {cat.percentage}% of total
                    </span>
                  </div>
                </div>
                <span className="text-currency-tabular font-currency-tabular text-on-surface tabular-nums">
                  {settings.currencySymbol}
                  {cat.amount.toLocaleString('en-IN')}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Suggested Goal Card */}
        <section className="bg-surface-container-lowest rounded-2xl p-4 border border-outline-variant/30 shadow-[0px_2px_8px_-2px_rgba(15,23,42,0.04)] space-y-3">
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <h3 className="text-headline-sm font-headline-sm text-on-surface">
                🎯 AI Recommended Goal
              </h3>
              {settings.goalActive && (
                <span className="px-2 py-0.5 rounded-full bg-secondary-fixed/50 text-secondary font-label-sm text-label-sm">
                  Active Target
                </span>
              )}
            </div>
            <p className="text-body-md font-body-md text-on-surface-variant">
              Try keeping dining expenses below{' '}
              <span className="font-currency-tabular text-currency-tabular font-bold text-on-surface">
                {settings.currencySymbol}
                {settings.diningGoalLimit.toLocaleString('en-IN')}
              </span>{' '}
              next month.
            </p>
          </div>

          {/* Action Button */}
          <button
            type="button"
            onClick={onToggleGoal}
            className={`w-full h-12 rounded-xl font-label-md text-label-md active:scale-95 transition-all duration-150 flex items-center justify-center space-x-2 shadow-sm cursor-pointer ${
              settings.goalActive
                ? 'bg-secondary text-on-secondary'
                : 'bg-primary-container text-on-primary hover:bg-primary'
            }`}
          >
            <span>
              {settings.goalActive
                ? `Goal Active (${settings.currencySymbol}${settings.diningGoalLimit.toLocaleString('en-IN')}/mo)`
                : 'Set Goal'}
            </span>
            <span className="material-symbols-outlined text-[18px]">
              {settings.goalActive ? 'check_circle' : 'arrow_forward'}
            </span>
          </button>
        </section>
      </main>

      {/* Bottom Navigation Bar */}
      <BottomNavBar activeScreen="insights" onNavigate={onNavigate} />
    </div>
  );
};

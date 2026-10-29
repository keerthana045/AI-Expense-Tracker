import React, { useState } from 'react';
import { ScreenId } from '../types';

interface OnboardingScreenProps {
  onNavigate: (screen: ScreenId) => void;
  onShowToast: (msg: string) => void;
}

const DEMO_PREDICTIONS = [
  {
    title: '₹250 Swiggy dinner',
    meta: 'Processed 2 mins ago • UPI',
    amount: '-₹250',
    emoji: '🍔',
    category: 'Food • Dining',
    subtext: 'Categorized accurately via LLM',
    ruleNote: 'Monthly dine-out cap: 64% used',
    savings: '+₹1,040 potential savings',
  },
  {
    title: '₹180 Uber to Office',
    meta: 'Processed 15 mins ago • UPI',
    amount: '-₹180',
    emoji: '🚕',
    category: 'Travel • Commute',
    subtext: 'Auto-matched weekday office route',
    ruleNote: 'Transit allowance: 42% used',
    savings: '+₹620 commute optimization',
  },
  {
    title: '₹1,099 Airtel Fiber',
    meta: 'Processed 2 hrs ago • Auto-pay',
    amount: '-₹1,099',
    emoji: '📱',
    category: 'Bills • Utilities',
    subtext: 'Recurring tax invoice verified',
    ruleNote: 'Zero late fee protection active',
    savings: '+₹350 annual cashback eligible',
  },
];

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onNavigate, onShowToast }) => {
  const [demoIdx, setDemoIdx] = useState(0);
  const currentDemo = DEMO_PREDICTIONS[demoIdx];

  const handleCycleDemo = () => {
    setDemoIdx((prev) => (prev + 1) % DEMO_PREDICTIONS.length);
  };

  return (
    <div className="bg-surface text-on-surface min-h-[840px] flex flex-col justify-between items-center selection:bg-primary-fixed selection:text-primary overflow-hidden relative">
      {/* Atmospheric Ambient Glows */}
      <div className="absolute top-[-80px] left-1/2 -translate-x-1/2 w-[340px] h-[340px] bg-primary-fixed opacity-40 blur-[90px] rounded-full pointer-events-none"></div>
      <div className="absolute bottom-[-60px] right-[-40px] w-[260px] h-[260px] bg-secondary-fixed opacity-30 blur-[80px] rounded-full pointer-events-none"></div>

      {/* Mobile Shell Wrapper */}
      <div className="w-full max-w-md flex-1 flex flex-col justify-between px-4 py-4 sm:px-6 mx-auto relative z-10">
        {/* Top Navigation / Branding Anchor */}
        <header className="w-full pt-2 flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="w-10 h-10 rounded-xl bg-primary-container flex items-center justify-center text-on-primary shadow-sm shadow-primary/20 transition-transform active:scale-95 duration-150">
              <span className="material-symbols-outlined filled text-[22px]" data-weight="fill">
                auto_awesome
              </span>
            </div>
            <span className="font-headline-md text-headline-md font-bold tracking-tight text-primary">
              SpendAI
            </span>
          </div>
          <button
            type="button"
            onClick={handleCycleDemo}
            title="Click to test live AI categorization preview"
            className="flex items-center space-x-1 px-2.5 py-1 rounded-full bg-surface-container border border-outline-variant/30 hover:bg-surface-container-high transition-colors cursor-pointer"
          >
            <span className="w-2 h-2 rounded-full bg-secondary"></span>
            <span className="font-label-sm text-label-sm text-secondary font-semibold">
              Live v2.4
            </span>
          </button>
        </header>

        {/* Center Interactive Hero Section */}
        <section className="flex flex-col items-center justify-center my-auto py-6 w-full">
          {/* Interactive AI Prediction Showcase Card */}
          <div
            onClick={handleCycleDemo}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => e.key === 'Enter' && handleCycleDemo()}
            className="w-full relative group cursor-pointer text-left"
          >
            {/* Subtle Glow Layer Behind Card */}
            <div className="absolute -inset-1 bg-gradient-to-r from-primary-fixed-dim/40 to-secondary-fixed/30 rounded-3xl blur-md opacity-70 group-hover:opacity-100 transition-opacity"></div>

            {/* Main Elevated Card */}
            <div className="relative bg-surface-container-lowest rounded-3xl p-5 border border-surface-container-high shadow-sm shadow-primary/5 transition-all">
              {/* Top Row: Anomaly/Potential Badge & Live Ping */}
              <div className="flex items-center justify-between pb-3.5 border-b border-surface-container-low">
                <div className="flex items-center space-x-1.5 bg-surface-container px-2.5 py-1 rounded-full">
                  <span className="material-symbols-outlined filled text-[16px] text-primary" data-weight="fill">
                    psychology
                  </span>
                  <span className="font-label-sm text-label-sm text-primary font-bold">
                    AI Autopilot
                  </span>
                </div>
                {/* Savings Pill Badge */}
                <div className="flex items-center space-x-1 bg-secondary-fixed/40 px-2.5 py-1 rounded-full border border-secondary/20">
                  <span className="material-symbols-outlined text-[14px] text-secondary font-bold">
                    trending_up
                  </span>
                  <span className="font-label-sm text-label-sm text-secondary font-bold">
                    {currentDemo.savings}
                  </span>
                </div>
              </div>

              {/* Transaction Source Item */}
              <div className="pt-4 pb-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-11 h-11 rounded-2xl bg-surface-container-low flex items-center justify-center text-primary-container border border-surface-container">
                      <span className="material-symbols-outlined text-[24px]">
                        receipt_long
                      </span>
                    </div>
                    <div>
                      <div className="flex items-center space-x-1.5">
                        <span className="font-headline-sm text-headline-sm font-bold text-on-surface">
                          {currentDemo.title}
                        </span>
                      </div>
                      <p className="font-body-sm text-body-sm text-outline">
                        {currentDemo.meta}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="font-currency-tabular text-currency-tabular text-on-surface font-bold">
                      {currentDemo.amount}
                    </span>
                  </div>
                </div>
              </div>

              {/* Connecting Kinetic Node Arrow */}
              <div className="flex items-center justify-center my-1.5">
                <div className="h-6 w-[2px] bg-gradient-to-b from-primary-fixed-dim to-primary"></div>
              </div>

              {/* AI Categorization Resolution Pill (Transformed State) */}
              <div className="bg-surface-container-low rounded-2xl p-3 border border-primary-fixed-dim/40 flex items-center justify-between">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-surface-container-lowest flex items-center justify-center shadow-xs text-base">
                    {currentDemo.emoji}
                  </div>
                  <div>
                    <span className="font-label-md text-label-md text-on-surface font-bold block">
                      {currentDemo.category}
                    </span>
                    <span className="font-label-sm text-label-sm text-outline font-medium">
                      {currentDemo.subtext}
                    </span>
                  </div>
                </div>
                <span className="material-symbols-outlined filled text-primary text-[20px]" data-weight="fill">
                  check_circle
                </span>
              </div>

              {/* Micro AI Suggestion Footer Inside Card */}
              <div className="mt-3.5 pt-3 border-t border-surface-container-low flex items-center justify-between text-outline">
                <div className="flex items-center space-x-1.5">
                  <span className="material-symbols-outlined text-[16px] text-tertiary-container">
                    lightbulb
                  </span>
                  <span className="font-label-sm text-label-sm text-on-surface-variant font-medium">
                    {currentDemo.ruleNote}
                  </span>
                </div>
                <span className="font-label-sm text-label-sm text-primary font-semibold">
                  Rule active
                </span>
              </div>
            </div>
          </div>

          {/* Hero Typography Content */}
          <div className="text-center mt-7 px-1">
            <h1 className="font-headline-lg text-headline-lg font-extrabold text-on-surface tracking-tight leading-tight">
              Track Smarter.
              <br />
              <span className="text-primary-container">Spend Better.</span>
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-3 max-w-xs mx-auto leading-relaxed">
              Automatically understand where your money goes with instant AI categorization and personalized spending insights.
            </p>
          </div>

          {/* Feature Pill Micro Indicators */}
          <div className="flex items-center justify-center space-x-2 mt-5">
            <span className="px-3 py-1 rounded-full bg-surface-container-low font-label-sm text-label-sm text-outline font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-primary">
                lock
              </span>{' '}
              Bank-Grade 256-bit
            </span>
            <span className="px-3 py-1 rounded-full bg-surface-container-low font-label-sm text-label-sm text-outline font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px] text-secondary">
                bolt
              </span>{' '}
              Realtime Sync
            </span>
          </div>
        </section>

        {/* Bottom Actions Container */}
        <footer className="w-full pb-4 pt-2 flex flex-col space-y-3">
          {/* Primary Call to Action Button */}
          <button
            type="button"
            onClick={() => onNavigate('home')}
            className="w-full h-12 bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-bold rounded-2xl flex items-center justify-center space-x-2 shadow-md shadow-primary/20 active:scale-95 transition-all duration-150 cursor-pointer"
          >
            <span>Get Started</span>
            <span className="material-symbols-outlined text-[20px]">
              arrow_forward
            </span>
          </button>

          {/* Secondary Sign In Action */}
          <div className="text-center pt-1">
            <button
              type="button"
              onClick={() => {
                onShowToast('Welcome back, Keerthana! Signed in to SpendAI.');
                onNavigate('home');
              }}
              className="font-label-md text-label-md text-on-surface-variant hover:text-on-surface active:scale-95 transition-transform duration-150 inline-flex items-center justify-center py-1 cursor-pointer"
            >
              <span>Already have an account?</span>
              <span className="ml-1 text-primary-container font-bold hover:underline">
                Sign In
              </span>
            </button>
          </div>

          {/* Regulatory Note for Young Pros & Students */}
          <p className="font-body-sm text-body-sm text-center text-outline text-[11px] leading-tight">
            By continuing, you agree to SpendAI’s Terms of Service &amp; Privacy Policy.
          </p>
        </footer>
      </div>
    </div>
  );
};

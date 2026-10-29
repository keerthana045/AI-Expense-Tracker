import React from 'react';
import { ScreenId } from '../types';

interface BottomNavBarProps {
  activeScreen: ScreenId;
  onNavigate: (screen: ScreenId) => void;
}

export const BottomNavBar: React.FC<BottomNavBarProps> = ({ activeScreen, onNavigate }) => {
  const navItems: { id: ScreenId; label: string; icon: string }[] = [
    { id: 'home', label: 'Home', icon: 'home' },
    { id: 'history', label: 'History', icon: 'receipt_long' },
    { id: 'insights', label: 'Insights', icon: 'auto_awesome' },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ];

  return (
    <nav className="sticky bottom-0 left-0 w-full z-40 flex justify-around items-center px-4 py-2 max-w-md mx-auto bg-surface-container-lowest shadow-[0px_-2px_10px_rgba(15,23,42,0.04)] border-t border-surface-container/60 backdrop-blur-lg">
      {navItems.map((item) => {
        const isActive = activeScreen === item.id;
        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onNavigate(item.id)}
            className={`min-h-[44px] min-w-[64px] flex flex-col items-center justify-center py-1 transition-all active:scale-95 duration-150 cursor-pointer ${
              isActive
                ? 'text-primary font-semibold'
                : 'text-on-surface-variant hover:text-primary'
            }`}
          >
            <span
              className={`material-symbols-outlined text-[22px] ${isActive ? 'filled' : ''}`}
              data-weight={isActive ? 'fill' : undefined}
            >
              {item.icon}
            </span>
            <span className="font-label-sm text-label-sm mt-0.5 whitespace-nowrap shrink-0">
              {item.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};

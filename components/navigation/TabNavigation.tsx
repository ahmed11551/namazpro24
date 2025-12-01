'use client';

import { Home, Target, CircleDot, Calendar } from 'lucide-react';
import clsx from 'clsx';

interface TabNavigationProps {
  activeTab: 'dashboard' | 'tasbih' | 'goals' | 'prayer-debt';
  onTabChange: (tab: 'dashboard' | 'tasbih' | 'goals' | 'prayer-debt') => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const tabs = [
    { id: 'dashboard' as const, label: 'Главная', icon: Home },
    { id: 'tasbih' as const, label: 'Тасбих', icon: CircleDot },
    { id: 'goals' as const, label: 'Цели', icon: Target },
    { id: 'prayer-debt' as const, label: 'Каза', icon: Calendar },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id)}
              className={clsx(
                'flex flex-col items-center justify-center flex-1 h-full transition-colors',
                isActive
                  ? 'text-primary-600'
                  : 'text-gray-500'
              )}
            >
              <Icon
                size={24}
                className={clsx(
                  'mb-1 transition-transform',
                  isActive && 'scale-110'
                )}
              />
              <span
                className={clsx(
                  'text-xs font-medium transition-colors',
                  isActive && 'text-primary-600'
                )}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}


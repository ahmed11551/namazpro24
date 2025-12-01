'use client';

import { useEffect, useState } from 'react';
import MainLayout from '@/components/layout/MainLayout';
import TabNavigation from '@/components/navigation/TabNavigation';
import Dashboard from '@/components/dashboard/Dashboard';
import TasbihModule from '@/components/tasbih/TasbihModule';
import GoalsModule from '@/components/goals/GoalsModule';
import PrayerDebtModule from '@/components/prayer-debt/PrayerDebtModule';
import OfflineIndicator from '@/components/offline/OfflineIndicator';
import { useTelegramWebApp } from '@/hooks/useTelegramWebApp';

export default function Home() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'tasbih' | 'goals' | 'prayer-debt'>('dashboard');
  const { init, ready } = useTelegramWebApp();

  useEffect(() => {
    if (typeof window !== 'undefined') {
      init();
    }
  }, [init]);

  if (!ready) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-500">Загрузка...</div>
      </div>
    );
  }

  return (
    <MainLayout>
      <OfflineIndicator />
      <div className="flex flex-col h-screen bg-gray-50">
        <div className="flex-1 overflow-y-auto pb-20">
          {activeTab === 'dashboard' && <Dashboard onNavigate={setActiveTab} />}
          {activeTab === 'tasbih' && <TasbihModule />}
          {activeTab === 'goals' && <GoalsModule onNavigate={setActiveTab} />}
          {activeTab === 'prayer-debt' && <PrayerDebtModule />}
        </div>
        <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
    </MainLayout>
  );
}


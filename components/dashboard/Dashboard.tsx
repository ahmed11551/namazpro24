'use client';

import { useEffect, useState } from 'react';
import Card from '@/components/ui/Card';
import ProgressBar from '@/components/ui/ProgressBar';
import Badge from '@/components/ui/Badge';
import { Target, CircleDot, Calendar, TrendingUp, Flame } from 'lucide-react';
import RecommendationsPanel from '@/components/ai/RecommendationsPanel';

interface DashboardProps {
  onNavigate?: (tab: 'dashboard' | 'tasbih' | 'goals' | 'prayer-debt') => void;
}

export default function Dashboard({ onNavigate }: DashboardProps) {
  const [stats, setStats] = useState({
    activeGoals: 0,
    completedToday: 0,
    streak: 0,
    totalDhikr: 0,
  });

  useEffect(() => {
    // Загрузка статистики
    fetch('/api/v1/bootstrap')
      .then((res) => res.json())
      .then((data) => {
        if (data.daily_azkar) {
          setStats({
            activeGoals: data.active_goals?.length || 0,
            completedToday: data.daily_azkar.total || 0,
            streak: data.streak || 0,
            totalDhikr: data.total_dhikr || 0,
          });
        }
      })
      .catch(() => {
        // Игнорируем ошибки в dev режиме
      });
  }, []);

  return (
    <div className="p-4 space-y-4 animate-fadeIn">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Мой духовный путь
        </h1>
        <p className="text-gray-600 text-sm">
          Сегодня {new Date().toLocaleDateString('ru-RU', {
            weekday: 'long',
            day: 'numeric',
            month: 'long',
          })}
        </p>
      </div>

      {/* Streak Card */}
      {stats.streak > 0 && (
        <Card className="p-4 bg-gradient-to-r from-warning-400 to-warning-600 text-white">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm opacity-90 mb-1">Серия дней</p>
              <div className="flex items-center gap-2">
                <Flame size={24} className="fill-current" />
                <span className="text-2xl font-bold">{stats.streak} дней</span>
              </div>
            </div>
            <Badge variant="default" className="bg-white/20 text-white border-0">
              Ма ша Аллах!
            </Badge>
          </div>
        </Card>
      )}

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center">
              <Target className="text-primary-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.activeGoals}
              </p>
              <p className="text-xs text-gray-500">Активных целей</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-success-100 flex items-center justify-center">
              <CircleDot className="text-success-600" size={24} />
            </div>
            <div>
              <p className="text-2xl font-bold text-gray-900">
                {stats.completedToday}
              </p>
              <p className="text-xs text-gray-500">Сегодня</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Active Goals Preview */}
      <Card className="p-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Активные цели</h2>
          <button
            onClick={() => onNavigate?.('goals')}
            className="text-primary-600 text-sm font-medium"
          >
            Все →
          </button>
        </div>
        <div className="space-y-3">
          {/* Placeholder goals */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                Читать Коран
              </span>
              <span className="text-xs text-gray-500">15/30 дней</span>
            </div>
            <ProgressBar value={50} color="primary" size="sm" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">
                5000 салаватов
              </span>
              <span className="text-xs text-gray-500">2500/5000</span>
            </div>
            <ProgressBar value={50} color="success" size="sm" />
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Card
          className="p-4 cursor-pointer"
          onClick={() => onNavigate?.('tasbih')}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-primary-100 flex items-center justify-center mb-2">
              <CircleDot className="text-primary-600" size={28} />
            </div>
            <span className="text-sm font-medium text-gray-900">Тасбих</span>
          </div>
        </Card>

        <Card
          className="p-4 cursor-pointer"
          onClick={() => onNavigate?.('prayer-debt')}
        >
          <div className="flex flex-col items-center text-center">
            <div className="w-14 h-14 rounded-2xl bg-warning-100 flex items-center justify-center mb-2">
              <Calendar className="text-warning-600" size={28} />
            </div>
            <span className="text-sm font-medium text-gray-900">
              Пропущенные намазы
            </span>
          </div>
        </Card>
      </div>

      {/* Daily Azkar Progress */}
      <Card className="p-4">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Ежедневные азкары
        </h2>
        <div className="space-y-3">
          {['Фаджр', 'Зухр', 'Аср', 'Магриб', 'Иша'].map((prayer, index) => (
            <div key={prayer} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  {prayer}
                </span>
                <span className="text-xs text-gray-500">0/99</span>
              </div>
              <ProgressBar value={0} color="primary" size="sm" />
            </div>
          ))}
        </div>
      </Card>

      {/* AI Recommendations */}
      <RecommendationsPanel />
    </div>
  );
}


'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { Play, Pause, RotateCcw, Plus, Minus, Settings } from 'lucide-react';
import { dbManager } from '@/lib/indexeddb';

interface TasbihSession {
  id: string;
  category: string;
  itemId?: string;
  count: number;
  target?: number;
  isReverse: boolean;
  autoInterval?: number;
}

export default function TasbihModule() {
  const [session, setSession] = useState<TasbihSession | null>(null);
  const [isAuto, setIsAuto] = useState(false);
  const [autoInterval, setAutoInterval] = useState(1); // seconds
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    if (isAuto && session && autoInterval > 0) {
      const interval = setInterval(() => {
        handleTap();
      }, autoInterval * 1000);
      return () => clearInterval(interval);
    }
  }, [isAuto, session, autoInterval]);

  const handleTap = async () => {
    if (!session) return;
    const newCount = session.isReverse
      ? Math.max(0, session.count - 1)
      : session.count + 1;
    
    setSession({
      ...session,
      count: newCount,
    });

    // Сохранение в офлайн хранилище
    try {
      await dbManager.saveOfflineEvent({
        type: 'dhikr_tap',
        data: {
          session_id: session.id,
          delta: 1,
          event_type: 'tap',
          category: session.category,
          value_after: newCount,
        },
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error('Error saving offline event:', error);
    }
  };

  const handleReset = () => {
    if (!session) return;
    setSession({ ...session, count: session.isReverse ? (session.target || 0) : 0 });
  };

  const handleBulkAdd = (amount: number) => {
    if (!session) return;
    setSession({
      ...session,
      count: session.isReverse
        ? Math.max(0, session.count - amount)
        : session.count + amount,
    });
  };

  const startSession = (category: string, target?: number, isReverse = false) => {
    setSession({
      id: Date.now().toString(),
      category,
      count: isReverse ? (target || 0) : 0,
      target,
      isReverse,
    });
  };

  if (!session) {
    return (
      <div className="p-4 space-y-4">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-1">Тасбих</h1>
          <p className="text-gray-600 text-sm">
            Выберите категорию для начала
          </p>
        </div>

        {/* Quick Start from Goals */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Из ваших целей
          </h2>
          <div className="space-y-2">
            <Button
              variant="outline"
              fullWidth
              onClick={() => startSession('salawat', 1000, false)}
            >
              Салаваты - 1000
            </Button>
            <Button
              variant="outline"
              fullWidth
              onClick={() => startSession('subhanallah', 33, true)}
            >
              СубханАллах - 33
            </Button>
          </div>
        </Card>

        {/* Categories */}
        <Card className="p-4">
          <h2 className="text-lg font-semibold text-gray-900 mb-3">
            Категории
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {[
              { id: 'salawat', label: 'Салаваты', icon: '🕌' },
              { id: 'dua', label: 'Дуа', icon: '🤲' },
              { id: 'azkar', label: 'Азкары', icon: '📿' },
              { id: 'kalimat', label: 'Калимы', icon: '✨' },
              { id: 'names99', label: '99 имен', icon: '🕋' },
              { id: 'surah', label: 'Суры', icon: '📖' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => startSession(cat.id)}
                className="p-4 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all active:scale-95"
              >
                <div className="text-2xl mb-1">{cat.icon}</div>
                <div className="text-sm font-medium text-gray-700">
                  {cat.label}
                </div>
              </button>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  const progress = session.target
    ? (session.isReverse
        ? ((session.target - session.count) / session.target) * 100
        : (session.count / session.target) * 100)
    : 0;

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Тасбих</h1>
          <p className="text-gray-600 text-sm capitalize">{session.category}</p>
        </div>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 rounded-lg hover:bg-gray-100"
        >
          <Settings size={20} className="text-gray-600" />
        </button>
      </div>

      {/* Main Counter */}
      <Card className="p-8 text-center" variant="elevated">
        <div className="mb-6">
          {session.target && (
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-500">Прогресс</span>
                <span className="text-sm font-medium text-gray-700">
                  {session.isReverse
                    ? session.target - session.count
                    : session.count}{' '}
                  / {session.target}
                </span>
              </div>
              <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary-600 transition-all duration-300"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
            </div>
          )}
          <div
            onClick={handleTap}
            className="text-7xl font-bold text-primary-600 mb-2 cursor-pointer active:scale-95 transition-transform select-none"
          >
            {session.isReverse ? session.target! - session.count : session.count}
          </div>
          <p className="text-gray-500 text-sm">Нажмите для подсчета</p>
        </div>

        {/* Quick Add Buttons */}
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAdd(10)}
            className="flex-1"
          >
            +10
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAdd(33)}
            className="flex-1"
          >
            +33
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => handleBulkAdd(100)}
            className="flex-1"
          >
            +100
          </Button>
        </div>

        {/* Control Buttons */}
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => setIsAuto(!isAuto)}
            className="flex-1"
          >
            {isAuto ? (
              <>
                <Pause size={18} className="mr-2" />
                Пауза
              </>
            ) : (
              <>
                <Play size={18} className="mr-2" />
                Авто
              </>
            )}
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="flex-1"
          >
            <RotateCcw size={18} className="mr-2" />
            Сброс
          </Button>
        </div>
      </Card>

      {/* Settings Panel */}
      {showSettings && (
        <Card className="p-4">
          <h3 className="font-semibold text-gray-900 mb-3">Настройки</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm text-gray-700 mb-1 block">
                Автоинтервал (сек): {autoInterval}
              </label>
              <input
                type="range"
                min="1"
                max="60"
                value={autoInterval}
                onChange={(e) => setAutoInterval(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setSession(null);
                setIsAuto(false);
              }}
            >
              Завершить сессию
            </Button>
          </div>
        </Card>
      )}
    </div>
  );
}


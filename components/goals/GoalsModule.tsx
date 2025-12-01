'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import Badge from '@/components/ui/Badge';
import { Plus, Target, Edit, Trash2, CheckCircle2 } from 'lucide-react';

interface GoalsModuleProps {
  onNavigate?: (tab: 'dashboard' | 'tasbih' | 'goals' | 'prayer-debt') => void;
}

interface Goal {
  id: string;
  title: string;
  category: string;
  target: number;
  current: number;
  endDate?: string;
  status: 'active' | 'completed' | 'paused';
  dailyPlan?: number;
}

export default function GoalsModule({ onNavigate }: GoalsModuleProps) {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    // Загрузка целей
    fetch('/api/v1/goals')
      .then((res) => res.json())
      .then((data) => {
        if (data.goals) {
          setGoals(data.goals);
        }
      })
      .catch(() => {
        // Mock data для разработки
        setGoals([
          {
            id: '1',
            title: 'Читать Коран',
            category: 'quran',
            target: 30,
            current: 15,
            status: 'active',
            dailyPlan: 1,
          },
          {
            id: '2',
            title: '5000 салаватов',
            category: 'salawat',
            target: 5000,
            current: 2500,
            status: 'active',
            dailyPlan: 125,
          },
        ]);
      });
  }, []);

  const categories = [
    { id: 'prayer', label: 'Намаз', icon: '🕌' },
    { id: 'quran', label: 'Коран', icon: '📖' },
    { id: 'zikr', label: 'Зикр', icon: '📿' },
    { id: 'sadaqa', label: 'Садака', icon: '💰' },
    { id: 'knowledge', label: 'Знания', icon: '📚' },
    { id: 'names99', label: '99 имен', icon: '🕋' },
  ];

  const getProgress = (goal: Goal) => {
    return (goal.current / goal.target) * 100;
  };

  const getStatusColor = (goal: Goal) => {
    const progress = getProgress(goal);
    if (progress >= 100) return 'success';
    if (progress >= 50) return 'primary';
    if (progress >= 25) return 'warning';
    return 'danger';
  };

  if (showAddModal) {
    return (
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-gray-900">Новая цель</h1>
          <button
            onClick={() => setShowAddModal(false)}
            className="text-gray-500"
          >
            ✕
          </button>
        </div>

        {!selectedCategory ? (
          <div>
            <h2 className="text-lg font-semibold text-gray-900 mb-3">
              Выберите категорию
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className="p-4 rounded-xl border-2 border-gray-200 hover:border-primary-300 hover:bg-primary-50 transition-all active:scale-95 text-left"
                >
                  <div className="text-2xl mb-2">{cat.icon}</div>
                  <div className="text-sm font-medium text-gray-700">
                    {cat.label}
                  </div>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <Card className="p-4">
            <p className="text-sm text-gray-600 mb-4">
              Форма создания цели для категории: {categories.find(c => c.id === selectedCategory)?.label}
            </p>
            <Button
              variant="outline"
              fullWidth
              onClick={() => {
                setSelectedCategory(null);
                setShowAddModal(false);
              }}
            >
              Назад
            </Button>
          </Card>
        )}
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Цели</h1>
          <p className="text-gray-600 text-sm">
            {goals.filter((g) => g.status === 'active').length} активных
          </p>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          className="w-10 h-10 rounded-full bg-primary-600 text-white flex items-center justify-center shadow-lg active:scale-95"
        >
          <Plus size={20} />
        </button>
      </div>

      {/* Goals List */}
      {goals.length === 0 ? (
        <Card className="p-8 text-center">
          <Target size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Нет активных целей
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Создайте свою первую цель для духовного роста
          </p>
          <Button onClick={() => setShowAddModal(true)}>
            Создать цель
          </Button>
        </Card>
      ) : (
        <div className="space-y-3">
          {goals.map((goal) => (
            <Card key={goal.id} className="p-4">
              <div className="flex items-start justify-between mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-semibold text-gray-900">
                      {goal.title}
                    </h3>
                    {goal.status === 'completed' && (
                      <Badge variant="success" size="sm">
                        <CheckCircle2 size={12} className="mr-1" />
                        Выполнено
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 capitalize">
                    {categories.find((c) => c.id === goal.category)?.label}
                  </p>
                </div>
                <div className="flex gap-1">
                  <button className="p-1.5 rounded-lg hover:bg-gray-100">
                    <Edit size={16} className="text-gray-600" />
                  </button>
                  <button className="p-1.5 rounded-lg hover:bg-gray-100">
                    <Trash2 size={16} className="text-gray-600" />
                  </button>
                </div>
              </div>

              <div className="mb-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-gray-500">
                    {goal.current} / {goal.target}
                  </span>
                  <span className="text-xs font-medium text-gray-700">
                    {Math.round(getProgress(goal))}%
                  </span>
                </div>
                <ProgressBar
                  value={getProgress(goal)}
                  color={getStatusColor(goal)}
                  size="sm"
                />
              </div>

              {goal.dailyPlan && goal.status === 'active' && (
                <div className="mt-3 pt-3 border-t border-gray-100">
                  <p className="text-xs text-gray-600">
                    Ежедневный план: <span className="font-medium text-gray-900">{goal.dailyPlan}</span>
                  </p>
                </div>
              )}

              {goal.status === 'active' && (
                <div className="mt-3 flex gap-2">
                  <Button
                    variant="primary"
                    size="sm"
                    className="flex-1"
                    onClick={() => {
                      // Navigate to tasbih or mark as done
                    }}
                  >
                    Отметить
                  </Button>
                  {goal.category === 'zikr' || goal.category === 'salawat' ? (
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1"
                      onClick={() => onNavigate?.('tasbih')}
                    >
                      К тасбиху
                    </Button>
                  ) : null}
                </div>
              )}
            </Card>
          ))}
        </div>
      )}

      {/* Prayer Debt Quick Access */}
      <Card className="p-4 bg-warning-50 border-warning-200">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-gray-900 mb-1">
              Пропущенные намазы
            </h3>
            <p className="text-sm text-gray-600">
              Рассчитайте и восполните свой долг
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onNavigate?.('prayer-debt')}
          >
            Посчитать
          </Button>
        </div>
      </Card>
    </div>
  );
}


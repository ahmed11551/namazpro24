'use client';

import { useState } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import ProgressBar from '@/components/ui/ProgressBar';
import { Calendar, Calculator, TrendingUp, FileText, Share2 } from 'lucide-react';

type Tab = 'calculate' | 'debt' | 'travel' | 'plan' | 'reports';

interface PrayerDebt {
  total: number;
  completed: number;
  byPrayer: {
    fajr: { total: number; completed: number };
    dhuhr: { total: number; completed: number };
    asr: { total: number; completed: number };
    maghrib: { total: number; completed: number };
    isha: { total: number; completed: number };
    witr: { total: number; completed: number };
  };
}

export default function PrayerDebtModule() {
  const [activeTab, setActiveTab] = useState<Tab>('calculate');
  const [formData, setFormData] = useState({
    birthDate: '',
    gender: 'male' as 'male' | 'female',
    bulughAge: 15,
    prayerStartDate: '',
    todayAsStart: true,
    haidDaysPerMonth: 7,
    childbirthCount: 0,
    travelDays: 0,
  });
  const [debt, setDebt] = useState<PrayerDebt | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);

  const handleCalculate = async () => {
    setIsCalculating(true);
    try {
      const response = await fetch('/api/prayer-debt/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          calculation_method: 'calculator',
          personal_data: {
            birth_date: formData.birthDate,
            gender: formData.gender,
            bulugh_age: formData.bulughAge,
            prayer_start_date: formData.prayerStartDate,
            today_as_start: formData.todayAsStart,
          },
          women_data: {
            haid_days_per_month: formData.haidDaysPerMonth,
            childbirth_count: formData.childbirthCount,
            nifas_days_per_childbirth: 40,
          },
          travel_data: {
            total_travel_days: formData.travelDays,
            travel_periods: [],
          },
        }),
      });
      const data = await response.json();
      if (data.debt_calculation) {
        setDebt({
          total: Object.values(data.debt_calculation.missed_prayers).reduce(
            (sum: number, val: number) => sum + val,
            0
          ),
          completed: 0,
          byPrayer: {
            fajr: {
              total: data.debt_calculation.missed_prayers.fajr,
              completed: 0,
            },
            dhuhr: {
              total: data.debt_calculation.missed_prayers.dhuhr,
              completed: 0,
            },
            asr: {
              total: data.debt_calculation.missed_prayers.asr,
              completed: 0,
            },
            maghrib: {
              total: data.debt_calculation.missed_prayers.maghrib,
              completed: 0,
            },
            isha: {
              total: data.debt_calculation.missed_prayers.isha,
              completed: 0,
            },
            witr: {
              total: data.debt_calculation.missed_prayers.witr,
              completed: 0,
            },
          },
        });
        setActiveTab('debt');
      }
    } catch (error) {
      console.error('Calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const tabs = [
    { id: 'calculate' as Tab, label: 'Расчёт', icon: Calculator },
    { id: 'debt' as Tab, label: 'Мой долг', icon: Calendar },
    { id: 'travel' as Tab, label: 'Сафар', icon: TrendingUp },
    { id: 'plan' as Tab, label: 'План', icon: TrendingUp },
    { id: 'reports' as Tab, label: 'Отчёты', icon: FileText },
  ];

  return (
    <div className="p-4 space-y-4">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-gray-900 mb-1">
          Пропущенные намазы
        </h1>
        <p className="text-gray-600 text-sm">
          Рассчитайте и восполните свой долг
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl font-medium text-sm whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Icon size={16} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab Content */}
      {activeTab === 'calculate' && (
        <Card className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дата рождения
            </label>
            <input
              type="date"
              value={formData.birthDate}
              onChange={(e) =>
                setFormData({ ...formData, birthDate: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Пол
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => setFormData({ ...formData, gender: 'male' })}
                className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
                  formData.gender === 'male'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Мужской
              </button>
              <button
                onClick={() => setFormData({ ...formData, gender: 'female' })}
                className={`flex-1 px-4 py-2 rounded-xl font-medium transition-colors ${
                  formData.gender === 'female'
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700'
                }`}
              >
                Женский
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Возраст булюга: {formData.bulughAge} лет
            </label>
            <input
              type="range"
              min="12"
              max="18"
              value={formData.bulughAge}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  bulughAge: Number(e.target.value),
                })
              }
              className="w-full"
            />
          </div>

          {formData.gender === 'female' && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Дней хайда в месяц: {formData.haidDaysPerMonth}
                </label>
                <input
                  type="range"
                  min="3"
                  max="15"
                  value={formData.haidDaysPerMonth}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      haidDaysPerMonth: Number(e.target.value),
                    })
                  }
                  className="w-full"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Количество родов: {formData.childbirthCount}
                </label>
                <input
                  type="number"
                  min="0"
                  value={formData.childbirthCount}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      childbirthCount: Number(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Дней в пути: {formData.travelDays}
            </label>
            <input
              type="number"
              min="0"
              value={formData.travelDays}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  travelDays: Number(e.target.value),
                })
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-xl"
            />
          </div>

          <Button
            variant="primary"
            fullWidth
            onClick={handleCalculate}
            disabled={isCalculating || !formData.birthDate}
          >
            {isCalculating ? 'Рассчитываю...' : 'Рассчитать долг'}
          </Button>
        </Card>
      )}

      {activeTab === 'debt' && debt && (
        <div className="space-y-4">
          <Card className="p-4">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Общий прогресс
            </h2>
            <div className="mb-4">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-gray-600">
                  {debt.completed} / {debt.total}
                </span>
                <span className="text-sm font-medium text-gray-900">
                  {Math.round((debt.completed / debt.total) * 100)}%
                </span>
              </div>
              <ProgressBar
                value={(debt.completed / debt.total) * 100}
                color="primary"
              />
            </div>
          </Card>

          <Card className="p-4">
            <h3 className="font-semibold text-gray-900 mb-3">По намазам</h3>
            <div className="space-y-3">
              {Object.entries(debt.byPrayer).map(([prayer, data]) => (
                <div key={prayer} className="space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {prayer}
                    </span>
                    <span className="text-xs text-gray-500">
                      {data.completed} / {data.total}
                    </span>
                  </div>
                  <ProgressBar
                    value={(data.completed / data.total) * 100}
                    color="primary"
                    size="sm"
                  />
                </div>
              ))}
            </div>
          </Card>

          <Button variant="primary" fullWidth>
            + Отметить восполненные намазы
          </Button>
        </div>
      )}

      {activeTab === 'debt' && !debt && (
        <Card className="p-8 text-center">
          <Calendar size={48} className="mx-auto mb-4 text-gray-300" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Нет данных о долге
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Рассчитайте свой долг по намазам
          </p>
          <Button onClick={() => setActiveTab('calculate')}>
            Рассчитать
          </Button>
        </Card>
      )}

      {activeTab === 'reports' && (
        <Card className="p-4 space-y-3">
          <Button variant="outline" fullWidth>
            <FileText size={18} className="mr-2" />
            Скачать PDF отчёт
          </Button>
          <Button variant="outline" fullWidth>
            <Share2 size={18} className="mr-2" />
            Поделиться с наставником
          </Button>
        </Card>
      )}
    </div>
  );
}


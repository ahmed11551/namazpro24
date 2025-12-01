'use client';

import { useState, useEffect } from 'react';
import Card from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import Badge from '@/components/ui/Badge';
import { Sparkles, TrendingUp, AlertCircle, Lightbulb } from 'lucide-react';

interface Recommendation {
  type: 'goal_suggestion' | 'motivation' | 'insight' | 'warning';
  title: string;
  message: string;
  action?: {
    label: string;
    goalData?: any;
  };
  priority: 'low' | 'medium' | 'high';
}

export default function RecommendationsPanel() {
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      // В реальном приложении здесь будет получение профиля пользователя
      const mockProfile = {
        goals: [],
        dhikr_history: [],
        prayer_history: [],
        streak: 0,
      };

      const response = await fetch('/api/ai/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_profile: mockProfile }),
      });

      const data = await response.json();
      if (data.recommendations) {
        setRecommendations(data.recommendations);
      }
    } catch (error) {
      console.error('Error loading recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: Recommendation['type']) => {
    switch (type) {
      case 'goal_suggestion':
        return <Sparkles size={20} className="text-primary-600" />;
      case 'motivation':
        return <TrendingUp size={20} className="text-success-600" />;
      case 'warning':
        return <AlertCircle size={20} className="text-warning-600" />;
      case 'insight':
        return <Lightbulb size={20} className="text-primary-600" />;
      default:
        return null;
    }
  };

  const getPriorityColor = (priority: Recommendation['priority']) => {
    switch (priority) {
      case 'high':
        return 'danger';
      case 'medium':
        return 'warning';
      case 'low':
        return 'info';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <Card className="p-4">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
        </div>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return (
      <Card className="p-4 text-center">
        <Sparkles size={32} className="mx-auto mb-2 text-gray-300" />
        <p className="text-sm text-gray-600">
          Рекомендации появятся после анализа вашей активности
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-3">
      <h2 className="text-lg font-semibold text-gray-900 px-4">
        AI-рекомендации
      </h2>
      {recommendations.map((rec, index) => (
        <Card key={index} className="p-4">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 mt-0.5">{getIcon(rec.type)}</div>
            <div className="flex-1">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-gray-900">{rec.title}</h3>
                <Badge variant={getPriorityColor(rec.priority)} size="sm">
                  {rec.priority}
                </Badge>
              </div>
              <p className="text-sm text-gray-600 mb-3">{rec.message}</p>
              {rec.action && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    // Обработка действия
                    if (rec.action?.goalData) {
                      // Создание цели
                      console.log('Create goal:', rec.action.goalData);
                    }
                  }}
                >
                  {rec.action.label}
                </Button>
              )}
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}


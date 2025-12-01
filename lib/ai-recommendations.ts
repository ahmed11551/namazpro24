/**
 * AI-рекомендации для целей и мотивации
 */

export interface UserProfile {
  goals: Array<{
    id: string;
    category: string;
    target: number;
    current: number;
    status: string;
    created_at: string;
  }>;
  dhikr_history: Array<{
    date: string;
    count: number;
    category: string;
  }>;
  prayer_history: Array<{
    date: string;
    completed: boolean;
  }>;
  streak: number;
}

export interface Recommendation {
  type: 'goal_suggestion' | 'motivation' | 'insight' | 'warning';
  title: string;
  message: string;
  action?: {
    label: string;
    goalData?: any;
  };
  priority: 'low' | 'medium' | 'high';
}

/**
 * Анализ паттернов пользователя
 */
function analyzePatterns(profile: UserProfile) {
  const insights = {
    mostActiveCategory: '',
    averageDailyDhikr: 0,
    consistency: 0,
    weakAreas: [] as string[],
    strongAreas: [] as string[],
  };

  // Анализ категорий
  const categoryCounts: Record<string, number> = {};
  profile.dhikr_history.forEach((entry) => {
    categoryCounts[entry.category] = (categoryCounts[entry.category] || 0) + entry.count;
  });

  const mostActive = Object.entries(categoryCounts).sort(
    (a, b) => b[1] - a[1]
  )[0];
  insights.mostActiveCategory = mostActive?.[0] || '';

  // Среднее количество зикров в день
  const totalDhikr = profile.dhikr_history.reduce((sum, entry) => sum + entry.count, 0);
  const days = new Set(profile.dhikr_history.map((e) => e.date)).size;
  insights.averageDailyDhikr = days > 0 ? Math.round(totalDhikr / days) : 0;

  // Консистентность (процент дней с активностью)
  const activeDays = new Set(profile.dhikr_history.map((e) => e.date)).size;
  const totalDays = profile.prayer_history.length || 30;
  insights.consistency = totalDays > 0 ? (activeDays / totalDays) * 100 : 0;

  // Слабые и сильные стороны
  const categoryAverages: Record<string, number> = {};
  Object.keys(categoryCounts).forEach((cat) => {
    const days = profile.dhikr_history.filter((e) => e.category === cat).length;
    categoryAverages[cat] = days > 0 ? categoryCounts[cat] / days : 0;
  });

  const sortedCategories = Object.entries(categoryAverages).sort(
    (a, b) => b[1] - a[1]
  );
  insights.strongAreas = sortedCategories.slice(0, 2).map(([cat]) => cat);
  insights.weakAreas = sortedCategories.slice(-2).map(([cat]) => cat);

  return insights;
}

/**
 * Генерация рекомендаций на основе профиля
 */
export function generateRecommendations(profile: UserProfile): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const insights = analyzePatterns(profile);

  // 1. Предложение цели на основе активности
  if (insights.mostActiveCategory && insights.averageDailyDhikr > 0) {
    const suggestedTarget = Math.round(insights.averageDailyDhikr * 30);
    recommendations.push({
      type: 'goal_suggestion',
      title: 'Предлагаем новую цель',
      message: `Вы стабильно делаете ${insights.averageDailyDhikr} зикров в день в категории "${insights.mostActiveCategory}". Хотите поставить цель ${suggestedTarget} за месяц?`,
      action: {
        label: 'Создать цель',
        goalData: {
          category: insights.mostActiveCategory,
          target_count: suggestedTarget,
          period_type: 'monthly',
        },
      },
      priority: 'medium',
    });
  }

  // 2. Мотивация при низкой консистентности
  if (insights.consistency < 50) {
    recommendations.push({
      type: 'warning',
      title: 'Повысьте регулярность',
      message: `Ваша активность составляет ${Math.round(insights.consistency)}%. Попробуйте заниматься каждый день, даже понемногу. Маленькие, но постоянные действия приносят большие результаты!`,
      priority: 'high',
    });
  }

  // 3. Предложение развить слабые области
  if (insights.weakAreas.length > 0) {
    const weakArea = insights.weakAreas[0];
    recommendations.push({
      type: 'goal_suggestion',
      title: 'Развивайте слабые стороны',
      message: `Вы редко практикуете "${weakArea}". Давайте начнем с малого — цель "${weakArea}" 2 раза в неделю?`,
      action: {
        label: 'Создать цель',
        goalData: {
          category: weakArea,
          target_count: 2,
          period_type: 'weekly',
        },
      },
      priority: 'low',
    });
  }

  // 4. Поздравление с серией
  if (profile.streak >= 7) {
    recommendations.push({
      type: 'motivation',
      title: 'Отличная серия!',
      message: `У вас уже ${profile.streak} дней подряд! Ма ша Аллах! Продолжайте в том же духе! 🔥`,
      priority: 'high',
    });
  }

  // 5. Инсайт о сильных сторонах
  if (insights.strongAreas.length > 0) {
    recommendations.push({
      type: 'insight',
      title: 'Ваши сильные стороны',
      message: `Вы особенно активны в "${insights.strongAreas.join('" и "')}". Это отлично! Продолжайте развивать эти практики.`,
      priority: 'low',
    });
  }

  // 6. Предложение для пропущенных намазов
  const missedPrayers = profile.prayer_history.filter((p) => !p.completed).length;
  if (missedPrayers > 0) {
    recommendations.push({
      type: 'goal_suggestion',
      title: 'Восполните пропущенные намазы',
      message: `У вас есть пропущенные намазы. Рассчитайте свой долг и начните восполнение. Каждый шаг на пути к Аллаху важен!`,
      action: {
        label: 'Рассчитать долг',
      },
      priority: 'high',
    });
  }

  return recommendations.sort((a, b) => {
    const priorityOrder = { high: 3, medium: 2, low: 1 };
    return priorityOrder[b.priority] - priorityOrder[a.priority];
  });
}

/**
 * Генерация мотивационного сообщения
 */
export function generateMotivationalMessage(
  progress: number,
  goalTitle: string
): string {
  const milestones = {
    100: 'Поздравляем! Первые 100 единиц выполнены!',
    1000: 'Ма ша Аллах! Вы достигли 1000!',
    50: 'Вы прошли половину пути. Пусть Аллах укрепит вас!',
  };

  const percentage = Math.round(progress);
  
  if (percentage >= 100) {
    return `🎉 Поздравляем! Цель "${goalTitle}" выполнена! Ма ша Аллах!`;
  }

  if (percentage >= 50) {
    return milestones[50];
  }

  if (progress >= 1000) {
    return milestones[1000];
  }

  if (progress >= 100) {
    return milestones[100];
  }

  const messages = [
    'Каждое действие приближает вас к цели. Продолжайте! 💪',
    'Маленькие шаги ведут к большим результатам. Не останавливайтесь! 🌟',
    'Пусть Аллах примет ваши старания и вознаградит вас! 🤲',
    'Вы на правильном пути. Продолжайте с усердием! ✨',
  ];

  return messages[Math.floor(Math.random() * messages.length)];
}

/**
 * Анализ трендов
 */
export function analyzeTrends(profile: UserProfile): {
  trend: 'improving' | 'declining' | 'stable';
  message: string;
} {
  if (profile.dhikr_history.length < 7) {
    return {
      trend: 'stable',
      message: 'Недостаточно данных для анализа тренда',
    };
  }

  const recent = profile.dhikr_history.slice(-7);
  const older = profile.dhikr_history.slice(-14, -7);

  const recentAvg = recent.reduce((sum, e) => sum + e.count, 0) / recent.length;
  const olderAvg = older.length > 0
    ? older.reduce((sum, e) => sum + e.count, 0) / older.length
    : recentAvg;

  const change = ((recentAvg - olderAvg) / olderAvg) * 100;

  if (change > 10) {
    return {
      trend: 'improving',
      message: `Отлично! Ваша активность выросла на ${Math.round(change)}% за последнюю неделю!`,
    };
  } else if (change < -10) {
    return {
      trend: 'declining',
      message: `Ваша активность снизилась на ${Math.round(Math.abs(change))}%. Не останавливайтесь!`,
    };
  } else {
    return {
      trend: 'stable',
      message: 'Вы поддерживаете стабильную активность. Продолжайте!',
    };
  }
}


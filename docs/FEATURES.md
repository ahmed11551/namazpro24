# Дополнительные функции

## 1. Интеграция с e-Replika API

### Описание
Интеграция с внешним API e-Replika для работы с исламским календарем, терминами и генерации отчетов.

### Использование

#### Конвертация дат в хиджру
```typescript
import { convertToHijri } from '@/lib/ereplika';

const hijriDate = await convertToHijri(new Date());
// { day: 15, month: 5, year: 1445, month_name: "Джумада аль-уля", day_name: "Пятница" }
```

#### Получение терминов
```typescript
import { getTerms } from '@/lib/ereplika';

const terms = await getTerms('prayer');
// Массив терминов с определениями
```

#### Генерация PDF отчета
```typescript
import { generatePDFReport } from '@/lib/ereplika';

const pdfBlob = await generatePDFReport({
  user_id: '123',
  prayer_debt: {...},
  goals: [...],
  statistics: {...}
});
```

### API Endpoints
- `POST /api/ereplika/pdf` - генерация PDF отчета через e-Replika

### Настройка
Добавьте в `.env`:
```
E_REPLIKA_API_URL=https://bot.e-replika.ru
E_REPLIKA_API_KEY=your_api_key_here
```

---

## 2. Офлайн-режим с IndexedDB

### Описание
Приложение работает офлайн, сохраняя все действия в IndexedDB и синхронизируя их при восстановлении связи.

### Использование

#### Сохранение офлайн события
```typescript
import { dbManager } from '@/lib/indexeddb';

await dbManager.saveOfflineEvent({
  type: 'dhikr_tap',
  data: {
    session_id: '123',
    delta: 1,
    event_type: 'tap',
    category: 'salawat',
    value_after: 100,
  },
  timestamp: Date.now(),
});
```

#### Автоматическая синхронизация
Используйте хук `useOfflineSync`:
```typescript
import { useOfflineSync } from '@/hooks/useOfflineSync';

function MyComponent() {
  const { isOnline, pendingEvents, syncEvents } = useOfflineSync();
  
  // Автоматически синхронизирует при восстановлении связи
  // Показывает количество несинхронизированных событий
}
```

### Индикатор офлайн режима
Компонент `OfflineIndicator` автоматически показывает статус:
- 🟢 Онлайн - все синхронизировано
- 🟡 Онлайн - есть события в очереди
- 🔴 Офлайн - работа в офлайн режиме

### Хранилища IndexedDB
- `offline_events` - очередь событий для синхронизации
- `goals_cache` - кеш целей пользователя
- `tasbih_sessions` - сессии тасбиха
- `prayer_debt_cache` - кеш долга по намазам

---

## 3. Push-уведомления

### Описание
Отправка уведомлений пользователям через Telegram Bot API.

### Типы уведомлений

#### Напоминание о цели
```typescript
import { sendGoalReminder } from '@/lib/notifications';

await sendGoalReminder(
  userId,
  'Читать Коран',
  15, // осталось
  30, // цель
  10  // дней осталось
);
```

#### Мотивация при отставании
```typescript
import { sendMotivationNotification } from '@/lib/notifications';

await sendMotivationNotification(
  userId,
  '5000 салаватов',
  500 // отставание
);
```

#### Достижение
```typescript
import { sendAchievementNotification } from '@/lib/notifications';

await sendAchievementNotification(
  userId,
  'Неуклонный в намазе',
  '30 дней без пропусков!'
);
```

#### Завершение цели
```typescript
import { sendGoalCompletedNotification } from '@/lib/notifications';

await sendGoalCompletedNotification(userId, 'Читать Коран');
```

#### Серия дней
```typescript
import { sendStreakNotification } from '@/lib/notifications';

await sendStreakNotification(userId, 7); // 7 дней подряд
```

### API Endpoint
```typescript
POST /api/notifications/send
Body: {
  type: 'goal_reminder' | 'motivation' | 'achievement' | 'goal_completed' | 'streak',
  user_id: number,
  ...data
}
```

### Настройка
Добавьте в `.env`:
```
TELEGRAM_BOT_TOKEN=your_bot_token_here
```

---

## 4. AI-рекомендации

### Описание
Умные рекомендации на основе анализа активности пользователя.

### Использование

#### Получение рекомендаций
```typescript
const response = await fetch('/api/ai/recommendations', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    user_profile: {
      goals: [...],
      dhikr_history: [...],
      prayer_history: [...],
      streak: 7,
    }
  })
});

const { recommendations, trends } = await response.json();
```

### Типы рекомендаций

1. **goal_suggestion** - предложение новой цели
   - На основе активности пользователя
   - Учитывает слабые и сильные стороны

2. **motivation** - мотивационные сообщения
   - При достижении серий
   - При хорошем прогрессе

3. **insight** - инсайты о поведении
   - Сильные стороны
   - Паттерны активности

4. **warning** - предупреждения
   - Низкая консистентность
   - Отставание от графика

### Анализ трендов
```typescript
import { analyzeTrends } from '@/lib/ai-recommendations';

const trends = analyzeTrends(userProfile);
// { trend: 'improving' | 'declining' | 'stable', message: '...' }
```

### Компонент RecommendationsPanel
Автоматически отображает рекомендации на главном экране:
- Иконки по типу рекомендации
- Приоритеты (high/medium/low)
- Кнопки действий для быстрого создания целей

### Генерация мотивационных сообщений
```typescript
import { generateMotivationalMessage } from '@/lib/ai-recommendations';

const message = generateMotivationalMessage(50, 'Читать Коран');
// "Вы прошли половину пути. Пусть Аллах укрепит вас!"
```

---

## Примеры интеграции

### Автоматическая отправка уведомлений при обновлении цели
```typescript
// В API endpoint обновления цели
import { sendGoalReminder } from '@/lib/notifications';

// После обновления цели
if (goal.progress < goal.target) {
  const daysRemaining = calculateDaysRemaining(goal.endDate);
  await sendGoalReminder(
    userId,
    goal.title,
    goal.target - goal.progress,
    goal.target,
    daysRemaining
  );
}
```

### Использование офлайн режима в тасбихе
```typescript
// В компоненте тасбиха
import { dbManager } from '@/lib/indexeddb';

const handleTap = async () => {
  // Обновление UI
  setCount(count + 1);
  
  // Сохранение в офлайн хранилище
  await dbManager.saveOfflineEvent({
    type: 'dhikr_tap',
    data: { session_id, delta: 1, ... },
    timestamp: Date.now(),
  });
};
```

### Получение рекомендаций на главном экране
```typescript
// В компоненте Dashboard
import RecommendationsPanel from '@/components/ai/RecommendationsPanel';

// Компонент автоматически загружает и отображает рекомендации
<RecommendationsPanel />
```

---

## Настройка переменных окружения

Создайте файл `.env.local`:

```env
# Telegram Bot
TELEGRAM_BOT_TOKEN=your_bot_token_here

# e-Replika API
E_REPLIKA_API_URL=https://bot.e-replika.ru
E_REPLIKA_API_KEY=your_api_key_here

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## Тестирование

### Офлайн режим
1. Откройте DevTools → Network
2. Включите "Offline" режим
3. Выполните действия в приложении
4. Включите "Online" - события синхронизируются

### Уведомления
```bash
curl -X POST http://localhost:3000/api/notifications/send \
  -H "Content-Type: application/json" \
  -d '{
    "type": "goal_reminder",
    "user_id": 123456789,
    "goal_title": "Читать Коран",
    "remaining": 15,
    "target": 30,
    "days_remaining": 10
  }'
```

### AI рекомендации
```bash
curl -X POST http://localhost:3000/api/ai/recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "user_profile": {
      "goals": [],
      "dhikr_history": [],
      "prayer_history": [],
      "streak": 7
    }
  }'
```


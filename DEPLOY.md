# Инструкция по деплою на Vercel

## Быстрый старт

1. **Установите зависимости:**
   ```bash
   npm install
   ```

2. **Проверьте локально:**
   ```bash
   npm run dev
   ```
   Откройте http://localhost:3000

3. **Деплой на Vercel:**

   ### Вариант 1: Через веб-интерфейс
   - Зайдите на [vercel.com](https://vercel.com)
   - Нажмите "Add New Project"
   - Подключите ваш Git репозиторий
   - Vercel автоматически определит Next.js и настроит проект
   - Нажмите "Deploy"

   ### Вариант 2: Через CLI
   ```bash
   npm i -g vercel
   vercel
   ```
   Следуйте инструкциям в терминале

## Настройка переменных окружения

В настройках проекта Vercel добавьте переменные (если нужны):

- `TELEGRAM_BOT_TOKEN` - токен бота для валидации initData
- `DATABASE_URL` - URL базы данных (если используется)
- `E_REPLIKA_API_KEY` - ключ API e-Replika

## Настройка Telegram Mini App

1. После деплоя получите URL вашего приложения (например: `https://your-app.vercel.app`)

2. В настройках Telegram бота укажите:
   - Web App URL: `https://your-app.vercel.app`
   - Short name: `namazpro24`

3. Для тестирования можно использовать:
   - [@BotFather](https://t.me/botfather) - создание/настройка бота
   - [@WebAppTestBot](https://t.me/webapptestbot) - тестирование Mini App

## Структура проекта

```
namazpro24/
├── app/                    # Next.js App Router
│   ├── api/               # API endpoints (Serverless Functions)
│   ├── page.tsx           # Главная страница
│   └── layout.tsx         # Layout
├── components/            # React компоненты
├── hooks/                 # React хуки
├── lib/                   # Утилиты
├── types/                 # TypeScript типы
└── public/                # Статические файлы
```

## API Routes

Все API routes находятся в `app/api/` и автоматически становятся Serverless Functions на Vercel:

- `/api/v1/bootstrap` - инициализация
- `/api/v1/goals` - управление целями
- `/api/prayer-debt/calculate` - расчет долга
- `/api/v1/counter/tap` - счетчик тасбиха

## Производительность

Vercel автоматически:
- Оптимизирует изображения
- Минифицирует код
- Кеширует статические ресурсы
- Использует Edge Network для быстрой загрузки

## Мониторинг

После деплоя вы получите:
- Analytics dashboard
- Логи ошибок
- Метрики производительности

## Дополнительные настройки

### Custom Domain
В настройках проекта Vercel можно добавить свой домен

### Environment Variables
Разные переменные для Production, Preview и Development

### Build Settings
По умолчанию Vercel определяет Next.js автоматически, но можно настроить вручную в `vercel.json`

## Troubleshooting

### Ошибка при сборке
- Проверьте логи в Vercel Dashboard
- Убедитесь, что все зависимости в `package.json`
- Проверьте TypeScript ошибки: `npm run type-check`

### API не работает
- Проверьте, что routes находятся в `app/api/`
- Убедитесь, что используете правильные HTTP методы (GET, POST, etc.)

### Telegram WebApp не загружается
- Проверьте, что URL указан правильно в настройках бота
- Убедитесь, что приложение доступно по HTTPS
- Проверьте консоль браузера на ошибки

## Полезные ссылки

- [Vercel Documentation](https://vercel.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Telegram Mini Apps](https://core.telegram.org/bots/webapps)


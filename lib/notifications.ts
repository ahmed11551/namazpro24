/**
 * Push-уведомления через Telegram Bot API
 */

const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_API_URL = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}`;

export interface NotificationPayload {
  user_id: number;
  message: string;
  options?: {
    parse_mode?: 'HTML' | 'Markdown';
    disable_web_page_preview?: boolean;
    silent?: boolean;
  };
}

/**
 * Отправка уведомления пользователю
 */
export async function sendNotification(
  payload: NotificationPayload
): Promise<boolean> {
  try {
    const response = await fetch(`${TELEGRAM_API_URL}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: payload.user_id,
        text: payload.message,
        parse_mode: payload.options?.parse_mode || 'HTML',
        disable_web_page_preview: payload.options?.disable_web_page_preview || true,
        disable_notification: payload.options?.silent || false,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      console.error('Telegram API error:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
}

/**
 * Уведомление о напоминании цели
 */
export async function sendGoalReminder(
  userId: number,
  goalTitle: string,
  remaining: number,
  target: number,
  daysRemaining?: number
): Promise<boolean> {
  let message = `🎯 <b>${goalTitle}</b>\n\n`;
  message += `Осталось: ${remaining} из ${target}\n`;

  if (daysRemaining !== undefined) {
    if (daysRemaining < 0) {
      message += `⚠️ Цель просрочена на ${Math.abs(daysRemaining)} дней`;
    } else {
      const dailyPlan = Math.ceil(remaining / daysRemaining);
      message += `📊 Для достижения цели делайте <b>${dailyPlan}</b> в день`;
    }
  }

  return sendNotification({
    user_id: userId,
    message,
    options: {
      parse_mode: 'HTML',
    },
  });
}

/**
 * Уведомление о мотивации при отставании
 */
export async function sendMotivationNotification(
  userId: number,
  goalTitle: string,
  behindBy: number
): Promise<boolean> {
  const message = `💪 <b>${goalTitle}</b>\n\n`;
  const motivation = `Вы отстаете от графика на ${behindBy} единиц. Не останавливайтесь! Пусть Аллах укрепит вас! 🤲`;

  return sendNotification({
    user_id: userId,
    message: message + motivation,
    options: {
      parse_mode: 'HTML',
    },
  });
}

/**
 * Уведомление о достижении
 */
export async function sendAchievementNotification(
  userId: number,
  achievement: string,
  message: string
): Promise<boolean> {
  const fullMessage = `🎉 <b>${achievement}</b>\n\n${message}`;

  return sendNotification({
    user_id: userId,
    message: fullMessage,
    options: {
      parse_mode: 'HTML',
    },
  });
}

/**
 * Уведомление о завершении цели
 */
export async function sendGoalCompletedNotification(
  userId: number,
  goalTitle: string
): Promise<boolean> {
  const message = `✅ <b>Цель выполнена!</b>\n\n"${goalTitle}"\n\nМа ша Аллах! Поздравляем с достижением! 🎉`;

  return sendNotification({
    user_id: userId,
    message,
    options: {
      parse_mode: 'HTML',
    },
  });
}

/**
 * Уведомление о серии дней (streak)
 */
export async function sendStreakNotification(
  userId: number,
  streakDays: number
): Promise<boolean> {
  let message = '';
  if (streakDays === 7) {
    message = `🔥 Отличная серия!\n\nУ вас уже ${streakDays} дней подряд! Продолжайте в том же духе! 💪`;
  } else if (streakDays === 30) {
    message = `🌟 Невероятно!\n\n${streakDays} дней подряд! Ма ша Аллах! Вы настоящий пример! 🏆`;
  } else if (streakDays % 7 === 0) {
    message = `🔥 Серия продолжается!\n\nУже ${streakDays} дней подряд! Не останавливайтесь! 💪`;
  } else {
    return false; // Не отправляем для других дней
  }

  return sendNotification({
    user_id: userId,
    message,
    options: {
      parse_mode: 'HTML',
    },
  });
}


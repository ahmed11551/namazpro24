import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    // В реальном приложении здесь будет проверка Telegram initData
    // и получение данных пользователя из БД
    
    return NextResponse.json({
      user: {
        id: 1,
        telegram_user_id: 123456789,
        locale: 'ru',
        madhab: 'hanafi',
        tz: 'Europe/Moscow',
      },
      active_goal: null,
      daily_azkar: {
        fajr: 0,
        dhuhr: 0,
        asr: 0,
        maghrib: 0,
        isha: 0,
        total: 0,
        is_complete: false,
      },
      recent_items: [],
      active_goals: [],
      streak: 0,
      total_dhikr: 0,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to bootstrap' },
      { status: 500 }
    );
  }
}


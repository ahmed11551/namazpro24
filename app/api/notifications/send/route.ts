import { NextRequest, NextResponse } from 'next/server';
import {
  sendGoalReminder,
  sendMotivationNotification,
  sendAchievementNotification,
  sendGoalCompletedNotification,
  sendStreakNotification,
} from '@/lib/notifications';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, user_id, ...data } = body;

    if (!user_id || !type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    let success = false;

    switch (type) {
      case 'goal_reminder':
        success = await sendGoalReminder(
          user_id,
          data.goal_title,
          data.remaining,
          data.target,
          data.days_remaining
        );
        break;

      case 'motivation':
        success = await sendMotivationNotification(
          user_id,
          data.goal_title,
          data.behind_by
        );
        break;

      case 'achievement':
        success = await sendAchievementNotification(
          user_id,
          data.achievement,
          data.message
        );
        break;

      case 'goal_completed':
        success = await sendGoalCompletedNotification(
          user_id,
          data.goal_title
        );
        break;

      case 'streak':
        success = await sendStreakNotification(user_id, data.streak_days);
        break;

      default:
        return NextResponse.json(
          { error: 'Invalid notification type' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success });
  } catch (error) {
    console.error('Error sending notification:', error);
    return NextResponse.json(
      { error: 'Failed to send notification' },
      { status: 500 }
    );
  }
}


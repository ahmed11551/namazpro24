import { NextRequest, NextResponse } from 'next/server';

// GET /api/prayer-debt/snapshot - получить последний расчет и прогресс
export async function GET(request: NextRequest) {
  try {
    // В реальном приложении здесь будет получение из БД
    return NextResponse.json({
      debt_calculation: null,
      repayment_progress: {
        completed_prayers: {
          fajr: 0,
          dhuhr: 0,
          asr: 0,
          maghrib: 0,
          isha: 0,
          witr: 0,
        },
        last_updated: null,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch snapshot' },
      { status: 500 }
    );
  }
}


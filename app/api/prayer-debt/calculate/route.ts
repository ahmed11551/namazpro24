import { NextRequest, NextResponse } from 'next/server';

// POST /api/prayer-debt/calculate - рассчитать долг по намазам
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      personal_data,
      women_data,
      travel_data,
    } = body;

    // Валидация
    if (!personal_data?.birth_date || !personal_data?.gender) {
      return NextResponse.json(
        { error: 'Missing required personal data' },
        { status: 400 }
      );
    }

    // Расчет даты булюга (упрощенная версия)
    const birthDate = new Date(personal_data.birth_date);
    const bulughAge = personal_data.bulugh_age || 15;
    const bulughDate = new Date(birthDate);
    bulughDate.setFullYear(birthDate.getFullYear() + bulughAge);

    // Определение периода
    const startDate = bulughDate;
    const endDate = personal_data.today_as_start
      ? new Date()
      : new Date(personal_data.prayer_start_date || new Date());
    
    const totalDays = Math.floor(
      (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // Исключения
    let excludedDays = 0;
    if (personal_data.gender === 'female' && women_data) {
      const totalMonths = totalDays / 30.44;
      const haidDays = totalMonths * (women_data.haid_days_per_month || 7);
      const nifasDays =
        (women_data.childbirth_count || 0) *
        (women_data.nifas_days_per_childbirth || 40);
      excludedDays = haidDays + nifasDays;
    }

    excludedDays += travel_data?.total_travel_days || 0;

    // Эффективные дни
    const effectiveDays = Math.max(0, totalDays - excludedDays);

    // Расчет пропущенных намазов (5 обязательных + витр)
    const missed_prayers = {
      fajr: effectiveDays,
      dhuhr: effectiveDays,
      asr: effectiveDays,
      maghrib: effectiveDays,
      isha: effectiveDays,
      witr: effectiveDays,
    };

    // Сафар-намазы (сокращенные)
    const travel_prayers = {
      dhuhr_safar: travel_data?.total_travel_days || 0,
      asr_safar: travel_data?.total_travel_days || 0,
      isha_safar: travel_data?.total_travel_days || 0,
    };

    const debt_calculation = {
      period: {
        start: startDate.toISOString(),
        end: endDate.toISOString(),
      },
      total_days: totalDays,
      excluded_days: Math.round(excludedDays),
      effective_days: Math.round(effectiveDays),
      missed_prayers,
      travel_prayers,
    };

    return NextResponse.json({
      calc_version: '1.0.0',
      madhab: 'hanafi',
      calculation_method: 'calculator',
      personal_data,
      women_data: women_data || null,
      travel_data: travel_data || { total_travel_days: 0, travel_periods: [] },
      debt_calculation,
      repayment_progress: {
        completed_prayers: {
          fajr: 0,
          dhuhr: 0,
          asr: 0,
          maghrib: 0,
          isha: 0,
          witr: 0,
        },
        last_updated: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Calculation error:', error);
    return NextResponse.json(
      { error: 'Failed to calculate prayer debt' },
      { status: 500 }
    );
  }
}


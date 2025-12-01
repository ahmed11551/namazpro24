/**
 * e-Replika API Client
 * Документация: https://bot.e-replika.ru/docs
 */

const E_REPLIKA_API_URL = process.env.E_REPLIKA_API_URL || 'https://bot.e-replika.ru';
const E_REPLIKA_API_KEY = process.env.E_REPLIKA_API_KEY || '';

export interface EReplikaResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export interface HijriDate {
  day: number;
  month: number;
  year: number;
  month_name: string;
  day_name: string;
}

export interface PrayerTimes {
  fajr: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

export interface Term {
  id: string;
  term: string;
  definition: string;
  category: string;
}

/**
 * Конвертация григорианской даты в хиджру
 */
export async function convertToHijri(
  gregorianDate: Date | string
): Promise<HijriDate | null> {
  try {
    const date = typeof gregorianDate === 'string' 
      ? new Date(gregorianDate) 
      : gregorianDate;
    
    const response = await fetch(
      `${E_REPLIKA_API_URL}/api/hijri/convert?date=${date.toISOString()}`,
      {
        headers: {
          'Authorization': `Bearer ${E_REPLIKA_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to convert date');
    }

    const data = await response.json();
    return data as HijriDate;
  } catch (error) {
    console.error('Error converting to Hijri:', error);
    return null;
  }
}

/**
 * Получение терминов (словарик)
 */
export async function getTerms(
  category?: string
): Promise<Term[]> {
  try {
    const url = category
      ? `${E_REPLIKA_API_URL}/api/terms?category=${category}`
      : `${E_REPLIKA_API_URL}/api/terms`;
    
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${E_REPLIKA_API_KEY}`,
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch terms');
    }

    const data = await response.json();
    return data.terms || [];
  } catch (error) {
    console.error('Error fetching terms:', error);
    return [];
  }
}

/**
 * Генерация PDF отчета
 */
export async function generatePDFReport(
  reportData: {
    user_id: string;
    prayer_debt?: any;
    goals?: any[];
    statistics?: any;
  }
): Promise<Blob | null> {
  try {
    const response = await fetch(`${E_REPLIKA_API_URL}/api/reports/pdf`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${E_REPLIKA_API_KEY}`,
      },
      body: JSON.stringify(reportData),
    });

    if (!response.ok) {
      throw new Error('Failed to generate PDF');
    }

    return await response.blob();
  } catch (error) {
    console.error('Error generating PDF:', error);
    return null;
  }
}

/**
 * Получение времени намазов
 */
export async function getPrayerTimes(
  date: Date,
  latitude: number,
  longitude: number,
  timezone?: string
): Promise<PrayerTimes | null> {
  try {
    const response = await fetch(
      `${E_REPLIKA_API_URL}/api/prayer-times?` +
      `date=${date.toISOString()}&lat=${latitude}&lng=${longitude}&tz=${timezone || 'auto'}`,
      {
        headers: {
          'Authorization': `Bearer ${E_REPLIKA_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch prayer times');
    }

    const data = await response.json();
    return data.times as PrayerTimes;
  } catch (error) {
    console.error('Error fetching prayer times:', error);
    return null;
  }
}

/**
 * Асинхронный расчет долга по намазам через e-Replika
 */
export async function calculatePrayerDebtAsync(
  calculationData: any
): Promise<{ job_id: string; status_url: string } | null> {
  try {
    const response = await fetch(`${E_REPLIKA_API_URL}/api/prayer-debt/calculate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${E_REPLIKA_API_KEY}`,
      },
      body: JSON.stringify(calculationData),
    });

    if (!response.ok) {
      throw new Error('Failed to start calculation');
    }

    const data = await response.json();
    return {
      job_id: data.job_id,
      status_url: data.status_url,
    };
  } catch (error) {
    console.error('Error starting calculation:', error);
    return null;
  }
}

/**
 * Проверка статуса асинхронного расчета
 */
export async function checkCalculationStatus(
  jobId: string
): Promise<{ status: 'pending' | 'done' | 'error'; result?: any } | null> {
  try {
    const response = await fetch(
      `${E_REPLIKA_API_URL}/api/prayer-debt/status/${jobId}`,
      {
        headers: {
          'Authorization': `Bearer ${E_REPLIKA_API_KEY}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error('Failed to check status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error checking status:', error);
    return null;
  }
}


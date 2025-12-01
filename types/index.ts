export type PrayerType = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha' | 'witr';
export type PrayerSegment = PrayerType | 'none';

export type GoalCategory =
  | 'prayer'
  | 'quran'
  | 'zikr'
  | 'sadaqa'
  | 'knowledge'
  | 'names99';

export type GoalType = 'recite' | 'learn';
export type GoalStatus = 'active' | 'completed' | 'paused' | 'archived';

export type DhikrCategory =
  | 'general'
  | 'surah'
  | 'ayah'
  | 'dua'
  | 'azkar'
  | 'names99'
  | 'salawat'
  | 'kalimat';

export type EventType = 'tap' | 'bulk' | 'repeat' | 'learn_mark' | 'goal_completed' | 'auto_reset';

export type Madhab = 'hanafi' | 'shafi' | 'maliki' | 'hanbali';

export interface User {
  id: string;
  telegram_user_id: number;
  locale: string;
  madhab: Madhab;
  tz: string;
  created_at: string;
}

export interface Goal {
  id: string;
  user_id: string;
  category: GoalCategory;
  item_id?: string;
  goal_type: GoalType;
  target_count: number;
  progress: number;
  status: GoalStatus;
  linked_counter_type?: string;
  created_at: string;
  completed_at?: string;
}

export interface TasbihSession {
  id: string;
  user_id: string;
  goal_id?: string;
  prayer_segment: PrayerSegment;
  started_at: string;
  ended_at?: string;
}

export interface DhikrLog {
  id: string;
  user_id: string;
  session_id: string;
  goal_id?: string;
  category: DhikrCategory;
  item_id?: string;
  event_type: EventType;
  delta: number;
  value_after: number;
  prayer_segment: PrayerSegment;
  at_ts: string;
  tz: string;
  offline_id?: string;
}

export interface DailyAzkar {
  user_id: string;
  date_local: string;
  fajr: number;
  dhuhr: number;
  asr: number;
  maghrib: number;
  isha: number;
  total: number;
  is_complete: boolean;
}

export interface PrayerDebt {
  user_id: string;
  calc_version: string;
  madhab: Madhab;
  calculation_method: 'manual' | 'calculator';
  personal_data: {
    birth_date: string;
    gender: 'male' | 'female';
    bulugh_age: number;
    bulugh_date: string;
    prayer_start_date: string;
    today_as_start: boolean;
  };
  women_data?: {
    haid_days_per_month: number;
    childbirth_count: number;
    nifas_days_per_childbirth: number;
  };
  travel_data: {
    total_travel_days: number;
    travel_periods: Array<{
      start_date: string;
      end_date: string;
      days_count: number;
    }>;
  };
  debt_calculation: {
    period: {
      start: string;
      end: string;
    };
    total_days: number;
    excluded_days: number;
    effective_days: number;
    missed_prayers: {
      fajr: number;
      dhuhr: number;
      asr: number;
      maghrib: number;
      isha: number;
      witr: number;
    };
    travel_prayers: {
      dhuhr_safar: number;
      asr_safar: number;
      isha_safar: number;
    };
  };
  repayment_progress: {
    completed_prayers: {
      fajr: number;
      dhuhr: number;
      asr: number;
      maghrib: number;
      isha: number;
      witr: number;
    };
    last_updated: string;
  };
}


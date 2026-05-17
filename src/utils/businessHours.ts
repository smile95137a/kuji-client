import type {
  StoreBusinessHours,
  StoreBusinessHoursDay,
  StoreBusinessHoursStructured,
  StoreBusinessHoursStructuredSchedule,
} from '@/services/storeService';

type LegacyDayKey =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export interface BusinessHoursDisplayRow {
  key: LegacyDayKey;
  day: StoreBusinessHoursStructuredSchedule['day'];
  label: string;
  isClosed: boolean;
  open: string;
  close: string;
}

const dayDefinitions: Array<{
  key: LegacyDayKey;
  day: StoreBusinessHoursStructuredSchedule['day'];
  label: string;
}> = [
  { key: 'monday', day: 'MON', label: '週一' },
  { key: 'tuesday', day: 'TUE', label: '週二' },
  { key: 'wednesday', day: 'WED', label: '週三' },
  { key: 'thursday', day: 'THU', label: '週四' },
  { key: 'friday', day: 'FRI', label: '週五' },
  { key: 'saturday', day: 'SAT', label: '週六' },
  { key: 'sunday', day: 'SUN', label: '週日' },
];

const isStructuredBusinessHours = (
  value: StoreBusinessHours,
): value is StoreBusinessHoursStructured => {
  return (
    !!value &&
    typeof value === 'object' &&
    'schedules' in value &&
    Array.isArray((value as StoreBusinessHoursStructured).schedules)
  );
};

const isLegacyBusinessHours = (
  value: StoreBusinessHours,
): value is Record<string, StoreBusinessHoursDay> => {
  return !!value && typeof value === 'object' && !('schedules' in value);
};

export const toBusinessHoursRows = (
  businessHours: StoreBusinessHours,
): BusinessHoursDisplayRow[] => {
  if (isStructuredBusinessHours(businessHours)) {
    const scheduleMap = new Map(
      businessHours.schedules.map((schedule) => [schedule.day, schedule]),
    );

    return dayDefinitions.map(({ key, day, label }) => {
      const schedule = scheduleMap.get(day);
      return {
        key,
        day,
        label,
        isClosed: schedule?.closed ?? true,
        open: schedule?.open ?? '',
        close: schedule?.close ?? '',
      };
    });
  }

  if (isLegacyBusinessHours(businessHours)) {
    return dayDefinitions.map(({ key, day, label }) => {
      const schedule = businessHours[key];
      return {
        key,
        day,
        label,
        isClosed: schedule?.isClosed ?? true,
        open: schedule?.open ?? '',
        close: schedule?.close ?? '',
      };
    });
  }

  return [];
};

export const getTodayBusinessHoursRow = (
  businessHours: StoreBusinessHours,
): BusinessHoursDisplayRow | null => {
  const rows = toBusinessHoursRows(businessHours);
  if (!rows.length) return null;

  const todayIndex = (() => {
    const day = new Date().getDay();
    return day === 0 ? 6 : day - 1;
  })();

  return rows[todayIndex] ?? null;
};

export const formatBusinessHoursSummary = (
  businessHours: StoreBusinessHours,
): string => {
  if (!businessHours) return '';

  if (typeof businessHours === 'string') {
    return businessHours.trim();
  }

  const rows = toBusinessHoursRows(businessHours);
  if (!rows.length) {
    return '';
  }

  const openRows = rows.filter((row) => !row.isClosed);
  if (!openRows.length) {
    return '目前公休';
  }

  const sameHours = openRows.every(
    (row) => row.open === openRows[0].open && row.close === openRows[0].close,
  );

  if (openRows.length === 7 && sameHours) {
    return `每日 ${openRows[0].open} - ${openRows[0].close}`;
  }

  return '營業時間依每日時段為準';
};

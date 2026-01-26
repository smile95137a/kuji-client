// src/utils/DateUtils.ts
import moment, { Moment } from 'moment';

const DEFAULT_FORMAT = 'YYYY-MM-DD';
const DEFAULT_DATETIME_FORMAT = 'YYYY-MM-DD HH:mm:ss';
const PARSE_FORMATS = [
  DEFAULT_FORMAT,
  DEFAULT_DATETIME_FORMAT,
  'YYYY/MM/DD',
  'YYYY/MM/DD HH:mm:ss',
  'MM/DD/YYYY',
  'DD/MM/YYYY',
  moment.ISO_8601,
];

type DateInput = string | Date | number | Moment;

export type DateRange = { start: string; end: string };
export type DateRangeMoment = { start: Moment; end: Moment };

/* ===================== 基礎格式化 / 解析 ===================== */
export const toMoment = (
  input?: DateInput,
  format: string = DEFAULT_FORMAT
): Moment => {
  if (!input) return moment.invalid();
  if (moment.isMoment(input)) return input.clone();
  if (input instanceof Date) return moment(input);
  if (typeof input === 'number') return moment(input); // ms/unix(秒)都可；秒需用 fromUnix
  if (typeof input === 'string')
    return moment(input, PARSE_FORMATS, true).isValid()
      ? moment(input, PARSE_FORMATS, true)
      : moment(input, format, true);
  return moment.invalid();
};

export const safeParse = (input?: DateInput): Moment => toMoment(input);

export const isValidDate = (input?: DateInput): boolean =>
  toMoment(input).isValid();

export const formatDate = (
  input?: DateInput,
  format: string = DEFAULT_FORMAT
): string => (toMoment(input).isValid() ? toMoment(input).format(format) : '');

export const formatDateTime = (
  input?: DateInput,
  format: string = DEFAULT_DATETIME_FORMAT
): string => formatDate(input, format);

export const toDate = (input?: DateInput): Date | null =>
  toMoment(input).isValid() ? toMoment(input).toDate() : null;

export const toISO = (input?: DateInput): string =>
  toMoment(input).isValid() ? toMoment(input).toISOString() : '';

export const toUnix = (input?: DateInput): number | null =>
  toMoment(input).isValid() ? toMoment(input).unix() : null;

export const fromUnix = (seconds: number): Moment => moment.unix(seconds);

/* ===================== 今日 / 昨日 / 相對日期 ===================== */
export const today = (format: string = DEFAULT_FORMAT): string =>
  moment().format(format);
export const now = (): Moment => moment();

export const yesterday = (format: string = DEFAULT_FORMAT): string =>
  moment().subtract(1, 'day').format(format);

export const daysAgo = (
  days: number = 7,
  format: string = DEFAULT_FORMAT
): string => moment().subtract(days, 'days').format(format);

export const monthsAgo = (
  months: number = 1,
  format: string = DEFAULT_FORMAT
): string => moment().subtract(months, 'month').format(format);

export const add = (
  input: DateInput,
  amount: number,
  unit: moment.unitOfTime.DurationConstructor,
  format: string = DEFAULT_FORMAT
) => formatDate(toMoment(input).add(amount, unit), format);

export const sub = (
  input: DateInput,
  amount: number,
  unit: moment.unitOfTime.DurationConstructor,
  format: string = DEFAULT_FORMAT
) => formatDate(toMoment(input).subtract(amount, unit), format);

/* ===================== 當月 / 指定月份最後一天 ===================== */

/** 當月最後一天（回傳字串） */
export const lastDayOfCurrentMonth = (
  format: string = DEFAULT_FORMAT
): string => endOfMonth().format(format);

/** 指定日期所屬月份的最後一天（回傳字串） */
export const lastDayOfMonth = (
  input?: DateInput,
  format: string = DEFAULT_FORMAT
): string => endOfMonth(input).format(format);

/* ===================== 起迄 / 週期 ===================== */
export const startOfDay = (input?: DateInput): Moment =>
  toMoment(input ?? now()).startOf('day');
export const endOfDay = (input?: DateInput): Moment =>
  toMoment(input ?? now()).endOf('day');

export const startOfWeek = (input?: DateInput, dow: number = 1): Moment => {
  // dow: 0 = Sunday, 1 = Monday（預設周一為週首）
  return toMoment(input ?? now())
    .isoWeekday(dow)
    .startOf('day');
};

export const endOfWeek = (input?: DateInput, dow: number = 1): Moment => {
  const start = startOfWeek(input, dow);
  return start.clone().add(6, 'days').endOf('day');
};

export const startOfMonth = (input?: DateInput): Moment =>
  toMoment(input ?? now()).startOf('month');

export const endOfMonth = (input?: DateInput): Moment =>
  toMoment(input ?? now()).endOf('month');

export const startOfQuarter = (input?: DateInput): Moment =>
  toMoment(input ?? now()).startOf('quarter');

export const endOfQuarter = (input?: DateInput): Moment =>
  toMoment(input ?? now()).endOf('quarter');

export const startOfYear = (input?: DateInput): Moment =>
  toMoment(input ?? now()).startOf('year');

export const endOfYear = (input?: DateInput): Moment =>
  toMoment(input ?? now()).endOf('year');

/* ===================== 區間（字串） ===================== */
export const thisWeekRange = (
  format: string = DEFAULT_FORMAT,
  dow: number = 1
): DateRange => ({
  start: startOfWeek(undefined, dow).format(format),
  end: endOfWeek(undefined, dow).format(format),
});

export const lastWeekRange = (
  format: string = DEFAULT_FORMAT,
  dow: number = 1
): DateRange => {
  const start = startOfWeek(undefined, dow).subtract(7, 'days');
  const end = start.clone().add(6, 'days').endOf('day');
  return { start: start.format(format), end: end.format(format) };
};

export const thisMonthRange = (format: string = DEFAULT_FORMAT): DateRange => ({
  start: startOfMonth().format(format),
  end: endOfMonth().format(format),
});

export const lastMonthRange = (format: string = DEFAULT_FORMAT): DateRange => {
  const start = startOfMonth().subtract(1, 'month');
  const end = start.clone().endOf('month');
  return { start: start.format(format), end: end.format(format) };
};

export const thisQuarterRange = (
  format: string = DEFAULT_FORMAT
): DateRange => ({
  start: startOfQuarter().format(format),
  end: endOfQuarter().format(format),
});

export const lastQuarterRange = (
  format: string = DEFAULT_FORMAT
): DateRange => {
  const start = startOfQuarter().subtract(1, 'quarter');
  const end = start.clone().endOf('quarter');
  return { start: start.format(format), end: end.format(format) };
};

export const thisYearRange = (format: string = DEFAULT_FORMAT): DateRange => ({
  start: startOfYear().format(format),
  end: endOfYear().format(format),
});

export const lastYearRange = (format: string = DEFAULT_FORMAT): DateRange => {
  const start = startOfYear().subtract(1, 'year');
  const end = start.clone().endOf('year');
  return { start: start.format(format), end: end.format(format) };
};

export const lastNDaysRange = (
  days: number = 7,
  format: string = DEFAULT_FORMAT
): DateRange => ({
  start: moment().subtract(days, 'days').format(format),
  end: moment().format(format),
});

export const lastNMonthsRange = (
  months: number = 1,
  format: string = DEFAULT_FORMAT
): DateRange => ({
  start: moment().subtract(months, 'month').format(format),
  end: moment().format(format),
});

/* ===================== 季度 / 年度工具 ===================== */
export const getQuarter = (input?: DateInput): number =>
  toMoment(input ?? now()).quarter();

export const getQuarterLabel = (input?: DateInput): string => {
  const m = toMoment(input ?? now());
  return `${m.year()} Q${m.quarter()}`;
};

/* ===================== 比較 / 差異 ===================== */
export const isSameDay = (a?: DateInput, b?: DateInput): boolean =>
  toMoment(a).isSame(toMoment(b), 'day');

export const isBefore = (a?: DateInput, b?: DateInput): boolean =>
  toMoment(a).isBefore(toMoment(b));

export const isAfter = (a?: DateInput, b?: DateInput): boolean =>
  toMoment(a).isAfter(toMoment(b));

export const isBetween = (
  target?: DateInput,
  start?: DateInput,
  end?: DateInput,
  inclusive: '()' | '[]' | '[)' | '(]' = '[]'
): boolean => {
  const t = toMoment(target);
  return t.isBetween(toMoment(start), toMoment(end), undefined, inclusive);
};

export const diffDays = (a?: DateInput, b?: DateInput): number =>
  toMoment(a).diff(toMoment(b), 'days');

export const diffMonths = (a?: DateInput, b?: DateInput): number =>
  toMoment(a).diff(toMoment(b), 'months');

export const diffYears = (a?: DateInput, b?: DateInput): number =>
  toMoment(a).diff(toMoment(b), 'years');

/* ===================== 其他工具 ===================== */
export const clampDate = (
  input?: DateInput,
  min?: DateInput,
  max?: DateInput,
  format: string = DEFAULT_FORMAT
): string => {
  const m = toMoment(input);
  if (!m.isValid()) return '';
  const minM = min ? toMoment(min) : null;
  const maxM = max ? toMoment(max) : null;

  let res = m.clone();
  if (minM && res.isBefore(minM)) res = minM.clone();
  if (maxM && res.isAfter(maxM)) res = maxM.clone();
  return res.format(format);
};

export const isWeekend = (input?: DateInput): boolean => {
  const d = toMoment(input ?? now()).day(); // 0 Sun ~ 6 Sat
  return d === 0 || d === 6;
};

export const addBusinessDays = (
  input: DateInput,
  days: number,
  format: string = DEFAULT_FORMAT
): string => {
  let m = startOfDay(input);
  const step = days >= 0 ? 1 : -1;
  let remaining = Math.abs(days);

  while (remaining > 0) {
    m = m.add(step, 'day');
    if (!isWeekend(m)) remaining -= 1;
  }
  return m.format(format);
};

/* ===================== 預設常用區間 / 泛用介面 ===================== */
export const presetRanges = (
  format: string = DEFAULT_FORMAT,
  dow: number = 1
) => ({
  today: { start: today(format), end: today(format) },
  yesterday: { start: yesterday(format), end: yesterday(format) },
  last7Days: lastNDaysRange(7, format),
  last30Days: lastNDaysRange(30, format),
  thisWeek: thisWeekRange(format, dow),
  lastWeek: lastWeekRange(format, dow),
  thisMonth: thisMonthRange(format),
  lastMonth: lastMonthRange(format),
  thisQuarter: thisQuarterRange(format),
  lastQuarter: lastQuarterRange(format),
  thisYear: thisYearRange(format),
  lastYear: lastYearRange(format),
});

export type PresetKey =
  | 'today'
  | 'yesterday'
  | 'last7Days'
  | 'last30Days'
  | 'thisWeek'
  | 'lastWeek'
  | 'thisMonth'
  | 'lastMonth'
  | 'thisQuarter'
  | 'lastQuarter'
  | 'thisYear'
  | 'lastYear';

export const getRangeFor = (
  key: PresetKey,
  format: string = DEFAULT_FORMAT,
  dow: number = 1
): DateRange => presetRanges(format, dow)[key];
export const parseYyyyMmDd = (input?: string): string =>
  input ? moment(input, 'YYYYMMDD', true).format('YYYY-MM-DD') : '';
// 轉成 YYYY/MM/DD
export const formatDateString = (input?: string): string => {
  if (!input) return '';
  return moment(input, PARSE_FORMATS, true).format('YYYY/MM/DD');
};

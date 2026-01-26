import moment from 'moment';

export const formatToTaiwanDateArray = (dateStr: string): string[] => {
  const m = moment(dateStr, 'YYYY-MM-DD', true);
  if (!m.isValid()) return [];
  const year = (m.year() - 1911).toString();
  const month = m.format('MM');
  const day = m.format('DD');
  return [year, month, day];
};

export const parseTaiwanDateArray = (taiwanDate: string): string[] => {
  const match = taiwanDate.match(/^民國(\d{1,3})年(\d{1,2})月(\d{1,2})日$/);
  if (!match) return [];
  const [, rocYear, month, day] = match;
  const year = (parseInt(rocYear) + 1911).toString();
  const paddedMonth = month.padStart(2, '0');
  const paddedDay = day.padStart(2, '0');
  return [year, paddedMonth, paddedDay];
};

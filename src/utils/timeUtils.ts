// src/utils/timeUtils.ts

export const parseDateSafe = (s?: string | null) => {
  if (!s) return null;
  const d = new Date(s);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const formatRelativeTimeZh = (date: Date, now = new Date()) => {
  const diffMs = now.getTime() - date.getTime();
  if (diffMs < 0) return '剛剛';

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < hour) {
    const mins = Math.max(1, Math.floor(diffMs / minute));
    return mins <= 1 ? '1分鐘前' : `${mins}分鐘前`;
  }

  if (diffMs < day) {
    const hrs = Math.floor(diffMs / hour);
    return hrs <= 1 ? '1小時前' : `${hrs}小時前`;
  }

  const days = Math.floor(diffMs / day);

  if (days < 7) return days <= 1 ? '1天前' : `${days}天前`;

  if (days < 30) {
    const weeks = Math.floor(days / 7);
    return weeks <= 1 ? '1週前' : `${weeks}週前`;
  }

  // >= 30 天：用「月」(以年月差計算，避免 31/28 天問題)
  const y1 = now.getFullYear();
  const m1 = now.getMonth();
  const y2 = date.getFullYear();
  const m2 = date.getMonth();

  let months = (y1 - y2) * 12 + (m1 - m2);

  // 如果「本月還沒到那一天」，月數要 -1
  if (now.getDate() < date.getDate()) months -= 1;

  if (months <= 0) {
    const approxWeeks = Math.floor(days / 7);
    return approxWeeks <= 1 ? '1週前' : `${approxWeeks}週前`;
  }

  if (months < 12) return months === 1 ? '1個月前' : `${months}個月前`;

  const years = Math.floor(months / 12);
  return years === 1 ? '1年前' : `${years}年前`;
};

export const formatFutureTimeZh = (target: Date, now = new Date()) => {
  const diffMs = target.getTime() - now.getTime();
  if (diffMs <= 0) return '剛剛';

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs < hour) {
    const mins = Math.max(1, Math.ceil(diffMs / minute));
    return mins === 1 ? '1分鐘後' : `${mins}分鐘後`;
  }

  if (diffMs < day) {
    const hrs = Math.max(1, Math.ceil(diffMs / hour));
    return hrs === 1 ? '1小時後' : `${hrs}小時後`;
  }

  const days = Math.max(1, Math.ceil(diffMs / day));
  if (days < 7) return days === 1 ? '1天後' : `${days}天後`;

  if (days < 30) {
    const weeks = Math.max(1, Math.ceil(days / 7));
    return weeks === 1 ? '1週後' : `${weeks}週後`;
  }

  // 月/年用年月差
  const y1 = now.getFullYear();
  const m1 = now.getMonth();
  const y2 = target.getFullYear();
  const m2 = target.getMonth();

  let months = (y2 - y1) * 12 + (m2 - m1);
  if (target.getDate() < now.getDate()) months -= 1;

  if (months <= 0) {
    const weeks = Math.max(1, Math.ceil(days / 7));
    return weeks === 1 ? '1週後' : `${weeks}週後`;
  }

  if (months < 12) return months === 1 ? '1個月後' : `${months}個月後`;

  const years = Math.max(1, Math.floor(months / 12));
  return years === 1 ? '1年後' : `${years}年後`;
};

export const formatRemainingZh = (end: Date, now = new Date()) => {
  const diffMs = end.getTime() - now.getTime();
  if (diffMs <= 0) return '0分鐘';

  const minute = 60 * 1000;
  const hour = 60 * minute;
  const day = 24 * hour;

  if (diffMs >= day) {
    const d = Math.ceil(diffMs / day);
    return d === 1 ? '1天' : `${d}天`;
  }

  if (diffMs >= hour) {
    const h = Math.ceil(diffMs / hour);
    return h === 1 ? '1小時' : `${h}小時`;
  }

  const m = Math.max(1, Math.ceil(diffMs / minute));
  return m === 1 ? '1分鐘' : `${m}分鐘`;
};

export const getBannerTag = (b: any, now = new Date()) => {
  const start = parseDateSafe(b.startTime);
  const end = parseDateSafe(b.endTime);

  if (start && end) {
    if (now < start) return `即將開始 · ${formatFutureTimeZh(start, now)}`;
    if (now > end) return `已結束 · ${formatRelativeTimeZh(end, now)}`;
    return `進行中 · 剩${formatRemainingZh(end, now)}`;
  }

  const created = parseDateSafe(b.createdAt);
  if (created) return `上架 · ${formatRelativeTimeZh(created, now)}`;

  return '活動中';
};

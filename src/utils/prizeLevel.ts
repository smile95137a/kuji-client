export function formatPrizeLevel(level?: string | null): string {
  const normalized = String(level ?? '')
    .trim()
    .toUpperCase();

  if (!normalized) return '';
  if (normalized === 'GRAND') return '大獎';
  if (normalized === 'LAST') return '最後賞';
  if (normalized === 'THANKS') return '銘謝惠顧';
  if (normalized.endsWith('賞')) return normalized;

  return `${normalized}賞`;
}

/**
 * Format number as Japanese Yen currency
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("ja-JP", {
    style: "currency",
    currency: "JPY",
    minimumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format date for display
 */
export function formatDate(
  dateStr: string,
  options?: Intl.DateTimeFormatOptions
): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat(
    "ja-JP",
    options || {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(date);
}

/**
 * Format relative time (e.g., "3分前")
 */
export function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMinutes < 1) return "たった今";
  if (diffMinutes < 60) return `${diffMinutes}分前`;
  if (diffHours < 24) return `${diffHours}時間前`;
  if (diffDays < 7) return `${diffDays}日前`;

  return formatDate(dateStr, { month: "short", day: "numeric" });
}

/**
 * Get month label in Japanese
 */
export function getMonthLabel(date: Date = new Date()): string {
  return new Intl.DateTimeFormat("ja-JP", {
    year: "numeric",
    month: "long",
  }).format(date);
}

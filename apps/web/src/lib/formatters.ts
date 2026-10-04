/**
 * Centralized formatting utility for professional, human-friendly UI labels.
 * Transforms technical database enums and snake_case slugs into clean, readable text.
 */

export const ACCESS_TYPE_LABELS: Record<string, string> = {
  van_only: 'Van Only',
  mall_dock: 'Mall Dock',
  rear_dock: 'Rear Dock',
  street: 'Street Access',
  normal: 'Standard Dock',
};

export const DEFERRAL_REASON_LABELS: Record<string, string> = {
  REEFER_CAPACITY: 'Reefer Capacity Shortage',
  VAN_ONLY: 'Van-Only Access Constraint',
  WEIGHT_VOLUME: 'Weight & Volume Exceeded',
  TIME_BUDGET: 'Time Budget Exceeded',
  FUEL_QUOTA: 'Fuel Quota Limit',
  MALL_WINDOW: 'Mall Delivery Window Missed',
};

/**
 * Converts access constraint slugs (e.g. 'van_only', 'mall_dock') into clean Title Case labels.
 */
export function formatAccessType(type?: string | null): string {
  if (!type) return '';
  return ACCESS_TYPE_LABELS[type] || humanizeSnakeCase(type);
}

/**
 * Converts deferral reason codes (e.g. 'REEFER_CAPACITY') into readable descriptions.
 */
export function formatDeferralReason(reason?: string | null): string {
  if (!reason) return '';
  return DEFERRAL_REASON_LABELS[reason] || humanizeSnakeCase(reason);
}

/**
 * Converts generic snake_case or SCREAMING_SNAKE_CASE strings to clean Title Case.
 */
export function humanizeSnakeCase(str: string): string {
  return str
    .replace(/[_-]+/g, ' ')
    .trim()
    .toLowerCase()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

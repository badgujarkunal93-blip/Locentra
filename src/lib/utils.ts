import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Utility function to conditionally combine CSS class names with Tailwind merge support.
 */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

/**
 * Formats a number with precision and units for scientific telemetry.
 */
export function formatScientificValue(val: number, precision: number = 2, unit: string = ''): string {
  return `${val.toFixed(precision)}${unit ? ' ' + unit : ''}`;
}

/**
 * Formats a timestamp into human-readable ISO-like local time.
 */
export function formatTelemetryTime(date: Date = new Date()): string {
  return date.toTimeString().split(' ')[0] + '.' + String(date.getMilliseconds()).padStart(3, '0');
}

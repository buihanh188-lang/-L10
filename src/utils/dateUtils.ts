/**
 * Utility functions for handling Real-Time Vietnam Timezone (UTC+7, Asia/Ho_Chi_Minh)
 * and Teacher Exam Deadlines / Countdown Timers.
 */

export interface RemainingTimeInfo {
  isExpired: boolean;
  isRevoked: boolean;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalSeconds: number;
  displayText: string;
  badgeStyle: 'active' | 'warning' | 'expired' | 'revoked';
}

/**
 * Parses any date/string input safely into a Date object.
 * If input is a date-only string (e.g. "2026-11-20"), treats it as 23:59:59 of that day.
 */
export function parseDateInput(input: string | number | Date | undefined): Date | null {
  if (!input) return null;
  if (input instanceof Date) return isNaN(input.getTime()) ? null : input;

  if (typeof input === 'number') {
    const d = new Date(input);
    return isNaN(d.getTime()) ? null : d;
  }

  const str = String(input).trim();
  // Check if string is date-only YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) {
    // Treat as 23:59:59 in local / VN time
    const [y, m, d] = str.split('-').map(Number);
    const date = new Date();
    date.setFullYear(y, m - 1, d);
    date.setHours(23, 59, 59, 999);
    return isNaN(date.getTime()) ? null : date;
  }

  const parsed = new Date(str);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Formats a Date or ISO string into Vietnam DateTime format: HH:mm, DD/MM/YYYY
 */
export function formatVNDateTime(
  input: string | number | Date | undefined,
  lang: 'vi' | 'en' = 'vi'
): string {
  const d = parseDateInput(input);
  if (!d) return lang === 'en' ? 'Unspecified' : 'Chưa xác định';

  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(d);
    const m: Record<string, string> = {};
    parts.forEach((p) => {
      m[p.type] = p.value;
    });
    return `${m.hour}:${m.minute}, ${m.day}/${m.month}/${m.year}`;
  } catch {
    // Fallback
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getHours())}:${pad(d.getMinutes())}, ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  }
}

/**
 * Formats into Vietnam Date only: DD/MM/YYYY
 */
export function formatVNDate(
  input: string | number | Date | undefined,
  lang: 'vi' | 'en' = 'vi'
): string {
  const d = parseDateInput(input);
  if (!d) return lang === 'en' ? 'Unspecified' : 'Chưa xác định';

  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    });
    const parts = formatter.formatToParts(d);
    const m: Record<string, string> = {};
    parts.forEach((p) => {
      m[p.type] = p.value;
    });
    return `${m.day}/${m.month}/${m.year}`;
  } catch {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
  }
}

/**
 * Formats a date into value for HTML <input type="datetime-local" /> in VN time
 * Format: YYYY-MM-DDTHH:mm
 */
export function toVNDateTimeLocalInput(input: string | number | Date | undefined): string {
  const d = parseDateInput(input) || new Date();

  try {
    const formatter = new Intl.DateTimeFormat('en-GB', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
    const parts = formatter.formatToParts(d);
    const m: Record<string, string> = {};
    parts.forEach((p) => {
      m[p.type] = p.value;
    });
    return `${m.year}-${m.month}-${m.day}T${m.hour}:${m.minute}`;
  } catch {
    const pad = (n: number) => n.toString().padStart(2, '0');
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
}

/**
 * Calculates deadline ISO string given a number of days from right now (real-time).
 * Default: 3 days.
 */
export function getFutureDeadlineISO(days: number = 3): string {
  const now = new Date();
  const future = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
  return future.toISOString();
}

/**
 * Calculates remaining time, countdown string, and status badge against real current time.
 */
export function calculateRemainingTime(
  deadlineInput: string | number | Date | undefined,
  isRevoked: boolean = false,
  lang: 'vi' | 'en' = 'vi'
): RemainingTimeInfo {
  const isEn = lang === 'en';
  if (isRevoked) {
    return {
      isExpired: true,
      isRevoked: true,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      displayText: isEn ? 'Exam revoked' : 'Đã thu hồi đề',
      badgeStyle: 'revoked',
    };
  }

  const deadline = parseDateInput(deadlineInput);
  if (!deadline) {
    return {
      isExpired: false,
      isRevoked: false,
      days: 999,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 999999,
      displayText: isEn ? 'No time limit' : 'Không giới hạn thời gian',
      badgeStyle: 'active',
    };
  }

  const nowMs = Date.now();
  const diffMs = deadline.getTime() - nowMs;

  if (diffMs <= 0) {
    return {
      isExpired: true,
      isRevoked: false,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      totalSeconds: 0,
      displayText: isEn ? 'Expired' : 'Đã hết hạn làm bài',
      badgeStyle: 'expired',
    };
  }

  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  const pad = (n: number) => n.toString().padStart(2, '0');

  let displayText = '';
  if (isEn) {
    if (days > 0) {
      displayText = `${days}d ${pad(hours)}:${pad(minutes)}:${pad(seconds)} left`;
    } else if (hours > 0) {
      displayText = `${pad(hours)}h ${pad(minutes)}:${pad(seconds)} left`;
    } else {
      displayText = `${pad(minutes)}m ${pad(seconds)}s left`;
    }
  } else {
    if (days > 0) {
      displayText = `Còn ${days} ngày ${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
    } else if (hours > 0) {
      displayText = `Còn ${pad(hours)} giờ ${pad(minutes)}:${pad(seconds)}`;
    } else {
      displayText = `Còn ${pad(minutes)} phút ${pad(seconds)} giây`;
    }
  }

  // Warning when less than 12 hours remain
  const badgeStyle = totalSeconds < 12 * 3600 ? 'warning' : 'active';

  return {
    isExpired: false,
    isRevoked: false,
    days,
    hours,
    minutes,
    seconds,
    totalSeconds,
    displayText,
    badgeStyle,
  };
}

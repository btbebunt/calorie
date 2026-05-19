/** Fixed app timezone: UTC+8 (no DST). */
export const APP_TIMEZONE = "Asia/Singapore";

/** Minutes returned by `Date.getTimezoneOffset()` for UTC+8 (local ahead of UTC). */
export const APP_TZ_OFFSET_MINUTES = -480;

export function getAppTodayDateString(now = new Date()): string {
  return now.toLocaleDateString("en-CA", { timeZone: APP_TIMEZONE });
}

export function getAppDayBounds(localDate: string): { start: string; end: string } {
  const [year, month, day] = localDate.split("-").map(Number);
  const startMs =
    Date.UTC(year, month - 1, day, 0, 0, 0, 0) +
    APP_TZ_OFFSET_MINUTES * 60 * 1000;
  const endMs =
    Date.UTC(year, month - 1, day, 23, 59, 59, 999) +
    APP_TZ_OFFSET_MINUTES * 60 * 1000;
  return {
    start: new Date(startMs).toISOString(),
    end: new Date(endMs).toISOString(),
  };
}

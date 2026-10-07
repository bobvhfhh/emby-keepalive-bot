export const REMINDER_DAYS = 25;
export function addDaysUtc(input: Date, days: number): Date { return new Date(input.getTime() + days * 86400000); }
export function formatShanghaiDate(input: Date): string { return new Intl.DateTimeFormat('zh-CN', { timeZone: 'Asia/Shanghai', year: 'numeric', month: 'long', day: 'numeric' }).format(input); }
export function initialReminderDate(): Date { return new Date('2026-10-31T16:00:00.000Z'); }

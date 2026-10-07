import { shanghaiCalendarDayNumber } from './time';

export type ReminderStage = 'five_days' | 'one_day' | 'due';

export function reminderStage(now: Date, due: Date): ReminderStage | null {
  const daysUntilDue = shanghaiCalendarDayNumber(due) - shanghaiCalendarDayNumber(now);
  if (daysUntilDue === 5) return 'five_days';
  if (daysUntilDue === 1) return 'one_day';
  if (daysUntilDue === 0) return 'due';
  return null;
}

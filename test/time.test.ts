import { describe, expect, it } from 'vitest';
import { addDaysUtc, addShanghaiCalendarDays, formatShanghaiDate } from '../src/time';

describe('time helpers', () => {
  it('adds exactly 25 days', () => {
    expect(addDaysUtc(new Date('2026-11-01T00:00:00.000Z'), 25).toISOString())
      .toBe('2026-11-26T00:00:00.000Z');
  });

  it('formats reminder date in Shanghai time', () => {
    expect(formatShanghaiDate(new Date('2026-10-31T16:00:00.000Z')))
      .toBe('2026年11月1日');
  });

  it('uses Shanghai midnight for the next calendar reminder', () => {
    expect(addShanghaiCalendarDays(new Date('2026-11-01T10:30:00.000Z'), 25).toISOString())
      .toBe('2026-11-25T16:00:00.000Z');
  });
});

import { describe, expect, it } from 'vitest';
import { reminderStage } from '../src/reminder';

describe('reminder schedule', () => {
  const due = new Date('2026-10-31T16:00:00.000Z'); // November 1 in Shanghai

  it('sends the early notice five Shanghai calendar days before the due date', () => {
    expect(reminderStage(new Date('2026-10-27T06:00:00.000Z'), due)).toBe('five_days');
  });

  it('sends the actionable reminder one Shanghai calendar day before the due date', () => {
    expect(reminderStage(new Date('2026-10-31T06:00:00.000Z'), due)).toBe('one_day');
  });

  it('sends the actionable reminder on the Shanghai due date', () => {
    expect(reminderStage(new Date('2026-11-01T06:00:00.000Z'), due)).toBe('due');
  });

  it('does not notify on other days', () => {
    expect(reminderStage(new Date('2026-10-28T06:00:00.000Z'), due)).toBeNull();
  });
});

import { describe, expect, it } from 'vitest';
import { buildReminderMessage, buildWelcomeMessage } from '../src/messages';

describe('Telegram messages', () => {
  it('renders the reminder with exactly one confirmation button', () => {
    const message = buildReminderMessage(new Date('2026-11-01T00:00:00.000Z'));
    expect(message.text).toContain('墨云阁 · 折纸');
    expect(message.reply_markup!.inline_keyboard).toEqual([[
      { text: '✅ 已完成保号', callback_data: 'confirm_keepalive' }
    ]]);
  });

  it('does not include extra buttons in the welcome message', () => {
    expect(buildWelcomeMessage().text).toContain('/start');
  });
});

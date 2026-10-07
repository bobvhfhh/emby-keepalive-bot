import { describe, expect, it } from 'vitest';
import { buildConfirmationPromptMessage, buildReminderMessage, buildWelcomeMessage } from '../src/messages';

describe('Telegram messages', () => {
  it('renders the reminder with exactly one confirmation button', () => {
    const message = buildReminderMessage(new Date('2026-11-01T00:00:00.000Z'));
    expect(message.text).toContain('墨云阁 · 折纸');
    expect(message.reply_markup!.inline_keyboard).toEqual([[
      { text: '✅ 已完成保号', callback_data: 'confirm_keepalive' }
    ]]);
  });

  it('explains the test command without adding a welcome-message button', () => {
    const message = buildWelcomeMessage();
    expect(message.text).toContain('/test');
    expect(message.reply_markup).toBeUndefined();
  });

  it('replaces the first action with one final confirmation button', () => {
    const message = buildConfirmationPromptMessage();
    expect(message.text).toContain('确认你已经完成观看吗');
    expect(message.reply_markup!.inline_keyboard).toEqual([[
      { text: '✅ 确认，已观看', callback_data: 'confirm_keepalive_final' }
    ]]);
  });
});

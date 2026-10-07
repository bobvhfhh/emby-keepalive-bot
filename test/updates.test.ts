import { afterEach, describe, expect, it, vi } from 'vitest';
import { handleTelegramUpdate } from '../src/index';

const env = { TELEGRAM_BOT_TOKEN: 'test-token', WEBHOOK_SECRET: 'test-secret' };

function existingSubscriberDb(): D1Database {
  const statement = {
    bind: () => statement,
    first: async () => ({ chat_id: '123', enabled: 1 }),
    run: async () => ({ success: true }),
    all: async () => ({ results: [] })
  };
  return { prepare: () => statement } as unknown as D1Database;
}

function telegramFetch() {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ ok: true, result: { message_id: 1 } })
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('Telegram update commands', () => {
  it('replies to /start even when the chat is already registered', async () => {
    const fetchMock = telegramFetch();
    vi.stubGlobal('fetch', fetchMock);

    await handleTelegramUpdate({ message: { chat: { id: 123 }, text: '/start' } }, { ...env, DB: existingSubscriberDb() }, new Date('2026-10-07T04:00:00.000Z'));

    expect(fetchMock).toHaveBeenCalledOnce();
    expect(JSON.parse(fetchMock.mock.calls[0][1].body as string).text).toContain('保号提醒机器人');
  });

  it('sends the real reminder card with its one confirmation button for /test', async () => {
    const fetchMock = telegramFetch();
    vi.stubGlobal('fetch', fetchMock);

    await handleTelegramUpdate({ message: { chat: { id: 123 }, text: '/test' } }, { ...env, DB: existingSubscriberDb() }, new Date('2026-10-07T04:00:00.000Z'));

    const body = JSON.parse(fetchMock.mock.calls[0][1].body as string);
    expect(body.text).toContain('新一轮保号周期到了');
    expect(body.reply_markup.inline_keyboard).toEqual([[{ text: '✅ 已完成保号', callback_data: 'confirm_keepalive' }]]);
  });
});

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
    expect(body.text).toContain('今天该保号了');
    expect(body.reply_markup.inline_keyboard).toEqual([[{ text: '✅ 已完成保号', callback_data: 'confirm_keepalive' }]]);
  });

  it('turns the original reminder into a final confirmation instead of recording immediately', async () => {
    const fetchMock = telegramFetch();
    vi.stubGlobal('fetch', fetchMock);

    await handleTelegramUpdate({ callback_query: { id: 'callback-1', data: 'confirm_keepalive', message: { chat: { id: 123 }, message_id: 99 } } }, { ...env, DB: existingSubscriberDb() }, new Date('2026-10-07T04:00:00.000Z'));

    expect(fetchMock).toHaveBeenCalledTimes(2);
    expect(fetchMock.mock.calls[1][0]).toContain('/editMessageText');
    const body = JSON.parse(fetchMock.mock.calls[1][1].body as string);
    expect(body.message_id).toBe(99);
    expect(body.text).toContain('确认你已经完成观看吗');
  });

  it('records only after the final confirmation and then sends the record message', async () => {
    const fetchMock = telegramFetch();
    vi.stubGlobal('fetch', fetchMock);

    await handleTelegramUpdate({ callback_query: { id: 'callback-2', data: 'confirm_keepalive_final', message: { chat: { id: 123 }, message_id: 99 } } }, { ...env, DB: existingSubscriberDb() }, new Date('2026-10-07T04:00:00.000Z'));

    expect(fetchMock).toHaveBeenCalledTimes(3);
    expect(fetchMock.mock.calls[1][0]).toContain('/editMessageText');
    expect(fetchMock.mock.calls[2][0]).toContain('/sendMessage');
    expect(JSON.parse(fetchMock.mock.calls[2][1].body as string).text).toContain('已记录本次保号');
  });
});

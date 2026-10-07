import type { TelegramMessagePayload } from './messages';
const TELEGRAM_API = 'https://api.telegram.org';
type TelegramResponse<T> = { ok: boolean; result: T; description?: string };
async function callTelegram<T>(token: string, method: string, body: unknown): Promise<T> { const response = await fetch(TELEGRAM_API + '/bot' + token + '/' + method, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) }); const data = await response.json() as TelegramResponse<T>; if (!response.ok || !data.ok) throw new Error(data.description || ('Telegram ' + method + ' failed')); return data.result; }
export async function sendTelegramMessage(token: string, chatId: string, payload: TelegramMessagePayload): Promise<number> { const result = await callTelegram<{ message_id: number }>(token, 'sendMessage', { chat_id: chatId, text: payload.text, reply_markup: payload.reply_markup }); return result.message_id; }
export async function answerCallbackQuery(token: string, callbackQueryId: string): Promise<void> { await callTelegram(token, 'answerCallbackQuery', { callback_query_id: callbackQueryId }); }
export async function setTelegramWebhook(token: string, webhookUrl: string, secretToken: string): Promise<void> { await callTelegram(token, 'setWebhook', { url: webhookUrl, secret_token: secretToken }); }

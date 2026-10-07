import { formatShanghaiDate } from './time';
export type TelegramMessagePayload = { text: string; reply_markup?: { inline_keyboard: Array<Array<{ text: string; callback_data: string }>> } };
export function buildReminderMessage(nextReminderAt: Date): TelegramMessagePayload { return { text: ['🌙 墨云阁 · 折纸', '', '新一轮使用周期到了。', '请前往 Emby 完成一次观看，完成本次保号。', '', '看完后点击下方按钮，下一次提醒将顺延 25 天。', '提醒日期：' + formatShanghaiDate(nextReminderAt)].join('\n'), reply_markup: { inline_keyboard: [[{ text: '✅ 已完成保号', callback_data: 'confirm_keepalive' }]] } }; }
export function buildWelcomeMessage(): TelegramMessagePayload { return { text: ['🌙 墨云阁 · 折纸保号提醒机器人', '', '机器人会按 25 天周期提醒你。', '首次使用请发送 /start；完成观看后，点击提醒消息下方的确认按钮。'].join('\n') }; }
export function buildConfirmedMessage(nextReminderAt: Date): TelegramMessagePayload { return { text: '✅ 已记录本次保号。\n下次提醒日期：' + formatShanghaiDate(nextReminderAt) }; }

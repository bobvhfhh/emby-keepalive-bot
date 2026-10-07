import { formatShanghaiDate } from './time';
export type TelegramMessagePayload = { text: string; parse_mode?: 'HTML'; reply_markup?: { inline_keyboard: Array<Array<{ text: string; callback_data: string }>> } };
export function buildReminderMessage(nextReminderAt: Date): TelegramMessagePayload { return { parse_mode: 'HTML', text: ['🌙 <b>墨云阁 · 折纸</b>', '', '<b>新一轮保号周期到了</b>', '请前往 Emby 完成一次观看，完成本次保号。', '', '看完后点击下方按钮，下一次提醒将顺延 <b>25 天</b>。', '提醒日期：' + formatShanghaiDate(nextReminderAt)].join('\n'), reply_markup: { inline_keyboard: [[{ text: '✅ 已完成保号', callback_data: 'confirm_keepalive' }]] } }; }
export function buildWelcomeMessage(): TelegramMessagePayload { return { parse_mode: 'HTML', text: ['🌙 <b>墨云阁 · 折纸保号提醒机器人</b>', '', '机器人会按 <b>25 天</b> 周期提醒你。', '首次使用请发送 /start；完成观看后，点击提醒消息下方的确认按钮。'].join('\n') }; }
export function buildConfirmedMessage(nextReminderAt: Date): TelegramMessagePayload { return { text: '✅ 已记录本次保号。\n下次提醒日期：' + formatShanghaiDate(nextReminderAt) }; }

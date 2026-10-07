export type Env = { DB: D1Database; TELEGRAM_BOT_TOKEN: string; WEBHOOK_SECRET: string };
export function validateTelegramSecret(received: string | null, expected: string): boolean { return Boolean(received && expected && received === expected); }

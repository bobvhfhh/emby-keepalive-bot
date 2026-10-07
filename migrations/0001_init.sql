CREATE TABLE IF NOT EXISTS subscribers (chat_id TEXT PRIMARY KEY, next_reminder_at TEXT NOT NULL, last_confirmed_at TEXT NOT NULL, last_message_id INTEGER, enabled INTEGER NOT NULL DEFAULT 1, created_at TEXT NOT NULL, updated_at TEXT NOT NULL);
CREATE INDEX IF NOT EXISTS idx_subscribers_due ON subscribers (enabled, next_reminder_at);

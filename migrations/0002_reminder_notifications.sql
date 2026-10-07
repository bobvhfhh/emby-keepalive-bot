CREATE TABLE IF NOT EXISTS reminder_notifications (
  chat_id TEXT NOT NULL,
  next_reminder_at TEXT NOT NULL,
  stage TEXT NOT NULL CHECK (stage IN ('five_days', 'one_day', 'due')),
  sent_at TEXT NOT NULL,
  PRIMARY KEY (chat_id, next_reminder_at, stage)
);

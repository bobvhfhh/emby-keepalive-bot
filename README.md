# 墨云阁 · 折纸保号提醒机器人

这是一个独立的 Telegram 提醒机器人。它不会访问 Emby，也不会读取观影记录；你看完后手动点击按钮，机器人重新开始 25 天倒计时。

## 运行规则

- 第一次 /start 后，首次提醒日期固定为 2026 年 11 月 1 日（Asia/Shanghai）。
- 提醒内容标题为“🌙 墨云阁 · 折纸”。
- 提醒消息只有一个按钮：“✅ 已完成保号”。
- 点击按钮后，下一次提醒为点击时间之后 25 天。
- Cron 每天 00:00（上海时间）附近检查一次；Cloudflare Cron 使用 UTC 的 0 16 * * *。

## 需要准备

1. 一个 Cloudflare 账号。
2. Node.js 18 或更高版本。
3. 通过 Telegram 的 BotFather 创建一个全新的机器人并取得 Bot Token。
4. 安装 Wrangler：npm install -g wrangler，然后执行 wrangler login。

不要把 Bot Token 发到聊天、提交到 Git 或写入代码；部署时用 Secret 配置。

## 推荐部署方式：GitHub Actions 自动部署

这个项目可以完全不依赖你的本地电脑运行。把整个 emby-keepalive-bot 目录上传到 GitHub 后，GitHub Actions 会自动完成测试、D1 迁移、Worker 部署、Secret 更新和 Telegram Webhook 设置。

### 1. 创建 Cloudflare API Token

在 Cloudflare 创建一个 API Token，权限至少包含：Workers Scripts 编辑、D1 编辑。记下 Cloudflare Account ID。Cloudflare API Token 和 Telegram Bot Token 都只放在 GitHub Secrets。

### 2. 创建 D1 数据库

可以在 Cloudflare Dashboard 创建名为 emby-keepalive 的 D1 数据库，或者只在第一次使用 Cloudflare CLI 时创建。把数据库的 ID 填到 wrangler.jsonc 的 database_id；数据库 ID 不是密码，可以提交到 GitHub。

### 3. 上传到 GitHub

建议把 emby-keepalive-bot 目录里的内容直接作为 GitHub 仓库根目录，结构是：

~~~text
你的仓库/
├── .github/workflows/deploy.yml
├── src/
├── migrations/
├── wrangler.jsonc
└── package.json
~~~

### 4. 配置 GitHub Secrets 和 Variables

仓库进入 Settings → Secrets and variables → Actions，添加以下 Secrets：

~~~text
CLOUDFLARE_API_TOKEN
CLOUDFLARE_ACCOUNT_ID
TELEGRAM_BOT_TOKEN
WEBHOOK_SECRET
~~~

再添加一个 Repository Variable：

~~~text
WORKER_URL = https://emby-keepalive-bot.<你的账号>.workers.dev
~~~

第一次部署前，如果还不知道 Worker URL，可以先把 workflow 里的最后一步 Configure Telegram webhook 暂时注释掉，部署完成后从 Cloudflare 控制台复制 Worker URL，再添加 WORKER_URL 并重新运行 workflow。

### 5. 推送代码

推送到 main 分支后，进入 GitHub 的 Actions 页面查看 Deploy Emby Keepalive Bot。它会按顺序执行：npm 测试、TypeScript 检查、配置检查、D1 迁移、Secret 更新、Worker 部署和 Telegram Webhook 设置。

部署完成后，在 Telegram 打开新机器人并发送 /start。

## 本地或 VPS 部署步骤（备用）

在本目录执行：

~~~powershell
npm install
npx wrangler login
npx wrangler d1 create emby-keepalive
~~~

命令会返回 database_id。打开 wrangler.toml，把 REPLACE_WITH_D1_DATABASE_ID 替换为实际 ID。

创建数据库表：

~~~powershell
npx wrangler d1 migrations apply emby-keepalive --remote
~~~

配置两个 Secret：

~~~powershell
npx wrangler secret put TELEGRAM_BOT_TOKEN
npx wrangler secret put WEBHOOK_SECRET
~~~

每条命令都会要求你粘贴对应的值。WEBHOOK_SECRET 可以使用一段随机长字符串。

完成后部署：

~~~powershell
npx wrangler deploy
~~~

部署完成后记下 Worker 地址，例如 https://emby-keepalive-bot.<你的账号>.workers.dev。

设置 Telegram webhook：

~~~powershell
.\\scripts\\set-webhook.ps1 -WorkerUrl 'https://emby-keepalive-bot.<你的账号>.workers.dev' -BotToken '<你的 Bot Token>' -WebhookSecret '<刚才保存的 webhook 密钥>'
~~~

然后在 Telegram 打开新机器人并发送 /start。机器人会注册你的 chat_id，并返回启动说明。

## 首次日期说明

代码已经按你的例子写死首次提醒：

~~~text
2026 年 10 月 7 日看过
2026 年 11 月 1 日提醒
点击确认后，再顺延 25 天
~~~

如果你不是在 2026 年 10 月 7 日初始化，先修改 src/time.ts 里的 initialReminderDate()，再重新部署；日常点击按钮后的 25 天计算不需要修改。

## 自测

~~~powershell
npm test
npx wrangler tail
~~~

访问 https://你的Worker地址/health 应返回 ok。如果 Telegram 没有反应，先检查 webhook：

~~~powershell
Invoke-RestMethod 'https://api.telegram.org/bot<你的 Bot Token>/getWebhookInfo' | ConvertTo-Json -Depth 10
~~~

常见问题：

- 401 Unauthorized：Worker Secret 与 setWebhook 使用的 webhook 密钥不一致。
- /start 没反应：检查 webhook 的 url 是否是 /telegram/webhook，以及 Worker 是否已部署。
- 没收到到期提醒：确认 D1 迁移已执行，并使用 npx wrangler tail 查看发送错误。
- Token 泄露：立即在 BotFather 使用 /revoke 撤销旧 Token，再重新设置 TELEGRAM_BOT_TOKEN。

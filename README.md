# 墨云阁 · 折纸保号提醒机器人

[![Deploy to Cloudflare](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https%3A%2F%2Fgithub.com%2Fbobvhfhh%2Femby-keepalive-bot)

点击上面的按钮即可将本项目导入并部署到你自己的 Cloudflare 账号。Cloudflare 会自动创建 Worker 和 D1 数据库；部署配置页面会要求你填写 Telegram Bot Token 和 Webhook Secret。

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

## 一键部署后的第一次设置

点击按钮后，Cloudflare 会把代码导入你的 GitHub 账号，并自动配置 Worker 和 D1。部署配置页中填写两个 Secret：

~~~text
TELEGRAM_BOT_TOKEN=BotFather 创建的机器人 Token
WEBHOOK_SECRET=64 位十六进制高强度随机字符串
~~~

生成 WEBHOOK_SECRET 的推荐方式：

~~~bash
openssl rand -hex 32
~~~

这会生成 32 字节、256 位随机值，复制完整结果填入 WEBHOOK_SECRET。不要使用生日、手机号、用户名或简单英文单词。

部署完成后，在 Telegram 打开新机器人并发送 /start。Cloudflare 部署按钮支持从 Wrangler 配置读取所需资源，并在部署时自动创建 D1；.dev.vars.example 和 package.json 中的 bindings 描述用于让配置页面识别所需 Secret。

部署成功后，在浏览器打开 Worker 地址加上 /setup：

~~~text
https://你的Worker地址/setup
~~~

页面显示 Telegram webhook configured 后，再回 Telegram 给机器人发送 /start。/setup 会在 Cloudflare 内部读取两个 Secret 并自动向 Telegram 注册 Webhook，不会把 Token 显示在网页中。

## 本地或 VPS 部署步骤（备用）

在本目录执行：

~~~powershell
npm install
npx wrangler login
npx wrangler d1 create emby-keepalive
~~~

命令会返回 database_id。备用命令行部署时，把它填入 wrangler.jsonc 的 database_id。

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

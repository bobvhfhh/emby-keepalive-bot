param(
  [Parameter(Mandatory = $true)][string]$WorkerUrl,
  [Parameter(Mandatory = $true)][string]$BotToken,
  [Parameter(Mandatory = $true)][string]$WebhookSecret
)
$body = @{ url = ($WorkerUrl.TrimEnd('/') + '/telegram/webhook'); secret_token = $WebhookSecret } | ConvertTo-Json
$result = Invoke-RestMethod -Method Post -Uri ('https://api.telegram.org/bot{0}/setWebhook' -f $BotToken) -ContentType 'application/json' -Body $body
$result | ConvertTo-Json

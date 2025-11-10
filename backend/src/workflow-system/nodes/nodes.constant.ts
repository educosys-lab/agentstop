export const NODES_REGISTRY = {
	// ========== Trigger Nodes ==========
	'cron-trigger': './nodes/triggers/cron/Cron',
	'discord-trigger': './nodes/triggers/discord/Discord',
	'google-sheets-trigger': './nodes/triggers/google-sheets/GoogleSheets',
	'interact-trigger': './nodes/triggers/interact/Interact',
	'slack-trigger': './nodes/triggers/slack/Slack',
	'telegram-trigger': './nodes/triggers/telegram/Telegram',
	'webhook-trigger': './nodes/triggers/webhook/Webhook',
	'whatsapp-trigger': './nodes/triggers/whatsapp/WhatsApp',

	// === Agent ===
	agent: './nodes/general/agent/Agent',

	// ========== Tool ==========
	'airbnb-tool': './nodes/tools/airbnb/Airbnb',
	'airtable-tool': './nodes/tools/airtable/Airtable',
	'discord-tool': './nodes/tools/discord/Discord',
	'firecrawl-tool': './nodes/tools/firecrawl/Firecrawl',
	'github-tool': './nodes/tools/github/GitHub',
	'google-sheets-tool': './nodes/tools/google-sheets/GoogleSheets',
	'linkedin-tool': './nodes/tools/linkedin/LinkedIn',
	'mongodb-tool': './nodes/tools/mongodb/MongoDB',
	'notion-tool': './nodes/tools/notion/Notion',
	'pinecone-tool': './nodes/tools/pinecone/Pinecone',
	'redis-tool': './nodes/tools/redis/Redis',
	'reddit-tool': './nodes/tools/reddit/Reddit',
	'slack-tool': './nodes/tools/slack/Slack',
	'supabase-tool': './nodes/tools/supabase/Supabase',
	'tavily-tool': './nodes/tools/tavily/Tavily',
	'quickchart-tool': './nodes/tools/quickchart/QuickChart',
	'whatsapp-tool': './nodes/tools/whatsapp/WhatsApp',

	// ========== General Nodes ==========
	// === Action ===
	'aws-s3-upload': './nodes/general/aws/s3-upload/S3Upload',
	'discord-read': './nodes/general/discord/read/DiscordRead',
	'discord-send': './nodes/general/discord/send/DiscordSend',
	'gmail-read': './nodes/general/gmail/read/GmailRead',
	'gmail-send': './nodes/general/gmail/send/GmailSend',
	'google-calendar-read': './nodes/general/google-calendar/read/GoogleCalendarRead',
	'google-calendar-write': './nodes/general/google-calendar/write/GoogleCalendarWrite',
	'google-docs-read': './nodes/general/google-docs/read/GoogleDocsRead',
	'google-docs-write': './nodes/general/google-docs/write/GoogleDocsWrite',
	'google-sheets-read': './nodes/general/google-sheets/read/GoogleSheetsRead',
	'google-sheets-write': './nodes/general/google-sheets/write/GoogleSheetsWrite',
	http: './nodes/general/http/Http',
	'linkedin-post': './nodes/general/linkedin/post-generator/LinkedInPostGenerator',
	'pdf-generator': './nodes/general/pdf-generator/PdfGenerator',
	'resume-pdf-generator': './nodes/general/resume-pdf-generator/ResumePDFGenerator',
	// 'rag-ingestion': './nodes/general/rag/ingestion/RagIngestion',
	rag: './nodes/general/rag/query/RagQuery',
	'slack-read': './nodes/general/slack/read/SlackRead',
	'slack-send': './nodes/general/slack/send/SlackSend',
	'web-scraper': './nodes/general/web-scraper/WebScraper',
	'youtube-transcribe': './nodes/general/youtube/transcribe/YouTubeTranscribe',

	// === LLM ===
	openai: './nodes/general/open-ai/OpenAi',

	// ========== Responders Nodes ==========
	'default-responder': './nodes/responders/default/Default',
	'discord-responder': './nodes/responders/discord/Discord',
	'google-sheets-responder': './nodes/responders/google-sheets/GoogleSheets',
	'interact-responder': './nodes/responders/interact/Interact',
	'slack-responder': './nodes/responders/slack/Slack',
	'telegram-responder': './nodes/responders/telegram/Telegram',
	'webhook-responder': './nodes/responders/webhook/Webhook',
	'whatsapp-responder': './nodes/responders/whatsapp/WhatsApp',
} as const;

export const categoriesDescription: { [category: string]: string } = {
	Action: `Performs a specific task in the mission. It can read, write, send, or process data using connected apps or services like Google Sheets, Docs, Calendar and more.`,
	Agent: `Smart assistant that can perform tasks step-by-step. It uses an AI model (like GPT or Gemini) and can have tools (e.g., web search, GitHub) and memory attached to it. Agents are recommended when your mission needs to take action, reason through steps, or use multiple tools.`,
	LLM: `AI model like GPT (OpenAI), Gemini (Google), or Claude (Anthropic) that can understand text inputs (called prompts) and generate smart responses. LLMs are best used when you only need answers or text-based replies in your mission. If you want the AI to do something - like search, send emails, or write to a document - we recommend using an Agent instead.`,
	Mission: `Defines what you want to automate. It includes one or more tasks like triggers, actions, calling agents and responses that together complete the automation.`,
	Responder: `Sends a reply to the same place where the mission was triggered from - such as chat, Slack, Discord, or Telegram. It shares the output or result after the mission has run.`,
	Tool: `Adds extra capability like search, scraping, or accessing external services. Agents can use tools to complete tasks in a flexible and intelligent way`,
	Trigger: `Starts the mission. It listens for events like a message or a scheduled time. The message can come from AgentStop chat or external platforms like Discord, Slack, or Telegram.`,
};

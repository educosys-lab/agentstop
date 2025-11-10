from typing import Any
from langgraph.prebuilt import create_react_agent
from langchain.chat_models import init_chat_model

from app.shared.config.config import env
from app.chat.chat_type import ChatbotArgs
from app.shared.types.return_type import DefaultReturnType, ErrorResponseType


data = """
AgentStop Platform Concepts

Mission
A Mission defines the complete automation flow. It includes one or more Tasks like Triggers, Actions, Agent calls, and Responders that together achieve a goal.

Trigger
A Trigger starts the Mission. It listens for events such as incoming messages or scheduled times. Messages can come from AgentStop Chat or external platforms like Slack, Discord, or Telegram.

Action (Task)
An Action is a specific step within a Mission. It can read, write, send, or process data using connected services like Google Sheets, Docs, Calendar, and others.

Responder
A Responder sends the final output or message back to the platform where the Mission was triggered—such as chat, Slack, Discord, or Telegram.

Agent
An Agent is a smart assistant that uses an AI model (like GPT or Gemini) to reason through steps and perform tasks. Agents can have tools (e.g., web search, GitHub) and memory attached. Use an Agent when your Mission needs logic, multi-step reasoning, or integration with tools.

LLM (Large Language Model)
An LLM is an AI model such as GPT (OpenAI), Gemini (Google), or Claude (Anthropic). It understands text input (prompts) and generates responses.
LLMs are ideal for Missions that require only text-based replies or answers. For tasks that require action (e.g., sending email or fetching data), use an Agent.

Prompt
A prompt is the instruction or question given to the LLM.

Tool
A Tool extends an Agent’s capabilities—for example, search, scraping, or accessing APIs. Agents use tools to perform more advanced and flexible tasks.
"""


async def call_agent_for_query(args: ChatbotArgs) -> DefaultReturnType[dict[str, Any] | Any]:
    try:
        model = init_chat_model(model="openai:gpt-4o", api_key=env.OPENAI_KEY)
        agent = create_react_agent(model=model, tools=[])
        ques_with_query = (
            "You are a friendly and accurate chatbot for our product, AgentStop — a visual automation platform where users can drag and drop tasks (nodes) to automate their workflows using AI agents. "
            "AgentStop uses its own terminology for automation concepts. Below are the definitions of key terms:\n\n"
            + data
            + "\n\nUse this information to help users understand how AgentStop works. "
            "This is the question asked by user - "
            + args.question
            + " Answer it clearly and concisely using the terms and structure described above."
            "If needed, guide them on how to create, connect, or configure these elements to build their automation. Do not use any formatting (no bold, no italics, no markdown). Keep your answers short, simple, and easy to understand. "
            + "Always speak positively about AgentStop."
            "If the user asks something completely unrelated to AgentStop, politely reply that the chatbot is only meant to answer questions related to our product, AgentStop."
        )

        response = await agent.ainvoke({"messages": ques_with_query})
        return DefaultReturnType(data=response)
    except Exception as error:
        return DefaultReturnType(
            error=ErrorResponseType(
                userMessage="Failed to give response for query!",
                error=str(error),
                errorType="InternalServerErrorException",
                errorData={},
                trace=["chat_service - call_agent_for_query - except Exception"],
            )
        )

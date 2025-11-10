from typing import Any, Dict, Optional
from pydantic import BaseModel


class AgentArgs(BaseModel):
    workflow_id: str
    api_key: str
    memory_id: Optional[str]
    user_id: str
    # example=[{"role": "user", "content": "What is the weather in Paris?"}]
    messages: list[Dict[str, Any]]
    # example="openai:gpt-4-turbo"
    model: str
    # example={"foo": "bar"}
    schema: Optional[Dict[str, Any]]
    # Configurations for each tool, keys are tool names, values are dicts with any config keys
    # example={
    #     "github-tool": {
    #         "github_token": "your_github_personal_access_token_here"
    #     }
    # }
    tool_configs: Optional[Dict[str, Dict[str, Any]]]

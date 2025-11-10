from typing import Any, Dict, Literal
from pydantic import BaseModel

LogLevel = Literal['info', 'warn', 'error']


class GetLogPathArgs(BaseModel):
    level: LogLevel
    log_id: str


class GetLoggerArgs(BaseModel):
    level: LogLevel
    log_id: str


class LogDataArgs(BaseModel):
    message: str
    data: Dict[str, Any]
    trace: list[str]

from typing import Generic, Optional, TypeVar
from pydantic import BaseModel, ConfigDict

from app.shared.types.error_type import ErrorType


class ErrorResponseType(BaseModel):
    userMessage: str
    error: str
    errorType: ErrorType
    errorData: dict
    trace: list[str]


T = TypeVar("T")


class DefaultReturnType(BaseModel, Generic[T]):
    model_config = ConfigDict(arbitrary_types_allowed=True)
    data: Optional[T] = None
    error: Optional[ErrorResponseType] = None

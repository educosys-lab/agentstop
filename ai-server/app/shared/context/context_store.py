from contextvars import ContextVar
import json
from typing import Any
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware

from app.shared.types.return_type import DefaultReturnType, ErrorResponseType


# Context store for storing data across requests
context_store: ContextVar[dict] = ContextVar("context_store", default={})


def set_context_data(key: str, value) -> DefaultReturnType[None]:
    try:
        context = context_store.get()
        context[key] = value
        context_store.set(context)
        return DefaultReturnType(data=None)
    except Exception as error:
        return DefaultReturnType(
            error=ErrorResponseType(
                userMessage=f"Internal server error!",
                error=str(error),
                errorType="InternalServerErrorException",
                errorData={},
                trace=["context_store - set_context_data - except Exception"]
            )
        )


def get_context_data(key: str) -> DefaultReturnType[Any]:
    try:
        return DefaultReturnType(data=context_store.get().get(key))
    except Exception as error:
        return DefaultReturnType(
            error=ErrorResponseType(
                userMessage=f"Internal server error!",
                error=str(error),
                errorType="InternalServerErrorException",
                errorData={},
                trace=["context_store - get_context_data - except Exception"]
            )
        )


def clear_context() -> DefaultReturnType[None]:
    try:
        context_store.set({})
        return DefaultReturnType(data=None)
    except Exception as error:
        return DefaultReturnType(
            error=ErrorResponseType(
                userMessage=f"Internal server error!",
                error=str(error),
                errorType="InternalServerErrorException",
                errorData={},
                trace=["context_store - clear_context - except Exception"]
            )
        )


# Middleware to clear the request store after every request
class ContextStoreMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        # Initialize empty store for the request
        context_store.set({})

        try:
            response = await call_next(request)
            return response
        finally:
            # Ensure cleanup
            clear_context()


# Access the context store
def demo_function():
    user_id = get_context_data("user_id")
    if user_id is None:
        return json.dumps({"status": "failed", "type": "text", "data": "Missing user_id"})

    return user_id

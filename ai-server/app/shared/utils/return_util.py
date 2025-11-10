from typing import Any, Union
from fastapi.encoders import jsonable_encoder
from fastapi.responses import JSONResponse
from bson import ObjectId
from datetime import datetime
from uuid import UUID
from pydantic import BaseModel


def return_data(args: Union[dict[str, Any], BaseModel]) -> JSONResponse:
    safe_data = jsonable_encoder(
        args,
        custom_encoder={
            ObjectId: str,
            datetime: lambda v: v.isoformat(),
            UUID: str,
        }
    )
    return JSONResponse(content=safe_data)

from fastapi import HTTPException, status
from pydantic import BaseModel
from typing import Any, TypeGuard

from app.shared.types.return_type import ErrorResponseType
from app.shared.types.error_type import ErrorType


class ThrowErrorArgs(BaseModel):
    error: str
    errorType: ErrorType


def throw_error(args: ThrowErrorArgs):
    if (args.errorType == "BadRequestException"):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=args.error
        )
    elif (args.errorType == "ConflictException"):
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=args.error
        )
    elif (args.errorType == "ForbiddenException"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail=args.error
        )
    elif (args.errorType == "InternalServerErrorException"):
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=args.error
        )
    elif (args.errorType == "NotAcceptableException"):
        raise HTTPException(
            status_code=status.HTTP_406_NOT_ACCEPTABLE,
            detail=args.error
        )
    elif (args.errorType == "NotFoundException"):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=args.error
        )
    elif (args.errorType == "UnauthorizedException"):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=args.error
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=args.error
        )


def is_error(response: Any) -> TypeGuard[ErrorResponseType]:
    return isinstance(response, ErrorResponseType)


def carry_error(error: ErrorResponseType, trace: str) -> ErrorResponseType:
    return ErrorResponseType(
        **error.model_dump(exclude={"trace"}),
        trace=error.trace + [trace]
    )

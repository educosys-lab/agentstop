from typing import Any
from fastapi import APIRouter
from fastapi.responses import JSONResponse

from app.shared.logger.logger import log
from app.shared.logger.logger_type import LogDataArgs
from app.shared.dependencies.instance import get_redis_client, get_mongo_db

router = APIRouter()


@router.get("/health")
async def health_check():
    # A more comprehensive health check endpoint.
    # Checks connectivity to Redis and MongoDB.

    redis_status = "unhealthy"
    mongo_status = "unhealthy"

    # Check Redis connection
    redis_client = await get_redis_client()
    if redis_client is not None:
        try:
            if redis_client.ping():
                redis_status = "healthy"
        except Exception as error:
            log('system', 'error',
                LogDataArgs(
                    message="Error checking Redis connection!",
                    data={"error": str(error)},
                    trace=["health - health_check - except Exception"],
                )
                )

    # Check MongoDB connection
    mongo_client: Any = await get_mongo_db()
    if mongo_client is not None:
        try:
            mongo_client.admin.command('ping')
            mongo_status = "healthy"
        except Exception as error:
            log('system', 'error',
                LogDataArgs(
                    message="Error checking MongoDB connection!",
                    data={"error": str(error)},
                    trace=["health - health_check - except Exception"],
                )
                )

    overall = "healthy" if redis_status == mongo_status == "healthy" else "unhealthy"
    return JSONResponse(status_code=200 if overall == "healthy" else 503, content={
        "status": overall,
        "redis": redis_status,
        "mongo": mongo_status
    })

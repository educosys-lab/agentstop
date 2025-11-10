from typing import Optional
import redis
from pymongo import MongoClient
from pymongo.database import Database

from app.shared.logger.logger import log
from app.shared.logger.logger_type import LogDataArgs
from app.shared.utils.error_util import throw_error, ThrowErrorArgs


class InstanceRegistry:
    redis_client: Optional[redis.Redis] = None
    mongo_client: Optional[MongoClient] = None
    mongo_db: Optional[Database] = None


instance = InstanceRegistry()


async def get_redis_client():
    if instance.redis_client is not None:
        return instance.redis_client

    log('system', 'error',
        LogDataArgs(
            message="Redis client is not initialized!",
            data={},
            trace=["instance - get_redis_client - if instance.redis_client is None"],
        )
        )
    return throw_error(ThrowErrorArgs(
        error="Redis unavailable! Please try again later!",
        errorType="InternalServerErrorException",
    ))


async def get_mongo_db():
    if instance.mongo_db is not None:
        return instance.mongo_db

    log('system', 'error',
        LogDataArgs(
            message="MongoDB client is not initialized!",
            data={},
            trace=["instance - get_mongo_db - if instance.mongo_db is None"],
        )
        )
    return throw_error(ThrowErrorArgs(
        error="MongoDB unavailable! Please try again later!",
        errorType="InternalServerErrorException",
    ))

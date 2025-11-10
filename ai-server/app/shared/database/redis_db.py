import asyncio
import sys
import redis

from app.shared.config.config import env
from app.shared.logger.logger import log, console_log
from app.shared.logger.logger_type import LogDataArgs
from app.shared.dependencies.instance import instance
from redis.exceptions import ConnectionError


async def connect_to_redis_with_retry():
    # Establishes a connection to Redis with retry logic. The Redis client instance will be stored in app_state.redis_client.
    console_log("Connecting to Redis!")
    max_attempts = 5

    for attempt in range(max_attempts):
        try:
            console_log(f"Connecting to Redis! Attempt {attempt + 1}")
            redisInstance = redis.Redis(
                host=env.REDIS_HOST,
                port=env.REDIS_PORT,
                password=env.REDIS_PASSWORD,
                socket_connect_timeout=5,
                # Decode responses to strings
                decode_responses=True,
            )
            redisInstance.ping()

            console_log("Redis connected!")
            instance.redis_client = redisInstance
            return True
        except ConnectionError as error:
            console_log("Failed to connect to Redis!", error=error)
            console_log(f"Redis connection attempt {attempt + 1}/{max_attempts} failed!")

            if attempt < max_attempts - 1:
                console_log(f"Retrying Redis connection in 3 seconds!")
                await asyncio.sleep(3)
            else:
                log(
                    "system",
                    "error",
                    LogDataArgs(
                        message="Failed to connect to Redis!",
                        data={},
                        trace=["database - connect_to_redis_with_retry - except ConnectionError"],
                    ),
                )
                sys.exit("Redis connection failed during startup!")

    return False


async def close_redis_client():
    console_log("Closing Redis connection!")
    if instance.redis_client is not None:
        try:
            instance.redis_client.close()
        except Exception as error:
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Error closing Redis connection!",
                    data={"error": str(error)},
                    trace=["instance - close_redis_client - except Exception"],
                ),
            )

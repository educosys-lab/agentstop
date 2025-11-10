import asyncio
import sys
from pymongo import MongoClient
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

from app.shared.config.config import env
from app.shared.logger.logger import log, console_log
from app.shared.logger.logger_type import LogDataArgs
from app.shared.dependencies.instance import instance


async def connect_to_mongo_with_retry():
    # Establishes a connection to MongoDB with retry logic. The MongoDB client and database instance will be stored in app_state.mongo_client and app_state.mongo_db.
    console_log("Connecting to MongoDB!")
    max_attempts = 3

    for attempt in range(max_attempts):
        console_log(f"Connecting to MongoDB! Attempt {attempt + 1}")
        try:
            client = MongoClient(env.MONGODB_URI, serverSelectionTimeoutMS=5000, connectTimeoutMS=5000)
            client.admin.command("ismaster")

            console_log("MongoDB connected!")
            instance.mongo_client = client
            instance.mongo_db = client["mydatabase"]
            return True
        except (ConnectionFailure, ServerSelectionTimeoutError) as error:
            console_log("Failed to connect to MongoDB!", error=error)
            console_log(f"MongoDB connection attempt {attempt + 1}/{max_attempts} failed!")

            if attempt < max_attempts - 1:
                console_log(f"Retrying MongoDB connection in 3 seconds!")
                await asyncio.sleep(3)
            else:
                log(
                    "system",
                    "error",
                    LogDataArgs(
                        message="Failed to connect to MongoDB!",
                        data={},
                        trace=[
                            "database - connect_to_mongo_with_retry - except (ConnectionFailure, ServerSelectionTimeoutError)"
                        ],
                    ),
                )
                sys.exit("MongoDB connection failed during startup!")

    return False


async def close_mongo_db():
    console_log("Closing MongoDB connection!")
    if instance.mongo_client is not None:
        try:
            instance.mongo_client.close()
        except Exception as error:
            log(
                "system",
                "error",
                LogDataArgs(
                    message="Error closing MongoDB connection!",
                    data={"error": str(error)},
                    trace=["instance - close_mongo_db - except Exception"],
                ),
            )

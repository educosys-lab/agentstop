from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.shared.config.asyncio import set_windows_event_loop_policy
from app.shared.logger.logger import console_log
from app.shared.database.redis_db import connect_to_redis_with_retry, close_redis_client
from app.shared.database.mongodb_db import connect_to_mongo_with_retry, close_mongo_db
from app.health.health import router as health_router
from app.api import router as api_router

# from app.shared.context.context_store import ContextStoreMiddleware

set_windows_event_loop_policy()


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Actions to perform on application startup:
    console_log("Starting application!")
    # - Connect to Redis
    await connect_to_redis_with_retry()
    # - Connect to MongoDB
    await connect_to_mongo_with_retry()

    yield

    # Actions to perform on application shutdown:
    console_log("Shutting down application!")
    # - Close Redis connection
    await close_redis_client()
    # - Close MongoDB connection
    await close_mongo_db()

    console_log("Application shutdown complete!")


app = FastAPI(lifespan=lifespan)


# CORS
app.add_middleware(
    CORSMiddleware,
    # allow_origins=["http://localhost:5100"],
    # Or ["*"] for all origins (not recommended in production)
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Context-store middleware
# app.add_middleware(ContextStoreMiddleware)


@app.get("/")
async def root():
    # Root endpoint providing a welcome message and connection status.
    return {"message": "Welcome to Agentstop AI!"}


# Routes
app.include_router(health_router)
app.include_router(api_router)

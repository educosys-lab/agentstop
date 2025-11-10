from fastapi import APIRouter

from app.chat.chat_controller import router as chat_router
from app.agent.agent_controller import router as agent_router
from app.rag.rag_controller import router as rag_router

router = APIRouter()

router.include_router(chat_router)
router.include_router(agent_router)
router.include_router(rag_router)

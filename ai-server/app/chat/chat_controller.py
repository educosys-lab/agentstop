from fastapi import APIRouter

from app.chat.chat_service import call_agent_for_query
from app.shared.logger.logger import log
from app.shared.logger.logger_type import LogDataArgs
from app.chat.chat_type import ChatbotArgs
from app.shared.utils.error_util import is_error, throw_error, ThrowErrorArgs
from app.shared.utils.return_util import return_data

router = APIRouter()


@router.post("/respond_to_query")
async def respond_to_query(args: ChatbotArgs):

    response = await call_agent_for_query(args)

    if is_error(response.error):
        log('system', 'error',
            LogDataArgs(
                message=response.error.error,
                data=response.error.errorData,
                trace=response.error.trace,
            )
            )
        return throw_error(ThrowErrorArgs(
            error=response.error.error,
            errorType=response.error.errorType
        ))

    assert response.data is not None
    return return_data({
        "status": "success",
        "message": "Agent executed successfully",
        "output": response.data
    })

from fastapi import APIRouter

from app.agent.agent_service import run_agent
from app.agent.agent_type import AgentArgs
# from app.agent.supervisor import run_multi_agent
from app.shared.utils.error_util import is_error, throw_error, ThrowErrorArgs
from app.shared.utils.return_util import return_data
from app.shared.logger.logger import log
from app.shared.logger.logger_type import LogDataArgs

router = APIRouter()


@router.post("/execute")
async def execute(data: AgentArgs):
    response = await run_agent(data)
    # response = await run_multi_agent(data)

    if is_error(response.error):
        log(
            "system",
            "error",
            LogDataArgs(
                message=response.error.error,
                data=response.error.errorData,
                trace=response.error.trace,
            ),
        )
        return throw_error(ThrowErrorArgs(error=response.error.error, errorType=response.error.errorType))

    assert response.data is not None
    return return_data({"status": "success", "message": "Agent executed successfully!", "output": response.data})

# from fastapi import APIRouter

# from app.mongodb.user.user_service import UserService
# from app.mongodb.user.user_type import GetUserArgs
# from app.shared.utils.error_util import isError, throwError, ThrowErrorArgs
# from app.shared.utils.return_util import returnData
# from app.shared.logger.logger import log
# from app.shared.logger.logger_type import LogDataArgs

# router = APIRouter()


# @router.get("/user")
# async def get_user():
#     response = await UserService().get_user(GetUserArgs(id="47d01c8d-adae-458f-abac-2abda42eb42c"))

#     if isError(response.error):
#         log('system', 'error',
#             LogDataArgs(
#                 message=response.error.error,
#                 data=response.error.errorData,
#                 trace=response.error.trace,
#             )
#             )
#         return throwError(ThrowErrorArgs(
#             error=response.error.userMessage,
#             errorType=response.error.errorType
#         ))

#     assert response.data is not None
#     return returnData(response.data)

from mcp.server.fastmcp import FastMCP
import json

from app.mongodb.user.user_type import GetUserArgs, GetUserFileDetailsArgs
from app.mongodb.user.user_service import UserService
from app.shared.utils.error_util import is_error

mcp = FastMCP("UserFileTools")


@mcp.tool()
async def get_user_all_files_details(user_id: str) -> str:
    """
    Get the list of all the files and their details uploaded by the user.
    """
    try:
        all_file_details = await UserService().get_user(GetUserArgs(id=user_id))

        if is_error(all_file_details.error):
            return json.dumps({"status": "failed", "data": all_file_details.error.userMessage})

        assert all_file_details.data is not None
        files = all_file_details.data.files

        return json.dumps({"status": "success", "data": files})
    except Exception as error:
        return json.dumps({"status": "failed", "data": str(error)})


@mcp.tool()
async def get_user_files_list(user_id: str) -> str:
    """
    Get the list of all the files uploaded by the user.
    """
    try:
        files_list = await UserService().get_user_files_list(user_id)

        if is_error(files_list.error):
            return json.dumps({"status": "failed", "data": files_list.error.userMessage})

        assert files_list.data is not None

        return json.dumps({"status": "success", "data": files_list.data})
    except Exception as error:
        return json.dumps({"status": "failed", "data": str(error)})


@mcp.tool()
async def get_user_specific_file_details(user_id: str, file_name: str) -> str:
    """
    Get the details of a specific file uploaded by the user.
    """
    try:
        specific_file_details = await UserService().get_user_specific_file_details(GetUserFileDetailsArgs(user_id=user_id, file_name=file_name))

        if is_error(specific_file_details.error):
            return json.dumps({"status": "failed", "data": specific_file_details.error.userMessage})

        assert specific_file_details.data is not None

        return json.dumps({"status": "success", "data": specific_file_details.data})
    except Exception as error:
        return json.dumps({"status": "failed", "data": str(error)})


if __name__ == "__main__":
    mcp.run(transport="stdio")

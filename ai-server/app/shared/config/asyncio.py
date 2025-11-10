import asyncio
import sys

from app.shared.logger.logger import log
from app.shared.logger.logger_type import LogDataArgs


def set_windows_event_loop_policy():
    if sys.platform == "win32":
        # console_log(f"Current default event loop policy: {asyncio.get_event_loop_policy().__class__}!")

        try:
            # Attempting to set WindowsProactorEventLoopPolicy
            asyncio.set_event_loop_policy(asyncio.WindowsProactorEventLoopPolicy())

            # After setting the policy, any new event loop should be a Proactor loop
            # Verify by creating a new loop
            new_loop = asyncio.new_event_loop()
            # console_log(f"Newly created loop type (after set_event_loop_policy): {new_loop.__class__}")

            new_loop.close()
            # console_log(f"Policy after setting: {asyncio.get_event_loop_policy().__class__}!")
        except Exception as error:
            log('system', 'error',
                LogDataArgs(
                    message="ERROR setting event loop policy!",
                    data={"error": str(error)},
                    trace=["asyncio - set_windows_event_loop_policy - except Exception"],
                )
                )
